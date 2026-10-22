/**
 * Machine-Readable Classical SOP Expected Processes for Ayurvedic Formulations
 * 
 * Standard Action Types:
 * - 'place_apparatus' : Preparing utensil (khalva_yantra, sneha_patra, etc.)
 * - 'add'             : Adding raw ingredient with quantity & tolerance
 * - 'mardan'          : Mardana (triturating/grinding in khalva)
 * - 'agni'            : Paka/Agnidana (heating at specific agni level)
 * - 'sifting'         : Vastragalita (sieving through cloth/mesh)
 * - 'bhavana'         : Levigation with swarasa/liquid
 * - 'mix'             : Homogenizing multiple powders
 * - 'form_pills'      : Rolling into tablets/vati
 * - 'filter'          : Galana / decoction filtration
 * 
 * Standard Agni Levels:
 * - 'mridu'     : Low/Gentle heat (< 70°C)
 * - 'madhyama'  : Moderate heat (70°C - 100°C)
 * - 'teekshna'  : Intense/High heat (> 100°C)
 * - 'none'      : No heat (ambient temperature)
 */

export const EXPECTED_PROCESSES = {
  // -------------------------------------------------------------------------
  // 1. TRIPHALA CHURNA (Sharangadhara Samhita, Madhyama Khanda 6/1-3)
  // Sampramana: Haritaki (1 part) : Bibhitaki (1 part) : Amalaki (1 part)
  // -------------------------------------------------------------------------
  triphala_churna: {
    practicalId: 'triphala_churna',
    title: 'Triphala Churna',
    classicalReference: 'Sharangadhara Samhita, Madhyama Khanda 6/1-3',
    requiredApparatus: ['khalva_yantra', 'cloth', 'tray', 'spoon'],
    expectedRatio: { haritaki: 1, bibhitaki: 1, amalaki: 1 },
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare Khalva Yantra',
        actionType: 'place_apparatus',
        targetItem: 'khalva_yantra',
        requiredApparatus: 'khalva_yantra',
        instructions: 'Clean and position the stone Khalva Yantra on the lab workbench.',
      },
      {
        stepNumber: 2,
        title: 'Add Haritaki (Terminalia chebula)',
        actionType: 'add',
        targetItem: 'haritaki',
        expectedQuantity: 50,
        tolerancePercent: 5, // ±5% -> 47.5g to 52.5g
        unit: 'gm',
        instructions: 'Add 50 gm of cleaned dry Haritaki fruit pulp.',
      },
      {
        stepNumber: 3,
        title: 'Mardana of Haritaki',
        actionType: 'mardan',
        targetItem: 'haritaki',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 }, // simulation seconds
        instructions: 'Grind Haritaki with pestle until reduced to coarse powder.',
      },
      {
        stepNumber: 4,
        title: 'Vastragalita (Sifting) of Haritaki',
        actionType: 'sifting',
        targetItem: 'haritaki',
        requiredApparatus: 'cloth',
        instructions: 'Pass Haritaki powder through clean fine cloth (80 mesh).',
      },
      {
        stepNumber: 5,
        title: 'Add Bibhitaki (Terminalia bellirica)',
        actionType: 'add',
        targetItem: 'bibhitaki',
        expectedQuantity: 50,
        tolerancePercent: 5,
        unit: 'gm',
        instructions: 'Add 50 gm of cleaned dry Bibhitaki fruit pulp.',
      },
      {
        stepNumber: 6,
        title: 'Mardana of Bibhitaki',
        actionType: 'mardan',
        targetItem: 'bibhitaki',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 },
        instructions: 'Grind Bibhitaki thoroughly in the Khalva Yantra.',
      },
      {
        stepNumber: 7,
        title: 'Vastragalita of Bibhitaki',
        actionType: 'sifting',
        targetItem: 'bibhitaki',
        requiredApparatus: 'cloth',
        instructions: 'Sift Bibhitaki through fine cloth.',
      },
      {
        stepNumber: 8,
        title: 'Add Amalaki (Phyllanthus emblica)',
        actionType: 'add',
        targetItem: 'amalaki',
        expectedQuantity: 50,
        tolerancePercent: 5,
        unit: 'gm',
        instructions: 'Add 50 gm of cleaned dry Amalaki fruit pulp.',
      },
      {
        stepNumber: 9,
        title: 'Mardana of Amalaki',
        actionType: 'mardan',
        targetItem: 'amalaki',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 },
        instructions: 'Grind Amalaki thoroughly to powder.',
      },
      {
        stepNumber: 10,
        title: 'Vastragalita of Amalaki',
        actionType: 'sifting',
        targetItem: 'amalaki',
        requiredApparatus: 'cloth',
        instructions: 'Sift Amalaki through fine cloth.',
      },
      {
        stepNumber: 11,
        title: 'Mishrana (Homogenization)',
        actionType: 'mix',
        targetItem: 'triphala_churna',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 8 },
        instructions: 'Triturate all three fine powders together into a homogeneous compound.',
      },
    ],
    endpointConditions: {
      minimumPassingScore: 70,
      mustPassApparatusCheck: true,
      siddhiLakshana: [
        {
          id: 'sukshmatva',
          title: 'Sukshmatva (Micro-Fineness)',
          description: 'Powder must pass completely through 80-mesh vastra with zero grit.',
          conditionType: 'sifting_completed',
        },
        {
          id: 'sampramana',
          title: 'Sampramana (1:1:1 Ratio)',
          description: 'Ingredients must be present in equal proportions within ±5% tolerance.',
          conditionType: 'ratio_tolerance',
        },
        {
          id: 'varnotpatti',
          title: 'Varnotpatti & Gandha (Uniform Colour & Aroma)',
          description: 'Uniform yellowish-brown powder with characteristic composite astringent-sour aroma.',
          conditionType: 'homogenized',
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // 2. TRIKATU CHURNA (Bhaishajya Ratnavali, Agnimandya Rogadhikara)
  // Sampramana: Sunthi (1 part) : Maricha (1 part) : Pippali (1 part)
  // -------------------------------------------------------------------------
  trikatu_churna: {
    practicalId: 'trikatu_churna',
    title: 'Trikatu Churna',
    classicalReference: 'Bhaishajya Ratnavali, Agnimandya Rogadhikara',
    requiredApparatus: ['khalva_yantra', 'cloth', 'tray', 'spoon'],
    expectedRatio: { sunthi: 1, maricha: 1, pippali: 1 },
    steps: [
      {
        stepNumber: 1,
        title: 'Prepare Khalva Yantra',
        actionType: 'place_apparatus',
        targetItem: 'khalva_yantra',
        requiredApparatus: 'khalva_yantra',
        instructions: 'Place a dry, clean stone mortar on the workstation.',
      },
      {
        stepNumber: 2,
        title: 'Add Sunthi (Zingiber officinale)',
        actionType: 'add',
        targetItem: 'sunthi',
        expectedQuantity: 50,
        tolerancePercent: 5, // ±5% -> 47.5g to 52.5g
        unit: 'gm',
        instructions: 'Measure and add 50 gm of dried rhizome Sunthi.',
      },
      {
        stepNumber: 3,
        title: 'Mardana of Sunthi',
        actionType: 'mardan',
        targetItem: 'sunthi',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 },
        instructions: 'Pound and grind the fibrous Sunthi rhizomes into fine powder.',
      },
      {
        stepNumber: 4,
        title: 'Vastragalita of Sunthi',
        actionType: 'sifting',
        targetItem: 'sunthi',
        requiredApparatus: 'cloth',
        instructions: 'Sift through fine cloth to eliminate fibrous coarse particles.',
      },
      {
        stepNumber: 5,
        title: 'Add Maricha (Piper nigrum)',
        actionType: 'add',
        targetItem: 'maricha',
        expectedQuantity: 50,
        tolerancePercent: 5,
        unit: 'gm',
        instructions: 'Measure and add 50 gm of dry black pepper Maricha.',
      },
      {
        stepNumber: 6,
        title: 'Mardana of Maricha',
        actionType: 'mardan',
        targetItem: 'maricha',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 },
        instructions: 'Grind Maricha dried berries into fine powder.',
      },
      {
        stepNumber: 7,
        title: 'Vastragalita of Maricha',
        actionType: 'sifting',
        targetItem: 'maricha',
        requiredApparatus: 'cloth',
        instructions: 'Sift Maricha powder through 80-mesh cloth.',
      },
      {
        stepNumber: 8,
        title: 'Add Pippali (Piper longum)',
        actionType: 'add',
        targetItem: 'pippali',
        expectedQuantity: 50,
        tolerancePercent: 5,
        unit: 'gm',
        instructions: 'Measure and add 50 gm of dry Pippali inflorescence spikes.',
      },
      {
        stepNumber: 9,
        title: 'Mardana of Pippali',
        actionType: 'mardan',
        targetItem: 'pippali',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 10 },
        instructions: 'Triturate Pippali until completely reduced to fine dust.',
      },
      {
        stepNumber: 10,
        title: 'Vastragalita of Pippali',
        actionType: 'sifting',
        targetItem: 'pippali',
        requiredApparatus: 'cloth',
        instructions: 'Sift Pippali powder through cloth.',
      },
      {
        stepNumber: 11,
        title: 'Mishrana (Homogenization)',
        actionType: 'mix',
        targetItem: 'trikatu_churna',
        requiredAgni: 'none',
        durationRange: { min: 2, max: 8 },
        instructions: 'Triturate all three pungent powders together into an even blend.',
      },
    ],
    endpointConditions: {
      minimumPassingScore: 70,
      mustPassApparatusCheck: true,
      siddhiLakshana: [
        {
          id: 'sukshmatva',
          title: 'Sukshmatva (Cloth-Sieved Fineness)',
          description: 'Passed through 80-mesh sieve, free from Sunthi fibers or Maricha skins.',
          conditionType: 'sifting_completed',
        },
        {
          id: 'teekshna_rasa',
          title: 'Teekshna-Katu Rasa & Gandha',
          description: 'Intense pungent sharpness with pronounced warming aroma.',
          conditionType: 'ratio_tolerance',
        },
        {
          id: 'samarasatva',
          title: 'Ekavarnatva (Uniform Greyish-Black Tint)',
          description: 'Even greyish-black powder with no visible layering.',
          conditionType: 'homogenized',
        },
      ],
    },
  },
};

/**
 * Helper to retrieve expected process by ID or normalized name
 */
export function getExpectedProcess(idOrName) {
  if (!idOrName) return null;
  const cleanKey = String(idOrName)
    .trim()
    .toLowerCase()
    .replace(/[-\s]/g, '_');

  if (EXPECTED_PROCESSES[cleanKey]) {
    return EXPECTED_PROCESSES[cleanKey];
  }

  // Partial match fallback
  for (const [key, proc] of Object.entries(EXPECTED_PROCESSES)) {
    if (cleanKey.includes(key) || key.includes(cleanKey)) {
      return proc;
    }
  }

  return null;
}
