import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, GraduationCap, ChevronRight, Clock, FlaskConical, 
  Video, Bot, CheckSquare, FileText, ArrowRight, Sparkles, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRecentActivities, formatRelativeTime } from '../utils/activityTracker';
import './Dashboard.css';

const ICON_MAP = {
  practical: FlaskConical,
  video: Video,
  tutor: Bot,
  assessment: CheckSquare,
  note: FileText
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Ayurveda Scholar';

  const [activities, setActivities] = useState(() => getRecentActivities());

  useEffect(() => {
    const handleUpdate = () => {
      setActivities(getRecentActivities());
    };

    // Load initial and listen to live changes
    window.addEventListener('ayurveda_activity_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Refresh every minute to ensure expired >24h entries are removed
    const interval = setInterval(handleUpdate, 60000);

    return () => {
      window.removeEventListener('ayurveda_activity_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

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
          <p className="text-muted">Explore Ayurvedic concepts, formulas, and get assistance from your personal AI Tutor.</p>
          <Link to="/learning" className="btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Enter Library <ChevronRight size={18} />
          </Link>
          <Leaf style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'rotate(45deg)' }} size={120} />
        </div>

        <div className="platform-card glass-panel leaf-card" style={{ borderRadius: '4px 60px 4px 60px' }}>
          <div className="card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Leaf size={32} />
          </div>
          <h2>Practical Platform</h2>
          <p className="text-muted">Enter the virtual lab to mix herbs, apply heat, and test your compound formulations.</p>
          <Link to="/practical" className="btn-outline" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>
            Enter Lab <ChevronRight size={18} />
          </Link>
          <Leaf style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'rotate(-45deg)' }} size={120} />
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
                <span className="activity-24h-tag">Last 24 Hours</span>
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
