/**
 * Ayurlab AI Tutor Safety Guardrails
 * 
 * Pre-generation filter protecting students and ensuring compliance with:
 * 1. Medical emergency triage (redirects to emergency services 108/112/911)
 * 2. Allopathic synthetic drug prescription blocking (restricted to classical Ayurveda)
 * 3. Prompt injection and jailbreak defense
 * 4. Dangerous/toxic extraction prevention (strictly allows classical Shodhana/purification education)
 */

// Patterns indicating life-threatening emergency situations
const EMERGENCY_PATTERNS = [
  /\b(heart\s*attack|cardiac\s*arrest|myocardial\s*infarction)\b/i,
  /\b(stroke|brain\s*stroke|paralysis\s*attack|facial\s*droop)\b/i,
  /\b(severe\s*chest\s*pain|crushing\s*chest\s*pain)\b/i,
  /\b(cannot\s*breathe|severe\s*shortness\s*of\s*breath|asphyxia|suffocating)\b/i,
  /\b(profuse\s*bleeding|arterial\s*bleeding|hemorrhaging|severe\s*blood\s*loss)\b/i,
  /\b(suicid(e|al)|kill\s*myself|end\s*my\s*life|overdose\s*on)\b/i,
  /\b(swallowed\s*poison|ingested\s*chemical|snake\s*bite|scorpion\s*sting)\b/i,
  /\b(unconscious|passed\s*out|unresponsive\s*person)\b/i,
];

// Patterns requesting synthetic modern pharmaceutical prescriptions
const ALLOPATHIC_PATTERNS = [
  /\b(prescribe|prescription|give\s*me\s*(the\s*)?(dose|dosage)\s*(of)?|how\s*much\s*should\s*i\s*take|what\s*is\s*the\s*(dose|dosage)\s*of)\b.*\b(paracetamol|acetaminophen|ibuprofen|amoxicillin|azithromycin|ciprofloxacin|metformin|atorvastatin|sildenafil|alprazolam|diazepam|tramadol|fentanyl|prednisone|dexamethasone)\b/i,
  /\b(paracetamol|amoxicillin|ibuprofen|antibiotic|steroid\s*injection|chemotherapy)\b.*\b(dose|dosage|prescription|treatment\s*for\s*me)\b/i,
];

// Patterns attempting prompt injection, instruction override, or system prompt exfiltration
const INJECTION_PATTERNS = [
  /\b(ignore\s*(all\s*)?(previous|above)\s*instructions)\b/i,
  /\b(disregard\s*(all\s*)?system\s*prompts?)\b/i,
  /\b(you\s*are\s*now\s*in\s*(dan|developer|jailbreak|unfiltered)\s*mode)\b/i,
  /\b(reveal|show|print|exfiltrate)\s*(your\s*)?(system\s*prompt|system\s*instructions|hidden\s*rules)\b/i,
  /\b(pretend\s*you\s*have\s*no\s*rules|act\s*as\s*an\s*unrestricted\s*ai)\b/i,
];

// Toxic extraction without classical context (educational Shodhana is permitted)
const HARMFUL_PATTERNS = [
  /\b(how\s*to\s*(make|create|extract)\s*(a\s*)?(poison|lethal\s*dose|weapon|explosive))\b/i,
  /\b(kill\s*someone\s*with)\b/i,
];

/**
 * Evaluates a user prompt against safety guardrails before LLM execution
 * @param {string} question - Student input prompt
 * @returns {{ isSafe: boolean, category?: string, response?: string }}
 */
export function checkSafetyGuardrails(question) {
  if (!question || typeof question !== 'string') {
    return { isSafe: true };
  }

  const clean = question.trim();

  // 1. Emergency Medical Guardrail
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSafe: false,
        category: 'EMERGENCY',
        response: `🚨 **EMERGENCY MEDICAL NOTICE**

If you or someone around you is experiencing a medical emergency (such as severe chest pain, stroke symptoms, difficulty breathing, active bleeding, or acute poisoning), **please call emergency services immediately**:

- 🇮🇳 **India**: Call **108** or **112**
- 🇺🇸 **USA/Canada**: Call **911**
- 🇬🇧 **UK**: Call **999** or **111**
- Or proceed directly to the nearest hospital emergency room.

*Ayurlab AI Tutor is strictly an educational BAMS laboratory simulation tool for pharmacy students. It is neither intended nor licensed to diagnose, triage, or treat acute medical emergencies.*`,
      };
    }
  }

  // 2. Allopathic Synthetic Medicine Guardrail
  for (const pattern of ALLOPATHIC_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSafe: false,
        category: 'ALLOPATHIC_RESTRICTION',
        response: `🌿 **Ayurvedic Pharmacology Scope Notice**

Ayurlab AI Tutor is strictly specialized in **Classical Ayurveda, Bhaishajya Kalpana (Ayurvedic Pharmaceutics), and Rasa Shastra (Iatrochemistry)**. 

We do not provide clinical prescriptions, therapeutic dosing, or guidance for synthetic modern pharmaceuticals (allopathic medicines). 

Please consult an authorized medical practitioner for modern drug regimens, or ask an Ayurvedic pharmacology question regarding classical herbal compounding, Rasayanas, or laboratory preparations.`,
      };
    }
  }

  // 3. Prompt Injection & Jailbreak Defense
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSafe: false,
        category: 'PROMPT_INJECTION',
        response: `🔒 **Security & Educational Boundary Notice**

This request cannot be processed because it attempts to override the educational laboratory guardrails of Ayurlab. 

Please ask academic questions related to Ayurvedic pharmacy formulations, laboratory procedures (*Mardana, Paka, Shodhana*), or BAMS coursework.`,
      };
    }
  }

  // 4. Harmful Poison / Weapon Synthesis Defense
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isSafe: false,
        category: 'HARMFUL_SUBSTANCE',
        response: `⚠️ **Safety Constraint Notice**

Ayurlab promotes safe, therapeutic Ayurvedic pharmacy. Queries regarding the extraction of toxins or hazardous compounds for non-medicinal or harmful purposes are strictly prohibited.

If you are studying Upavishas (*Vatsanabha, Gunja, Bhallataka, Kupilu*), please ask specifically about classical **Shodhana (Purification Protocols)** as prescribed in *Rasa Ratna Samuccaya* or *Sharangadhara Samhita*.`,
      };
    }
  }

  return { isSafe: true };
}
