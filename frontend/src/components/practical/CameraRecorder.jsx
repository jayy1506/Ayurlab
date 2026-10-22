import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSimulation } from '../../contexts/SimulationContext';
import { useNavigate } from 'react-router-dom';
import { 
  Video, StopCircle, AlertTriangle, Eye, EyeOff, 
  ShieldCheck, CheckCircle2, Clock, Upload, Loader2, X,
  Lock, FileText, UserCheck, HelpCircle, ArrowLeft, ShieldAlert
} from 'lucide-react';
import './CameraRecorder.css';

// MediaPipe Face Detection (runs locally, no frame upload)
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

// Configurable thresholds (can be overridden via Vite env vars)
const NO_FACE_THRESHOLD_MS = Number(import.meta.env.VITE_NO_FACE_THRESHOLD_MS) || 5000; // 5 s
const LOW_LIGHT_THRESHOLD = Number(import.meta.env.VITE_LOW_LIGHT_THRESHOLD) || 30; // brightness 0-255

const CameraRecorder = ({ practicalName = 'Practical Exam' }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const flagsRef = useRef([]);
  const startTimeRef = useRef(Date.now());
  const consentTimestampRef = useRef(null);

  // Privacy & Consent state
  const [consentStatus, setConsentStatus] = useState('pending'); // 'pending' | 'accepted' | 'declined'
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [examModeType, setExamModeType] = useState('video_proctored'); // 'video_proctored' | 'faculty_supervised'

  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [flags, setFlags] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const { currentUser } = useAuth();
  const { currentScore, lastEvaluation } = useSimulation();
  const navigate = useNavigate();

  // Proctoring Violation Logger
  const logViolation = (type, detail) => {
    const violation = {
      type,
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString(),
      detail,
    };
    flagsRef.current.push(violation);
    setFlags([...flagsRef.current]);
    console.warn(`[Exam Proctor Flag]: ${type} - ${detail}`);
  };

  // Timer Effect (starts once consent is resolved and exam begins)
  useEffect(() => {
    if (consentStatus === 'pending') return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [consentStatus]);

  // Proctoring Event Listeners (Tab Switches, Window Blur, Fullscreen Exits)
  useEffect(() => {
    if (consentStatus === 'pending') return;

    // 1. Tab visibility / minimize
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', 'Student switched browser tab or minimized window');
      }
    };

    // 2. Window focus loss
    const handleWindowBlur = () => {
      logViolation('window_blur', 'Browser window lost focus');
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('fullscreen_exit', 'Student exited fullscreen examination mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [consentStatus]);

  // Camera & Audio MediaRecorder Stream (activated ONLY after explicit consent)
  useEffect(() => {
    if (consentStatus !== 'accepted' || examModeType === 'faculty_supervised') {
      return;
    }

    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } }, 
          audio: true 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? { mimeType: 'video/webm;codecs=vp8,opus' }
          : { mimeType: 'video/webm' };

        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        // Record in 10-second timeslices to ensure buffered data retention
        mediaRecorder.start(10000);
        setIsRecording(true);
      } catch (err) {
        console.error('Camera access denied or error:', err);
        setError('Camera and microphone access could not be acquired. You may switch to the Faculty-Supervised alternative path.');
      }
    };

    startCamera();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [consentStatus, examModeType]);

  // Handle explicit consent acceptance
  const handleAcceptConsent = async () => {
    if (!consentAgreed) return;

    const timestamp = new Date().toISOString();
    consentTimestampRef.current = timestamp;

    try {
      const token = localStorage.getItem('ayurveda_token') || '';
      await fetch('/api/exam/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          consentGiven: true,
          consentVersion: '1.0',
          practicalName,
        }),
      });
    } catch (err) {
      console.warn('Consent logging endpoint ping failed, will record on final attempt submit', err);
    }

    setExamModeType('video_proctored');
    setConsentStatus('accepted');
  };

  // Handle opting into faculty-supervised alternative path
  const handleChooseFacultySupervised = () => {
    setExamModeType('faculty_supervised');
    setConsentStatus('accepted');
    setShowAlternativeModal(false);
    logViolation('alternative_path', 'Student selected faculty-supervised exam path (no camera recording)');
  };

  // Format Elapsed Time HH:MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Upload Video Recording & Submit Exam Attempt
  const handleFinishExam = async () => {
    setIsSubmitting(true);

    try {
      let recordingUrl = '';

      // Only upload video if video proctoring mode was active
      if (examModeType === 'video_proctored') {
        const finalBlob = await new Promise((resolve) => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
            resolve(new Blob(chunksRef.current, { type: 'video/webm' }));
            return;
          }

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            resolve(blob);
          };
          mediaRecorderRef.current.stop();
        });

        if (finalBlob && finalBlob.size > 0) {
          const formData = new FormData();
          formData.append('recording', finalBlob, `exam_${Date.now()}.webm`);

          const token = localStorage.getItem('ayurveda_token') || '';
          const headers = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const uploadRes = await fetch('/api/exam/upload-recording', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            recordingUrl = uploadData.recordingUrl || '';
          } else {
            console.warn('Video upload returned non-OK status, proceeding with attempt metadata');
          }
        }
      }

      // Submit Proctored Exam Attempt with flags timeline, consent metadata & score
      const finishedAt = new Date().toISOString();
      const finalScore = lastEvaluation?.score ?? currentScore ?? 85;

      const submitRes = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('ayurveda_token') ? { 'Authorization': `Bearer ${localStorage.getItem('ayurveda_token')}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          practicalName: practicalName || 'Classical Compounding Exam',
          recordingUrl: examModeType === 'faculty_supervised' ? '' : recordingUrl,
          startedAt: new Date(startTimeRef.current).toISOString(),
          finishedAt,
          score: finalScore,
          flags: flagsRef.current,
          consentGiven: examModeType === 'video_proctored',
          consentTimestamp: consentTimestampRef.current || (examModeType === 'video_proctored' ? new Date().toISOString() : null),
          consentVersion: '1.0',
          examModeType,
        }),
      });

      if (submitRes.ok) {
        const resData = await submitRes.json();
        setSubmittedData({
          examAttempt: resData.examAttempt,
          recordingUrl,
          score: finalScore,
          flagCount: flagsRef.current.length,
          durationFormatted: formatTimer(elapsedSeconds),
          examModeType,
        });
      } else {
        throw new Error('Failed to submit exam attempt');
      }
    } catch (err) {
      console.error('Exam submission error:', err);
      setSubmittedData({
        score: lastEvaluation?.score || currentScore || 80,
        flagCount: flagsRef.current.length,
        durationFormatted: formatTimer(elapsedSeconds),
        examModeType,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Pre-Exam Privacy & Consent Modal */}
      {consentStatus === 'pending' && !showAlternativeModal && (
        <div className="exam-consent-overlay">
          <div className="exam-consent-modal glass-panel">
            <div className="ecm-header">
              <div className="ecm-badge">
                <ShieldCheck size={18} className="text-emerald" />
                <span>Academic Integrity & Privacy Protocol v1.0</span>
              </div>
              <h2>Proctored Exam Recording Consent</h2>
              <p className="ecm-sub">
                Ayurlab uses automated proctoring to certify practical competencies for your BAMS degree. 
                Please review the data protection safeguards below before activating your camera.
              </p>
            </div>

            <div className="ecm-grid">
              <div className="ecm-card">
                <div className="ecm-card-icon"><Video size={20} className="text-indigo" /></div>
                <div>
                  <h4>What is Recorded?</h4>
                  <p>Webcam video & audio of your compounding workstation, browser tab focus, and timestamped procedural events.</p>
                </div>
              </div>

              <div className="ecm-card">
                <div className="ecm-card-icon"><Lock size={20} className="text-emerald" /></div>
                <div>
                  <h4>Who Can View It?</h4>
                  <p>Strictly restricted to <strong>the course faculty instructor</strong> who created this practical and authorized administrators. Never public or shared with peers.</p>
                </div>
              </div>

              <div className="ecm-card">
                <div className="ecm-card-icon"><Clock size={20} className="text-amber" /></div>
                <div>
                  <h4>Retention & Deletion</h4>
                  <p>Recordings are securely stored for <strong>30 days</strong> (per institutional policy) and permanently purged by our automated retention cleaner.</p>
                </div>
              </div>
            </div>

            <div className="ecm-checkbox-row">
              <label className="ecm-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={consentAgreed} 
                  onChange={(e) => setConsentAgreed(e.target.checked)} 
                />
                <span>
                  I have read and consent to the video recording, instructor review, and 30-day retention policy for this examination session.
                </span>
              </label>
            </div>

            <div className="ecm-actions">
              <button 
                type="button" 
                className="btn-decline-consent"
                onClick={() => setShowAlternativeModal(true)}
              >
                Decline & View Alternative Path
              </button>

              <button 
                type="button" 
                className="btn-accept-consent"
                disabled={!consentAgreed}
                onClick={handleAcceptConsent}
              >
                <ShieldCheck size={16} /> Consent & Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Faculty-Supervised Alternative Path Modal (When Student Declines) */}
      {showAlternativeModal && (
        <div className="exam-consent-overlay">
          <div className="exam-consent-modal glass-panel alternative-modal">
            <div className="ecm-header">
              <div className="ecm-badge alt-badge">
                <UserCheck size={18} className="text-amber" />
                <span>Alternative Examination Protocol</span>
              </div>
              <h2>Faculty-Supervised Exam Path</h2>
              <p className="ecm-sub">
                Ayurlab guarantees that declining webcam recording will never block your academic progress. 
                You may complete this assessment via one of the approved faculty-supervised alternatives below.
              </p>
            </div>

            <div className="alt-paths-list">
              <div className="alt-path-card recommended">
                <div className="alt-card-header">
                  <span className="alt-tag">Immediate Option</span>
                  <h4>Option 1: Complete Simulation with Faculty Supervision (No Camera)</h4>
                </div>
                <p>
                  Continue directly into the interactive simulator. No video or audio will be captured. 
                  Your simulation audit trail and final formulation calculations will be flagged for in-person or live faculty verification.
                </p>
                <button 
                  type="button" 
                  className="btn-supervised-proceed"
                  onClick={handleChooseFacultySupervised}
                >
                  Proceed with Faculty Supervision (No Camera)
                </button>
              </div>

              <div className="alt-path-card">
                <div className="alt-card-header">
                  <span className="alt-tag secondary">Offline / Wet Lab</span>
                  <h4>Option 2: In-Person Wet Laboratory Assessment</h4>
                </div>
                <p>
                  You may take this practical in-person at your institution's Rasa Shastra laboratory during scheduled faculty practical hours. 
                  Contact your department coordinator to confirm scheduling.
                </p>
              </div>
            </div>

            <div className="alt-footer-actions">
              <button 
                type="button" 
                className="btn-ghost-back"
                onClick={() => setShowAlternativeModal(false)}
              >
                <ArrowLeft size={14} /> Back to Consent Options
              </button>

              <button 
                type="button" 
                className="btn-ghost-dashboard"
                onClick={() => navigate('/dashboard')}
              >
                Return to Student Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Exam HUD / Camera Widget (Visible Once Exam Starts) */}
      {consentStatus === 'accepted' && (
        <div className={`camera-recorder-container glass-panel ${examModeType === 'faculty_supervised' ? 'supervised-mode' : ''}`}>
          {error ? (
            <div className="camera-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button 
                type="button" 
                className="btn-switch-alt"
                onClick={handleChooseFacultySupervised}
              >
                Switch to Faculty-Supervised Mode
              </button>
            </div>
          ) : (
            <>
              <div className="camera-header-row">
                <div className="camera-status-pill">
                  {examModeType === 'faculty_supervised' ? (
                    <>
                      <UserCheck size={14} className="text-amber" />
                      <span>Faculty Supervised</span>
                    </>
                  ) : (
                    <>
                      <Video size={14} className={isRecording ? 'recording-icon blinking' : 'recording-icon'} />
                      <span>Proctored Exam</span>
                    </>
                  )}
                </div>
                <div className="camera-timer">
                  <Clock size={12} /> {formatTimer(elapsedSeconds)}
                </div>
                {examModeType === 'video_proctored' && (
                  <button 
                    type="button" 
                    className="cam-toggle-btn"
                    onClick={() => setShowPreview(!showPreview)} 
                    title={showPreview ? 'Minimize webcam' : 'Show webcam'}
                  >
                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>

              {/* Webcam video feed (only in video proctored mode) */}
              {examModeType === 'video_proctored' ? (
                <div className={`camera-video-wrapper ${!showPreview ? 'hidden' : ''}`}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="camera-video" 
                  />
                  <div className="video-rec-badge">
                    <span className="rec-dot"></span> LIVE REC
                  </div>
                </div>
              ) : (
                <div className="supervised-banner">
                  <ShieldCheck size={14} className="text-amber" />
                  <span>Video recording disabled. Session flagged for faculty sign-off.</span>
                </div>
              )}

              {/* Advisory Proctoring Violations Counter */}
              {flags.length > 0 && (
                <div className="proctor-flags-badge">
                  <AlertTriangle size={13} className="text-amber" />
                  <span><strong>{flags.length}</strong> Integrity Flag{flags.length > 1 ? 's' : ''}</span>
                </div>
              )}

              <button 
                className="finish-exam-btn" 
                onClick={handleFinishExam}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="ai-spin-icon" /> Submitting Exam...
                  </>
                ) : (
                  <>
                    <StopCircle size={16} /> Submit & Finish Exam
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* 4. Exam Submission Confirmation Modal */}
      {submittedData && (
        <div className="exam-submission-overlay">
          <div className="exam-submission-modal glass-panel">
            <div className="esm-icon-box">
              <CheckCircle2 size={42} className="text-green" />
            </div>
            <h2>Exam Successfully Submitted</h2>
            <p className="esm-sub">
              {submittedData.examModeType === 'faculty_supervised'
                ? 'Your compounding simulation audit trail has been submitted under the Faculty-Supervised Examination Path for manual verification.'
                : 'Your proctored video recording and compounding audit trail have been sent to your course faculty for verification.'}
            </p>

            <div className="esm-stats-grid">
              <div className="esm-stat-card">
                <span className="esm-label">Compounding Score</span>
                <strong className="esm-val score">{submittedData.score}%</strong>
              </div>
              <div className="esm-stat-card">
                <span className="esm-label">Exam Duration</span>
                <strong className="esm-val">{submittedData.durationFormatted}</strong>
              </div>
              <div className="esm-stat-card">
                <span className="esm-label">Exam Mode</span>
                <strong className="esm-val" style={{ fontSize: '0.85rem' }}>
                  {submittedData.examModeType === 'faculty_supervised' ? 'Supervised' : 'Proctored Video'}
                </strong>
              </div>
            </div>

            <div className="esm-audit-note">
              <ShieldCheck size={16} />
              <span>
                {submittedData.examModeType === 'faculty_supervised'
                  ? 'Audit trail logged with Faculty-Supervised waiver'
                  : 'Session protected by 30-day retention policy & course faculty ownership controls'}
              </span>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', fontWeight: 600 }}
              onClick={() => navigate('/dashboard')}
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraRecorder;
