import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Award, RefreshCw, LayoutDashboard, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SimulationResultModal.css';

const SimulationResultModal = ({ isOpen, onClose, practicalName, evaluation, onReset }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isFacultyOrAdmin = currentUser?.role === 'faculty' || currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen && evaluation) {
      // Auto-save attempt to MongoDB database
      fetch('/api/simulation/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          practicalName: practicalName || 'Ayurvedic Practical',
          score: evaluation.score,
          passed: evaluation.passed,
          durationSeconds: 120,
          mistakes: evaluation.mistakes || [],
          stepLog: evaluation.stepResults || [],
          feedback: evaluation.feedback || '',
        }),
      }).catch((err) => console.warn('[ResultModal] Database auto-save warning:', err));
    }
  }, [isOpen, evaluation, practicalName]);

  if (!isOpen || !evaluation) return null;

  const { score, passed, summary, mistakes, siddhiLakshanaResults, feedback } = evaluation;
  const grade = summary?.grade || (passed ? 'Uttama (A)' : 'Heena (Needs Revision)');

  return (
    <div className="eval-modal-overlay" onClick={onClose}>
      <div className="eval-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="eval-modal-header">
          <div className="eval-title-group">
            <span className="eval-kicker">
              <Sparkles size={14} /> {isFacultyOrAdmin ? 'Faculty Evaluation & Grading Report' : 'Laboratory Submission Report'}
            </span>
            <h2>{practicalName}</h2>
          </div>
          {isFacultyOrAdmin ? (
            <div className={`eval-badge ${passed ? 'passed' : 'failed'}`}>
              {passed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {passed ? 'PASSED' : 'NEEDS PRACTICE'}
            </div>
          ) : (
            <div className="eval-badge submitted" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <ShieldCheck size={16} /> SUBMITTED FOR FACULTY REVIEW
            </div>
          )}
        </div>

        {/* Score & Grade Hero: Visible ONLY to Faculty & Admin */}
        {isFacultyOrAdmin ? (
          <div className="eval-hero-card">
            <div className="eval-score-circle">
              <span className="eval-score-number">{score}%</span>
              <span className="eval-score-label">Final Score</span>
            </div>
            <div className="eval-hero-info">
              <div className="eval-grade-pill">
                <Award size={18} />
                <span>Classical Grade: <strong>{grade}</strong></span>
              </div>
              <p className="eval-feedback-text">{feedback}</p>
            </div>
          </div>
        ) : (
          <div className="eval-hero-card student-eval-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <div className="eval-hero-info" style={{ flex: 1 }}>
              <div className="eval-grade-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                <ShieldCheck size={16} />
                <span>Session Logged for Faculty Grading</span>
              </div>
              <p className="eval-feedback-text" style={{ marginTop: '0.4rem', color: '#cbd5e1' }}>
                Your compounding steps, ingredient proportions, and physical observations have been recorded. Official marks and classical grading are assessed and released by your course faculty.
              </p>
            </div>
          </div>
        )}

        {/* Siddhi Lakshana Verification */}
        {siddhiLakshanaResults && siddhiLakshanaResults.length > 0 && (
          <div className="eval-section">
            <h3 className="eval-section-title">
              <BookOpen size={16} /> Siddhi Lakshana Verification (Endpoint Criteria)
            </h3>
            <div className="eval-siddhi-list">
              {siddhiLakshanaResults.map((siddhi, idx) => (
                <div key={idx} className={`eval-siddhi-item ${siddhi.achieved ? 'achieved' : 'unmet'}`}>
                  {siddhi.achieved ? (
                    <CheckCircle2 size={18} className="siddhi-icon-success" />
                  ) : (
                    <XCircle size={18} className="siddhi-icon-danger" />
                  )}
                  <div className="eval-siddhi-text">
                    <strong>{siddhi.title}</strong>
                    <p>{siddhi.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mistakes & Deviations Breakdown */}
        <div className="eval-section">
          <h3 className="eval-section-title">
            <AlertTriangle size={16} /> Procedural Deviations & Mistake Log ({mistakes?.length || 0})
          </h3>
          {(!mistakes || mistakes.length === 0) ? (
            <div className="eval-no-mistakes">
              <CheckCircle2 size={24} color="#10b981" />
              <p>Flawless Execution! All raw ingredients, grinding durations, and tolerances matched classical texts.</p>
            </div>
          ) : (
            <div className="eval-mistakes-list">
              {mistakes.map((m, idx) => (
                <div key={idx} className="eval-mistake-card">
                  <div className="eval-mistake-tag">Step {m.step || idx + 1}: {m.type}</div>
                  <div className="eval-mistake-desc">{m.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="eval-modal-actions">
          <button
            type="button"
            className="eval-btn-secondary"
            onClick={() => {
              onClose();
              if (onReset) onReset();
            }}
          >
            <RefreshCw size={16} /> Re-attempt Practical
          </button>
          <button
            type="button"
            className="eval-btn-primary"
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
          >
            <LayoutDashboard size={16} /> View Student Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default SimulationResultModal;
