import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveRecording } from '../../utils/db';
import { useNavigate } from 'react-router-dom';
import { Video, StopCircle } from 'lucide-react';
import './CameraRecorder.css';

const CameraRecorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const recording = {
            id: `rec_${Date.now()}`,
            studentName: currentUser?.username || 'Unknown Student',
            date: new Date().toISOString(),
            blob: blob
          };
          
          try {
            await saveRecording(recording);
            console.log('Recording saved successfully to IndexedDB');
          } catch (err) {
            console.error('Failed to save recording', err);
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setError('Camera access is required for the exam.');
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
  }, [currentUser]);

  const handleFinishExam = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Give it a tiny bit of time to process the stop event and save
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  return (
    <div className="camera-recorder-container glass-panel">
      {error ? (
        <div className="camera-error">{error}</div>
      ) : (
        <>
          <div className="camera-header">
            <Video size={16} className={isRecording ? 'recording-icon blinking' : 'recording-icon'} />
            <span>Exam Active (Background Recording)</span>
          </div>
          <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
          <button className="finish-exam-btn" onClick={handleFinishExam}>
            <StopCircle size={16} /> Finish Exam
          </button>
        </>
      )}
    </div>
  );
};

export default CameraRecorder;
