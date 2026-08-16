import React from 'react';
import { X } from 'lucide-react';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose, videoUrl, title }) => {
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

  return (
    <div className="cinema-overlay" onClick={onClose}>
      <div className="cinema-container" onClick={e => e.stopPropagation()}>
        <div className="cinema-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="cinema-body">
          {isExternalEmbed ? (
            <iframe 
              src={getEmbedUrl(videoUrl)} 
              className="cinema-video"
              title={title}
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen;"
              style={{ border: 'none' }}
            />
          ) : (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              className="cinema-video"
              crossOrigin="anonymous"
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
