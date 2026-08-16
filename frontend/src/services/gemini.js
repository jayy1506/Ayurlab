import { GoogleGenAI } from '@google/genai';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';

// 4 Provided Keys for Fallback - strictly for Tutor mode
const TUTOR_API_KEYS = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4
].filter(Boolean);

// Fallback logic for normal operations (e.g. video mock)
const defaultApiKey = import.meta.env.VITE_GEMINI_API_KEY || TUTOR_API_KEYS[0];
let defaultAi;
if (defaultApiKey && defaultApiKey !== 'your_gemini_api_key_here') {
  defaultAi = new GoogleGenAI({ apiKey: defaultApiKey });
}

// Keep track of the currently working key to avoid waiting for dead keys on every request
let currentKeyIndex = 0;

export const askTutor = async (question, onChunk) => {
  const systemInstruction = `You are an AI Ayurveda Virtual Lab Tutor. You must STRICTLY restrict your answers to Ayurveda, herbal medicine, traditional compounding, and practical chemistry related to this virtual lab. If the user asks anything unrelated to the project, you must respond EXACTLY with: 'This question is not related to the project'.

CRITICAL FORMATTING INSTRUCTIONS:
1. Provide answers ONLY in concise point-to-point formats (bullet points or numbered lists).
2. Keep your answers brief and easy to understand.
3. Avoid long paragraphs. Give point-to-point answers only.
4. Use simple line breaks to align your points clearly.`;

  // 1. Check Global Cloud Cache
  if (db) {
    try {
      const cacheRef = collection(db, 'tutor_cache');
      const normalizedQuestion = question.trim().toLowerCase();
      const q = query(cacheRef, where("prompt", "==", normalizedQuestion), limit(1));
      
      // Add a strict timeout to cache fetch so it doesn't hang
      const querySnapshot = await Promise.race([
        getDocs(q),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Cache timeout")), 2000))
      ]);

      if (!querySnapshot.empty) {
        console.log("[Tutor AI] CACHE HIT - Returning cached response for all users");
        const cachedText = querySnapshot.docs[0].data().response;
        if (onChunk) onChunk(cachedText);
        return cachedText;
      }
      console.log("[Tutor AI] CACHE MISS - Fetching from Gemini API");
    } catch (err) {
      console.warn("[Tutor AI] Cache DB Skipped or Timeout:", err.message || err);
    }
  }

  // 2. One-stop Fallback System (Rotate Keys smartly)
  let lastErrorMsg = "Unable to process request.";
  
  for (let attempt = 0; attempt < TUTOR_API_KEYS.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % TUTOR_API_KEYS.length;
    const key = TUTOR_API_KEYS[keyIndex];
    
    try {
      console.log(`[Tutor AI] Attempting with API Key ${keyIndex + 1}`);
      const ai = new GoogleGenAI({ apiKey: key });
      
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash', 
        contents: question,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      let responseText = "";
      for await (const chunk of responseStream) {
        responseText += chunk.text;
        if (onChunk) onChunk(responseText);
      }
      
      console.log(`[Tutor AI] SUCCESS with Key ${keyIndex + 1}`);
      currentKeyIndex = keyIndex; 
      
      // Save to global cloud cache
      if (db) {
        try {
          const cacheRef = collection(db, 'tutor_cache');
          await addDoc(cacheRef, {
            prompt: question.trim().toLowerCase(),
            originalPrompt: question,
            response: responseText,
            timestamp: serverTimestamp()
          });
        } catch (err) {
           console.error("[Tutor AI] Failed to save to cache:", err);
        }
      }

      return responseText;

    } catch (error) {
      // 3. Smart Logging for errors
      const errorMessage = error.message || String(error);
      let errorType = "Unknown Error";
      
      if (errorMessage.includes("429")) errorType = "429 Too Many Requests";
      else if (errorMessage.includes("403")) errorType = "403 Permission Issue";
      else if (errorMessage.includes("401")) errorType = "401 Invalid Key";
      else if (errorMessage.includes("quota") || errorMessage.includes("exhausted")) errorType = "Quota Exhausted";

      console.warn(`[Tutor AI] FAIL with Key ${keyIndex + 1} - ${errorType}`, errorMessage);
      lastErrorMsg = errorType;
      // Loop will continue to next key
    }
  }

  // If all keys fail
  console.error("[Tutor AI] ERROR - All API keys failed.");
  return `Sorry, all API channels are currently unavailable (${lastErrorMsg}). Please try again later.`;
};

export const generateVideoMock = async (prompt) => {
  if (!defaultAi) {
    return Promise.reject(new Error("API Key not configured."));
  }
  
  console.log(`Simulating video generation for: ${prompt}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      let videoFile = "/videos/sitophaladi churna.mp4";
      const p = prompt.toLowerCase();
      
      if (p.includes("hingwastaka")) {
        videoFile = "/videos/Hingwastaka Churna Preparation Guide_720p_caption.mp4";
      } else if (p.includes("agnitundi")) {
        videoFile = "/videos/agnitundi vati.mp4";
      }
      
      resolve(videoFile);
    }, 2000);
  });
};
