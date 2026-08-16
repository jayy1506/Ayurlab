import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSimulation } from '../../contexts/useSimulation';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { X, RefreshCw, Eye, EyeOff, CheckCircle, AlertOctagon, Loader2, ArrowLeft } from 'lucide-react';

/* ── Visual form representations ────────────────────────────────── */
const FORM_VISUALS = {
  hard:         { emoji: '🪨', label: 'Hard/Leaf', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  powder:       { emoji: '🌫️', label: 'Powder',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  liquid:       { emoji: '💧', label: 'Liquid',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  boiling:      { emoji: '♨️', label: 'Boiling',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  mixed_powder: { emoji: '✨', label: 'Mixed',     color: '#c2410c', bg: 'rgba(194,65,12,0.15)' },
  pill:         { emoji: '💊', label: 'Tablet',    color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  paste:        { emoji: '🥣', label: 'Paste',     color: '#78350f', bg: 'rgba(120,53,15,0.15)' },
};

/* ── Utensil emoji map ───────────────────────────────────────────── */
const UTENSIL_EMOJI = {
  khalva_yantra: '🫙',
  sneha_patra:   '🪣',
  steel_vessel:  '🫕',
  sarava:        '🧱',
  angara_koshti: '🔥',
  strainer:      '🕸️',
  cloth:         '🧶',
  laddle:        '🥄',
  tray:          '🗳️',
};

/* ── Action animation label map ─────────────────────────────────── */
const ACTION_LABELS = {
  grind:     '⚙️ Grinding to fine powder…',
  sieve:     '🕸️ Sieving through cloth…',
  heat:      '🔥 Heating on Mandagni…',
  filter:    '🌊 Filtering decoction…',
  mix:       '🔄 Mixing thoroughly…',
  form_pills:'💊 Forming Vati / Varti…',
  freeze:    '❄️ Cooling down…',
};

/* ── Single herb card inside utensil ────────────────────────────── */
const HerbChip = ({ herb, onRemove }) => {
  const visual = FORM_VISUALS[herb.form] || FORM_VISUALS.hard;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.3rem 0.5rem',
      borderRadius: '20px',
      background: visual.bg,
      border: `1px solid ${visual.color}40`,
      fontSize: '0.7rem',
      color: visual.color,
      position: 'relative',
      animation: 'popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
    }}>
      <span style={{ fontSize: '1rem' }}>{visual.emoji}</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.68rem' }}>{herb.name}</div>
        <div style={{ fontSize: '0.6rem', opacity: 0.75 }}>{herb.amount}{herb.type === 'liquid' ? 'ml' : 'g'} · {visual.label}</div>
      </div>
      <button onClick={() => onRemove(herb.uniqueId)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--error-color)', padding: '0 2px', lineHeight: 1, marginLeft: '2px'
      }}>×</button>
    </div>
  );
};

