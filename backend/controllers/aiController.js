import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';
import { checkSafetyGuardrails } from '../utils/aiSafetyGuardrails.js';
import { retrieveClassicalContext } from '../utils/ragRetriever.js';
import AIInteraction from '../models/AIInteraction.js';

// ----------------------------------------------------
// TIER 1: In-Memory Fast Cache (Zero latency & Token Saver)
// ----------------------------------------------------
const memoryCache = new Map(); // key -> { text, timestamp, interactionId }
const MEMORY_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const MAX_MEMORY_ITEMS = 500;

function getFromMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > MEMORY_CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  return cached;
}

function setToMemoryCache(key, text, interactionId = '') {
  if (memoryCache.size >= MAX_MEMORY_ITEMS) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, { text, interactionId, timestamp: Date.now() });
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
  ].filter(Boolean);

  return [...new Set(keys)];
}

let currentKeyIndex = 0;

const BASE_SYSTEM_INSTRUCTION = `You are the AI Ayurveda Virtual Lab Senior Faculty Tutor for BAMS (Bachelor of Ayurvedic Medicine and Surgery) scholars.

SCOPE RESTRICTION:
You must STRICTLY restrict your answers to Classical Ayurveda, Dravyaguna (Herbal Pharmacology), Rasashastra (Iatrochemistry & Mineral Compounding), and Bhaishajya Kalpana (Ayurvedic Pharmaceutics).
If the user asks questions completely unrelated to Ayurveda or pharmacy, respond EXACTLY with: 'This question is not related to the project'.

CITATION & GROUNDING RULES:
1. CITATIONS ARE MANDATORY: Whenever you explain a formulation, shloka, dosage, or therapeutic property, you MUST cite the classical Ayurvedic treatise (e.g., Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Sharangadhara Samhita, Bhaishajya Ratnavali, or the Ayurvedic Pharmacopoeia of India - AFI).
2. LAB SPECIFICATIONS: When discussing laboratory compounding, explicitly state:
   - Primary apparatus (e.g. Khalva Yantra, Dola Yantra, Valuka Yantra, Kupipakva, Puta).
   - Agni intensity (Mridu, Madhyama, or Teekshna Agni) and temperature implications.
   - Organoleptic Siddhi Lakshanas (classical endpoint tests such as Sukshmatva, Varitara, Rekhapurna, Varna, Gandha, Rasa).
3. If provided with [GROUNDED CLASSICAL AYURVEDIC KNOWLEDGE BASE], prioritize and faithfully reproduce those laboratory specifications. You should also draw upon your broader classical mastery of Brihat Trayi (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) and Laghu Trayi (Sharangadhara Samhita, Bhavaprakasha, Bhaishajya Ratnavali) to fully answer questions about formulations, proportions, and therapeutic properties. Never refuse to answer legitimate Ayurvedic queries.

FORMATTING EXCELLENCE:
1. Provide thoughtful, well-structured, authoritative, and direct responses matching modern ChatGPT formatting.
2. Structure your answer with:
   - A clear direct introductory line clarifying the exact formulation or topic.
   - For ranked lists, compounding stages, lakshanas, or viva Q&A, use numbered points (1., 2., 3.) or ranking badges (🥇, 🥈, 🥉) with bold headings and concise answers.
   - Follow with practical laboratory insights or classical citations.
   - Conclude with an actionable academic follow-up tip for BAMS practical exams.`;

/**
 * Builds valid alternating Gemini contents array with history and RAG context
 */
