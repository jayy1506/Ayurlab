import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../contexts/useSimulation';
import { Flame, Snowflake, RotateCw, Cog, Clock, Filter, Columns, Pill, AlertOctagon, CheckCircle } from 'lucide-react';
import { t, getLanguage } from '../../utils/i18n';

const ACTIONS = [
  { id: 'grind', key: 'mardan', name: 'Grind (Mardana)', devanagari: 'मर्दनम् (Mardana)', icon: <Cog size={15} />, desc: 'Triturate & powder herbs in stone mortar' },
  { id: 'sieve', key: 'sifting', name: 'Sieve (Vastragalita)', devanagari: 'वस्त्रगालितम् (Sifting)', icon: <Columns size={15} />, desc: 'Pass fine powder through clean cloth' },
  { id: 'heat', key: 'agni', name: 'Heat (Agni Paka)', devanagari: 'अग्निदानम् (Agni Paka)', icon: <Flame size={15} />, desc: 'Apply controlled classical heat' },
  { id: 'filter', key: 'filter', name: 'Filter (Galana)', devanagari: 'गालनम् (Galana)', icon: <Filter size={15} />, desc: 'Filter decoction or liquid extract' },
  { id: 'mix', key: 'mix', name: 'Mix (Mishrana)', devanagari: 'मिश्रणम् (Mishrana)', icon: <RotateCw size={15} />, desc: 'Homogenize multiple compounded herbs' },
  { id: 'form_pills', key: 'form_pills', name: 'Form Pills (Vati)', devanagari: 'वटीनिर्माणम् (Vati)', icon: <Pill size={15} />, desc: 'Roll paste into spherical tablets' },
  { id: 'freeze', key: 'freeze', name: 'Cool (Sheetikarana)', devanagari: 'शीतीकरणम् (Cooling)', icon: <Snowflake size={15} />, desc: 'Allow formulation to cool naturally' },
];

const ActionsPanel = () => {
  const {
    applyAction, currentAction,
    simulationResult, resetCanvas,
    timelapse, setTimelapse,
    actionSequence,
  } = useSimulation();

  const [lang, setLang] = useState(() => getLanguage());
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener('ayurveda_language_changed', handleLangChange);
    return () => window.removeEventListener('ayurveda_language_changed', handleLangChange);
  }, []);

  const handleActionClick = (action) => {
    applyAction(action.id);
    const label = lang === 'sa' ? action.devanagari : action.name;
    setAnnouncement(`Action started: ${label}`);
  };

  const resultColor = simulationResult?.success === true ? '#10b981'
    : simulationResult?.success === false ? '#f59e0b' : '#c2410c';

  return (
    <div 
      className="actions-sidebar ayurvedic-panel" 
      style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', borderRadius: '40px 4px 40px 4px' }}
      role="region"
      aria-label="Laboratory Pharmacy Actions"
    >
      {/* Screen Reader Live Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        style={{ position: 'absolute', width: 1, height: 1, padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {announcement}
      </div>

      {/* Header */}
      <h3 style={{ marginBottom: '0.3rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        ⚗️ {lang === 'sa' ? 'रसशाला कर्माणि' : 'Lab Actions'}
      </h3>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        {lang === 'sa' ? 'यथाविधि शास्त्रोक्तक्रमं पालयत।' : 'Follow the classical SOP steps in order.'}
      </p>

      {/* Action buttons with bilingual Devanagari / English display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
        {ACTIONS.map(a => {
          const displayLabel = lang === 'sa' ? a.devanagari : a.name;
          return (
            <button
              key={a.id}
              className="lab-action-btn"
              onClick={() => handleActionClick(a)}
              disabled={!!currentAction}
              title={a.desc}
              aria-label={a.name}
            >
              <span className="lab-action-icon">{a.icon}</span>
              <span className="lab-action-label" style={{ fontSize: '0.78rem' }}>{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Result feedback */}
      {simulationResult?.message && (
        <div style={{
          padding: '0.55rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${resultColor}40`,
          color: resultColor,
          fontSize: '0.72rem',
          lineHeight: 1.4,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.4rem',
          marginBottom: '0.75rem',
        }}>
          {simulationResult.success === true  && <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} />}
          {simulationResult.success === false && <AlertOctagon size={13} style={{ flexShrink: 0, marginTop: 2 }} />}
          {simulationResult.message}
        </div>
      )}
    </div>
  );
};

export default ActionsPanel;
