import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';

// ----------------------------------------------------
// TIER 1: In-Memory Fast Cache (Zero latency & Token Saver)
// ----------------------------------------------------
const memoryCache = new Map(); // key -> { text, timestamp }
const MEMORY_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const MAX_MEMORY_ITEMS = 500;

function getFromMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > MEMORY_CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  return cached.text;
}

function setToMemoryCache(key, text) {
  if (memoryCache.size >= MAX_MEMORY_ITEMS) {
    // Evict oldest entry
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { text, timestamp: Date.now() });
}

// ----------------------------------------------------
// TIER 2: Upstash Redis Persistent Distributed Cache
// ----------------------------------------------------
let redisClient = null;

function getAICacheRedis() {
  if (redisClient) return redisClient;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !redisToken.includes('your_upstash')) {
    try {
      redisClient = new Redis({ url: redisUrl, token: redisToken });
    } catch (e) {
      console.warn('[AICache Warning] Redis initialization failed:', e.message);
    }
  }
  return redisClient;
}

// ----------------------------------------------------
// Multi-Key Failover Pool
// ----------------------------------------------------
function getGeminiApiKeys() {
  const keys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
    process.env.GEMINI_API_KEY,
    process.env.VITE_GEMINI_KEY_1,
    process.env.VITE_GEMINI_KEY_2,
    process.env.VITE_GEMINI_KEY_3,
    process.env.VITE_GEMINI_KEY_4,
    process.env.VITE_GEMINI_API_KEY,
  ].filter(Boolean);

  // Deduplicate keys while preserving priority order
  return [...new Set(keys)];
}

let currentKeyIndex = 0;

const SYSTEM_INSTRUCTION = `You are an AI Ayurveda Virtual Lab Tutor for BAMS medical students. You must STRICTLY restrict your answers to Ayurveda, herbal medicine, traditional compounding (Bhaishajya Kalpana & Rasashastra), and practical laboratory chemistry related to this virtual lab. If the user asks anything unrelated to Ayurveda or this project, you must respond EXACTLY with: 'This question is not related to the project'.

CRITICAL CONVERSATIONAL CONTEXT RULES:
1. ALWAYS maintain conversation context across previous chat messages.
2. If the user was previously discussing a specific formulation, herb, procedure, or experiment (e.g., Sitopaladi Churna, Hingwastaka Churna, Agnitundi Vati, Shodhana, Bhavana, etc.) and then asks follow-up questions like "5 viva questions", "give its shloka", "what is the dose", "precautions", "lakshanas", "ingredients", etc., you MUST generate your answers specifically tailored to THAT formulation/topic (e.g., 5 viva questions specifically on Sitopaladi Churna).
3. Never reset context to a generic topic when follow-up queries are asked.

CHATGPT RESPONSE PATTERN:
1. Provide thoughtful, well-structured, authoritative, and direct responses matching modern ChatGPT formatting.
2. Structure your answer with:
   - A clear direct introductory line clarifying the exact formulation or topic being addressed.
   - For ranked lists, compounding stages, lakshanas, or viva Q&A, use ranking badges (🥇, 🥈, 🥉, 4️⃣, 5️⃣, etc.) or numbered points (1., 2., 3.) with bold headings and concise answers.
   - Follow with concise practical insights or classical references.
   - Conclude with a helpful, actionable follow-up line.
3. Keep every point medically precise, clean, and engaging.`;

/**
 * Builds valid alternating Gemini contents array with history
 */
