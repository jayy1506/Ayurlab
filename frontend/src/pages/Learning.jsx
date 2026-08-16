import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoModal from '../components/shared/VideoModal';
import TutorDrawer from '../components/shared/TutorDrawer';
import { FileText, ListChecks, Leaf, Bot, Play, ArrowLeft, ArrowRight, BookOpen, Sparkles, Lock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import learningPracticals from '../data/learningPracticals';
import { logUserActivity } from '../utils/activityTracker';
import './Learning.css';

// Helper to define category names, styling, and color accents dynamically
const getCategoryStyle = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('churna') || t.includes('curna')) {
    return {
      tag: 'Churna',
      accent: '#f59e0b', // Amber
      bg: 'rgba(245, 158, 11, 0.08)',
      glow: 'rgba(245, 158, 11, 0.2)'
    };
  } else if (t.includes('vati') || t.includes('gutika') || t.includes('batti')) {
    return {
      tag: 'Vati',
      accent: '#10b981', // Emerald
      bg: 'rgba(16, 185, 129, 0.08)',
      glow: 'rgba(16, 185, 129, 0.2)'
    };
  } else if (t.includes('guggulu')) {
    return {
      tag: 'Guggulu',
      accent: '#8b5cf6', // Purple
      bg: 'rgba(139, 92, 246, 0.08)',
      glow: 'rgba(139, 92, 246, 0.2)'
    };
  } else if (t.includes('varti')) {
    return {
      tag: 'Varti',
      accent: '#3b82f6', // Blue
      bg: 'rgba(59, 130, 246, 0.08)',
      glow: 'rgba(59, 130, 246, 0.2)'
    };
  } else if (t.includes('lavana')) {
    return {
      tag: 'Lavana',
      accent: '#ec4899', // Pink
      bg: 'rgba(236, 72, 153, 0.08)',
      glow: 'rgba(236, 72, 153, 0.2)'
    };
  } else if (t.includes('taila') || t.includes('tail') || t.includes('tailam')) {
    return {
      tag: 'Taila',
      accent: '#eab308', // Yellow
      bg: 'rgba(234, 179, 8, 0.08)',
      glow: 'rgba(234, 179, 8, 0.2)'
    };
  } else if (t.includes('leha') || t.includes('avaleha') || t.includes('paka')) {
    return {
      tag: 'Leha',
      accent: '#f97316', // Orange
      bg: 'rgba(249, 115, 22, 0.08)',
      glow: 'rgba(249, 115, 22, 0.2)'
    };
  } else if (t.includes('ghrita') || t.includes('ghrit') || t.includes('grita')) {
    return {
      tag: 'Ghrita',
      accent: '#06b6d4', // Cyan
      bg: 'rgba(6, 182, 212, 0.08)',
      glow: 'rgba(6, 182, 212, 0.2)'
    };
  } else if (t.includes('lauha') || t.includes('loha') || t.includes('manda') || t.includes('bhasma')) {
    return {
      tag: 'Mineral/Lauha',
      accent: '#ef4444', // Red
      bg: 'rgba(239, 68, 68, 0.08)',
      glow: 'rgba(239, 68, 68, 0.2)'
    };
  } else if (t.includes('arka')) {
    return {
      tag: 'Arka',
      accent: '#a855f7', // Light Purple
      bg: 'rgba(168, 85, 247, 0.08)',
      glow: 'rgba(168, 85, 247, 0.2)'
    };
  } else {
    return {
      tag: 'Kalpana',
      accent: '#a8a29e', // Stone
      bg: 'rgba(168, 162, 158, 0.08)',
      glow: 'rgba(168, 162, 158, 0.2)'
    };
  }
};

