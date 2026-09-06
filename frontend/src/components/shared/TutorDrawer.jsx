import React, { useState } from 'react';
import AITutor from '../learning/AITutor';
import './TutorDrawer.css';

const TutorDrawer = ({ isOpen, onClose, currentExperiment }) => {
  const [isFullPage, setIsFullPage] = useState(false);

  return (
    <div className={`tutor-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`tutor-drawer-container ${isOpen ? 'open' : ''} ${isFullPage ? 'full-page' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <AITutor 
          currentExperiment={currentExperiment} 
          isDrawer={true} 
          onClose={onClose}
          isFullPage={isFullPage}
          onToggleFullPage={() => setIsFullPage(prev => !prev)}
        />
      </div>
    </div>
  );
};

export default TutorDrawer;
