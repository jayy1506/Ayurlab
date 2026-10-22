/**
 * Pure, Testable Simulation Evaluator for Classical Ayurvedic Preparations
 * 
 * Complies with classical Bhaishajya Kalpana SOP standards:
 * - Tolerances on raw ingredient quantities (±5% default)
 * - Ordered procedural step progression
 * - Action type enforcement (mardan, agni, sifting, mix, bhavana, etc.)
 * - Agni level verification (mridu, madhyama, teekshna)
 * - Duration boundary verification
 * - Siddhi Lakshana endpoint condition gating
 */

/**
 * Normalizes action string identifiers for consistent comparison
 */
export function normalizeActionType(action) {
  if (!action) return '';
  const a = String(action).toLowerCase().trim();
  if (a === 'grind' || a === 'mardana' || a === 'mardan') return 'mardan';
  if (a === 'heat' || a === 'paka' || a === 'agnidana' || a === 'agni') return 'agni';
  if (a === 'sieve' || a === 'vastragalita' || a === 'sifting') return 'sifting';
  if (a === 'filter' || a === 'galana') return 'filter';
  if (a === 'mix' || a === 'mishrana') return 'mix';
  if (a === 'form_pills' || a === 'vati_nirmana') return 'form_pills';
  if (a === 'add' || a === 'place_herb') return 'add';
  if (a === 'place_apparatus' || a === 'place_utensil') return 'place_apparatus';
  return a;
}

/**
 * Evaluates a single performed action against its expected step definition
 * 
 * @param {Object} expectedStep - The SOP expected step definition
 * @param {Object} performedAction - The action performed by the student
 * @returns {Object} { stepNumber, passed, score, mistakes: [], feedback }
 */
export function evaluateStep(expectedStep, performedAction) {
  if (!expectedStep) {
    return {
      stepNumber: 0,
      passed: false,
      score: 0,
      mistakes: [{ type: 'UNEXPECTED_STEP', message: 'Action does not correspond to any required SOP step', penalty: 20 }],
      feedback: 'Extraneous action performed.',
    };
  }

  if (!performedAction) {
    return {
      stepNumber: expectedStep.stepNumber,
      passed: false,
      score: 0,
      mistakes: [{ type: 'SKIPPED_STEP', message: `Step ${expectedStep.stepNumber} was skipped (${expectedStep.title})`, penalty: 25 }],
      feedback: `Missed step: ${expectedStep.title}`,
    };
  }

  const mistakes = [];
  let penaltyPoints = 0;

  // 1. Check Action Type
  const normExpectedAction = normalizeActionType(expectedStep.actionType);
  const normPerformedAction = normalizeActionType(performedAction.action || performedAction.actionType);

  if (normExpectedAction !== normPerformedAction) {
    const penalty = 25;
    penaltyPoints += penalty;
    mistakes.push({
      type: 'WRONG_ACTION',
      penalty,
      message: `Incorrect action: Expected ${expectedStep.actionType.toUpperCase()} for "${expectedStep.title}", but performed ${normPerformedAction.toUpperCase()}.`,
    });
  }

  // 2. Check Target Item / Ingredient
  if (expectedStep.targetItem) {
    const expectedItem = expectedStep.targetItem.toLowerCase().trim();
    const performedItem = String(performedAction.item || performedAction.targetItem || '').toLowerCase().trim();

    if (performedItem && performedItem !== expectedItem) {
      const penalty = 20;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'WRONG_INGREDIENT',
        penalty,
        message: `Wrong ingredient sequence: Expected "${expectedStep.targetItem}", but selected "${performedItem}".`,
      });
    }
  }

  // 3. Check Quantity & Tolerance (e.g. ±5%)
  if (expectedStep.expectedQuantity && typeof expectedStep.expectedQuantity === 'number') {
    const performedQty = Number(performedAction.amount || performedAction.qty || performedAction.quantity || 0);
    const tolerancePercent = expectedStep.tolerancePercent || 5;
    const minAllowed = expectedStep.expectedQuantity * (1 - tolerancePercent / 100);
    const maxAllowed = expectedStep.expectedQuantity * (1 + tolerancePercent / 100);

    if (performedQty < minAllowed || performedQty > maxAllowed) {
      const deviation = (((performedQty - expectedStep.expectedQuantity) / expectedStep.expectedQuantity) * 100).toFixed(1);
      const penalty = 15;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'WRONG_QUANTITY',
        penalty,
        message: `Quantity out of tolerance: Added ${performedQty}${expectedStep.unit || 'g'} (${deviation > 0 ? '+' : ''}${deviation}% deviation). Allowed classical tolerance is ±${tolerancePercent}% (${minAllowed.toFixed(1)}g – ${maxAllowed.toFixed(1)}g).`,
      });
    }
  }

  // 4. Check Agni Level (Heat)
  if (expectedStep.requiredAgni && expectedStep.requiredAgni !== 'none') {
    const performedAgni = (performedAction.agni || performedAction.heatLevel || '').toLowerCase();
    if (performedAgni !== expectedStep.requiredAgni.toLowerCase()) {
      const penalty = 20;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'WRONG_HEAT',
        penalty,
        message: `Improper Agni: Applied ${performedAgni ? performedAgni.toUpperCase() : 'NO'} Agni. Classical text mandates ${expectedStep.requiredAgni.toUpperCase()} Agni.`,
      });
    }
  }

  // 5. Check Duration Range
  if (expectedStep.durationRange && typeof performedAction.duration === 'number') {
    const { min, max } = expectedStep.durationRange;
    if (performedAction.duration < min) {
      const penalty = 10;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'DURATION_TOO_SHORT',
        penalty,
        message: `Process incomplete: Duration was ${performedAction.duration}s (minimum required is ${min}s for adequate particle reduction).`,
      });
    } else if (max && performedAction.duration > max) {
      const penalty = 10;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'DURATION_TOO_LONG',
        penalty,
        message: `Exceeded duration: Operation ran for ${performedAction.duration}s (maximum recommended is ${max}s to avoid heat degradation).`,
      });
    }
  }

  // 6. Check Required Apparatus
  if (expectedStep.requiredApparatus && performedAction.apparatus) {
    if (performedAction.apparatus !== expectedStep.requiredApparatus) {
      const penalty = 15;
      penaltyPoints += penalty;
      mistakes.push({
        type: 'WRONG_APPARATUS',
        penalty,
        message: `Incorrect Yantra: Used ${performedAction.apparatus} instead of mandated ${expectedStep.requiredApparatus}.`,
      });
    }
  }

  const score = Math.max(0, 100 - penaltyPoints);
  const passed = mistakes.length === 0;

  return {
    stepNumber: expectedStep.stepNumber,
    stepTitle: expectedStep.title,
    passed,
    score,
    mistakes,
    feedback: passed
      ? `Step ${expectedStep.stepNumber} (${expectedStep.title}) completed with classical precision.`
      : mistakes.map((m) => m.message).join(' '),
  };
}