const Learning = () => {
  const { experiments, isLearningBlocked } = useData();
  const navigate = useNavigate();
  const [selectedExp, setSelectedExp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);

  // Merge built-in learning practicals with experiments from DataContext, deduplicating by title
  const allExperiments = useMemo(() => {
    const seenTitles = new Set();
    const result = [];

    // Add dynamic/custom experiments from DataContext first (so edits take precedence)
    (experiments || []).forEach(exp => {
      if (exp && exp.title) {
        const normalized = exp.title.trim().toLowerCase();
        if (!seenTitles.has(normalized)) {
          seenTitles.add(normalized);
          result.push(exp);
        }
      }
    });

    // Add static built-in library items if not already added
    learningPracticals.forEach(exp => {
      if (exp && exp.title) {
        const normalized = exp.title.trim().toLowerCase();
        if (!seenTitles.has(normalized)) {
          seenTitles.add(normalized);
          result.push(exp);
        }
      }
    });

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [experiments]);

  // Filter experiments based on search query
  const filteredExperiments = useMemo(() => {
    if (!searchQuery.trim()) return allExperiments;
    const query = searchQuery.toLowerCase();
    return allExperiments.filter(exp => 
      exp.title?.toLowerCase().includes(query) ||
      exp.description?.toLowerCase().includes(query) ||
      (exp.rawIngredients && exp.rawIngredients.some(ing => ing.name?.toLowerCase().includes(query)))
    );
  }, [allExperiments, searchQuery]);

  const handleSelectExp = (exp) => {
    setSelectedExp(exp);
    logUserActivity({
      type: 'video',
      colorClass: 'purple',
      title: 'Explored Theory Module',
      detail: exp.title,
      link: '/learning'
    });
  };

  const handleBackToLibrary = () => {
    setSelectedExp(null);
  };

  // Navigations inside Detail View
  const currentIndex = selectedExp ? allExperiments.findIndex(exp => exp.id === selectedExp.id) : -1;
  const totalCount = allExperiments.length;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedExp(allExperiments[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setSelectedExp(allExperiments[currentIndex + 1]);
    }
  };

  if (isLearningBlocked) {
    return (
      <div className="learning-container-flow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column' }}>
        <div className="ayurvedic-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <Lock size={64} color="var(--primary-color)" style={{ marginBottom: '1rem', opacity: 0.8, display: 'inline-block' }} />
          <h2 style={{ marginBottom: '1rem' }}>Module Locked</h2>
          <p className="text-muted">
            Access to the Learning module is currently restricted by the administrator. This is typically done during practical examinations to maintain academic integrity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-container-flow">
      {!selectedExp ? (
        /* GRID VIEW: Library selection */
        <div className="lrn-grid-view">
          <button className="lrn-back-btn" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} /> Exit to Dashboard
          </button>
          <div className="lrn-grid-header">
            <div className="lrn-grid-title-row">
              <Leaf className="lrn-leaf-icon" size={28} />
              <div>
                <h1 className="lrn-page-title">Ayurvedic E-Library</h1>
                <p className="lrn-page-sub">Explore formulation details, shlokas, ingredients, methods, and video demonstrations.</p>
              </div>
            </div>
            <div className="lrn-search-wrap">
              <input
                type="text"
                className="lrn-search"
                placeholder="Search preparations, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredExperiments.length > 0 ? (
            <div className="lrn-card-grid">
              {filteredExperiments.map((exp) => {
                const cat = getCategoryStyle(exp.title);
                const originalIndex = allExperiments.findIndex(e => e.id === exp.id);
                const numStr = String(originalIndex + 1).padStart(2, '0');
                
                return (
                  <div
                    key={exp.id}
                    className="lrn-card"
                    style={{
                      '--cat-bg': cat.bg,
                      '--cat-accent': cat.accent,
                      borderColor: 'rgba(245,158,11,0.15)'
                    }}
                    onClick={() => handleSelectExp(exp)}
                  >
                    <div className="lrn-card-top">
                      <span className="lrn-num-badge" style={{ color: cat.accent, borderColor: cat.accent }}>
                        #{numStr}
                      </span>
                      <span
                        className="lrn-card-tag"
                        style={{
                          color: cat.accent,
                          borderColor: `${cat.accent}33`,
                          backgroundColor: `${cat.accent}11`
                        }}
                      >
                        {cat.tag}
                      </span>
                    </div>
                    <h3 className="lrn-card-title">{exp.title}</h3>
                    <p className="lrn-card-desc">{exp.description || 'Classical Ayurvedic formulation detailed reference guidelines.'}</p>
                    <div className="lrn-card-footer">
                      {exp.rawIngredients && exp.rawIngredients.length > 0 && (
                        <span className="lrn-card-ing">
                          <Leaf size={12} /> {exp.rawIngredients.length} Ing
                        </span>
                      )}
                      {exp.videoUrl && (
                        <span className="lrn-card-vid" style={{ color: cat.accent }}>
                          <Play size={12} fill="currentColor" /> Video
                        </span>
                      )}
                      <span className="lrn-card-cta" style={{ color: cat.accent }}>
                        View <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="lrn-empty">
              No matching preparations found. Try adjusting your search query.
            </div>
          )}
        </div>
      ) : (
        /* DETAIL VIEW: Full screen single experiment analysis */
        <div className="lrn-detail-view">
          <div className="lrn-detail-topbar">
            <button className="lrn-back-btn" onClick={handleBackToLibrary}>
              <ArrowLeft size={16} /> Back to Library
            </button>
            <div className="lrn-detail-nav">
              <button
                className="lrn-nav-btn"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                style={{
                  opacity: currentIndex <= 0 ? 0.4 : 1,
                  cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>
              <span className="lrn-nav-pos">
                {currentIndex + 1} / {totalCount}
              </span>
              <button
                className="lrn-nav-btn"
                onClick={handleNext}
                disabled={currentIndex >= totalCount - 1}
                style={{
                  opacity: currentIndex >= totalCount - 1 ? 0.4 : 1,
                  cursor: currentIndex >= totalCount - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>

          {(() => {
            const cat = getCategoryStyle(selectedExp.title);
            return (
              <>
                <div className="lrn-detail-hero">
                  <div className="lrn-detail-hero-glow" style={{ background: cat.glow }} />
                  <div className="lrn-detail-hero-inner">
                    <span className="lrn-detail-tag" style={{ color: cat.accent, borderColor: cat.accent }}>
                      {cat.tag}
                    </span>
                    <h1 className="lrn-detail-title">{selectedExp.title}</h1>
                    <p className="lrn-detail-desc">{selectedExp.description}</p>

                    <div className="lrn-detail-meta">
                      {selectedExp.rawIngredients && (
                        <span>
                          <Leaf size={16} className="lrn-leaf-icon" /> {selectedExp.rawIngredients.length} Ingredients
                        </span>
                      )}
                      {selectedExp.apparatus && (
                        <span>
                          <ListChecks size={16} className="lrn-leaf-icon" /> {selectedExp.apparatus.length} Utensils
                        </span>
                      )}
                      {selectedExp.videoUrl && (
                        <button className="lrn-play-hero-btn" onClick={() => setIsCinemaMode(true)}>
                          <Play size={16} fill="currentColor" /> Play Preparation Video
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lrn-detail-body">
                  {selectedExp.shlok && (
                    <div className="lrn-section lrn-section-full">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><BookOpen size={16} /></span> Reference & Shloka
                      </h3>
                      <div className="lrn-shloka-box">
                        {selectedExp.shlok.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExp.rawIngredients && selectedExp.rawIngredients.length > 0 && (
                    <div className="lrn-section">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><Leaf size={16} /></span> Ingredients
                      </h3>
                      <div className="lrn-ing-table">
                        {selectedExp.rawIngredients.map((ing, i) => (
                          <div key={i} className="lrn-ing-row">
                            <span className="lrn-ing-num" style={{ color: cat.accent }}>{i + 1}</span>
                            <span className="lrn-ing-name">{ing.name}</span>
                            <span className="lrn-ing-qty">{ing.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExp.apparatus && selectedExp.apparatus.length > 0 && (
                    <div className="lrn-section">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><ListChecks size={16} /></span> Required Apparatus
                      </h3>
                      <div className="lrn-apparatus-pills">
                        {selectedExp.apparatus.map((app, i) => (
                          <span key={i} className="lrn-pill">{app}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExp.steps && selectedExp.steps.length > 0 && (
                    <div className="lrn-section lrn-section-full">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><ListChecks size={16} /></span> Method of Preparation
                      </h3>
                      <ol className="lrn-steps">
                        {selectedExp.steps.map((step, i) => (
                          <li key={i} className="lrn-step">
                            <span className="lrn-step-num" style={{ backgroundColor: cat.accent }}>{i + 1}</span>
                            <div>{step}</div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedExp.precautions && selectedExp.precautions.length > 0 && (
                    <div className="lrn-section">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><FileText size={16} /></span> Precautions
                      </h3>
                      <ul className="lrn-precautions">
                        {selectedExp.precautions.map((prec, i) => (
                          <li key={i}>
                            <span className="lrn-prec-dot" />
                            <div>{prec}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedExp.observations && Object.keys(selectedExp.observations).length > 0 && (
                    <div className="lrn-section">
                      <h3 className="lrn-section-title">
                        <span className="lrn-section-icon"><Sparkles size={16} /></span> Observations & Specifications
                      </h3>
                      <div className="lrn-obs-grid">
                        {Object.entries(selectedExp.observations).map(([key, value], i) => (
                          <div key={i} className="lrn-obs-card" style={{ borderColor: `${cat.accent}22` }}>
                            <span className="lrn-obs-key">{key}</span>
                            <span className="lrn-obs-val">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Floating Control Balls */}
      <div className="floating-balls-container">
        {selectedExp && selectedExp.videoUrl && (
          <button
            className="ball-button video-ball"
            onClick={() => setIsCinemaMode(true)}
            title="Watch Video Guide"
          >
            <div className="ball-inner">
              <Play size={26} fill="currentColor" />
            </div>
            <span className="ball-label">Video</span>
          </button>
        )}

        <button
          className="ball-button tutor-ball"
          onClick={() => setIsTutorOpen(true)}
          title="Ask AI Tutor"
        >
          <div className="ball-inner">
            <Bot size={26} />
          </div>
          <span className="ball-label">Tutor</span>
          <div className="ball-ping"></div>
        </button>
      </div>

      {/* Video Modal for Cinema Mode */}
      <VideoModal
        isOpen={isCinemaMode}
        onClose={() => setIsCinemaMode(false)}
        videoUrl={selectedExp?.videoUrl}
        title={selectedExp?.title}
      />

      {/* Tutor Drawer */}
      <TutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
      />
    </div>
  );
};

export default Learning;
