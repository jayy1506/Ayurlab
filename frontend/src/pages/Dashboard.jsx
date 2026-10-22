import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, GraduationCap, ChevronRight, Clock, FlaskConical, 
  Video, Bot, CheckSquare, FileText, ArrowRight, Sparkles, BookOpen,
  Award, TrendingUp, CheckCircle2, AlertTriangle, Calendar, Search, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import learningPracticals from '../data/learningPracticals';
import { getRecentActivities, formatRelativeTime } from '../utils/activityTracker';
import './Dashboard.css';

const ICON_MAP = {
  practical: FlaskConical,
  video: Video,
  tutor: Bot,
  assessment: CheckSquare,
  note: FileText
};

const getKalpanaType = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('churna')) return 'Churna Kalpana';
  if (t.includes('vati') || t.includes('gutika') || t.includes('varti')) return 'Vati Kalpana';
  if (t.includes('taila')) return 'Taila Kalpana';
  if (t.includes('ghrita')) return 'Ghrita Kalpana';
  if (t.includes('rasa') || t.includes('parpati') || t.includes('lauha') || t.includes('kajjali')) return 'Rasa Kalpana';
  if (t.includes('asava') || t.includes('arishta')) return 'Sandhana Kalpana';
  if (t.includes('avaleha') || t.includes('khanda') || t.includes('paka')) return 'Avaleha Kalpana';
  if (t.includes('kwatha') || t.includes('kashaya') || t.includes('paneeya') || t.includes('pramathya') || t.includes('mantha') || t.includes('panaka')) return 'Kashaya Kalpana';
  if (t.includes('lepa') || t.includes('upanaha') || t.includes('malahara')) return 'Lepa/Bahya Kalpana';
  if (t.includes('shodhana') || t.includes('marana') || t.includes('bhasma')) return 'Shodhana Kalpana';
  if (t.includes('lavana') || t.includes('kshara')) return 'Kshara/Lavana';
  return 'Classical Kalpana';
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { experiments = [] } = useData() || {};
  const navigate = useNavigate();
  const userName = currentUser?.name || currentUser?.displayName || currentUser?.username || localStorage.getItem('ayurveda_user_name_' + (currentUser?.email || '').toLowerCase()) || (currentUser?.email ? currentUser.email.split('@')[0] : 'Ayurveda Scholar');

  const [activities, setActivities] = useState(() => getRecentActivities());
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Competency filter, search, sort, and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'attempted' | 'passed' | 'unattempted' | 'custom'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'score' | 'recent'
  const [visibleLimit, setVisibleLimit] = useState(8);

  // Fetch student simulation attempts from database
  useEffect(() => {
    let isMounted = true;
    const fetchAttempts = async () => {
      try {
        const response = await fetch('/api/simulation/attempts/me?limit=100', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.attempts) {
            setAttempts(data.attempts);
          }
        }
      } catch (err) {
        console.warn('Could not load simulation attempts:', err);
      } finally {
        if (isMounted) setLoadingAttempts(false);
      }
    };

    fetchAttempts();

    const handleUpdate = () => {
      setActivities(getRecentActivities());
      fetchAttempts();
    };

    window.addEventListener('ayurveda_activity_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 60000);

    return () => {
      isMounted = false;
      window.removeEventListener('ayurveda_activity_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Normalize helper
  const normTitle = (str) => (str || '').trim().toLowerCase();

  // Canonical syllabus set from learningPracticals
  const canonicalTitleSet = useMemo(() => {
    const set = new Set();
    learningPracticals.forEach((p) => {
      if (p.title) set.add(normTitle(p.title));
    });
    return set;
  }, []);

  // Compute Best Score per Practical (normalized key)
  const bestScores = useMemo(() => {
    return attempts.reduce((acc, curr) => {
      const name = curr.practicalName || 'General Practical';
      const norm = normTitle(name);
      if (!acc[norm] || curr.score > acc[norm].score) {
        acc[norm] = curr;
      }
      return acc;
    }, {});
  }, [attempts]);

  // Build complete master catalogue of all 70+ experiments:
  // 1. All syllabus practicals from learningPracticals
  // 2. All from DataContext experiments (picks up custom experiments added by own via Faculty/Admin)
  // 3. Retain any practical from student attempts history even if missing from catalogue
  const allCatalogue = useMemo(() => {
    const map = new Map();

    // 1. Add syllabus practicals from learningPracticals first
    learningPracticals.forEach((p, idx) => {
      const key = normTitle(p.title);
      if (key && !map.has(key)) {
        map.set(key, {
          ...p,
          id: p.id || `p_${idx + 1}`,
          title: p.title,
          isCustom: false,
          isRetained: false,
        });
      }
    });

    // 2. Add / augment from DataContext experiments (custom additions from own/faculty/admin)
    (experiments || []).forEach((exp) => {
      const title = exp.title || exp.name;
      const key = normTitle(title);
      if (!key) return;

      const isCustomAdded = Boolean(
        exp.isCustom || 
        (typeof exp.id === 'number' && exp.id > 1000000000) || 
        !canonicalTitleSet.has(key)
      );

      if (map.has(key)) {
        map.set(key, { ...map.get(key), ...exp, isCustom: map.get(key).isCustom || isCustomAdded });
      } else {
        map.set(key, {
          ...exp,
          title: title,
          isCustom: isCustomAdded,
          isRetained: false,
        });
      }
    });

    // 3. Retain any practical that the student attempted even if not yet in official catalogue
    attempts.forEach((att) => {
      const name = att.practicalName;
      const key = normTitle(name);
      if (key && !map.has(key)) {
        map.set(key, {
          id: `retained_${key.replace(/\s+/g, '_')}`,
          title: name,
          description: att.feedback || 'Retained from completed lab simulation session',
          isCustom: false,
          isRetained: true,
        });
      }
    });

    return Array.from(map.values());
  }, [experiments, canonicalTitleSet, attempts]);

  // Metrics
  const canonicalCount = useMemo(() => {
    return allCatalogue.filter(e => !e.isCustom).length;
  }, [allCatalogue]);

  const customCatalogueCount = useMemo(() => {
    return allCatalogue.filter(e => e.isCustom).length;
  }, [allCatalogue]);

  const attemptedCount = useMemo(() => {
    return allCatalogue.filter(e => Boolean(bestScores[normTitle(e.title)])).length;
  }, [allCatalogue, bestScores]);

  const passedCount = useMemo(() => {
    return allCatalogue.filter(e => {
      const att = bestScores[normTitle(e.title)];
      return att && Boolean(att.passed);
    }).length;
  }, [allCatalogue, bestScores]);

  // Filtered and Sorted Experiments
  const displayedExperiments = useMemo(() => {
    let list = [...allCatalogue];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(exp => {
        const titleMatch = (exp.title || '').toLowerCase().includes(q);
        const descMatch = (exp.description || '').toLowerCase().includes(q);
        const kalpanaMatch = getKalpanaType(exp.title).toLowerCase().includes(q);
        return titleMatch || descMatch || kalpanaMatch;
      });
    }

    // Tab filter
    if (activeFilter === 'attempted') {
      list = list.filter(exp => Boolean(bestScores[normTitle(exp.title)]));
    } else if (activeFilter === 'passed') {
      list = list.filter(exp => {
        const att = bestScores[normTitle(exp.title)];
        return att && Boolean(att.passed);
      });
    } else if (activeFilter === 'unattempted') {
      list = list.filter(exp => !bestScores[normTitle(exp.title)]);
    } else if (activeFilter === 'custom') {
      list = list.filter(exp => exp.isCustom);
    }

    // Sorting
    list.sort((a, b) => {
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      const attemptA = bestScores[normTitle(titleA)];
      const attemptB = bestScores[normTitle(titleB)];

      if (sortBy === 'score') {
        const scoreA = attemptA ? attemptA.score : -1;
        const scoreB = attemptB ? attemptB.score : -1;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return titleA.localeCompare(titleB);
      }

      if (sortBy === 'recent') {
        const dateA = attemptA ? new Date(attemptA.createdAt || attemptA.startedAt || 0).getTime() : 0;
        const dateB = attemptB ? new Date(attemptB.createdAt || attemptB.startedAt || 0).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return titleA.localeCompare(titleB);
      }

      // Default 'name'
      return titleA.localeCompare(titleB);
    });

    return list;
  }, [allCatalogue, searchQuery, activeFilter, sortBy, bestScores]);

  const visibleExperiments = useMemo(() => {
    return displayedExperiments.slice(0, visibleLimit);
  }, [displayedExperiments, visibleLimit]);

  // Calculate Progress Over Time (last 7 attempts chronological)
  const chartAttempts = [...attempts].reverse().slice(-7);

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="dashboard-header glass-panel leaf-card">
        <div>
          <div className="dashboard-badge">
            <Leaf size={14} /> Traditional Wisdom
          </div>
          <h1 className="heading-lg dashboard-title">Namaste, {userName}</h1>
          <p className="text-muted dashboard-subtitle">Welcome to your personal Ayurveda hub. Your journey towards natural wellness continues.</p>
        </div>
      </div>

      {/* Main Platform Cards */}
      <div className="platform-cards">
        <div className="platform-card glass-panel leaf-card">
          <div className="card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <GraduationCap size={32} />
          </div>
          <h2>Learning Platform</h2>
          <p className="text-muted">Explore Ayurvedic concepts, classical formulas, and interact with the AI Tutor.</p>
          <Link to="/learning" className="btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Enter Library <ChevronRight size={18} />
          </Link>
          <Leaf style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'rotate(45deg)' }} size={120} />
        </div>

        <div className="platform-card glass-panel leaf-card" style={{ borderRadius: '4px 60px 4px 60px' }}>
          <div className="card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <FlaskConical size={32} />
          </div>
          <h2>Virtual Practical Lab</h2>
          <p className="text-muted">Perform classical Mardana, Paka, and Vastragalita compounding with real-time evaluation.</p>
          <Link to="/practical" className="btn-outline" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Enter Lab <ChevronRight size={18} />
          </Link>
          <Leaf style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'rotate(-45deg)' }} size={120} />
        </div>
      </div>

      {/* Student Lab Evaluation & Attempt History (Task 3) */}
      <div className="eval-dashboard-section glass-panel leaf-card">
        <div className="eval-header-row">
          <div>
            <div className="eval-kicker">
              <TrendingUp size={14} /> {isFacultyOrAdmin ? 'Performance Analytics & Faculty Grading' : 'Laboratory Submissions & Curriculum Progress'}
            </div>
            <h2 className="activity-section-title">
              {isFacultyOrAdmin ? 'Practical Lab Competency & Scores' : 'Practical Lab Formulations & Submissions'}
            </h2>
            <p className="activity-section-sub">
              {isFacultyOrAdmin 
                ? 'Machine-evaluated compounding accuracy, tolerance tracking, and Siddhi Lakshana achievements across all 70+ classical & custom formulations'
                : 'Track your completed compounding sessions across all 70+ BAMS formulations. Official evaluations and grading are conducted by course faculty.'}
            </p>
          </div>
          <Link to="/practical" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <FlaskConical size={16} /> New Experiment
          </Link>
        </div>

        {/* Top-Level Competency KPI Metrics */}
        <div className="competency-kpi-grid">
          <div className="competency-kpi-card">
            <div className="ckpi-header">
              <Award size={18} className="ckpi-icon" />
              <span>Total Formulations</span>
            </div>
            <div className="ckpi-value">{allCatalogue.length}</div>
            <div className="ckpi-sub">
              {canonicalCount} Syllabus {customCatalogueCount > 0 ? `+ ${customCatalogueCount} Custom Added` : 'Catalogue'}
            </div>
          </div>

          <div className="competency-kpi-card">
            <div className="ckpi-header">
              <CheckCircle2 size={18} className="ckpi-icon text-success" />
              <span>{isFacultyOrAdmin ? 'Practicals Attempted' : 'Practicals Completed'}</span>
            </div>
            <div className="ckpi-value">
              {attemptedCount} <span className="ckpi-total-slash">/ {allCatalogue.length}</span>
            </div>
            <div className="ckpi-sub">
              {allCatalogue.length > 0 ? `${Math.round((attemptedCount / allCatalogue.length) * 100)}% Curriculum Progress` : '0% Progress'}
            </div>
          </div>

          {isFacultyOrAdmin ? (
            <div className="competency-kpi-card">
              <div className="ckpi-header">
                <Sparkles size={18} className="ckpi-icon text-accent" />
                <span>Siddhi Lakshana Passed</span>
              </div>
              <div className="ckpi-value">{passedCount}</div>
              <div className="ckpi-sub">
                {passedCount > 0 ? `${Math.round((passedCount / (attemptedCount || 1)) * 100)}% First-Pass Quality` : 'Awaiting First Pass'}
              </div>
            </div>
          ) : (
            <div className="competency-kpi-card">
              <div className="ckpi-header">
                <Sparkles size={18} className="ckpi-icon text-accent" />
                <span>Sessions Logged</span>
              </div>
              <div className="ckpi-value">{attempts.length}</div>
              <div className="ckpi-sub">Institutional Laboratory Records</div>
            </div>
          )}

          {isFacultyOrAdmin ? (
            <div className="competency-kpi-card">
              <div className="ckpi-header">
                <TrendingUp size={18} className="ckpi-icon" />
                <span>Overall Lab Average</span>
              </div>
              <div className="ckpi-value">
                {attempts.length > 0
                  ? `${Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)}%`
                  : '100%'}
              </div>
              <div className="ckpi-sub">{attempts.length} Total Evaluated Attempt(s)</div>
            </div>
          ) : (
            <div className="competency-kpi-card">
              <div className="ckpi-header">
                <TrendingUp size={18} className="ckpi-icon" />
                <span>Academic Assessment</span>
              </div>
              <div className="ckpi-value" style={{ fontSize: '1.4rem' }}>
                {attempts.length > 0 ? 'Faculty Review' : 'Awaiting Trial'}
              </div>
              <div className="ckpi-sub">Official Grading Reserved for Faculty</div>
            </div>
          )}
        </div>

        {/* Search, Filter Tabs & Sort Controls */}
        <div className="competency-toolbar">
          <div className="comp-search-box">
            <Search size={16} className="comp-search-icon" />
            <input
              type="text"
              placeholder="Search all 70+ practicals (e.g. Triphala, Agnitundi, Vati, Taila)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="comp-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="comp-search-clear"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="comp-filter-pills">
            <button
              type="button"
              className={`comp-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({allCatalogue.length})
            </button>
            <button
              type="button"
              className={`comp-filter-pill ${activeFilter === 'attempted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('attempted')}
            >
              {isFacultyOrAdmin ? 'Attempted' : 'Completed'} ({attemptedCount})
            </button>
            {isFacultyOrAdmin && (
              <button
                type="button"
                className={`comp-filter-pill ${activeFilter === 'passed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('passed')}
              >
                Passed ({passedCount})
              </button>
            )}
            <button
              type="button"
              className={`comp-filter-pill ${activeFilter === 'unattempted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unattempted')}
            >
              Unattempted ({allCatalogue.length - attemptedCount})
            </button>
            {customCatalogueCount > 0 && (
              <button
                type="button"
                className={`comp-filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
                onClick={() => setActiveFilter('custom')}
              >
                ✨ Added by Own ({customCatalogueCount})
              </button>
            )}
          </div>

          <div className="comp-sort-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="comp-sort-select"
            >
              <option value="name">Sort: Name (A - Z)</option>
              {isFacultyOrAdmin && <option value="score">Sort: Highest Score</option>}
              <option value="recent">Sort: Recently Attempted</option>
            </select>
          </div>
        </div>

        {/* Experiment Competency Cards Grid */}
        {displayedExperiments.length > 0 ? (
          <>
            <div className="competency-cards-grid">
              {visibleExperiments.map((exp) => {
                const title = exp.title || exp.name || 'Ayurvedic Practical';
                const norm = title.trim().toLowerCase();
                const attempt = bestScores[norm];
                const kalpanaType = getKalpanaType(title);
                const isCustom = exp.isCustom;
                const isRetained = exp.isRetained;

                return (
                  <div key={exp.id || norm} className={`competency-card ${attempt ? 'attempted' : 'unattempted'}`}>
                    <div className="cc-header">
                      <div className="cc-badges">
                        <span className="cc-badge kalpana-badge">{kalpanaType}</span>
                        {isCustom && (
                          <span className="cc-badge custom-badge" title="Added by faculty or student">
                            ✨ Added by Own
                          </span>
                        )}
                        {isRetained && !isCustom && (
                          <span className="cc-badge retained-badge" title="Retained from attempt history">
                            Retained
                          </span>
                        )}
                      </div>
                      {attempt && (
                        isFacultyOrAdmin ? (
                          <div className={`cc-score-pill ${attempt.passed ? 'pass' : 'medium'}`}>
                            {attempt.score}%
                          </div>
                        ) : (
                          <div className="cc-score-pill" style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem', border: '1px solid #a7f3d0' }}>
                            Submitted
                          </div>
                        )
                      )}
                    </div>

                    <h3 className="cc-title" title={title}>{title}</h3>

                    <div className="cc-status-row">
                      {attempt ? (
                        <div className="cc-attempt-info">
                          {isFacultyOrAdmin ? (
                            <>
                              <span className={`cc-status-text ${attempt.passed ? 'pass' : 'warn'}`}>
                                {attempt.passed ? '✓ Siddhi Lakshana Achieved' : `${attempt.mistakes?.length || 1} Deviation(s) Noted`}
                              </span>
                              <span className="cc-attempt-date">
                                Best of {attempts.filter(a => (a.practicalName || '').trim().toLowerCase() === norm).length} attempt(s)
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="cc-status-text pass">
                                ✓ Practical Session Completed
                              </span>
                              <span className="cc-attempt-date">
                                Forwarded for Faculty Academic Review
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="cc-unattempted-info">
                          <span className="cc-unattempted-tag">Unattempted</span>
                          <span className="cc-unattempted-desc">
                            {exp.description ? `${exp.description.slice(0, 50)}...` : 'Awaiting initial laboratory compounding trial'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="cc-footer">
                      <Link 
                        to="/practical" 
                        state={{ practicalTitle: title }}
                        className="cc-launch-btn"
                      >
                        <FlaskConical size={14} /> Launch Lab
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Expand All Toggle */}
            {displayedExperiments.length > visibleLimit && (
              <div className="comp-expand-bar">
                <p className="comp-showing-text">
                  Showing {visibleLimit} of {displayedExperiments.length} formulations
                </p>
                <button
                  type="button"
                  className="btn-outline comp-expand-btn"
                  onClick={() => setVisibleLimit(prev => prev + 16 >= displayedExperiments.length ? displayedExperiments.length : prev + 16)}
                >
                  Show More Formulations ({displayedExperiments.length - visibleLimit} remaining)
                </button>
                <button
                  type="button"
                  className="btn-primary comp-expand-btn"
                  onClick={() => setVisibleLimit(displayedExperiments.length)}
                >
                  View All {displayedExperiments.length} Experiments
                </button>
              </div>
            )}

            {visibleLimit >= displayedExperiments.length && displayedExperiments.length > 8 && (
              <div className="comp-expand-bar">
                <button
                  type="button"
                  className="btn-outline comp-expand-btn"
                  onClick={() => setVisibleLimit(8)}
                >
                  Show Less (Default 8)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="comp-empty-state">
            <FlaskConical size={32} className="comp-empty-icon" />
            <h4>No experiments match your search or filter</h4>
            <p>Try clearing your search terms or selecting the "All" tab to view all 70+ practicals.</p>
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Progress Chart: Visible only to Faculty & Admin */}
        {isFacultyOrAdmin && chartAttempts.length > 1 && (
          <div className="progress-chart-container">
            <h3 className="chart-title"><TrendingUp size={16} /> Score Progression Curve</h3>
            <div className="chart-bars-wrap">
              {chartAttempts.map((att, i) => (
                <div key={i} className="chart-bar-col">
                  <div className="chart-bar-value">{att.score}%</div>
                  <div className="chart-bar-track">
                    <div 
                      className={`chart-bar-fill ${att.score >= 70 ? 'high' : 'medium'}`} 
                      style={{ height: `${att.score}%` }} 
                    />
                  </div>
                  <div className="chart-bar-label">{att.practicalName?.split(' ')[0] || `Exp ${i + 1}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attempt History List */}
        <div className="attempts-history-list">
          <h3 className="history-subheading">
            <Clock size={16} /> {isFacultyOrAdmin ? 'Recent Evaluated Attempts & Grades' : 'Recent Practical Submissions'}
          </h3>
          {attempts.length > 0 ? (
            <div className="attempts-table-wrap">
              {attempts.slice(0, 5).map((att) => (
                <div key={att._id} className="attempt-row-card">
                  <div className="att-col-main">
                    <strong>{att.practicalName}</strong>
                    <span className="att-date">
                      <Calendar size={12} /> {new Date(att.createdAt || att.startedAt).toLocaleDateString()} at {new Date(att.createdAt || att.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="att-col-feedback">
                    <span>{att.feedback || 'Completed classical preparation'}</span>
                  </div>
                  <div className="att-col-mistakes">
                    <span className={`att-mistake-pill ${(att.mistakes?.length || 0) === 0 ? 'zero' : 'warn'}`}>
                      {(att.mistakes?.length || 0) === 0 ? '0 Deviations' : `${att.mistakes.length} Deviation(s)`}
                    </span>
                  </div>
                  {isFacultyOrAdmin ? (
                    <div className={`att-col-score ${att.passed ? 'pass' : 'fail'}`}>
                      {att.score}%
                    </div>
                  ) : (
                    <div className="att-col-score" style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.78rem', border: '1px solid #a7f3d0', padding: '0.35rem 0.65rem', borderRadius: '8px', minWidth: 'auto' }}>
                      Submitted
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-attempts-text">
              {isFacultyOrAdmin
                ? 'No graded lab attempts recorded yet. Launch the Virtual Lab and complete an experiment to view competency analytics.'
                : 'No practical submissions recorded yet. Launch the Virtual Lab and compound a formulation to log your academic sessions.'}
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity Section (Last 24 Hours) */}
      <div className="recent-activity-section glass-panel leaf-card">
        <div className="activity-section-header">
          <div className="ash-title-wrap">
            <div className="ash-icon-box">
              <Clock size={20} />
            </div>
            <div>
              <div className="activity-title-row">
                <h2 className="activity-section-title">Recent Activity</h2>
                <span className="activity-24h-tag">Live Stream</span>
              </div>
              <p className="activity-section-sub">Real-time log of your experiments, lessons, and AI sessions</p>
            </div>
          </div>
          <button className="view-all-activity-btn" onClick={() => navigate('/learning')}>
            View Learning Library <ArrowRight size={14} />
          </button>
        </div>

        {activities.length > 0 ? (
          <div className="activity-items-grid">
            {activities.map((act) => {
              const Icon = ICON_MAP[act.type] || FlaskConical;
              return (
                <div 
                  key={act.id} 
                  className="activity-card-item"
                  onClick={() => act.link && navigate(act.link)}
                >
                  <div className={`activity-icon-bubble ${act.colorClass || 'green'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-main-line">
                      <strong className="activity-type-label">{act.title}</strong>
                      <span className="activity-dot">•</span>
                      <span className="activity-detail-text">{act.detail}</span>
                    </div>
                    <span className="activity-time-stamp">{formatRelativeTime(act.timestamp)}</span>
                  </div>
                  <ChevronRight size={16} className="activity-arrow-icon" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="activity-empty-state">
            <div className="empty-sparkle-icon">
              <Sparkles size={24} />
            </div>
            <h4>No activity recorded in the last 24 hours</h4>
            <p>Complete an experiment in the Practical Lab or explore theory modules to log your daily progress.</p>
            <div className="empty-state-actions">
              <Link to="/practical" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                <FlaskConical size={16} /> Start Experiment
              </Link>
              <Link to="/learning" className="btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                <BookOpen size={16} /> Explore Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
