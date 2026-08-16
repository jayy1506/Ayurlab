import { useState, useEffect, useRef } from 'react';
import './WeightModal.css';

const WeightModal = ({ item, onConfirm, onCancel }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(value);
    if (!isNaN(parsed) && value.trim() !== '') {
      onConfirm(parsed);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="weight-modal glass-panel" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {item.type === 'liquid' ? '💧' : '🌿'}
        </div>
        <h2>Measure {item.name}</h2>
        <p>Enter the exact amount required for the formulation as per Ayurvedic SOPs.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="weight-input-container">
            <input
              ref={inputRef}
              type="text"
              className="weight-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="0"
            />
            <span className="weight-unit">
              {item.type === 'liquid' ? 'ml' : 'g'}
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!value.trim()}>
              Confirm Measurement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeightModal;
