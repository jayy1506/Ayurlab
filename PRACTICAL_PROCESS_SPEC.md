# Ayurlab Practical Process Specification & Faculty Guide
**Machine-Readable SOP Schema for Classical Ayurvedic Laboratory Simulations**

---

## 1. Executive Overview

Ayurlab evaluates student competency during virtual pharmacy simulations using a **pure, deterministic evaluator** (`evaluateStep` and `evaluateAttempt`). Faculty members can define new laboratory procedures, formulations, and compounding processes **purely via data** in JSON/ESM without modifying simulation physics, UI components, or canvas rendering code.

### Core Architectural Principles
1. **Separation of Concerns**: Canvas components handle drag-and-drop interaction and dispatch action events; the evaluator computes score, penalties, and Siddhi Lakshana achievements independently.
2. **Deterministic Grading**: Given the same sequence of student actions, the evaluator always outputs identical scores, grades, and mistake diagnostics.
3. **Strict Tolerance Controls**: Compounding weights and ratios enforce classical tolerances (default **±5%** deviation), reflecting precision standards in *Rasa Shastra & Bhaishajya Kalpana*.
4. **Endpoint Condition Gating**: An experiment cannot be successfully completed if critical classical milestones (*Siddhi Lakshana*) are missing or skipped.

---

## 2. Expected Process Schema Specification

Every practical process is defined as an object in `frontend/src/data/expectedProcesses.js` (and mirrored in `backend/utils/expectedProcesses.js` for server-side evaluation).

### Top-Level Attributes

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `practicalId` | `string` | Unique snake_case identifier | `'triphala_churna'` |
| `title` | `string` | Classical name of formulation | `'Triphala Churna'` |
| `classicalReference` | `string` | Classical Ayurvedic treatise citation | `'Sharangadhara Samhita, Madhyama Khanda 6/1-3'` |
| `requiredApparatus` | `string[]` | List of utensils required | `['khalva_yantra', 'cloth', 'tray', 'spoon']` |
| `expectedRatio` | `Record<string, number>` | Proportional ratio of active ingredients | `{ haritaki: 1, bibhitaki: 1, amalaki: 1 }` |
| `steps` | `StepDefinition[]` | Ordered array of standard operating procedure steps | See Step Schema below |
| `endpointConditions` | `EndpointCondition[]` | Siddhi Lakshana verification rules | See Endpoint Condition Schema below |

---

### Step Schema (`StepDefinition`)

Each step represents a discrete operation in the formulation process:

```javascript
{
  stepNumber: 2,
  title: 'Add Haritaki (Terminalia chebula)',
  actionType: 'add',                // Standard Action Type (see below)
  targetItem: 'haritaki',           // Ingredient or apparatus ID
  expectedQuantity: 50,             // Numerical target value
  tolerancePercent: 5,              // ±5% tolerance (47.5g to 52.5g)
  unit: 'gm',                       // Measurement unit
  requiredAgni: 'none',             // Agni intensity level (see below)
  durationRange: { min: 2, max: 10 }, // Expected simulation time in seconds (optional)
  instructions: 'Add 50 gm of cleaned dry Haritaki fruit pulp.',
}
```

#### Standard Action Types (`actionType`)
- `'place_apparatus'`: Utensil preparation (e.g., `khalva_yantra`, `sneha_patra`, `sharava`).
- `'add'`: Adding an ingredient into the active utensil with quantity tracking.
- `'mardan'`: Mardana (triturating/grinding in mortar and pestle).
- `'agni'`: Paka / heating at a specified Agni intensity.
- `'sifting'`: Vastragalita (sieving fine powder through cloth or fine mesh).
- `'bhavana'`: Levigation with swarasa, decoction, or herbal juice.
- `'mix'`: Homogenization of blended dry or wet ingredients.
- `'filter'`: Galana (filtration of decoctions or oils).
- `'form_pills'`: Rolling paste into uniform tablets (*Vati/Gutika*).

#### Classical Agni Intensity Levels (`requiredAgni`)
- `'none'`: Ambient temperature / no heating.
- `'mridu'`: Gentle / mild heat (< 70°C). Used for delicate decoctions and drying.
- `'madhyama'`: Moderate heat (70°C - 100°C). Standard for *Kwatha* and *Avaleha*.
- `'teekshna'`: Intense / strong heat (> 100°C). Standard for *Bhasma* and metal calcination.

---

### Endpoint Conditions (`endpointConditions`)

Endpoint conditions test whether the student achieved the classical end-signs (*Siddhi Lakshana*) before declaring the preparation complete:

```javascript
endpointConditions: [
  {
    id: 'sukshmatva',
    siddhiName: 'Sukshmatva (Finely Sieved Particle Size)',
    classicalSign: 'Vastragalita Churna passed through single/double-layered clean cloth',
    requiresAction: 'sifting',
    requiresItem: 'cloth',
    failMessage: 'Siddhi Lakshana unmet: Churna has not been sieved through fine cloth (Sukshmatva missing).',
  },
  {
    id: 'homogeneity',
    siddhiName: 'Sama-Mishrana (Homogeneity)',
    classicalSign: 'Uniform color and absence of segregated individual herb granules',
    requiresAction: 'mix',
    failMessage: 'Siddhi Lakshana unmet: Ingredients have not been uniformly blended.',
  }
]
```

