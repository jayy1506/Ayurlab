import { describe, it, expect, beforeEach } from 'vitest';
import { t, getLanguage, setLanguage, TRANSLATIONS } from '../frontend/src/utils/i18n.js';

describe('Ayurlab Classical Sanskrit & Bilingual i18n Dictionary', () => {
  beforeEach(() => {
    // Reset to English
    setLanguage('en');
  });

  it('translates laboratory actions correctly in English and Sanskrit (Devanagari)', () => {
    expect(t('mardan', 'en')).toBe('Mardana (Trituration)');
    expect(t('mardan', 'sa')).toBe('मर्दनम् (Trituration)');

    expect(t('sifting', 'en')).toBe('Vastragalita (Cloth Sifting)');
    expect(t('sifting', 'sa')).toBe('वस्त्रगालितम् (Cloth Sifting)');

    expect(t('bhavana', 'en')).toBe('Bhavana (Levigation)');
    expect(t('bhavana', 'sa')).toBe('भावना (Levigation)');
  });

  it('translates classical apparatus correctly', () => {
    expect(t('khalva_yantra', 'en')).toBe('Khalva Yantra (Mortar & Pestle)');
    expect(t('khalva_yantra', 'sa')).toBe('खल्लयन्त्रम् (Khalva Yantra)');
  });

  it('translates major formulation titles into Devanagari script', () => {
    expect(t('triphala_churna', 'sa')).toBe('त्रिफला चूर्णम्');
    expect(t('trikatu_churna', 'sa')).toBe('त्रिकटु चूर्णम्');
    expect(t('sitopaladi_churna', 'sa')).toBe('सितोपलादि चूर्णम्');
  });

  it('falls back gracefully to English when key is missing in Sanskrit', () => {
    expect(t('canvas_title', 'en')).toBe('Laboratory Workbench');
    expect(t('non_existent_key', 'sa')).toBe('non_existent_key');
  });
});
