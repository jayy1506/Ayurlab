import Practical from '../models/Practical.js';

/**
 * Classical Samhita Reference Map for primary formulations
 * Provides direct textual citations if not populated in MongoDB document
 */
const CLASSICAL_CITATIONS = {
  triphala: 'Sharangadhara Samhita, Madhyama Khanda 6/1-3',
  trikatu: 'Bhaishajya Ratnavali, Agnimandya Rogadhikara 5/18',
  sitopaladi: 'Sharangadhara Samhita, Madhyama Khanda 6/12-14',
  hingwastaka: 'Ashtanga Hridaya, Chikitsa Sthana 14/35',
  agnitundi: 'Bhaishajya Ratnavali, Agnimandya Rogadhikara',
  chavanprash: 'Charaka Samhita, Chikitsa Sthana 1/1: 62-74',
  haridra_khanda: 'Bhaishajya Ratnavali, Sheetapitta Rogadhikara',
  brahmi_ghrita: 'Charaka Samhita, Chikitsa Sthana 10/25',
  kshara_sutra: 'Sushruta Samhita, Chikitsa Sthana 17',
  dashamularishta: 'Sharangadhara Samhita, Madhyama Khanda 10/78',
  kumaryasava: 'Sharangadhara Samhita, Madhyama Khanda 10/18',
};

/**
 * Normalizes search terms from user question and experiment context
 */
function extractSearchKeywords(question = '', context = '') {
  const combined = `${context} ${question}`.toLowerCase();
  // Strip out common stop words and punctuation
  return combined
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !['what', 'give', 'tell', 'about', 'how', 'does', 'from', 'with', 'this', 'that', 'please', 'step', 'make', 'procedure', 'prepare'].includes(word));
}

/**
 * Retrieves relevant classical practicals and builds a grounded RAG context block
 * @param {string} question - Student prompt
 * @param {string} experimentContext - Optional current laboratory experiment
 * @returns {Promise<{ contextText: string, citations: string[], matchedPracticals: any[] }>}
 */
export async function retrieveClassicalContext(question, experimentContext = '') {
  try {
    const keywords = extractSearchKeywords(question, experimentContext);
    let matchedPracticals = [];

    // 1. Direct match on experimentContext if provided
    if (experimentContext && experimentContext.trim()) {
      const cleanCtx = experimentContext.trim();
      const directMatch = await Practical.findOne({
        name: { $regex: new RegExp(cleanCtx, 'i') },
        isActive: true,
      }).lean();

      if (directMatch) {
        matchedPracticals.push(directMatch);
      }
    }

    // 2. Text or Keyword Search on MongoDB collection
    if (matchedPracticals.length < 3 && keywords.length > 0) {
      const searchQuery = keywords.slice(0, 5).join(' ');
      
      let dbMatches = [];
      try {
        // Try MongoDB text search
        dbMatches = await Practical.find(
          { $text: { $search: searchQuery }, isActive: true },
          { score: { $meta: 'textScore' } }
        )
          .sort({ score: { $meta: 'textScore' } })
          .limit(3)
          .lean();
      } catch (err) {
        // Fallback to regex search on name & category if text index isn't ready
        const regexConditions = keywords.slice(0, 3).map(kw => ({
          $or: [
            { name: { $regex: kw, $options: 'i' } },
            { category: { $regex: kw, $options: 'i' } },
            { 'ingredients.name': { $regex: kw, $options: 'i' } },
          ],
        }));
        dbMatches = await Practical.find({ $or: regexConditions, isActive: true })
          .limit(3)
          .lean();
      }

      for (const item of dbMatches) {
        if (!matchedPracticals.some(p => p._id.toString() === item._id.toString())) {
          matchedPracticals.push(item);
          if (matchedPracticals.length >= 3) break;
        }
      }
    }

    if (matchedPracticals.length === 0) {
      return {
        contextText: '',
        citations: [],
        matchedPracticals: [],
      };
    }

    const citations = [];
    const contextSections = matchedPracticals.map(p => {
      // Find or build classical citation
      const key = Object.keys(CLASSICAL_CITATIONS).find(k => p.name.toLowerCase().includes(k));
      const citation = p.shlok?.trim() || (key ? CLASSICAL_CITATIONS[key] : 'Ayurvedic Pharmacopoeia of India (AFI)');
      if (!citations.includes(citation)) {
        citations.push(citation);
      }

      const ingredientStr = (p.ingredients || [])
        .map(ing => `${ing.name} (${ing.qty || (ing.ratio ? `${ing.ratio} part` : 'Q.S.')})`)
        .join(', ');

      const apparatusStr = (p.apparatus || []).join(', ');
      const precautionsStr = (p.precautions || []).slice(0, 3).join('; ');
      const stepsStr = (p.steps || []).slice(0, 4).join(' -> ');

      let siddhiStr = '';
      if (p.siddhiLakshana) {
        if (typeof p.siddhiLakshana === 'string') {
          siddhiStr = p.siddhiLakshana;
        } else if (typeof p.siddhiLakshana === 'object') {
          siddhiStr = Object.entries(p.siddhiLakshana)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');
        }
      }

      return `[PRACTICAL: ${p.name}]
- Category: ${p.category || 'Bhaishajya Kalpana'}
- Classical Authority / Citation: ${citation}
- Standard Ratio & Ingredients: ${ingredientStr || 'Classical standard'}
- Key Apparatus: ${apparatusStr || 'Khalva Yantra, Clean Cloth'}
- Laboratory Procedure Highlights: ${stepsStr || 'Classical preparation'}
- Siddhi Lakshana (Classical End-Signs): ${siddhiStr || 'Sukshmatva, uniform color, organoleptic perfection'}
- Safety & Precautions: ${precautionsStr || 'Ensure raw drug purity'}`;
    });

    const contextText = `=== GROUNDED CLASSICAL AYURVEDIC KNOWLEDGE BASE ===
The following authenticated classical data from the BAMS laboratory curriculum must be used as primary grounding for your answer:

${contextSections.join('\n\n')}

MANDATORY GROUNDING INSTRUCTIONS:
1. Always explicitly cite the Classical Treatise / Reference indicated above when discussing preparation, ratios, or dosage.
2. Ensure compounding steps and Siddhi Lakshanas match the authenticated procedures above.`;

    return {
      contextText,
      citations,
      matchedPracticals,
    };
  } catch (error) {
    console.warn('[RAG Retriever Warning] Failed to retrieve practicals:', error.message);
    return {
      contextText: '',
      citations: [],
      matchedPracticals: [],
    };
  }
}
