/**
 * AI Tutor Client Service
 * Features:
 * 1. Client-side instant query caching (saves 100% tokens on repeated queries)
 * 2. Secure routing strictly through backend API (/api/ai/tutor) with multi-key failover & Redis
 * 3. Safe fallback message if backend is unreachable (zero client-side API key exposure)
 */

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

const FRIENDLY_ERROR_MESSAGE = 
  '🌿 Ayurvedic AI Tutor is currently unavailable. Please verify your internet connection or try again in a moment.';

/**
 * Main askTutor function
 */
export const askTutor = async (question, onChunk, history = [], experimentContext = '', onMetadata = null) => {
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

  // 2. Query Backend API with cookie credentials & authorization headers
  try {
    const response = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ 
        question: cleanQuestion,
        history,
        experimentContext
      }),
    });

    const interactionId = response.headers.get('x-interaction-id') || '';
    const citations = response.headers.get('x-classical-citations') || '';
    if (onMetadata && (interactionId || citations)) {
      onMetadata({ interactionId, citations });
    }

    // Handle Rate Limiting (429)
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '15';
      const limitMsg = `⏳ Rate limit reached. Please wait ${retryAfter} seconds before asking your next question.`;
      if (onChunk) onChunk(limitMsg);
      return limitMsg;
    }

    if (!response.ok) {
      let errMsg = FRIENDLY_ERROR_MESSAGE;
      try {
        const errorJson = await response.json();
        if (errorJson.message) {
          errMsg = `⚠️ ${errorJson.message}`;
        }
      } catch (e) {}
      if (onChunk) onChunk(errMsg);
      return errMsg;
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
      const fallbackMsg = '⚠️ The AI Tutor service is currently experiencing high load. Please try again shortly.';
      if (onChunk) onChunk(fallbackMsg);
      return fallbackMsg;
    }

    return accumulatedText;
  } catch (err) {
    console.error('[AI Tutor Client] Backend fetch failed:', err.message);
    if (onChunk) onChunk(FRIENDLY_ERROR_MESSAGE);
    return FRIENDLY_ERROR_MESSAGE;
  }
};

/**
 * Submit star rating and feedback for an AI tutor response
 */
export const rateInteraction = async (interactionId, rating, feedback = '') => {
  if (!interactionId) return false;
  try {
    const token = localStorage.getItem('ayurveda_token') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/ai/rating', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ interactionId, rating: Number(rating), feedback }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[AI Tutor Client] Failed to submit rating:', err.message);
    return false;
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