/**
 * Evaluates a complete practical simulation attempt
 * 
 * @param {Object} expectedProcess - The expected process definition with SOP steps
 * @param {Array} actionLog - The student's recorded action sequence
 * @returns {Object} Comprehensive evaluation result
 */
export function evaluateAttempt(expectedProcess, actionLog = []) {
  if (!expectedProcess || !Array.isArray(expectedProcess.steps)) {
    return {
      score: 0,
      passed: false,
      canComplete: false,
      stepResults: [],
      mistakes: [{ type: 'NO_PROCESS_SPEC', message: 'No expected process SOP found for this formulation.' }],
      unmetConditions: ['Missing expected process definition'],
      feedback: 'Cannot evaluate: Missing process specification.',
      summary: { totalSteps: 0, completedCount: 0, grade: 'Heena (Needs Revision)' },
    };
  }

  const expectedSteps = expectedProcess.steps;
  const stepResults = [];
  const allMistakes = [];
  const unmetConditions = [];

  // Match actions to steps in sequence
  let logPointer = 0;

  for (let i = 0; i < expectedSteps.length; i++) {
    const expStep = expectedSteps[i];
    const performed = actionLog[logPointer];

    if (!performed) {
      // Step was skipped completely
      const skippedRes = evaluateStep(expStep, null);
      stepResults.push(skippedRes);
      allMistakes.push({ step: expStep.stepNumber, ...skippedRes.mistakes[0] });
      continue;
    }

    const stepResult = evaluateStep(expStep, performed);
    stepResults.push(stepResult);

    if (!stepResult.passed) {
      stepResult.mistakes.forEach((m) => {
        allMistakes.push({ step: expStep.stepNumber, ...m });
      });
    }

    logPointer++;
  }

  // Check for extraneous actions beyond expected steps
  if (logPointer < actionLog.length) {
    for (let j = logPointer; j < actionLog.length; j++) {
      allMistakes.push({
        step: expectedSteps.length + (j - logPointer + 1),
        type: 'EXTRANEOUS_ACTION',
        message: `Extraneous action "${actionLog[j].action || actionLog[j].actionType}" performed after compounding concluded.`,
        penalty: 10,
      });
    }
  }

  // Calculate Weighted Total Score
  const stepScores = stepResults.map((r) => r.score);
  const rawAverage = stepScores.length > 0 ? stepScores.reduce((a, b) => a + b, 0) / expectedSteps.length : 0;
  const extraneousPenalties = Math.max(0, (actionLog.length - expectedSteps.length) * 10);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawAverage - extraneousPenalties)));

  // Verify Siddhi Lakshana Endpoint Conditions
  const conditions = expectedProcess.endpointConditions || {};
  const minPassingScore = conditions.minimumPassingScore || 70;
  const siddhiResults = [];

  // 1. Fineness check (Sukshmatva)
  const hasSifting = actionLog.some((a) => normalizeActionType(a.action || a.actionType) === 'sifting');
  const sukshmatvaAchieved = hasSifting;
  siddhiResults.push({
    id: 'sukshmatva',
    title: 'Sukshmatva (Micro-Fineness)',
    achieved: sukshmatvaAchieved,
    note: sukshmatvaAchieved ? 'Vastragalita sukshma churna verified (passed through 80 mesh).' : 'Unmet: Powder was not sieved through fine vastra.',
  });
  if (!sukshmatvaAchieved) unmetConditions.push('Sukshmatva not achieved: Must perform Vastragalita (sieving through fine cloth)');

  // 2. Homogenization check (Mishrana)
  const hasMix = actionLog.some((a) => normalizeActionType(a.action || a.actionType) === 'mix');
  const mixAchieved = hasMix;
  siddhiResults.push({
    id: 'samarasatva',
    title: 'Samarasatva & Varnotpatti (Homogeneity & Uniform Colour)',
    achieved: mixAchieved,
    note: mixAchieved ? 'Homogeneous composite coloration achieved.' : 'Unmet: Powders were not uniformly mixed together.',
  });
  if (!mixAchieved) unmetConditions.push('Samarasatva not achieved: Must perform Mishrana (homogenization)');

  // 3. Proportions tolerance check
  const quantityMistakes = allMistakes.filter((m) => m.type === 'WRONG_QUANTITY');
  const ratioAchieved = quantityMistakes.length === 0;
  siddhiResults.push({
    id: 'sampramana',
    title: 'Sampramana (Classical Ratio Alignment)',
    achieved: ratioAchieved,
    note: ratioAchieved ? 'All ingredients compounded within classical ±5% tolerance.' : 'Unmet: Ingredient quantities deviate from classical ratio.',
  });
  if (!ratioAchieved) unmetConditions.push('Sampramana not achieved: Ingredient quantities deviate from classical ±5% tolerance');

  // Gating check: Can student mark experiment complete?
  const allConditionsMet = unmetConditions.length === 0 && actionLog.length >= expectedSteps.length;
  const passed = finalScore >= minPassingScore && allConditionsMet;
  const canComplete = allConditionsMet;

  // Grade Assignment
  let grade = 'Heena (Needs Revision)';
  if (finalScore >= 90 && passed) grade = 'Uttama (A)';
  else if (finalScore >= 75 && passed) grade = 'Madhyama (B)';
  else if (passed) grade = 'Pravara (C)';

  // Build constructive feedback text
  let feedback = '';
  if (passed) {
    feedback = `🌟 Outstanding Compounding! You formulated ${expectedProcess.title} with classical precision according to ${expectedProcess.classicalReference || 'the classical texts'}. Siddhi Lakshanas fully verified.`;
  } else if (!allConditionsMet) {
    feedback = `⚠️ Siddhi Lakshana Endpoint Conditions Unmet: ${unmetConditions.join('; ')}. Complete these actions before concluding the experiment.`;
  } else {
    feedback = `Compound prepared with deviations (${allMistakes.length} procedural mistake(s)). Review mistake log and re-attempt to achieve classical standard.`;
  }

  return {
    score: finalScore,
    grade,
    passed,
    canComplete,
    stepResults,
    mistakes: allMistakes,
    siddhiLakshanaResults: siddhiResults,
    unmetConditions,
    feedback,
    summary: {
      totalSteps: expectedSteps.length,
      completedCount: stepResults.filter((r) => r.passed).length,
      mistakesCount: allMistakes.length,
      grade,
      minPassingScore,
    },
  };
}
