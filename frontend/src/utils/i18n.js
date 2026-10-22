/**
 * Ayurlab Bilingual Classical Sanskrit & English Localization Dictionary
 * Provides Devanagari script, IAST transliteration, and English descriptions
 * for classical BAMS pharmaceutics (Bhaishajya Kalpana & Rasa Shastra).
 */

export const TRANSLATIONS = {
  en: {
    // Actions & Operations
    mardan: 'Mardana (Trituration)',
    bhavana: 'Bhavana (Levigation)',
    sifting: 'Vastragalita (Cloth Sifting)',
    agni: 'Agnidana (Controlled Heating)',
    mix: 'Mishrana (Homogenization)',
    filter: 'Galana (Filtration)',
    form_pills: 'Vati Nirmana (Pill Rolling)',

    // Utensils & Apparatus
    khalva_yantra: 'Khalva Yantra (Mortar & Pestle)',
    mortar_pestle: 'Khalva Yantra',
    cloth: 'Vastra (Fine Muslin Cloth)',
    tray: 'Sharava (Drying Tray)',
    spoon: 'Darvi (Lab Spoon)',
    burner: 'Agni Kunda / Gas Burner',
    dola_yantra: 'Dola Yantra (Swinging Basket)',
    valuka_yantra: 'Valuka Yantra (Sand Bath)',

    // Agni Intensity
    agni_none: 'No Heat (Ambient)',
    agni_mridu: 'Mridu Agni (Low Heat < 70°C)',
    agni_madhyama: 'Madhyama Agni (Moderate 70-100°C)',
    agni_teekshna: 'Teekshna Agni (Intense > 100°C)',

    // Endpoints & Siddhi Lakshanas
    siddhi_lakshana: 'Siddhi Lakshana (Signs of Perfection)',
    sukshmatva: 'Sukshmatva (Fine Sifted Powder)',
    samarasatva: 'Samarasatva (Uniform Homogeneity)',
    sampramana: 'Sampramana (Classical Proportion)',
    rekhapurna: 'Rekhapurnatva (Enters Skin Creases)',
    varitara: 'Varitara (Floats on Water)',

    // Ingredients
    haritaki: 'Haritaki (Terminalia chebula)',
    bibhitaki: 'Bibhitaki (Terminalia bellirica)',
    amalaki: 'Amalaki (Emblica officinalis)',
    sunthi: 'Sunthi (Dry Ginger)',
    maricha: 'Maricha (Black Pepper)',
    pippali: 'Pippali (Long Pepper)',
    mishri: 'Mishri (Rock Sugar)',
    vanshalochan: 'Vanshalochan (Bamboo Manna)',
    ela: 'Ela (Cardamom)',
    twak: 'Twak (Cinnamon)',

    // Formulations
    triphala_churna: 'Triphala Churna',
    trikatu_churna: 'Trikatu Churna',
    sitopaladi_churna: 'Sitopaladi Churna',

    // UI Labels
    canvas_title: 'Laboratory Workbench',
    drag_drop_prompt: 'Drag and drop or click items to compound on the workbench',
    empty_workbench: 'Workbench Empty. Place a Khalva Yantra or Utensil to begin.',
    contents: 'Contents',
    complete_experiment: 'Evaluate & Complete',
    reset: 'Reset Workbench',
    exit: 'Exit Lab',
  },

  sa: {
    // Actions & Operations (Devanagari)
    mardan: 'मर्दनम् (Trituration)',
    bhavana: 'भावना (Levigation)',
    sifting: 'वस्त्रगालितम् (Cloth Sifting)',
    agni: 'अग्निदानम् (Controlled Heating)',
    mix: 'मिश्रणम् (Homogenization)',
    filter: 'गालनम् (Filtration)',
    form_pills: 'वटीनिर्माणम् (Pill Rolling)',

    // Utensils & Apparatus
    khalva_yantra: 'खल्लयन्त्रम् (Khalva Yantra)',
    mortar_pestle: 'खल्लयन्त्रम्',
    cloth: 'शुद्धवस्त्रम् (Clean Cloth)',
    tray: 'शरावः (Clay Dish/Tray)',
    spoon: 'दर्वी (Spoon/Spatula)',
    burner: 'अग्निकुण्डम् (Burner)',
    dola_yantra: 'दोलायन्त्रम् (Dola Yantra)',
    valuka_yantra: 'वालुकायन्त्रम् (Sand Bath)',

    // Agni Intensity
    agni_none: 'अग्निरहितम् (Ambient)',
    agni_mridu: 'मृद्वग्निः (< 70°C)',
    agni_madhyama: 'मध्यमाग्निः (70-100°C)',
    agni_teekshna: 'तीक्ष्णाग्निः (> 100°C)',

    // Endpoints & Siddhi Lakshanas
    siddhi_lakshana: 'सिद्धिलक्षणम् (Siddhi Lakshana)',
    sukshmatva: 'सूक्ष्मत्वम् (Sukshmatva)',
    samarasatva: 'समरसत्वम् (Samarasatva)',
    sampramana: 'समप्रमाणम् (Equal Ratio)',
    rekhapurna: 'रेखापूर्णत्वम् (Rekhapurnatva)',
    varitara: 'वारितरत्वम् (Varitara)',

    // Ingredients
    haritaki: 'हरीतकी (Haritaki)',
    bibhitaki: 'बिभीतकम् (Bibhitaki)',
    amalaki: 'आमलकी (Amalaki)',
    sunthi: 'शुण्ठी (Sunthi)',
    maricha: 'मरिचम् (Maricha)',
    pippali: 'पिप्पली (Pippali)',
    mishri: 'सिता / मिश्री (Mishri)',
    vanshalochan: 'वंशलोचनम् (Vanshalochan)',
    ela: 'एला (Ela)',
    twak: 'त्वक् (Twak)',

    // Formulations
    triphala_churna: 'त्रिफला चूर्णम्',
    trikatu_churna: 'त्रिकटु चूर्णम्',
    sitopaladi_churna: 'सितोपलादि चूर्णम्',

    // UI Labels
    canvas_title: 'रसशाला कर्मपीठम् (Workbench)',
    drag_drop_prompt: 'औषधद्रव्याणि यन्त्रे स्थापयित्वा कर्म कुरुत',
    empty_workbench: 'कर्मपीठं शून्यम्। खल्लयन्त्रं संस्थाप्य प्रारभताम्।',
    contents: 'अन्तर्गतद्रव्याणि (Contents)',
    complete_experiment: 'मूल्याङ्कनं समाप्यताम् (Evaluate)',
    reset: 'पुनः स्थाप्यताम् (Reset)',
    exit: 'निर्गमः (Exit)',
  },
};

const LANG_KEY = 'ayurveda_lab_lang';

let memoryStorage = {};

export function getLanguage() {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(LANG_KEY) || 'en';
    }
  } catch (e) {
    // ignore
  }
  return memoryStorage[LANG_KEY] || 'en';
}

export function setLanguage(lang) {
  if (['en', 'sa'].includes(lang)) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANG_KEY, lang);
      } else {
        memoryStorage[LANG_KEY] = lang;
      }
    } catch (e) {
      memoryStorage[LANG_KEY] = lang;
    }
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('ayurveda_language_changed'));
      }
    } catch (e) {
      // ignore in non-browser env
    }
  }
}

export function t(key, lang = null) {
  const activeLang = lang || getLanguage();
  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}
