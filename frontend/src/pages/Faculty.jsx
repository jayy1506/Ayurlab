import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  FlaskConical, Database, BookText, Settings, 
  Leaf, Video, Play, X, Plus, Trash2, 
  CheckCircle2, AlertCircle, AlertTriangle, Clock, Eye, RefreshCw, ShieldCheck,
  Award, Search, Edit3
} from 'lucide-react';
import { getAllRecordings, deleteRecording as deleteRecordingDB } from '../utils/db';
import './Faculty.css';

const Faculty = () => {
  const { currentUser } = useAuth();
  const {
    experiments, addExperiment, deleteExperiment,
    inventoryItems, addInventoryItem, deleteInventoryItem,
    recipes, addRecipe, deleteRecipe,
    isLearningBlocked, setIsLearningBlocked,
    isExamMode, setIsExamMode
  } = useData();

  const [activeTab, setActiveTab] = useState('grading'); // Default to Student Grading & Assessments

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student Grading System State
  const [gradingAttempts, setGradingAttempts] = useState([]);
  const [loadingGrading, setLoadingGrading] = useState(false);
  const [selectedAttemptToGrade, setSelectedAttemptToGrade] = useState(null);
  const [facultyMarksInput, setFacultyMarksInput] = useState(85);
  const [facultyGradeInput, setFacultyGradeInput] = useState('Uttama (A)');
  const [facultyRemarksInput, setFacultyRemarksInput] = useState('');
  const [gradingSearch, setGradingSearch] = useState('');
  const [gradingFilter, setGradingFilter] = useState('all'); // 'all' | 'pending' | 'graded' | 'approved'

  // Recordings
  const [recordings, setRecordings] = useState([]);
  const [playingRecording, setPlayingRecording] = useState(null);

  // Experiment Form
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expSteps, setExpSteps] = useState('');
  const [expVideo, setExpVideo] = useState('');

  // Inventory Form
  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState('herb');
  const [invAmount, setInvAmount] = useState(100);
  const [invIcon, setInvIcon] = useState('Leaf');

  // Recipe Form
  const [recName, setRecName] = useState('');
  const [recIngredients, setRecIngredients] = useState('');
  const [recUtensil, setRecUtensil] = useState('mortar_pestle');
  const [recAction, setRecAction] = useState('grind');
  const [recSuccess, setRecSuccess] = useState('Successfully created compound.');
  const [recFailure, setRecFailure] = useState('Failed to create compound.');

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/exam/attempts?limit=50', {
        credentials: 'include',
        headers: {
          ...(localStorage.getItem('ayurveda_token') ? { 'Authorization': `Bearer ${localStorage.getItem('ayurveda_token')}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.attempts && data.attempts.length > 0) {
          setRecordings(data.attempts);
          return;
        }
      }
      const recs = await getAllRecordings();
      setRecordings(recs || []);
    } catch (e) {
      console.error('Error fetching recordings from server:', e);
      try {
        const recs = await getAllRecordings();
        setRecordings(recs || []);
      } catch (err) {}
    }
  };

  const handleReviewAttempt = async (id, status, notes = '') => {
    try {
      const res = await fetch(`/api/exam/attempts/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('ayurveda_token') ? { 'Authorization': `Bearer ${localStorage.getItem('ayurveda_token')}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status, reviewNotes: notes }),
      });
      if (res.ok) {
        showToast(`Exam attempt marked as ${status}`);
        fetchRecordings();
        setPlayingRecording(null);
      } else {
        showToast('Failed to update exam status', 'error');
      }
    } catch (err) {
      console.error('Review attempt error:', err);
      showToast('Error reviewing exam attempt', 'error');
    }
  };

  const fetchGradingAttempts = async () => {
    setLoadingGrading(true);
    try {
      const token = localStorage.getItem('ayurveda_token') || '';
      const res = await fetch('/api/simulation/admin/attempts?limit=100', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.attempts) {
          setGradingAttempts(data.attempts);
        }
      }
    } catch (err) {
      console.error('Failed to load student attempts for grading:', err);
    } finally {
      setLoadingGrading(false);
    }
  };

  const handleOpenGradeModal = (att) => {
    setSelectedAttemptToGrade(att);
    setFacultyMarksInput(typeof att.score === 'number' ? att.score : 85);
    setFacultyGradeInput(att.grade || (att.passed ? 'Uttama (A)' : 'Madhyama (B)'));
    setFacultyRemarksInput(att.facultyRemarks || att.feedback || 'Completed classical preparation.');
  };

  const handleSaveGrade = async (status = 'graded') => {
    if (!selectedAttemptToGrade?._id) return;
    try {
      const token = localStorage.getItem('ayurveda_token') || '';
      const res = await fetch(`/api/simulation/admin/attempts/${selectedAttemptToGrade._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          score: Number(facultyMarksInput),
          grade: facultyGradeInput,
          facultyRemarks: facultyRemarksInput,
          status,
          passed: Number(facultyMarksInput) >= 50,
        }),
      });
      if (res.ok) {
        showToast(`Official Grade Published: ${facultyMarksInput}% (${facultyGradeInput})`);
        setSelectedAttemptToGrade(null);
        fetchGradingAttempts();
      } else {
        showToast('Failed to record faculty grade', 'error');
      }
    } catch (err) {
      console.error('Grade save error:', err);
      showToast('Error recording faculty grade', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'recordings') {
      fetchRecordings();
    } else if (activeTab === 'grading') {
      fetchGradingAttempts();
    }
  }, [activeTab]);

  const handleAddExperiment = (e) => {
    e.preventDefault();
    if (!expTitle) return;

    const stepsArray = expSteps.split('\n').filter(s => s.trim().length > 0);
    addExperiment({
      title: expTitle,
      description: expDesc,
      steps: stepsArray.length > 0 ? stepsArray : ['Measure ingredients', 'Mix thoroughly'],
      videoUrl: expVideo.trim() || undefined
    });

    setExpTitle('');
    setExpDesc('');
    setExpSteps('');
    setExpVideo('');
    showToast('Experiment published to Student Portal');
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    if (!invName) return;

    addInventoryItem({
      name: invName,
      type: invType,
      amount: Number(invAmount),
      icon: invIcon
    });

    setInvName('');
    setInvAmount(100);
    showToast('Laboratory inventory item updated');
  };

  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!recName || !recIngredients) return;

    const ingredientsArray = recIngredients.split(',').map(i => i.trim()).filter(Boolean);
    addRecipe({
      name: recName,
      ingredients: ingredientsArray,
      utensil: recUtensil,
      action: recAction,
      successMessage: recSuccess,
      failureMessage: recFailure
    });

    setRecName('');
    setRecIngredients('');
    showToast('Simulation formulation recipe saved');
  };

  const handleDeleteRecording = async (id) => {
    if (window.confirm('Delete this exam session recording?')) {
      await deleteRecordingDB(id);
      fetchRecordings();
      showToast('Recording removed');
    }
  };

  return (
    <div className="faculty-container">
      {/* Header */}
      <div className="faculty-header glass-panel leaf-card">
        <div className="faculty-header-content">
          <div className="faculty-badge">
            <ShieldCheck size={16} /> Faculty Instructor Portal
          </div>
          <h1 className="heading-lg faculty-title">Academic & Lab Management</h1>
          <p className="text-muted faculty-subtitle">
            Curate clinical experiments, configure compounding simulations, and monitor practical assessments.
          </p>
        </div>
        <div className="faculty-instructor-card">
          <span className="instructor-label">Logged in Faculty:</span>
          <strong>{currentUser?.name || currentUser?.displayName || currentUser?.email}</strong>
          <span className="college-tag">{currentUser?.collegeId || 'COLLEGE_001'}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`faculty-toast ${toastMessage.type}`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="faculty-tabs glass-panel">
        <button 
          className={`faculty-tab-btn ${activeTab === 'grading' ? 'active' : ''}`}
          onClick={() => setActiveTab('grading')}
        >
          <Award size={18} /> Student Grading & Assessments ({gradingAttempts.length})
        </button>
        <button 
          className={`faculty-tab-btn ${activeTab === 'experiments' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiments')}
        >
          <FlaskConical size={18} /> Experiments & Videos
        </button>
        <button 
          className={`faculty-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Leaf size={18} /> Inventory & Herbs
        </button>
        <button 
          className={`faculty-tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          <BookText size={18} /> Simulation Recipes
        </button>
        <button 
          className={`faculty-tab-btn ${activeTab === 'recordings' ? 'active' : ''}`}
          onClick={() => setActiveTab('recordings')}
        >
          <Video size={18} /> Student Recordings ({recordings.length})
        </button>
        <button 
          className={`faculty-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> Exam Controls
        </button>
      </div>

      {/* Tab: Student Grading & Assessments */}
      {activeTab === 'grading' && (
        <div className="faculty-tab-content">
          <div className="faculty-card glass-panel leaf-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="section-title" style={{ margin: 0 }}>
                  <Award size={20} /> Student Practical Submissions & Official Faculty Grading
                </h3>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                  Institutional repository of student compounding sessions across all 70+ formulations. Review procedural deviations, Siddhi Lakshanas, and issue official grades.
                </p>
              </div>
              <button 
                type="button" 
                onClick={fetchGradingAttempts} 
                className="btn-outline" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              >
                <RefreshCw size={14} className={loadingGrading ? 'spin' : ''} /> Refresh Submissions
              </button>
            </div>

            {/* Grading Summary KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Submissions</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>{gradingAttempts.length}</div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>All 70+ Formulations</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Pending Review</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '0.2rem 0' }}>
                  {gradingAttempts.filter(a => a.status === 'pending' || !a.status).length}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 500 }}>Awaiting Faculty Evaluation</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Graded / Approved</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>
                  {gradingAttempts.filter(a => a.status === 'graded' || a.status === 'approved').length}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>Official Grades Published</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Average Awarded Score</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                  {gradingAttempts.length > 0 
                    ? `${Math.round(gradingAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / gradingAttempts.length)}%`
                    : '100%'}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Class Practical Average</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by student name or practical..."
                  value={gradingSearch}
                  onChange={(e) => setGradingSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.48rem 0.75rem 0.48rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['all', 'pending', 'graded', 'approved'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setGradingFilter(f)}
                    style={{
                      padding: '0.38rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: gradingFilter === f ? '1px solid #10b981' : '1px solid #e2e8f0',
                      background: gradingFilter === f ? '#ecfdf5' : '#ffffff',
                      color: gradingFilter === f ? '#065f46' : '#475569',
                      textTransform: 'capitalize',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="faculty-card glass-panel leaf-card">
            {gradingAttempts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Award size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ margin: 0, color: '#1e293b' }}>No Student Submissions Yet</h4>
                <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  When students complete a compounding practical in the Virtual Lab, their session records will appear here for faculty grading.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Student Scholar</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Practical Formulation</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Machine Score</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Official Faculty Grade</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Deviations</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingAttempts
                      .filter((att) => {
                        const q = gradingSearch.toLowerCase().trim();
                        const matchesQ = !q || (att.userName || '').toLowerCase().includes(q) || (att.practicalName || '').toLowerCase().includes(q);
                        const matchesF = gradingFilter === 'all' || (att.status || 'pending') === gradingFilter;
                        return matchesQ && matchesF;
                      })
                      .map((att) => (
                        <tr key={att._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                            <div>{att.userName || att.user?.name || 'Ayurveda Scholar'}</div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{att.user?.email || ''}</span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                            {att.practicalName}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                            {new Date(att.createdAt || att.startedAt).toLocaleDateString()} at {new Date(att.createdAt || att.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>
                            {att.score}%
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ 
                              background: att.status === 'approved' ? '#ecfdf5' : '#eff6ff', 
                              color: att.status === 'approved' ? '#065f46' : '#1d4ed8',
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '6px', 
                              fontWeight: 700, 
                              fontSize: '0.78rem' 
                            }}>
                              {att.grade || `${att.score}% (Automated)`}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ 
                              color: (att.mistakes?.length || 0) === 0 ? '#059669' : '#b45309',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                            }}>
                              {(att.mistakes?.length || 0) === 0 ? '0 Deviations' : `${att.mistakes.length} Deviation(s)`}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: att.status === 'approved' ? '#dcfce7' : (att.status === 'graded' ? '#e0f2fe' : '#fef3c7'),
                              color: att.status === 'approved' ? '#15803d' : (att.status === 'graded' ? '#0369a1' : '#b45309'),
                            }}>
                              {att.status || 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenGradeModal(att)}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <Edit3 size={13} /> {att.status === 'approved' ? 'Edit Grade' : 'Grade & Review'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Experiments */}
      {activeTab === 'experiments' && (
        <div className="faculty-tab-content grid-layout">
          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><Plus size={18} /> Add New Experiment</h3>
            <form onSubmit={handleAddExperiment} className="faculty-form">
              <div className="form-group">
                <label>Experiment Title</label>
                <input 
                  type="text" 
                  value={expTitle} 
                  onChange={(e) => setExpTitle(e.target.value)} 
                  placeholder="e.g. Swaras Kalpana (Fresh Juice Extraction)" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description & Clinical Objective</label>
                <textarea 
                  value={expDesc} 
                  onChange={(e) => setExpDesc(e.target.value)} 
                  placeholder="Brief clinical background and dosage form characteristics" 
                  rows={2} 
                />
              </div>
              <div className="form-group">
                <label>Standard Steps (One per line)</label>
                <textarea 
                  value={expSteps} 
                  onChange={(e) => setExpSteps(e.target.value)} 
                  placeholder="Select fresh Tulsi leaves&#10;Wash with distilled water&#10;Grind in Khalva Yantra&#10;Express juice through clean cloth" 
                  rows={4} 
                />
              </div>
              <div className="form-group">
                <label>Instructional Video URL (YouTube embed or MP4)</label>
                <input 
                  type="url" 
                  value={expVideo} 
                  onChange={(e) => setExpVideo(e.target.value)} 
                  placeholder="https://www.youtube.com/embed/..." 
                />
              </div>
              <button type="submit" className="btn-primary faculty-btn">Publish Experiment</button>
            </form>
          </div>

          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><FlaskConical size={18} /> Current Experiments ({experiments.length})</h3>
            <div className="faculty-items-list">
              {experiments.map(exp => (
                <div key={exp.id} className="faculty-item-row">
                  <div>
                    <strong>{exp.title}</strong>
                    <p className="text-muted item-desc">{exp.description}</p>
                    {exp.videoUrl && <span className="video-badge"><Video size={12} /> Video Attached</span>}
                  </div>
                  <button 
                    onClick={() => deleteExperiment(exp.id)} 
                    className="icon-btn delete-btn"
                    title="Delete experiment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Inventory */}
      {activeTab === 'inventory' && (
        <div className="faculty-tab-content grid-layout">
          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><Plus size={18} /> Add Laboratory Supply / Herb</h3>
            <form onSubmit={handleAddInventory} className="faculty-form">
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={invName} 
                  onChange={(e) => setInvName(e.target.value)} 
                  placeholder="e.g. Ashwagandha Churna" 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={invType} onChange={(e) => setInvType(e.target.value)}>
                    <option value="herb">Dry Herb / Powder</option>
                    <option value="liquid">Liquid / Decoction / Oil</option>
                    <option value="utensil">Yantra / Apparatus</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Stock (Grams / mL)</label>
                  <input 
                    type="number" 
                    value={invAmount} 
                    onChange={(e) => setInvAmount(e.target.value)} 
                    min={1} 
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary faculty-btn">Add to Lab Inventory</button>
            </form>
          </div>

          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><Leaf size={18} /> Active Laboratory Inventory ({inventoryItems.length})</h3>
            <div className="faculty-items-list">
              {inventoryItems.map(item => (
                <div key={item.id} className="faculty-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="item-type-badge">{item.type}</span>
                    <span className="text-muted item-stock">{item.amount} units</span>
                  </div>
                  <button 
                    onClick={() => deleteInventoryItem(item.id)} 
                    className="icon-btn delete-btn"
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Recipes */}
      {activeTab === 'recipes' && (
        <div className="faculty-tab-content grid-layout">
          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><Plus size={18} /> Add Simulation Compounding Recipe</h3>
            <form onSubmit={handleAddRecipe} className="faculty-form">
              <div className="form-group">
                <label>Target Formulation Name</label>
                <input 
                  type="text" 
                  value={recName} 
                  onChange={(e) => setRecName(e.target.value)} 
                  placeholder="e.g. Sitopaladi Churna" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Required Ingredients (Comma-separated)</label>
                <input 
                  type="text" 
                  value={recIngredients} 
                  onChange={(e) => setRecIngredients(e.target.value)} 
                  placeholder="Mishri, Vanshlochan, Pippali, Ela, Twak" 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Apparatus (Yantra)</label>
                  <select value={recUtensil} onChange={(e) => setRecUtensil(e.target.value)}>
                    <option value="mortar_pestle">Khalva Yantra (Mortar & Pestle)</option>
                    <option value="pot">Patra (Heating Pot)</option>
                    <option value="cloth">Vastra (Straining Cloth)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Standard Action</label>
                  <select value={recAction} onChange={(e) => setRecAction(e.target.value)}>
                    <option value="grind">Mardana (Grinding)</option>
                    <option value="boil">Paka (Boiling / Heating)</option>
                    <option value="filter">Galana (Filtration)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary faculty-btn">Save Formulation Recipe</button>
            </form>
          </div>

          <div className="faculty-card glass-panel leaf-card">
            <h3 className="section-title"><BookText size={18} /> Configured Recipes ({recipes.length})</h3>
            <div className="faculty-items-list">
              {recipes.map(rec => {
                const ingredientsText = Array.isArray(rec.ingredients)
                  ? rec.ingredients.map(i => typeof i === 'string' ? i : (i.name || i.id || JSON.stringify(i))).join(', ')
                  : (rec.simulationSteps ? `${rec.simulationSteps.length} compounding steps` : 'Standard Ayurvedic formulation');

                return (
                  <div key={rec.id} className="faculty-item-row">
                    <div>
                      <strong>{rec.name || rec.title || 'Compounding Recipe'}</strong>
                      <div className="recipe-meta">
                        <span>Ingredients: {ingredientsText}</span>
                        {(rec.action || rec.utensil) && (
                          <span className="recipe-action-tag">{rec.action || 'Compound'} in {rec.utensil || 'Apparatus'}</span>
                        )}
                        {rec.finalForm && (
                          <span className="item-type-badge">{rec.finalForm}</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteRecipe(rec.id)} 
                      className="icon-btn delete-btn"
                      title="Delete recipe"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Recordings */}
      {activeTab === 'recordings' && (
        <div className="faculty-tab-content">
          <div className="faculty-card glass-panel leaf-card">
            <div className="recordings-header">
              <h3 className="section-title"><Video size={18} /> Student Practical Exam Recordings</h3>
              <button onClick={fetchRecordings} className="refresh-btn">
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>
            
            {recordings.length === 0 ? (
              <div className="empty-recordings-state">
                <Video size={40} className="empty-icon" />
                <h4>No Exam Recordings Yet</h4>
                <p className="text-muted">When students complete a practical assessment in Exam Mode, their screen & webcam session recordings will appear here for review.</p>
              </div>
            ) : (
              <div className="recordings-grid">
                {recordings.map((rec) => {
                  const recId = rec._id || rec.id;
                  const title = rec.practicalName || rec.experimentTitle || 'Practical Exam';
                  const student = rec.userName || rec.studentName || 'Student';
                  const dateStr = new Date(rec.createdAt || rec.date || rec.timestamp || Date.now()).toLocaleString();
                  const flagCount = rec.flagCount ?? (rec.flags?.length || 0);
                  const status = rec.status || 'pending';

                  return (
                    <div key={recId} className="recording-card glass-panel">
                      <div className="rec-info">
                        <strong>{title}</strong>
                        <span className="rec-date">{student} • {dateStr}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                          {rec.score !== undefined && (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: rec.score >= 70 ? '#10b981' : '#f59e0b' }}>
                              Score: {rec.score}%
                            </span>
                          )}
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 7px', 
                            borderRadius: '999px',
                            fontWeight: 600,
                            background: flagCount === 0 ? '#dcfce7' : '#fef3c7',
                            color: flagCount === 0 ? '#15803d' : '#b45309'
                          }}>
                            {flagCount === 0 ? '0 Flags' : `${flagCount} Flags`}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                            color: status === 'approved' ? '#15803d' : status === 'rejected' ? '#b91c1c' : '#475569'
                          }}>
                            {status}
                          </span>
                        </div>
                      </div>
                      <div className="rec-actions">
                        <button 
                          className="btn-primary play-btn"
                          onClick={() => setPlayingRecording(rec)}
                        >
                          <Play size={14} /> Review Session
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="faculty-tab-content">
          <div className="faculty-card glass-panel leaf-card settings-card">
            <h3 className="section-title"><Settings size={18} /> Examination & Learning Controls</h3>
            <p className="text-muted">Apply real-time restrictions across all student workstations.</p>

            <div className="setting-toggle-row">
              <div>
                <strong>Lock Learning Module (Exam Protection)</strong>
                <p className="text-muted">Prevents students from accessing reference guides, formulas, or AI Tutor during active lab hours.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isLearningBlocked} 
                  onChange={(e) => {
                    setIsLearningBlocked(e.target.checked);
                    showToast(e.target.checked ? 'Learning mode is now locked for students' : 'Learning mode unlocked');
                  }} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="setting-toggle-row">
              <div>
                <strong>Practical Exam Mode (Screen & Camera Assessment)</strong>
                <p className="text-muted">Enforces strict fullscreen and enables camera recording during practical experiments.</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isExamMode} 
                  onChange={(e) => {
                    setIsExamMode(e.target.checked);
                    showToast(e.target.checked ? 'Exam Mode enabled' : 'Exam Mode disabled');
                  }} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Recording Playback & Proctoring Review Modal */}
      {playingRecording && (
        <div className="recording-modal-overlay">
          <div className="recording-modal-card glass-panel" style={{ maxWidth: '720px', width: '92%' }}>
            <div className="rec-modal-header">
              <div>
                <h4>{playingRecording.practicalName || playingRecording.experimentTitle || 'Exam Video Session'}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Student: <strong>{playingRecording.userName || playingRecording.studentName || 'Student'}</strong> • Score: <strong>{playingRecording.score || 0}%</strong>
                </p>
              </div>
              <button onClick={() => setPlayingRecording(null)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="video-player-wrapper" style={{ marginTop: '0.75rem' }}>
              <video 
                src={playingRecording.recordingUrl || (playingRecording.videoBlob ? URL.createObjectURL(playingRecording.videoBlob) : (playingRecording.blob ? URL.createObjectURL(playingRecording.blob) : ''))} 
                controls 
                autoPlay 
                preload="auto"
                playsInline
                className="session-video"
                style={{ width: '100%', borderRadius: '12px', background: '#000', maxHeight: '360px' }}
              />
            </div>

            {/* Proctoring Flags Timeline */}
            {Array.isArray(playingRecording.flags) && playingRecording.flags.length > 0 && (
              <div style={{ marginTop: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontSize: '0.85rem' }}>
                  <AlertTriangle size={15} /> Proctoring Violations Timeline ({playingRecording.flags.length})
                </strong>
                <div style={{ maxHeight: '110px', overflowY: 'auto', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {playingRecording.flags.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#78350f', display: 'flex', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{f.timeFormatted || new Date(f.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span><strong>{f.type}</strong>: {f.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty Grading & Approval Actions */}
            {playingRecording._id && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  onClick={() => handleReviewAttempt(playingRecording._id, 'rejected', 'Review rejected due to proctoring flags')}
                  className="btn-outline"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  Reject Attempt
                </button>
                <button 
                  onClick={() => handleReviewAttempt(playingRecording._id, 'approved', 'Verified and approved')}
                  className="btn-primary"
                  style={{ background: '#10b981' }}
                >
                  <CheckCircle2 size={16} /> Approve & Validate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Student Practical Grading Modal */}
      {selectedAttemptToGrade && (
        <div className="recording-modal-overlay">
          <div className="recording-modal-card glass-panel" style={{ maxWidth: '640px', width: '92%' }}>
            <div className="rec-modal-header">
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#10b981" /> Grade Practical: {selectedAttemptToGrade.practicalName}
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Student: <strong>{selectedAttemptToGrade.userName || selectedAttemptToGrade.user?.name || 'Ayurveda Scholar'}</strong> ({selectedAttemptToGrade.user?.email || 'Student'})
                </p>
              </div>
              <button onClick={() => setSelectedAttemptToGrade(null)} className="close-btn">
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Deviations summary */}
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <strong style={{ color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Automated Lab Diagnostic Summary:
                </strong>
                <div>Machine Score: <strong>{selectedAttemptToGrade.score}%</strong></div>
                <div>Recorded Deviations: <strong>{selectedAttemptToGrade.mistakes?.length || 0} mistake(s)</strong></div>
                {Array.isArray(selectedAttemptToGrade.mistakes) && selectedAttemptToGrade.mistakes.length > 0 && (
                  <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.2rem', color: '#b45309' }}>
                    {selectedAttemptToGrade.mistakes.map((m, idx) => (
                      <li key={idx}>{m.message || m.type || 'Procedural deviation'}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Form Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Official Awarded Marks (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={facultyMarksInput}
                    onChange={(e) => setFacultyMarksInput(Math.min(100, Math.max(0, Number(e.target.value))))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Classical Letter Grade:
                  </label>
                  <select
                    value={facultyGradeInput}
                    onChange={(e) => setFacultyGradeInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="Uttama (A)">Uttama (A) - High Proficiency</option>
                    <option value="Madhyama (B)">Madhyama (B) - Satisfactory</option>
                    <option value="Heena (C)">Heena (C) - Marginally Acceptable</option>
                    <option value="Re-attempt Required (F)">Re-attempt Required (F)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Faculty Evaluation Remarks & Viva Feedback:
                </label>
                <textarea
                  rows="3"
                  value={facultyRemarksInput}
                  onChange={(e) => setFacultyRemarksInput(e.target.value)}
                  placeholder="e.g. Accurate Mardana achieved. Recommended review of Vastragalita mesh sieving protocols."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAttemptToGrade(null)}
                  className="btn-outline"
                  style={{ padding: '0.45rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGrade('graded')}
                  className="btn-outline"
                  style={{ padding: '0.45rem 1rem' }}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGrade('approved')}
                  className="btn-primary"
                  style={{ padding: '0.45rem 1.25rem', background: '#10b981' }}
                >
                  <CheckCircle2 size={16} /> Publish & Approve Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
