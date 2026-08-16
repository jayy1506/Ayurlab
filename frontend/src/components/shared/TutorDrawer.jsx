import React from 'react';
import { X, Bot } from 'lucide-react';
import AITutor from '../learning/AITutor';
import './TutorDrawer.css';

const TutorDrawer = ({ isOpen, onClose }) => {
  return (
    <div className={`tutor-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`tutor-drawer-container ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="title-area">
            <Bot size={22} className="tutor-icon" />
            <h2>Ayurvedic AI Tutor</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="drawer-body">
          <AITutor />
        </div>
        
        <div className="drawer-footer">
          <p>Traditional Knowledge • Modern Intelligence</p>
        </div>
      </div>
    </div>
  );
};

export default TutorDrawer;