/* ── Main Canvas ─────────────────────────────────────────────────── */
const Canvas = () => {
  const { isExamMode } = useData();
  const {
    activeUtensil, herbsInUtensil, removeHerb,
    currentAction, simulationResult, resetCanvas,
  } = useSimulation();

  const [showContents, setShowContents] = useState(true);

  /* Canvas drop zone (fallback – utensil or herb dropped on blank canvas) */
  const { isOver: isOverCanvas, setNodeRef: setCanvasRef } = useDroppable({ id: 'canvas-drop-zone' });
  /* Utensil bowl drop zone (herbs drop directly on the bowl) */
  const { isOver: isOverBowl, setNodeRef: setBowlRef } = useDroppable({ id: 'utensil-drop-zone' });

  const utensilEmoji = activeUtensil
    ? (UTENSIL_EMOJI[activeUtensil.id] || '🫙')
    : null;

  const resultColor = simulationResult?.success === true ? '#10b981'
    : simulationResult?.success === false ? '#f59e0b' : '#c2410c';

  return (
    <div
      className="canvas-area ayurvedic-panel"
      ref={setCanvasRef}
      style={{
        background: isOverCanvas ? 'rgba(245,158,11,0.04)' : undefined,
        border: isOverCanvas && !activeUtensil ? '2px dashed var(--primary-color)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="canvas-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {!isExamMode && (
            <Link to="/dashboard" className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '12px' }}>
              <ArrowLeft size={13} /> Exit
            </Link>
          )}
          <h3>⚗️ Laboratory Canvas</h3>
        </div>
        <button onClick={resetCanvas} className="btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem' }}>
          <RefreshCw size={13} /> Reset Lab
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>

        {/* Empty state */}
        {!activeUtensil && !currentAction && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>🫙</div>
            <p className="text-muted" style={{ maxWidth: 300 }}>
              Drag a <strong>utensil</strong> from the inventory to place it here, then drop <strong>herbs</strong> inside it.
            </p>
          </div>
        )}

        {/* Active Utensil – big centre piece */}
        {activeUtensil && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 500 }}>

            {/* Utensil bowl */}
            <div
              ref={setBowlRef}
              style={{
                fontSize: isOverBowl ? '8rem' : '6rem',
                transition: 'font-size 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
                filter: isOverBowl ? 'drop-shadow(0 0 20px rgba(245,158,11,0.6))' : 'none',
                lineHeight: 1,
                position: 'relative',
              }}
            >
              {utensilEmoji}
              {/* Drop arrow hint */}
              {isOverBowl && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  fontSize: '1.5rem', animation: 'bounce 0.6s infinite alternate',
                }}>⬇️</div>
              )}
            </div>

            {/* Utensil name + toggle contents */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activeUtensil.name}</span>
              <button
                onClick={() => setShowContents(v => !v)}
                className="btn-outline"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                title="Toggle view inside utensil"
              >
                {showContents ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> View Inside</>}
              </button>
            </div>

            {/* Contents – herbs inside the utensil */}
            {showContents && (
              <div style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '0.75rem',
                minHeight: '80px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignContent: 'flex-start',
              }}>
                {herbsInUtensil.length === 0
                  ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 'auto' }}>
                      Drop herbs here ↑ drag onto the {utensilEmoji} bowl above
                    </p>
                  : herbsInUtensil.map(h => <HerbChip key={h.uniqueId} herb={h} onRemove={removeHerb} />)
                }
              </div>
            )}
          </div>
        )}

        {/* Action overlay */}
        {currentAction && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            gap: '1rem',
          }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color)' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', textAlign: 'center' }}>
              {ACTION_LABELS[currentAction] || `${currentAction}…`}
            </p>
          </div>
        )}

        {/* Result banner (Bottom position as requested) */}
        {simulationResult?.message && !simulationResult?.success && (
          <div style={{
            position: 'absolute', bottom: '1.5rem',
            left: '50%', transform: 'translateX(-50%)',
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.85)',
            border: `2px solid ${resultColor}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 10px ${resultColor}30`,
            backdropFilter: 'blur(8px)',
            color: resultColor,
            fontSize: '0.9rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideUp 0.3s ease',
            zIndex: 50,
          }}>
            {simulationResult.success === false && <AlertOctagon size={18} />}
            {simulationResult.message}
          </div>
        )}

        {/* Success Overlay for Created Compound */}
        {simulationResult?.success === true && herbsInUtensil.length === 1 && herbsInUtensil[0].type === 'compound' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            animation: 'fadeIn 0.5s ease',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
          }}>
            <div style={{
              filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))',
              animation: 'bounce 2s infinite alternate ease-in-out',
              marginBottom: '1rem'
            }}>
              {['powder', 'pill', 'liquid', 'paste'].includes(herbsInUtensil[0].form) ? (
                <img 
                  src={`/assets/products/${herbsInUtensil[0].form === 'powder' ? 'churna' : herbsInUtensil[0].form === 'pill' ? 'vati' : herbsInUtensil[0].form === 'liquid' ? 'taila' : 'avaleha'}.png`} 
                  alt={herbsInUtensil[0].name} 
                  style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #10b981', boxShadow: '0 0 20px rgba(16,185,129,0.5)' }} 
                />
              ) : (
                <span style={{ fontSize: '6rem' }}>{FORM_VISUALS[herbsInUtensil[0].form]?.emoji || '✨'}</span>
              )}
            </div>
            <h2 style={{ 
              color: '#10b981', 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              textAlign: 'center',
              marginBottom: '0.5rem'
            }}>
              {herbsInUtensil[0].name}
            </h2>
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              <span style={{ opacity: 0.8 }}>Original State:</span>
              <strong style={{ color: FORM_VISUALS[herbsInUtensil[0].form]?.color || '#10b981' }}>
                {FORM_VISUALS[herbsInUtensil[0].form]?.label || 'Compound'}
              </strong>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '400px',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: '2rem'
            }}>
              {simulationResult.message}
            </p>
            <button 
              onClick={resetCanvas} 
              className="btn-primary"
              style={{
                background: '#10b981',
                color: '#000',
                fontWeight: 'bold',
                padding: '0.8rem 2rem',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              Start New Experiment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