function buildGeminiContents(question, history = [], experimentContext = '') {
  const contents = [];

  const validHistory = (Array.isArray(history) ? history : [])
    .filter(item => item && typeof item.text === 'string' && item.text.trim().length > 0)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      text: item.text.trim()
    }));

  let lastRole = null;
  for (const item of validHistory) {
    // Gemini multi-turn contents must start with 'user'
    if (contents.length === 0 && item.role !== 'user') {
      continue;
    }
    if (item.role === lastRole) {
      contents[contents.length - 1].parts[0].text += `\n\n${item.text}`;
    } else {
      contents.push({
        role: item.role,
        parts: [{ text: item.text }]
      });
      lastRole = item.role;
    }
  }

  let currentPrompt = question.trim();
  if (experimentContext && !currentPrompt.toLowerCase().includes(experimentContext.toLowerCase())) {
    currentPrompt = `[Context Experiment: ${experimentContext}]\n\n${currentPrompt}`;
  }

  if (lastRole === 'user' && contents.length > 0) {
    contents[contents.length - 1].parts[0].text += `\n\n${currentPrompt}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }]
    });
  }

  return contents;
}

/**
 * Handle AI Tutor Question
 * Route: POST /api/ai/tutor
 */
export const handleAITutor = async (req, res) => {
  try {
    const { question, history = [], experimentContext = '' } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Question is required and must be non-empty string',
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Question exceeds maximum length of 2000 characters',
      });
    }

    const normalizedQuestion = question.trim().toLowerCase();
    
    // Create contextual cache key
    let contextKeyPart = '';
    if (Array.isArray(history) && history.length > 0) {
      const prevUser = history.filter(h => h.role === 'user').slice(-1)[0];
      if (prevUser?.text) {
        contextKeyPart = `:${prevUser.text.slice(0, 32).toLowerCase()}`;
      }
    }
    if (experimentContext) {
      contextKeyPart += `:${experimentContext.slice(0, 24).toLowerCase()}`;
    }

    const cacheKey = `ai_cache:${Buffer.from(`${normalizedQuestion}${contextKeyPart}`).toString('base64').slice(0, 64)}`;

    // 1. Check Tier 1 (In-Memory Cache) - 0ms lookup, 0 API tokens
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      console.log(`[AI Tutor Backend] MEMORY CACHE HIT for prompt: "${question.slice(0, 40)}..."`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Cache', 'HIT-MEMORY');
      return res.status(200).send(memCached);
    }

    // 2. Check Tier 2 (Upstash Redis Persistent Cache)
    const redis = getAICacheRedis();
    if (redis) {
      try {
        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
          console.log(`[AI Tutor Backend] REDIS CACHE HIT for prompt: "${question.slice(0, 40)}..."`);
          setToMemoryCache(cacheKey, cachedResponse);
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Cache', 'HIT-REDIS');
          return res.status(200).send(cachedResponse);
        }
      } catch (cacheErr) {
        console.warn('[AI Tutor Backend] Cache lookup skipped:', cacheErr.message);
      }
    }

    const geminiKeys = getGeminiApiKeys();

    if (geminiKeys.length === 0) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Gemini API keys are not configured on the server',
      });
    }

    const contents = buildGeminiContents(question, history, experimentContext);

    let fullResponseText = '';
    let callSucceeded = false;
    let lastErrorType = 'Unknown Error';
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-pro'];

    // 3. Multi-Key & Model Failover Execution
    for (let attempt = 0; attempt < geminiKeys.length; attempt++) {
      const keyIdx = (currentKeyIndex + attempt) % geminiKeys.length;
      const apiKey = geminiKeys[keyIdx];

      for (const modelName of modelsToTry) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
          });

          // Buffer first chunk to verify stream validity before setting headers
          let firstChunkReceived = false;

          for await (const chunk of responseStream) {
            const chunkText = chunk.text || '';
            if (chunkText) {
              if (!firstChunkReceived) {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.setHeader('Transfer-Encoding', 'chunked');
                  res.setHeader('X-Content-Type-Options', 'nosniff');
                  res.setHeader('X-Cache', 'MISS');
                }
                firstChunkReceived = true;
              }
              fullResponseText += chunkText;
              res.write(chunkText);
            }
          }

          callSucceeded = true;
          currentKeyIndex = keyIdx; // Pin current working key for fast future lookups
          console.log(`[AI Tutor Backend] SUCCESS with Key #${keyIdx + 1} (${modelName})`);
          break; // Break model loop on success
        } catch (err) {
          const errMsg = err.message || String(err);
          if (errMsg.includes('429')) lastErrorType = '429 Rate Limit Exceeded';
          else if (errMsg.includes('403')) lastErrorType = '403 Forbidden';
          else if (errMsg.includes('quota') || errMsg.includes('exhausted')) lastErrorType = 'Quota Exhausted';
          else if (errMsg.includes('404')) lastErrorType = `Model ${modelName} 404`;
          else lastErrorType = errMsg.slice(0, 60);

          console.warn(`[AI Tutor Backend] Key #${keyIdx + 1} with ${modelName} failed (${lastErrorType}). Switching...`);
        }
      }

      if (callSucceeded) break; // Break key loop on success
    }

    if (!callSucceeded) {
      const failMsg = `Sorry, all AI channels are currently unavailable (${lastErrorType}). Please try again shortly.`;
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(failMsg);
      }
      res.write(failMsg);
      res.end();
      return;
    }

    // 4. Save to Tier 1 & Tier 2 Cache (7-day TTL = 604800s)
    if (fullResponseText) {
      setToMemoryCache(cacheKey, fullResponseText);
      if (redis) {
        try {
          await redis.set(cacheKey, fullResponseText, { ex: 604800 });
        } catch (e) {
          console.warn('[AI Tutor Backend] Failed to store in Redis cache:', e.message);
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('[AI Tutor Backend Error]:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while generating AI response',
      });
    }
    res.end();
  }
};
