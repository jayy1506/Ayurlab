import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import './DefaultPasswordModal.css';

const DefaultPasswordModal = ({ isOpen, onContinue, onChangePassword }) => {
  if (!isOpen) return null;

  return (
    <div className="default-modal-overlay">
      <div className="default-modal-card glass-panel leaf-card">
        <div className="default-modal-icon-wrapper">
          <KeyRound size={36} className="key-icon" />
        </div>
        
        <h2>Welcome to Ayurveda Virtual Lab!</h2>
        
        <div className="default-modal-notice">
          <ShieldAlert size={20} className="notice-icon" />
          <p>
            Your account is currently using the <strong>default initial password</strong>.
          </p>
        </div>

        <p className="default-modal-desc">
          We recommend updating your password to a unique, secure password for better account protection.
        </p>

        <div className="default-modal-actions">
          <button 
            type="button" 
            className="btn-primary change-btn"
            onClick={onChangePassword}
          >
            <KeyRound size={18} /> Change Password
          </button>
          
          <button 
            type="button" 
            className="btn-outline continue-btn"
            onClick={onContinue}
          >
            Continue to Lab <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultPasswordModal;
