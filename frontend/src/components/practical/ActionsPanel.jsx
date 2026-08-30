import { useSimulation } from '../../contexts/useSimulation';
import { Flame, Snowflake, RotateCw, Cog, Clock, Filter, Columns, Pill, AlertOctagon, CheckCircle } from 'lucide-react';

const ACTIONS = [
  { id: 'grind',      name: 'Grind (Mardana)',    icon: <Cog size={15} />,      desc: 'Powder the dry herbs' },
  { id: 'sieve',      name: 'Sieve (Vastragala)',  icon: <Columns size={15} />,  desc: 'Sieve through fine cloth' },
  { id: 'heat',       name: 'Heat (Agni Paka)',    icon: <Flame size={15} />,    desc: 'Apply Mandagni heat' },
  { id: 'filter',     name: 'Filter (Kvatha)',     icon: <Filter size={15} />,   desc: 'Filter the decoction' },
  { id: 'mix',        name: 'Mix (Samyoga)',       icon: <RotateCw size={15} />, desc: 'Blend all together' },
  { id: 'form_pills', name: 'Form Pills (Vati)',   icon: <Pill size={15} />,     desc: 'Shape into tablets/varti' },
  { id: 'freeze',     name: 'Cool (Shita)',        icon: <Snowflake size={15} />,desc: 'Let the compound cool' },
];

const TIME_UNITS = ['second', 'minute', 'hour', 'day'];

const ActionsPanel = () => {
  const {
    applyAction, currentAction,
    simulationResult, resetCanvas,
    timelapse, setTimelapse,
    actionSequence,
  } = useSimulation();

  const resultColor = simulationResult?.success === true ? '#10b981'
    : simulationResult?.success === false ? '#f59e0b' : '#c2410c';

  return (
    <div className="actions-sidebar ayurvedic-panel" style={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', borderRadius: '40px 4px 40px 4px' }}>

      {/* Header */}
      <h3 style={{ marginBottom: '0.3rem' }}>⚗️ Lab Actions</h3>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
        Follow the experiment SOP steps in order.
      </p>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
        {ACTIONS.map(a => (
          <button
            key={a.id}
            className="lab-action-btn"
            onClick={() => applyAction(a.id)}
            disabled={!!currentAction}
            title={a.desc}
          >
            <span className="lab-action-icon">{a.icon}</span>
            <span className="lab-action-label">{a.name}</span>
          </button>
        ))}
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

      {/* Step counter */}
      {actionSequence?.length > 0 && (
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Steps taken: <strong style={{ color: 'var(--text-primary)' }}>{actionSequence.length}</strong>
        </p>
      )}

      {/* Reset */}
      <button
        onClick={resetCanvas}
        style={{
          padding: '0.45rem', borderRadius: '8px', border: '1px solid var(--error-color)',
          background: 'rgba(146, 64, 14, 0.08)', color: 'var(--error-color)',
          cursor: 'pointer', fontSize: '0.75rem', marginBottom: '1.25rem'
        }}
      >
        🔄 Reset Lab
      </button>

      {/* ── Time-Lapse Controls ──────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={15} /> Time-Lapse
        </h3>
        <p style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Set how fast simulated actions run.
        </p>

        {/* Row 1: "X real seconds" */}
        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
          Each action takes
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <input
            type="number"
            min={0.5}
            max={60}
            step={0.5}
            value={timelapse.realSeconds}
            onChange={e => setTimelapse(t => ({ ...t, realSeconds: Number(e.target.value) || 1 }))}
            style={{
              width: '60px', padding: '0.35rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px', color: 'var(--text-primary)',
              fontSize: '0.78rem', outline: 'none', textAlign: 'center'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>real sec</span>
        </div>

        {/* Row 2: "= X units of simulated time" */}
        <label style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
          Which equals
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input
            type="number"
            min={1}
            value={timelapse.equals}
            onChange={e => setTimelapse(t => ({ ...t, equals: Number(e.target.value) || 1 }))}
            style={{
              width: '55px', padding: '0.35rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px', color: 'var(--text-primary)',
              fontSize: '0.78rem', outline: 'none', textAlign: 'center'
            }}
          />
          <select
            value={timelapse.unit}
            onChange={e => setTimelapse(t => ({ ...t, unit: e.target.value }))}
            style={{
              flex: 1, padding: '0.35rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px', color: 'var(--text-primary)',
              fontSize: '0.72rem', outline: 'none'
            }}
          >
            {TIME_UNITS.map(u => <option key={u} value={u}>{u}{timelapse.equals !== 1 ? 's' : ''}</option>)}
          </select>
        </div>

        {/* Preview */}
        <p style={{ fontSize: '0.63rem', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
          ⏱ {timelapse.realSeconds}s = {timelapse.equals} {timelapse.unit}{timelapse.equals !== 1 ? 's' : ''} of lab time
        </p>
      </div>

    </div>
  );
};

export default ActionsPanel;
