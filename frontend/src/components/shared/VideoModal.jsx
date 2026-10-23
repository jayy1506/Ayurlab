import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Play } from 'lucide-react';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setIsBuffering(false);
      setPlaybackError(false);
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  const isExternalEmbed = videoUrl && (videoUrl.includes('heygen.com') || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));

  const getEmbedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.includes('heygen.com')) {
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('-')) {
        const subParts = lastPart.split('-');
        const potentialId = subParts[subParts.length - 1];
        if (potentialId.length === 32) {
          return `https://app.heygen.com/embeds/${potentialId}`;
        }
      }
      return `https://app.heygen.com/embeds/${lastPart}`;
    }
    return url;
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      });
    }
  };

  return (
    <div className="cinema-overlay" onClick={onClose}>
      <div className="cinema-container" onClick={e => e.stopPropagation()}>
        <div className="cinema-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="cinema-body">
          {/* Loading / Buffering Overlay */}
          {(isLoading || isBuffering) && !isExternalEmbed && !playbackError && (
            <div className="video-loader-overlay">
              <Loader2 size={36} className="video-spin-loader" />
              <span>{isBuffering ? 'Buffering HD stream...' : 'Fast loading video guide...'}</span>
            </div>
          )}

          {playbackError && (
            <div className="video-error-overlay">
              <p>Video stream is taking longer than usual or is unavailable.</p>
              <button className="video-retry-btn" onClick={handleManualPlay}>
                <Play size={16} /> Tap to Play
              </button>
            </div>
          )}

          {isExternalEmbed ? (
            <iframe 
              src={getEmbedUrl(videoUrl)} 
              className="cinema-video"
              title={title}
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen;"
              style={{ border: 'none' }}
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <video 
              ref={videoRef}
              src={videoUrl} 
              controls 
              autoPlay 
              preload="auto"
              playsInline
              className="cinema-video"
              onCanPlay={() => {
                setIsLoading(false);
                setIsBuffering(false);
              }}
              onLoadedData={() => setIsLoading(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsBuffering(false);
              }}
              onError={() => {
                setIsLoading(false);
                setIsBuffering(false);
                setPlaybackError(true);
              }}
            />
          )}
        </div>

        <div className="cinema-footer">
          <p>Traditional Preparation Guide • Ayurvedic Virtual Lab</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
