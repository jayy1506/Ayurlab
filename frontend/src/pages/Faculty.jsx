import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  FlaskConical, Database, BookText, Settings, 
  Leaf, Video, Play, X, Plus, Trash2, 
  CheckCircle2, AlertCircle, Eye, RefreshCw, ShieldCheck
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

  const [activeTab, setActiveTab] = useState('experiments');

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

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
      const recs = await getAllRecordings();
      setRecordings(recs || []);
    } catch (e) {
      console.error('Error fetching recordings:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'recordings') {
      fetchRecordings();
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
                {recordings.map((rec) => (
                  <div key={rec.id} className="recording-card glass-panel">
                    <div className="rec-info">
                      <strong>{rec.experimentTitle || 'Practical Exam Assessment'}</strong>
                      <span className="rec-date">{new Date(rec.timestamp).toLocaleString()}</span>
                      <span className="rec-duration">Session ID: #{rec.id}</span>
                    </div>
                    <div className="rec-actions">
                      <button 
                        className="btn-primary play-btn"
                        onClick={() => setPlayingRecording(rec)}
                      >
                        <Play size={14} /> Watch Session
                      </button>
                      <button 
                        className="icon-btn delete-btn"
                        onClick={() => handleDeleteRecording(rec.id)}
                        title="Delete recording"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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

      {/* Recording Playback Modal */}
      {playingRecording && (
        <div className="recording-modal-overlay">
          <div className="recording-modal-card glass-panel">
            <div className="rec-modal-header">
              <h4>{playingRecording.experimentTitle || 'Exam Video Session'}</h4>
              <button onClick={() => setPlayingRecording(null)} className="close-btn">
                <X size={18} />
              </button>
            </div>
            <div className="video-player-wrapper">
              <video 
                src={URL.createObjectURL(playingRecording.videoBlob)} 
                controls 
                autoPlay 
                className="session-video"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