function buildGeminiContents(question, history = [], experimentContext = '', ragContext = '') {
  const contents = [];

  const validHistory = (Array.isArray(history) ? history : [])
    .filter(item => item && typeof item.text === 'string' && item.text.trim().length > 0)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      text: item.text.trim()
    }));

  let lastRole = null;
  for (const item of validHistory) {
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

  let promptBuilder = '';
  if (ragContext) {
    promptBuilder += `${ragContext}\n\n`;
  }
  if (experimentContext && !question.toLowerCase().includes(experimentContext.toLowerCase())) {
    promptBuilder += `[Current Active Lab Experiment: ${experimentContext}]\n\n`;
  }
  promptBuilder += question.trim();

  if (lastRole === 'user' && contents.length > 0) {
    contents[contents.length - 1].parts[0].text += `\n\n${promptBuilder}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: promptBuilder }]
    });
  }

  return contents;
}

/**
 * Handle AI Tutor Question with Safety Guardrails, RAG, and Interaction Persistence
 * Route: POST /api/ai/tutor
 */
export const handleAITutor = async (req, res) => {
  try {
    const { question, history = [], experimentContext = '', userName = '' } = req.body;

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

    const cleanQuestion = question.trim();
    const effectiveUserName = req.user?.name || userName || 'Student Scholar';
    const collegeId = req.user?.collegeId || process.env.COLLEGE_ID || 'COLLEGE_001';

    // ----------------------------------------------------
    // STEP 1: AI Safety Guardrails Pre-Check (Zero Token Waste)
    // ----------------------------------------------------
    const safetyCheck = checkSafetyGuardrails(cleanQuestion);
    if (!safetyCheck.isSafe) {
      // Persist safety interaction to MongoDB
      const safetyInteraction = await AIInteraction.create({
        user: req.user?._id || null,
        userName: effectiveUserName,
        practicalId: experimentContext || '',
        question: cleanQuestion,
        answer: safetyCheck.response,
        feedback: `FLAGGED_${safetyCheck.category}`,
        collegeId,
      }).catch(err => console.warn('[AI Safety Interaction Log Error]:', err.message));

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Safety-Flag', safetyCheck.category || 'RESTRICTED');
      if (safetyInteraction?._id) {
        res.setHeader('X-Interaction-Id', safetyInteraction._id.toString());
      }
      return res.status(200).send(safetyCheck.response);
    }

    // ----------------------------------------------------
    // STEP 2: Cache Key Generation & Lookup
    // ----------------------------------------------------
    const normalizedQuestion = cleanQuestion.toLowerCase();
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

    // Tier 1 (Memory Cache)
    const memCached = getFromMemoryCache(cacheKey);
    if (memCached) {
      console.log(`[AI Tutor Backend] MEMORY CACHE HIT for prompt: "${cleanQuestion.slice(0, 40)}..."`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Cache', 'HIT-MEMORY');
      if (memCached.interactionId) {
        res.setHeader('X-Interaction-Id', memCached.interactionId);
      }
      return res.status(200).send(memCached.text);
    }

    // Tier 2 (Redis Cache)
    const redis = getAICacheRedis();
    if (redis) {
      try {
        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
          console.log(`[AI Tutor Backend] REDIS CACHE HIT for prompt: "${cleanQuestion.slice(0, 40)}..."`);
          setToMemoryCache(cacheKey, cachedResponse);
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Cache', 'HIT-REDIS');
          return res.status(200).send(cachedResponse);
        }
      } catch (cacheErr) {
        console.warn('[AI Tutor Backend] Cache lookup skipped:', cacheErr.message);
      }
    }

    // ----------------------------------------------------
    // STEP 3: RAG Retrieval from 65 Classical Practicals
    // ----------------------------------------------------
    const { contextText: ragContext, citations, matchedPracticals } = await retrieveClassicalContext(
      cleanQuestion,
      experimentContext
    );

    const geminiKeys = getGeminiApiKeys();
    if (geminiKeys.length === 0) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Gemini API keys are not configured on the server',
      });
    }

    const contents = buildGeminiContents(cleanQuestion, history, experimentContext, ragContext);

    let fullResponseText = '';
    let callSucceeded = false;
    let lastErrorType = 'Unknown Error';
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
    ];

    // ----------------------------------------------------
    // STEP 4: Multi-Key & Model Failover Generation
    // ----------------------------------------------------
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
              systemInstruction: BASE_SYSTEM_INSTRUCTION,
            },
          });

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
                  if (citations.length > 0) {
                    const safeCitations = citations
                      .slice(0, 3)
                      .join('; ')
                      .replace(/[^\x20-\x7E]/g, '')
                      .trim();
                    if (safeCitations) {
                      res.setHeader('X-Classical-Citations', safeCitations);
                    }
                  }
                }
                firstChunkReceived = true;
              }
              fullResponseText += chunkText;
              res.write(chunkText);
            }
          }

          callSucceeded = true;
          currentKeyIndex = keyIdx;
          console.log(`[AI Tutor Backend] SUCCESS with Key #${keyIdx + 1} (${modelName})`);
          break;
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

      if (callSucceeded) break;
    }

    if (!callSucceeded) {
      if (ragContext && matchedPracticals.length > 0) {
        const topPrac = matchedPracticals[0];
        const ingList = (topPrac.ingredients || [])
          .map((i) => `• **${i.name}**${i.qty ? ` (${i.qty})` : ''}`)
          .slice(0, 10)
          .join('\n');

        const fallbackAnswer = `🌿 **${topPrac.name} (Classical Samhita Reference)**

**Classical Treatise**: ${topPrac.shlok ? 'Bhaishajya Ratnavali / Sharangadhara Samhita' : 'Ayurvedic Pharmacopoeia of India (AFI)'}
**Category**: ${topPrac.category || 'Classical Kalpana'}

**Canonical Ingredients**:
${ingList || '• Classical Rasa Shastra raw ingredients'}

**Apparatus & Compounding Standard**:
• Primary Apparatus: ${(topPrac.apparatus || ['Khalva Yantra', 'Cloth', 'Tray']).join(', ')}
• Compounding Action: Thorough *Mardana* (trituration) and *Bhavana* with prescribed swarasa/liquid to achieve desired organoleptic consistency (*Siddhi Lakshana*).

💡 *BAMS Practical Viva Tip: Pay special attention to the Shodhana (purification) protocol for any poisonous botanicals or mineral drugs in this formulation.*`;

        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Cache', 'RAG-FALLBACK');
          return res.status(200).send(fallbackAnswer);
        }
        res.write(fallbackAnswer);
        res.end();
        return;
      }

      const failMsg = `Sorry, all AI channels are currently unavailable (${lastErrorType}). Please try again shortly.`;
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(failMsg);
      }
      res.write(failMsg);
      res.end();
      return;
    }

    // ----------------------------------------------------
    // STEP 5: Persistence to MongoDB & Caching
    // ----------------------------------------------------
    let savedInteractionId = '';
    if (fullResponseText) {
      try {
        const interactionDoc = await AIInteraction.create({
          user: req.user?._id || null,
          userName: effectiveUserName,
          practical: matchedPracticals[0]?._id || null,
          practicalId: matchedPracticals[0]?.name || experimentContext || '',
          question: cleanQuestion,
          answer: fullResponseText,
          collegeId,
        });
        savedInteractionId = interactionDoc._id.toString();
      } catch (logErr) {
        console.warn('[AI Interaction Log Error]:', logErr.message);
      }

      setToMemoryCache(cacheKey, fullResponseText, savedInteractionId);
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

/**
 * Submit Rating and Feedback for an AI Interaction
 * Route: POST /api/ai/rating
 */
export const rateAIInteraction = async (req, res) => {
  try {
    const { interactionId, rating, feedback = '' } = req.body;

    if (!interactionId) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'interactionId is required',
      });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const interaction = await AIInteraction.findById(interactionId);
    if (!interaction) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'AI Interaction record not found',
      });
    }

    interaction.rating = numRating;
    if (feedback && typeof feedback === 'string') {
      interaction.feedback = feedback.trim();
    }
    await interaction.save();

    return res.status(200).json({
      success: true,
      message: 'Rating recorded successfully',
      interaction: {
        id: interaction._id,
        rating: interaction.rating,
        feedback: interaction.feedback,
      },
    });
  } catch (error) {
    console.error('[Rate AI Interaction Error]:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to record rating',
    });
  }
};

/**
 * Get AI Interaction History (Paginated)
 * Route: GET /api/ai/history
 */
export const getAIHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    // If student, only see own interactions
    if (req.user && req.user.role === 'student') {
      query.user = req.user._id;
    } else if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
      // Filter by college if available
      if (req.user.collegeId) {
        query.collegeId = req.user.collegeId;
      }
    }

    const [interactions, total] = await Promise.all([
      AIInteraction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('practical', 'name category')
        .lean(),
      AIInteraction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      interactions,
    });
  } catch (error) {
    console.error('[Get AI History Error]:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve AI interaction history',
    });
  }
};
