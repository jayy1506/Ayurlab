/**
 * AI Tutor Client Service
 * Features:
 * 1. Client-side instant query caching (saves 100% tokens on repeated queries)
 * 2. Primary routing through backend API (/api/ai/tutor) with multi-key failover & Redis
 * 3. Client-side direct failover fallback with GoogleGenAI rotation if backend is unreachable
 */
import { GoogleGenAI } from '@google/genai';

// ----------------------------------------------------
// Tier 0: Client Browser Cache (0 token usage for repeated questions)
// ----------------------------------------------------
const clientCache = new Map();

function getCachedReply(query) {
  const key = query.trim().toLowerCase();
  if (clientCache.has(key)) {
    return clientCache.get(key);
  }
  try {
    const sessionItem = sessionStorage.getItem(`ayur_ai_${key.slice(0, 48)}`);
    if (sessionItem) {
      clientCache.set(key, sessionItem);
      return sessionItem;
    }
  } catch (e) {}
  return null;
}

function setCachedReply(query, text) {
  if (!text || text.length < 5) return;
  const key = query.trim().toLowerCase();
  clientCache.set(key, text);
  try {
    sessionStorage.setItem(`ayur_ai_${key.slice(0, 48)}`, text);
  } catch (e) {}
}

const SYSTEM_INSTRUCTION = `You are an AI Ayurveda Virtual Lab Tutor for BAMS medical students. You must STRICTLY restrict your answers to Ayurveda, herbal medicine, traditional compounding (Bhaishajya Kalpana & Rasashastra), and practical laboratory chemistry related to this virtual lab. If the user asks anything unrelated to Ayurveda or this project, you must respond EXACTLY with: 'This question is not related to the project'.

CHATGPT RESPONSE PATTERN:
1. Provide thoughtful, well-structured, authoritative, and direct responses matching modern ChatGPT formatting.
2. Structure your answer with:
   - A clear direct introductory paragraph setting context.
   - For ranked lists, compounding stages, or lakshanas, use ranking badges (🥇, 🥈, 🥉, 4️⃣, 5️⃣, etc.) or clean numbered steps (1., 2., 3.) with clear bold terms.
   - Follow with concise practical insights or classical references.
   - Conclude with a helpful, actionable follow-up line (e.g. "If you'd like, I can detail the specific heating temperature curves or Sanskrit Shlokas for this procedure.").
3. Keep every point medically precise, clean, and engaging.`;

// Client-side fallback keys
function getClientGeminiKeys() {
  const env = import.meta.env || {};
  const keys = [
    env.VITE_GEMINI_KEY_1,
    env.VITE_GEMINI_KEY_2,
    env.VITE_GEMINI_KEY_3,
    env.VITE_GEMINI_KEY_4,
    env.VITE_GEMINI_API_KEY,
  ].filter(Boolean);

  return [...new Set(keys)];
}

let clientKeyIndex = 0;

/**
 * Direct Client-Side Fallback Generation
 * Automatically used if backend server is unreachable.
 */
/**
 * Direct Client-Side Fallback Generation
 * Automatically used if backend server is unreachable.
 */
async function fallbackDirectGemini(question, onChunk, history = [], experimentContext = '') {
  const keys = getClientGeminiKeys();
  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured on client.');
  }

  // Format history for GoogleGenAI
  const contents = [];
  const validHistory = (Array.isArray(history) ? history : [])
    .filter(item => item && typeof item.text === 'string' && item.text.trim().length > 0)
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      text: item.text.trim()
    }));

  let lastRole = null;
  for (const item of validHistory) {
    if (contents.length === 0 && item.role !== 'user') continue;
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

  let accumulatedText = '';
  let callSucceeded = false;
  let lastErr = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIdx = (clientKeyIndex + attempt) % keys.length;
    const apiKey = keys[keyIdx];

    try {
      const ai = new GoogleGenAI({ apiKey });
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          accumulatedText += text;
          if (onChunk) onChunk(accumulatedText);
        }
      }

      callSucceeded = true;
      clientKeyIndex = keyIdx;
      setCachedReply(question, accumulatedText);
      return accumulatedText;
    } catch (err) {
      console.warn(`[Client AI Fallback] Key #${keyIdx + 1} failed:`, err.message || err);
      lastErr = err;
    }
  }

  if (!callSucceeded) {
    throw lastErr || new Error('All AI keys unavailable.');
  }
  return accumulatedText;
}

/**
 * Main askTutor function
 */
export const askTutor = async (question, onChunk, history = [], experimentContext = '') => {
  if (!question || !question.trim()) {
    return 'Please ask a valid question.';
  }

  const cleanQuestion = question.trim();

  // 1. Instant Return from Client Cache if already searched and no multi-turn history
  const isFollowUp = Array.isArray(history) && history.length > 0;
  if (!isFollowUp) {
    const cached = getCachedReply(cleanQuestion);
    if (cached) {
      console.log('[AI Tutor Client] Returning from instant local cache (Tokens saved: 100%)');
      if (onChunk) onChunk(cached);
      return cached;
    }
  }

  const token = localStorage.getItem('ayurveda_token') || '';
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2. Try Backend API
  try {
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        question: cleanQuestion,
        history,
        experimentContext
      }),
    });

    // Handle Rate Limiting (429)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '10';
      const limitMsg = `⏳ Rate limit reached. You can ask up to 5 questions per 10 seconds. Please wait ${retryAfter}s.`;
      if (onChunk) onChunk(limitMsg);
      return limitMsg;
    }

    if (!response.ok) {
      console.warn('[AI Tutor Client] Backend returned non-OK status. Falling back to direct client AI...');
      return await fallbackDirectGemini(cleanQuestion, onChunk, history, experimentContext);
    }

    const contentType = response.headers.get('content-type') || '';

    // If backend returned plain JSON
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const text = data.response || 'No response generated.';
      setCachedReply(cleanQuestion, text);
      if (onChunk) onChunk(text);
      return text;
    }

    // Streamed chunked text response
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      if (onChunk) {
        onChunk(accumulatedText);
      }
    }

    if (accumulatedText && !accumulatedText.startsWith('Sorry, all AI channels')) {
      setCachedReply(cleanQuestion, accumulatedText);
    } else if (accumulatedText.startsWith('Sorry, all AI channels')) {
      // If backend exhausted channels, try direct client fallback
      console.warn('[AI Tutor Client] Backend channels exhausted. Trying direct client rotation...');
      return await fallbackDirectGemini(cleanQuestion, onChunk, history, experimentContext);
    }

    return accumulatedText;
  } catch (err) {
    console.warn('[AI Tutor Client] Backend network fetch failed. Switching to direct client AI fallback:', err.message);
    try {
      return await fallbackDirectGemini(cleanQuestion, onChunk, history, experimentContext);
    } catch (fallbackErr) {
      console.error('[AI Tutor Client All Fallbacks Failed]:', fallbackErr);
      const errMsg = 'Sorry, the AI Tutor service is temporarily unavailable. Please verify your internet connection and try again in a moment.';
      if (onChunk) onChunk(errMsg);
      return errMsg;
    }
  }
};

export const generateVideoMock = async (prompt) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let videoFile = '/videos/sitophaladi churna.mp4';
      const p = (prompt || '').toLowerCase();
      if (p.includes('hingwastaka')) {
        videoFile = '/videos/Hingwastaka Churna Preparation Guide_720p_caption.mp4';
      } else if (p.includes('agnitundi')) {
        videoFile = '/videos/agnitundi vati.mp4';
      }
      resolve(videoFile);
    }, 2000);
  });
};
