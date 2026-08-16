export const LAB_ACTIONS = ['add', 'grind', 'sieve', 'heat', 'filter', 'mix', 'form_pills'];

const IMPORTANT_TASKS = ['heat', 'filter', 'form_pills'];

const checkRatios = (recipeId, added) => {
  const checkEqual = (keys) => {
    if (keys.length <= 1) return true;
    const base = added[keys[0]] || 0;
    for (const key of keys) {
      if (Math.abs((added[key] || 0) - base) > 0.1) return false;
    }
    return true;
  };

  const getRatioString = (recipeId) => {
    switch (recipeId) {
      case 'sitopaladi_churna': return 'Sita (16) : Vamsharochana (8) : Pippali (4) : Ela (2) : Twak (1)';
      case 'hingwastaka_churna': return 'Sunthi (1) : Maricha (1) : Pippali (1) : Ajmoda (1) : Saindhava lavana (1) : Shweta jiraka (1) : Krishna jiraka (1) : Hingu (1)';
      case 'agnitundi_vati': return 'Parada (1) : Vatsanabh (1) : Gandhaka (1) : Ajamoda (1) : Haritaki (1) : Bibhitaki (1) : Amalaki (1) : Svarji kshara (1) : Yavakshara (1) : Chitraka (1) : Saindhava lavana (1) : Shweta Jiraka (1) : Sauvarchal lavana (1) : Vidanga (1) : Samudra lavana (1) : Tankan bhasma (1) : Su. Vishamusti (16)';
      case 'chitrakadi_vati': return '15 Active Herbs (1 part each)';
      case 'lavangadi_vati': return 'Lavanga (1) : Maricha (1) : Bibhitaka (1) : Khadir sara (1)';
      case 'triphala_guggulu': return 'Haritaki (1) : Bibhitaki (1) : Amalaki (1) : Pippali (1) : Guggulu (5)';
      case 'kaishora_guggulu': return 'Haritaki (64) : Bibhitaki (64) : Amalaki (64) : Guduchi (384) : Guggulu (192) : Triphala (6) : Trikatu (18) : Vidanga (6)';
      case 'phalavarti': return '7 Active Ingredients (1 part each)';
      case 'chandrodaya_varti': return '8 Active Ingredients (1 part each)';
      case 'atasi_upanaha': return 'Atasi beej (5) : Yava (5) : Godhuma (5) : Haridra (2.5) : Saindhava lavana (1) : Tila-Taila (2.5)';
      case 'dashanasamskara_churna': return '9 Active Ingredients (1 part each) : Khatika (9 parts)';
      case 'gandhaka_malahara': return 'Siktha Taila (36) : Su. Gandhaka (3) : Girisindura (3) : Tankana (1) : Karpura (1)';
      case 'dashanga_lepa': return '10 Active Herbs (5 parts each) : Ghrita (1 part)';
      case 'mustadi_pramathya': return 'Musta (1) : Indrayava (1) : Water (16)';
      case 'shadanga_paneeya': return '6 Active Herbs (1 part each) : Water (384 parts)';
      case 'kharjuradi_mantha': return '7 Active Fruits (1 part each) : Water (28 parts)';
      case 'chincha_panaka': return 'Chincha (5) : Water (87) : Sharkara (20) : Dhanyaka (1) : Ardraka (1) : Chaturjata (2)';
      case 'chandana_panaka': return 'Shweta Chandana (10) : Water (40) : Sharkara (20) : Jambira (1)';
      case 'ghrita_murchana': return '5 Active Herbs (1 part each) : Go-ghrita (19.2) : Water (76.8)';
      case 'taila_murchana': return 'Manjistha (4) : 10 Herbs (1 part each) : Tila Taila (64) : Water (256)';
      case 'triphala_ghrita': return '19 Kalka Herbs (1 part each) : Go-ghrita (64) : Go-dugdha (64) : Triphala kwatha (192)';
      case 'amruta_ghrita': return 'Sunthi (1) : Go-ghrita (6) : Amrita kwatha (24)';
      case 'ksheerbala_taila': return 'Bala kashaya (16) : Bala (1) : Tila taila (4) : Godugdha (4)';
      case 'arka_taila': return 'Arkapatra swarasa (16) : Haridra (1) : Sarshapa Taila (4)';
      case 'vasavaleha': return 'Vasa swarasa (8) : Sita (4) : Pippali (1) : Ghrita (1) : Madhu (4)';
      case 'nimbu_sharkara': return 'Nimbu swarasa (1) : Sharkara (2)';
      case 'kutaja_ghana': return 'Kutaja (4) : Water (64) : Ativisa (1)';
      case 'guduchi_ghana': return 'Guduchi (1) : Water (16)';
      case 'haridra_khanda': return 'Haridra (8) : Goghrita (6) : Godugdha (62.5) : Sita (50) : 8 Herbs (1 part each)';
      case 'narikela_khanda': return 'Coconut powder (64) : Goghrita (16) : Coconut water (256) : Sita (64) : 10 Prakshepa (1 part each)';
      case 'ananda_bhairava_rasa': return 'Hingula (1) : Vatsanabha (1) : Sunthi (1) : Marich (2) : Pippali (2) : Tankana (1) : Jatikosha (1)';
      case 'tribhuvan_kirti_rasa': return '7 Active Ingredients (1 part each)';
      case 'rasa_parpati': return 'Parada (1) : Gandhaka (1)';
      case 'shweta_parpati': return 'Soraka (16) : Sphatika (4) : Navasadar (1)';
      case 'laghusutasekhara_rasa': return 'Gairika (2) : Sunthi (1)';
      case 'navayas_lauha': return '9 Active Herbs (1 part each) : Lauha bhasma (9 parts)';
      case 'saptamrita_lauha': return 'Yastimadhu (1) : Haritaki (1) : Bibhitaki (1) : Amalaki (1) : Lauha bhasma (1)';
      case 'narikela_lavana': return 'Ripened coconut (1) : Saindhava lavana (Q.S.)';
      case 'arka_lavana': return 'Arka Patra (15 leaves) : Saindhava lavana (Q.S.)';
      case 'godanti_shodhana': return 'Godanti (10) : Nimbu Swarasa (5)';
      case 'shankha_shodhana': return 'Shankha (10) : Kanjika (5) : Hot Water (5)';
      case 'kapardika_shodhana': return 'Varatika (10) : Kanjika (5) : Hot Water (5)';
      case 'guggulu_shodhana': return 'Guggulu (10) : Triphala Kashaya (40)';
      case 'gandhaka_shodhana': return 'Gandhaka (10) : Goghrita (10) : Godugdha (40)';
      case 'vanga_shodhana': return 'Vanga (10) : Nirgundi (5) : Haridra (1)';
      case 'yashada_shodhana': return 'Yashada (10) : Godugdha (5)';
      case 'abhraka_shodhana': return 'Abhraka (10) : Triphala Kwatha (5)';
      case 'tamra_shodhana': return 'Tamra (10) : Saindhava (1) : Nimbu (1) : Kanjika (5)';
      case 'tankana_shodhana': return 'Tankana (10)';
      case 'kankshi_shodhana': return 'Kankshi (10)';
      case 'hingula_shodhana': return 'Hingula (10) : Meshi Kshira (1) : Nimbu (7)';
      case 'gairika_shodhana': return 'Gairika (8) : Goghrita (1)';
      case 'hingu_shodhana': return 'Hingu (10) : Goghrita (1)';
      case 'mugdha_rasa': return 'Parada (1) : Khatika (2)';
      case 'bhasma_samanya_pariksha': return 'Bhasma (1) : Water (10)';
      case 'tamra_bhasma_pariksha': return 'Tamra Bhasma (1) : Dadhi (5)';
      case 'npst_test': return 'Bhasma (1) : HCl (2)';
      case 'triphala_masi': return 'Haritaki (1) : Bibhitaki (1) : Amalaki (1)';
      case 'mayur_piccha_masi': return 'Mayur Pichha (5)';
      case 'vasaputapaka_swarasa': return 'Vasa Patra (10) : Vata Patra (2) : Multani Mitti (2)';
      case 'amrita_satva': return 'Guduchi (10) : Water (40)';
      case 'arjuna_ksheera_paka': return 'Arjuna Twak (1) : Godugdha (8) : Water (32)';
      case 'rasona_ksheerapaka': return 'Rasona (1) : Godugdha (8) : Water (8)';
      case 'punarnavastaka_kwatha': return '8 Herbs (1 part each) : Water (128 parts)';
      case 'rasna_saptaka_kwatha': return '7 Herbs (1 part each) : Water (112 parts)';
      case 'specific_gravity': return 'Liquid Sample (10) : Pycnometer (1)';
      case 'refractive_index': return 'Oil Sample (10) : Refractometer (1)';
      case 'ph_determination': return 'Solution Sample (10) : pH Meter (1)';
      default: return '';
    }
  };

  const ratioErr = (expected) => ({
    success: false,
    message: '💥 Compound Destroyed! Incorrect ingredient proportions.'
  });

  const getBase = (key) => added[key] || 0;

  switch (recipeId) {
    case 'sitopaladi_churna': {
      const twak = getBase('twak');
      if (twak === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['sita'] || 0) - 16 * twak) < 0.2 &&
        Math.abs((added['vamshalochana'] || 0) - 8 * twak) < 0.2 &&
        Math.abs((added['pippali'] || 0) - 4 * twak) < 0.2 &&
        Math.abs((added['ela'] || 0) - 2 * twak) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'hingwastaka_churna': {
      const ok = checkEqual(['sunthi', 'maricha', 'pippali', 'ajmoda', 'saindhava_lavana', 'shweta_jiraka', 'krishna_jiraka', 'hingu']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'agnitundi_vati': {
      const parada = getBase('su_parada');
      if (parada === 0) return ratioErr(getRatioString(recipeId));
      const first16Equal = checkEqual([
        'su_parada', 'su_vatsanabh', 'su_gandhaka', 'ajmoda', 'haritaki', 'bibhitaki', 'amalaki',
        'svarji_kshara', 'yavakshara', 'chitraka', 'saindhava_lavana', 'shweta_jiraka', 'sauvarchal_lavana',
        'vidanga', 'samudra_lavana', 'tankan_bhasma'
      ]);
      const vishamustiOk = Math.abs((added['su_vishamusti'] || 0) - 16 * parada) < 0.2;
      return (first16Equal && vishamustiOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'chitrakadi_vati': {
      const ok = checkEqual([
        'chitraka', 'pippalimula', 'yavakshara', 'sarji_kshara', 'saindhava_lavana',
        'sauvarchal_lavana', 'vid_lavana', 'audbhida_lavana', 'samudra_lavana',
        'sunthi', 'maricha', 'pippali', 'hingu', 'ajmoda', 'chavya'
      ]);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'lavangadi_vati': {
      const ok = checkEqual(['lavanga', 'maricha', 'bibhitaki', 'khadir_sara']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'triphala_guggulu': {
      const g = getBase('haritaki');
      if (g === 0) return ratioErr(getRatioString(recipeId));
      const ok = checkEqual(['haritaki', 'bibhitaki', 'amalaki', 'pippali_churna']) &&
        Math.abs((added['guggulu'] || 0) - 5 * g) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'kaishora_guggulu': {
      const v = getBase('vidanga');
      if (v === 0) return ratioErr(getRatioString(recipeId));
      const ok = checkEqual(['haritaki', 'bibhitaki', 'amalaki']) &&
        checkEqual(['triphala', 'vidanga']) &&
        Math.abs((added['haritaki'] || 0) - (64 / 6) * v) < 0.2 &&
        Math.abs((added['guduchi'] || 0) - (384 / 6) * v) < 0.2 &&
        Math.abs((added['guggulu'] || 0) - (192 / 6) * v) < 0.2 &&
        Math.abs((added['trikatu'] || 0) - 3 * v) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'phalavarti': {
      const ok = checkEqual(['madanaphala', 'pippali', 'kustha', 'vacha', 'sweta_sarshapa', 'yavakshara', 'guda']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'chandrodaya_varti': {
      const ok = checkEqual(['shankhanabhi', 'bibhitaki', 'haritaki', 'manashila', 'pippali', 'maricha', 'kustha', 'vacha']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'arka_lavana': {
      const leaves = getBase('arka_patra');
      const salt = getBase('saindhava_lavana');
      return (leaves === 15 && salt > 0) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'atasi_upanaha': {
      const saindhav = getBase('saindhava_lavana');
      if (saindhav === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['atasi_beej'] || 0) - 5 * saindhav) < 0.2 &&
        Math.abs((added['yava'] || 0) - 5 * saindhav) < 0.2 &&
        Math.abs((added['godhuma'] || 0) - 5 * saindhav) < 0.2 &&
        Math.abs((added['haridra'] || 0) - 2.5 * saindhav) < 0.2 &&
        Math.abs((added['tila_taila'] || 0) - 2.5 * saindhav) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'dashanasamskara_churna': {
      const base = getBase('sunthi');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalPart = checkEqual(['sunthi', 'haritaki', 'musta', 'khadira_sara', 'puga_bhasma', 'maricha', 'lavanga', 'twak', 'karpura']);
      const khatikaOk = Math.abs((added['khatika'] || 0) - 9 * base) < 0.2;
      return (equalPart && khatikaOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'gandhaka_malahara': {
      const base = getBase('tankana');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['siktha_taila'] || 0) - 36 * base) < 0.2 &&
        Math.abs((added['su_gandhaka'] || 0) - 3 * base) < 0.2 &&
        Math.abs((added['girisindura'] || 0) - 3 * base) < 0.2 &&
        Math.abs((added['karpura'] || 0) - base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'dashanga_lepa': {
      const ghrita = getBase('ghrita');
      if (ghrita === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['sirisha_twaka', 'madhuyasti', 'tagar', 'raktachandana', 'ela', 'jatamamsi', 'haridra', 'daruharidra', 'kustha', 'valaka']);
      const ghritaOk = Math.abs((added['sirisha_twaka'] || 0) - 5 * ghrita) < 0.2;
      return (equalHerbs && ghritaOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'mustadi_pramathya': {
      const musta = getBase('musta');
      if (musta === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['indrayava'] || 0) - musta) < 0.2 &&
        Math.abs((added['water'] || 0) - 16 * musta) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'shadanga_paneeya': {
      const musta = getBase('musta');
      if (musta === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['musta', 'parpataka', 'usheer', 'chandana', 'rhibera', 'nagara']);
      const waterOk = Math.abs((added['water'] || 0) - 384 * musta) < 1.0;
      return (equalHerbs && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'kharjuradi_mantha': {
      const kharjura = getBase('kharjura_phala');
      if (kharjura === 0) return ratioErr(getRatioString(recipeId));
      const equalFruits = checkEqual(['kharjura_phala', 'dadima_beej', 'draksha', 'tintidika', 'chincha_phal_majja', 'amalaki', 'parushaka']);
      const waterOk = Math.abs((added['water'] || 0) - 28 * kharjura) < 1.0;
      return (equalFruits && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'chincha_panaka': {
      const base = getBase('dhanyaka');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['chincha_phal_majja'] || 0) - 5 * base) < 0.2 &&
        Math.abs((added['water'] || 0) - 87 * base) < 1.0 &&
        Math.abs((added['sharkara'] || 0) - 20 * base) < 0.2 &&
        Math.abs((added['ardraka'] || 0) - base) < 0.2 &&
        Math.abs((added['chaturjata'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'chandana_panaka': {
      const base = getBase('jambira_rasa');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['shweta_chandana_powder'] || 0) - 10 * base) < 0.2 &&
        Math.abs((added['water'] || 0) - 40 * base) < 1.0 &&
        Math.abs((added['sharkara'] || 0) - 20 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'ghrita_murchana': {
      const base = getBase('haritaki');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['haritaki', 'bibhitaki', 'amalaki', 'musta', 'haridra']);
      const ghritaOk = Math.abs((added['goghrita'] || 0) - 19.2 * base) < 1.0;
      const waterOk = Math.abs((added['water'] || 0) - 76.8 * base) < 2.0;
      return (equalHerbs && ghritaOk && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'taila_murchana': {
      const base = getBase('haridra');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['haridra', 'lodhra', 'musta', 'hribera', 'haritaki', 'bibhitaki', 'amalaki', 'shuchipushpa', 'vatapraroha', 'nalika']);
      const manjisthaOk = Math.abs((added['manjistha'] || 0) - 4 * base) < 0.2;
      const tailaOk = Math.abs((added['tila_taila'] || 0) - 64 * base) < 2.0;
      const waterOk = Math.abs((added['water'] || 0) - 256 * base) < 4.0;
      return (equalHerbs && manjisthaOk && tailaOk && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'triphala_ghrita': {
      const base = getBase('haritaki');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual([
        'haritaki', 'bibhitaki', 'amalaki', 'sunthi', 'maricha', 'pippali', 'draksha',
        'yastimadhu', 'katurohini', 'prapaundarika', 'ela', 'vidanga', 'nagakeshara',
        'nilotpala', 'sweta_sariva', 'krishna_sariva', 'shweta_chandana', 'haridra', 'daruharidra'
      ]);
      const ghritaOk = Math.abs((added['goghrita'] || 0) - 64 * base) < 2.0;
      const dugdhaOk = Math.abs((added['godugdha'] || 0) - 64 * base) < 2.0;
      const kwathaOk = Math.abs((added['triphala_rasa'] || 0) - 192 * base) < 3.0;
      return (equalHerbs && ghritaOk && dugdhaOk && kwathaOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'amruta_ghrita': {
      const sunthi = getBase('sunthi');
      if (sunthi === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['goghrita'] || 0) - 6 * sunthi) < 0.5 &&
        Math.abs((added['amrita_kwatha'] || 0) - 24 * sunthi) < 1.0;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'ksheerbala_taila': {
      const bala = getBase('bala');
      if (bala === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['bala_kashaya'] || 0) - 16 * bala) < 0.5 &&
        Math.abs((added['tila_taila'] || 0) - 4 * bala) < 0.5 &&
        Math.abs((added['godugdha'] || 0) - 4 * bala) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'arka_taila': {
      const base = getBase('haridra_kalka');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['arkapatra_swarasa'] || 0) - 16 * base) < 0.5 &&
        Math.abs((added['sarshapa_taila'] || 0) - 4 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'vasavaleha': {
      const pippali = getBase('pippali');
      if (pippali === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['vasa_swarasa'] || 0) - 8 * pippali) < 0.5 &&
        Math.abs((added['sita'] || 0) - 4 * pippali) < 0.5 &&
        Math.abs((added['ghrita'] || 0) - pippali) < 0.2 &&
        Math.abs((added['madhu'] || 0) - 4 * pippali) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'nimbu_sharkara': {
      const nimbu = getBase('nimbu_swarasa');
      if (nimbu === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['sharkara'] || 0) - 2 * nimbu) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'kutaja_ghana': {
      const ativisa = getBase('atisa_curna');
      if (ativisa === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['kutaja_twaka'] || 0) - 4 * ativisa) < 0.5 &&
        Math.abs((added['water'] || 0) - 64 * ativisa) < 1.0;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'guduchi_ghana': {
      const base = getBase('guduchi');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['water'] || 0) - 16 * base) < 1.0;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'haridra_khanda': {
      const base = getBase('trikatu');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalunified = checkEqual(['trikatu', 'trijata', 'triphala']);
      const equalherbs = checkEqual(['vidanga', 'trivritta', 'nagakeshara', 'musta', 'lauha_bhasma']);
      const haridraOk = Math.abs((added['haridra_kalka'] || 0) - (8 / 3) * base) < 0.5;
      const ghritaOk = Math.abs((added['goghrita'] || 0) - 2 * base) < 0.5;
      const sitaOk = Math.abs((added['sita'] || 0) - (50 / 3) * base) < 1.0;
      const dugdhaOk = Math.abs((added['godugdha'] || 0) - (62.5 / 3) * base) < 2.0;
      const herbsOk = Math.abs((added['vidanga'] || 0) - base / 3) < 0.2;
      return (equalunified && equalherbs && haridraOk && ghritaOk && sitaOk && dugdhaOk && herbsOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'narikela_khanda': {
      const base = getBase('dhanyaka');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalprakshepa = checkEqual(['dhanyaka', 'pippali', 'musta', 'vamshalochana', 'shweta_jiraka', 'krishna_jiraka', 'twak', 'ela', 'tejapatra', 'nagakeshar']);
      const powderOk = Math.abs((added['coconut_powder'] || 0) - 64 * base) < 1.0;
      const ghritaOk = Math.abs((added['goghrita'] || 0) - 16 * base) < 0.5;
      const sitaOk = Math.abs((added['khanda_sita'] || 0) - 64 * base) < 1.0;
      const waterOk = Math.abs((added['coconut_water'] || 0) - 256 * base) < 3.0;
      return (equalprakshepa && powderOk && ghritaOk && sitaOk && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'ananda_bhairava_rasa': {
      const base = getBase('su_hingula');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = checkEqual(['su_hingula', 'su_vatsanabha', 'sunthi', 'tankana', 'jatikosha']) &&
        Math.abs((added['maricha'] || 0) - 2 * base) < 0.2 &&
        Math.abs((added['pippali'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'tribhuvan_kirti_rasa': {
      const ok = checkEqual(['su_hingula', 'su_vatsanabha', 'sunthi', 'maricha', 'pippali', 'tankana', 'pippalimula']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'rasa_parpati': {
      const ok = checkEqual(['su_parada', 'su_gandhaka']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'shweta_parpati': {
      const base = getBase('navasadar_nh4cl');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['soraka_kno3'] || 0) - 16 * base) < 0.5 &&
        Math.abs((added['sphatika_alum'] || 0) - 4 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'laghusutasekhara_rasa': {
      const base = getBase('sunthi');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['su_gairika'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'navayas_lauha': {
      const base = getBase('sunthi');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalherbs = checkEqual(['sunthi', 'maricha', 'pippali', 'amalaki', 'haritaki', 'bibhitaki', 'musta', 'vidanga', 'chitraka']);
      const lauhaOk = Math.abs((added['lauha_bhasma'] || 0) - 9 * base) < 0.5;
      return (equalherbs && lauhaOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'saptamrita_lauha': {
      const ok = checkEqual(['yastimadhu', 'haritaki', 'bibhitaki', 'amalaki', 'lauha_bhasma']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'narikela_lavana': {
      const coconut = added['ripened_coconut'] || 0;
      const salt = added['saindhava_lavana'] || 0;
      return (coconut > 0 && salt > 0) ? { success: true } : { success: false, message: '💥 Compound Destroyed! Missing ingredients.' };
    }
    case 'godanti_shodhana': {
      const base = getBase('nimbu_swarasa');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['godanti_raw'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'shankha_shodhana': {
      const base = getBase('kanjika');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['shankha_raw'] || 0) - 2 * base) < 0.2 &&
                 Math.abs((added['hot_water'] || 0) - base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'kapardika_shodhana': {
      const base = getBase('kanjika');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['varatika_raw'] || 0) - 2 * base) < 0.2 &&
                 Math.abs((added['hot_water'] || 0) - base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'guggulu_shodhana': {
      const base = getBase('guggulu_raw');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['triphala_kashaya'] || 0) - 4 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'gandhaka_shodhana': {
      const base = getBase('gandhaka_raw');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['goghrita'] || 0) - base) < 0.2 &&
                 Math.abs((added['godugdha'] || 0) - 4 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'vanga_shodhana': {
      const base = getBase('haridra');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['vanga_raw'] || 0) - 10 * base) < 0.5 &&
                 Math.abs((added['nirgundi_swarasa'] || 0) - 5 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'yashada_shodhana': {
      const base = getBase('godugdha');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['yashada_raw'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'abhraka_shodhana': {
      const base = getBase('triphala_rasa');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['abhraka_raw'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'tamra_shodhana': {
      const base = getBase('saindhava_lavana');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['tamra_raw'] || 0) - 10 * base) < 0.5 &&
                 Math.abs((added['nimbu_swarasa'] || 0) - base) < 0.2 &&
                 Math.abs((added['kanjika'] || 0) - 5 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'tankana_shodhana': {
      const base = getBase('tankana_raw');
      return base > 0 ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'kankshi_shodhana': {
      const base = getBase('kankshi_raw');
      return base > 0 ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'hingula_shodhana': {
      const base = getBase('meshi_kshira');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['hingula_raw'] || 0) - 10 * base) < 0.5 &&
                 Math.abs((added['nimbu_swarasa'] || 0) - 7 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'gairika_shodhana': {
      const base = getBase('goghrita');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['gairika_raw'] || 0) - 8 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'hingu_shodhana': {
      const base = getBase('goghrita');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['hingu_raw'] || 0) - 10 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'mugdha_rasa': {
      const base = getBase('su_parada');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['khatika'] || 0) - 2 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'bhasma_samanya_pariksha': {
      const base = getBase('bhasma_sample');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['water'] || 0) - 10 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'tamra_bhasma_pariksha': {
      const base = getBase('tamra_bhasma_sample');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['dadhi'] || 0) - 5 * base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'npst_test': {
      const base = getBase('abhraka_bhasma_sample');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['concentrated_hcl'] || 0) - 2 * base) < 0.2 &&
                 (added['ki_paper'] || 0) > 0;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'triphala_masi': {
      const ok = checkEqual(['haritaki', 'bibhitaki', 'amalaki']);
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'mayur_piccha_masi': {
      const base = getBase('mayur_pichha');
      return base > 0 ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'vasaputapaka_swarasa': {
      const base = getBase('multani_mitti');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['vasa_patra'] || 0) - 5 * base) < 0.5 &&
                 Math.abs((added['vata_patra'] || 0) - base) < 0.2;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'amrita_satva': {
      const base = getBase('guduchi');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['water'] || 0) - 4 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'arjuna_ksheera_paka': {
      const base = getBase('arjuna_twak');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['godugdha'] || 0) - 8 * base) < 0.5 &&
                 Math.abs((added['water'] || 0) - 32 * base) < 1.0;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'rasona_ksheerapaka': {
      const base = getBase('rasona');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['godugdha'] || 0) - 8 * base) < 0.5 &&
                 Math.abs((added['water'] || 0) - 8 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'punarnavastaka_kwatha': {
      const base = getBase('punarnava');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['punarnava', 'haritaki', 'nimbatwak', 'daruharidra', 'kuturohini', 'patolpatra', 'guduchi', 'sunthi']);
      const waterOk = Math.abs((added['water'] || 0) - 128 * base) < 2.0;
      return (equalHerbs && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'rasna_saptaka_kwatha': {
      const base = getBase('rasna');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const equalHerbs = checkEqual(['rasna', 'gokshura', 'erandamula', 'devadaru', 'punarnava', 'guduchi', 'aragwadha']);
      const waterOk = Math.abs((added['water'] || 0) - 112 * base) < 2.0;
      return (equalHerbs && waterOk) ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'specific_gravity': {
      const base = getBase('pycnometer');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['liquid_sample'] || 0) - 10 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'refractive_index': {
      const base = getBase('refractometer');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['oil_sample'] || 0) - 10 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    case 'ph_determination': {
      const base = getBase('ph_meter');
      if (base === 0) return ratioErr(getRatioString(recipeId));
      const ok = Math.abs((added['solution_sample'] || 0) - 10 * base) < 0.5;
      return ok ? { success: true } : ratioErr(getRatioString(recipeId));
    }
    default:
      return { success: true };
  }
};

export const validateSimulation = (actionSequence, recipes) => {
  if (!actionSequence || actionSequence.length === 0) {
    return { success: null, message: null };
  }

  const getPhases = (steps) => {
    const phases = [];
    let currentPhase = { items: [], actions: [] };

    for (const step of steps) {
      if (IMPORTANT_TASKS.includes(step.action)) {
        phases.push({ ...currentPhase, importantTask: step.action });
        currentPhase = { items: [], actions: [] };
      } else {
        if (step.action === 'add') {
          currentPhase.items.push(step.item);
        } else {
          currentPhase.actions.push(step.action);
        }
      }
    }
    phases.push({ ...currentPhase, importantTask: null });
    return phases;
  };

  let bestMatch = null;
  let maxMatchedScore = -1;

  for (const recipe of recipes) {
    const requiredSteps = recipe.simulationSteps || [];
    const recipePhases = getPhases(requiredSteps);
    const userPhases = getPhases(actionSequence);

    let isMatch = true;
    let score = 0;

    for (let i = 0; i < userPhases.length; i++) {
      const userPhase = userPhases[i];
      const reqPhase = recipePhases[i];

      if (!reqPhase) {
        isMatch = false;
        break;
      }

      // 1. Check Items
      let phaseMatch = true;
      let reqItemsCopy = [...reqPhase.items];
      let matchedItems = 0;

      for (const item of userPhase.items) {
        const idx = reqItemsCopy.indexOf(item);
        if (idx > -1) {
          reqItemsCopy.splice(idx, 1);
          matchedItems++;
        } else {
          phaseMatch = false;
          break;
        }
      }

      // 2. Check Actions
      let reqActionsCopy = [...reqPhase.actions];
      let matchedActions = 0;

      if (phaseMatch) {
        for (const act of userPhase.actions) {
          const idx = reqActionsCopy.indexOf(act);
          if (idx > -1) {
            reqActionsCopy.splice(idx, 1);
            matchedActions++;
          } else {
            phaseMatch = false;
            break;
          }
        }
      }

      if (!phaseMatch) {
        score += matchedItems + matchedActions;
        isMatch = false;
        break;
      }

      score += matchedItems + matchedActions;

      // 3. Check Phase Completion
      const isPhaseComplete = reqItemsCopy.length === 0 && reqActionsCopy.length === 0;

      // 4. Check Important Task Boundary
      if (userPhase.importantTask) {
        if (!isPhaseComplete) {
          isMatch = false;
          break;
        }
        if (userPhase.importantTask === reqPhase.importantTask) {
          score += 1;
        } else {
          isMatch = false;
          break;
        }
      }
    }

    if (score > maxMatchedScore) {
      maxMatchedScore = score;
      bestMatch = recipe;
    }

    // Success Check
    if (isMatch && userPhases.length === recipePhases.length) {
      const lastUserPhase = userPhases[userPhases.length - 1];
      const lastReqPhase = recipePhases[recipePhases.length - 1];

      if (lastUserPhase.items.length === lastReqPhase.items.length &&
        lastUserPhase.actions.length === lastReqPhase.actions.length &&
        lastUserPhase.importantTask === lastReqPhase.importantTask) {

        // Retrieve amounts and check proportions
        const addedItemsMap = {};
        for (const step of actionSequence) {
          if (step.action === 'add') {
            addedItemsMap[step.item] = (addedItemsMap[step.item] || 0) + (step.amount || 0);
          }
        }

        const ratioCheck = checkRatios(recipe.id, addedItemsMap);
        if (ratioCheck.success === false) {
          return {
            success: false,
            message: ratioCheck.message
          };
        }

        return {
          success: true,
          message: recipe.successMessage,
          compoundId: recipe.id
        };
      }
    }
  }

  if (bestMatch) {
    const requiredLength = bestMatch.simulationSteps.length;
    if (actionSequence.length >= requiredLength) {
      return {
        success: false,
        message: '💥 Compound Destroyed! Wrong ingredient or step order. Reset and try again.'
      };
    }
  }

  return { success: null, message: null };
};