---

## 3. Evaluation Formula & Grading Rubric

The evaluator initializes the attempt with a score of **100%** and applies deductions for procedural and quantitative deviations:

### Deductions Table

| Deviation Type | Mistake Code | Penalty | Explanation |
| :--- | :--- | :--- | :--- |
| **Omitted Step** | `OMITTED_STEP` | -25% per step | A mandatory SOP step was completely skipped |
| **Wrong Action** | `WRONG_ACTION` | -20% | Inappropriate operation (e.g. heating instead of grinding) |
| **Quantity Deviation** | `WRONG_QUANTITY` | -10% | Ingredient added outside the configured `±tolerancePercent` |
| **Wrong Agni Level** | `WRONG_AGNI` | -15% | Heating with incorrect intensity (e.g., `teekshna` instead of `mridu`) |
| **Duration Too Short** | `DURATION_TOO_SHORT` | -10% | Process stopped before reaching minimum therapeutic threshold |
| **Duration Too Long** | `DURATION_EXCEEDED` | -10% | Over-processing or excessive boiling |
| **Siddhi Lakshana Unmet** | `SIDDHI_LAKSHANA_UNMET` | -20% + Blocks Completion | Failed to achieve certified organoleptic endpoint |

### Scoring & Grading Tiers

$$\text{Final Score} = \max(0, 100 - \sum \text{Penalties})$$

- **Uttama (Grade A)**: Score $\ge 85\%$ — Flawless classical adherence.
- **Madhyama (Grade B)**: Score $70\% - 84\%$ — Minor tolerance deviations, safe formulation.
- **Adhama (Grade C / Fail)**: Score $< 70\%$ — Significant errors; student must repeat experiment.

---

## 4. How Faculty Can Add a New Practical (By Data Only)

To add a new practical (e.g., *Sitopaladi Churna* or *Pancha-Kola Phanta*), follow these 3 simple steps:

### Step 1: Open `frontend/src/data/expectedProcesses.js`
Add a new entry to the `EXPECTED_PROCESSES` export:

```javascript
sitopaladi_churna: {
  practicalId: 'sitopaladi_churna',
  title: 'Sitopaladi Churna',
  classicalReference: 'Sharangadhara Samhita, Madhyama Khanda 6/12-14',
  requiredApparatus: ['khalva_yantra', 'cloth', 'spoon'],
  expectedRatio: {
    mishri: 16,
    vanshalochan: 8,
    pippali: 4,
    ela: 2,
    twak: 1,
  },
  steps: [
    {
      stepNumber: 1,
      title: 'Prepare Khalva Yantra',
      actionType: 'place_apparatus',
      targetItem: 'khalva_yantra',
      requiredApparatus: 'khalva_yantra',
      instructions: 'Position clean Khalva Yantra.',
    },
    {
      stepNumber: 2,
      title: 'Add Mishri (Rock Sugar)',
      actionType: 'add',
      targetItem: 'mishri',
      expectedQuantity: 80,
      tolerancePercent: 5,
      unit: 'gm',
      instructions: 'Add 80 gm of clean Mishri (16 parts).',
    },
    {
      stepNumber: 3,
      title: 'Mardana of Mishri',
      actionType: 'mardan',
      targetItem: 'mishri',
      requiredAgni: 'none',
      durationRange: { min: 2, max: 10 },
      instructions: 'Powder Mishri finely in Khalva Yantra.',
    },
    // ... Additional steps for Vanshalochan, Pippali, Ela, Twak ...
    {
      stepNumber: 8,
      title: 'Vastragalita Sifting',
      actionType: 'sifting',
      targetItem: 'cloth',
      instructions: 'Pass compound powder through clean cloth.',
    }
  ],
  endpointConditions: [
    {
      id: 'sukshmatva',
      siddhiName: 'Sukshmatva',
      classicalSign: 'Vastragalita powder passed through cloth',
      requiresAction: 'sifting',
      requiresItem: 'cloth',
      failMessage: 'Churna must be passed through fine cloth.',
    }
  ]
}
```

### Step 2: Register in `learningPracticals.js` / MongoDB Catalog
Ensure the matching `id: 'sitopaladi_churna'` exists in the catalog so students can select and launch it from the menu.

### Step 3: Run Unit Test to Verify
Execute the test suite in the terminal:
```bash
node scratch/test_evaluator_unit.js
```
The evaluator automatically validates the steps, tolerances, and siddhi lakshana rules.

---

## 5. Reference Formulations Currently Configured

1. **Triphala Churna** (*Sharangadhara Samhita, Madhyama Khanda 6/1-3*):
   - Haritaki : Bibhitaki : Amalaki in equal ratio ($1:1:1$).
   - Mardana, blending, and Vastragalita cloth sifting.
   - Endpoint: *Sukshmatva* & *Sama-Mishrana*.

2. **Trikatu Churna** (*Bhaishajya Ratnavali, Agnimandya Rogadhikara*):
   - Sunthi : Maricha : Pippali in equal ratio ($1:1:1$).
   - Deepana & Pachana pungent compound.
   - Endpoint: *Teekshna Gandha & Katu Rasa* with fine particle size.
