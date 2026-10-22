import { describe, it, expect } from 'vitest';
import { evaluateStep, evaluateAttempt } from '../backend/utils/simulationEvaluator.js';
import { EXPECTED_PROCESSES } from '../frontend/src/data/expectedProcesses.js';

describe('Ayurlab Simulation Evaluator', () => {
  const triphalaProcess = EXPECTED_PROCESSES.triphala_churna;

  describe('evaluateStep', () => {
    it('accepts correct action and ingredient within ±5% tolerance', () => {
      const step = triphalaProcess.steps[1]; // Haritaki 50g
      const performed = {
        action: 'add',
        item: 'haritaki',
        amount: 51.5, // 50g + 3%
        apparatus: 'khalva_yantra',
      };

      const result = evaluateStep(step, performed);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.mistakes).toHaveLength(0);
    });

    it('penalizes ingredient when out of ±5% tolerance', () => {
      const step = triphalaProcess.steps[1]; // Haritaki 50g
      const performed = {
        action: 'add',
        item: 'haritaki',
        amount: 65, // +30% deviation
      };

      const result = evaluateStep(step, performed);
      expect(result.passed).toBe(false);
      expect(result.mistakes.some(m => m.type === 'WRONG_QUANTITY')).toBe(true);
    });

    it('rejects completely mismatched action types', () => {
      const step = triphalaProcess.steps[2]; // Mardana
      const performed = {
        action: 'heat', // Wrong action: heating instead of grinding
        item: 'haritaki',
        agni: 'teekshna',
      };

      const result = evaluateStep(step, performed);
      expect(result.passed).toBe(false);
      expect(result.mistakes.some(m => m.type === 'WRONG_ACTION')).toBe(true);
    });
  });

  describe('evaluateAttempt', () => {
    it('awards 100% and grade Uttama for flawless classical sequence', () => {
      const actionLog = [
        { action: 'place_apparatus', item: 'khalva_yantra', apparatus: 'khalva_yantra' },
        { action: 'add', item: 'haritaki', amount: 50 },
        { action: 'mardan', item: 'haritaki', duration: 5 },
        { action: 'sifting', item: 'haritaki', apparatus: 'cloth' },
        { action: 'add', item: 'bibhitaki', amount: 50 },
        { action: 'mardan', item: 'bibhitaki', duration: 5 },
        { action: 'sifting', item: 'bibhitaki', apparatus: 'cloth' },
        { action: 'add', item: 'amalaki', amount: 50 },
        { action: 'mardan', item: 'amalaki', duration: 5 },
        { action: 'sifting', item: 'amalaki', apparatus: 'cloth' },
        { action: 'mix', item: 'triphala_churna', duration: 5 },
      ];

      const evaluation = evaluateAttempt(triphalaProcess, actionLog);
      expect(evaluation.score).toBe(100);
      expect(evaluation.grade).toBe('Uttama (A)');
      expect(evaluation.passed).toBe(true);
      expect(evaluation.canComplete).toBe(true);
    });

    it('blocks completion when Siddhi Lakshana condition is omitted', () => {
      // Incomplete without vastragalita sifting
      const actionLog = [
        { action: 'place_apparatus', item: 'khalva_yantra', apparatus: 'khalva_yantra' },
        { action: 'add', item: 'haritaki', amount: 50 },
        { action: 'mardan', item: 'haritaki', duration: 5 },
      ];

      const evaluation = evaluateAttempt(triphalaProcess, actionLog);
      expect(evaluation.canComplete).toBe(false);
      expect(evaluation.unmetConditions.some(c => c.toLowerCase().includes('sukshmatva'))).toBe(true);
    });
  });
});
