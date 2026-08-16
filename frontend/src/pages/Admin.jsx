import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, ShieldAlert, FlaskConical, Database, BookText, Settings, Activity, ListFilter, Users, Leaf, FlaskRound, Video, Play, X } from 'lucide-react';
import { getAllRecordings, deleteRecording as deleteRecordingDB } from '../utils/db';
import './Admin.css';

const Admin = () => {
  const { isAdmin } = useAuth();
  const {
    experiments, addExperiment, deleteExperiment,
    inventoryItems, addInventoryItem, deleteInventoryItem,
    recipes, addRecipe, deleteRecipe,
    isLearningBlocked, setIsLearningBlocked,
    isExamMode, setIsExamMode
  } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setIsAuthenticated(true);
    }
  }, [isAdmin]);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [activeTab, setActiveTab] = useState('experiments');

  // Recordings
  const [recordings, setRecordings] = useState([]);
  const [playingRecording, setPlayingRecording] = useState(null);

  useEffect(() => {
    if (activeTab === 'recordings') {
      fetchRecordings();
    }
  }, [activeTab]);

  const fetchRecordings = async () => {
    try {
      const recs = await getAllRecordings();
      setRecordings(recs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayRecording = (rec) => {
    setPlayingRecording(URL.createObjectURL(rec.blob));
  };

  const handleDeleteRecording = async (id) => {
    if (window.confirm("Are you sure you want to delete this recording?")) {
      await deleteRecordingDB(id);
      fetchRecordings();
    }
  };

  const closePlayer = () => {
    if (playingRecording) URL.revokeObjectURL(playingRecording);
    setPlayingRecording(null);
  };

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
  const [recIngredients, setRecIngredients] = useState(''); // amalaki:100, water:50
  const [recUtensil, setRecUtensil] = useState('mortar_pestle');
  const [recAction, setRecAction] = useState('grind');
  const [recSuccess, setRecSuccess] = useState('Successfully created compound.');
  const [recFailure, setRecFailure] = useState('Failed to create compound.');

  const handleLogin = (e) => {
    e.preventDefault();
    const credentials = {
      'admin@123': 'password123',
      'bharatrathi174@gmail.com': 'Project@1',
      'rvr.226@gmail.com': 'Project@1',
      'jthakre62@gmail.com': 'Jay@152308',
      'jayy1506@gmail.com': 'Jay@152308'
    };

    const inputId = adminId.trim().toLowerCase();
    if (credentials[inputId] && credentials[inputId] === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Admin ID or Password');
    }
  };

  const handleAddExperiment = (e) => {
    e.preventDefault();
    if (!expTitle) return;
    const stepsArray = expSteps.split('\n').filter(s => s.trim());
    addExperiment({
      title: expTitle,
      description: expDesc,
      steps: stepsArray,
      videoUrl: expVideo || null
    });
    setExpTitle(''); setExpDesc(''); setExpSteps(''); setExpVideo('');
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    if (!invName) return;
    addInventoryItem({
      name: invName,
      type: invType,
      amount: parseInt(invAmount) || 0,
      iconName: invIcon
    });
    setInvName('');
  };

  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!recName) return;

    // Parse ingredients: format "amalaki:100, water:50" -> [{id: 'amalaki', amount: 100}, ...]
    const parsedIngredients = [];
    if (recIngredients) {
      recIngredients.split(',').forEach(pair => {
        const [id, amount] = pair.split(':');
        if (id && amount) {
          parsedIngredients.push({ id: id.trim().toLowerCase(), amount: parseInt(amount.trim()) });
        }
      });
    }

    addRecipe({
      name: recName,
      requiredIngredients: parsedIngredients,
      requiredUtensil: recUtensil,
      requiredAction: recAction,
      successMessage: recSuccess,
      failureMessage: recFailure
    });
    setRecName(''); setRecIngredients('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <ShieldAlert size={40} />
            </div>
            <h2>Admin Portal</h2>
            <p>Enter credentials to access the dashboard</p>
          </div>
          <div className="form-group">
            <label>Admin ID</label>
            <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} required placeholder="Enter your ID" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn-primary login-btn">Secure Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Manage the Ayurvedic virtual lab resources and system settings.</p>
        </div>
      </div>

      <div className="admin-summary-cards">
        <div className="summary-card">
          <div className="summary-icon"><FlaskConical size={28} /></div>
          <div className="summary-details">
            <h3>{experiments.length}</h3>
            <p>Total Experiments</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon"><Database size={28} /></div>
          <div className="summary-details">
            <h3>{inventoryItems.length}</h3>
            <p>Lab Inventory Items</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon"><BookText size={28} /></div>
          <div className="summary-details">
            <h3>{recipes.length}</h3>
            <p>Simulation Recipes</p>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button className={`admin-tab ${activeTab === 'experiments' ? 'active' : ''}`} onClick={() => setActiveTab('experiments')}>
            <FlaskConical size={18} /> Experiments
          </button>
          <button className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Leaf size={18} /> Inventory & Herbs
          </button>
          <button className={`admin-tab ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
            <Activity size={18} /> Simulation Recipes
          </button>
          <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> System Settings
          </button>
          <button className={`admin-tab ${activeTab === 'recordings' ? 'active' : ''}`} onClick={() => setActiveTab('recordings')}>
            <Video size={18} /> Exam Recordings
          </button>
        </aside>

        <main className="admin-main">
          {activeTab === 'experiments' && (
            <div className="admin-content-grid">
              <form className="admin-form" onSubmit={handleAddExperiment}>
                <h3><Plus size={20} /> Add New Experiment</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input value={expTitle} onChange={e => setExpTitle(e.target.value)} required placeholder="e.g. Sitopaladi Churna" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} rows="3" required placeholder="Brief description of the experiment..." />
                </div>
                <div className="form-group">
                  <label>Steps (One per line)</label>
                  <textarea value={expSteps} onChange={e => setExpSteps(e.target.value)} rows="4" required placeholder="Step 1...\nStep 2..." />
                </div>
                <div className="form-group">
                  <label>Video URL (Optional)</label>
                  <input value={expVideo} onChange={e => setExpVideo(e.target.value)} placeholder="https://example.com/video.mp4" />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}><Plus size={18} /> Add Experiment</button>
              </form>

              <div className="admin-list">
                <h3><ListFilter size={20} /> Current Experiments</h3>
                <div className="list-scroll-area">
                  {experiments.map(e => (
                    <div key={e.id} className="admin-list-item">
                      <div>
                        <h4>{e.title}</h4>
                        <p>{e.steps?.length || 0} steps</p>
                      </div>
                      <button className="delete-btn" onClick={() => deleteExperiment(e.id)} title="Delete Experiment"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="admin-content-grid">
              <form className="admin-form" onSubmit={handleAddInventory}>
                <h3><Plus size={20} /> Add Lab Item</h3>
                <div className="form-group">
                  <label>Item Name</label>
                  <input value={invName} onChange={e => setInvName(e.target.value)} required placeholder="e.g. Tulsi Leaves" />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={invType} onChange={e => setInvType(e.target.value)}>
                    <option value="herb">Herb</option>
                    <option value="liquid">Liquid</option>
                    <option value="utensil">Utensil</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (g/ml - not needed for utensil)</label>
                  <input type="number" value={invAmount} onChange={e => setInvAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <select value={invIcon} onChange={e => setInvIcon(e.target.value)}>
                    <option value="Leaf">Leaf</option>
                    <option value="Droplet">Droplet</option>
                    <option value="Flame">Flame</option>
                    <option value="Database">Mortar/Bowl</option>
                    <option value="Beaker">Beaker/Flask</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}><Plus size={18} /> Add Item</button>
                <div className="form-note">
                  <strong>Note:</strong> ID for recipes is auto-generated (e.g. "Tulsi Leaves" -{'>'} "tulsi_leaves").
                </div>
              </form>

              <div className="admin-list">
                <h3><Database size={20} /> Current Inventory</h3>
                <div className="list-scroll-area">
                  {inventoryItems.map(i => (
                    <div key={i.id} className="admin-list-item">
                      <div>
                        <h4>{i.name}</h4>
                        <p className="item-meta">
                          <span className="badge">{i.type}</span> ID: {i.id}
                        </p>
                      </div>
                      <button className="delete-btn" onClick={() => deleteInventoryItem(i.id)} title="Delete Item"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="admin-content-grid">
              <form className="admin-form" onSubmit={handleAddRecipe}>
                <h3><Plus size={20} /> Add Simulation Recipe</h3>
                <div className="form-group">
                  <label>Compound Name</label>
                  <input value={recName} onChange={e => setRecName(e.target.value)} required placeholder="e.g. Churna Mixture" />
                </div>
                <div className="form-group">
                  <label>Required Ingredients (id:amount, ...)</label>
                  <input
                    value={recIngredients}
                    onChange={e => setRecIngredients(e.target.value)}
                    placeholder="amalaki:100, water:800"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Required Utensil ID</label>
                  <input value={recUtensil} onChange={e => setRecUtensil(e.target.value)} placeholder="mortar_pestle" required />
                </div>
                <div className="form-group">
                  <label>Required Action</label>
                  <select value={recAction} onChange={e => setRecAction(e.target.value)}>
                    <option value="grind">Grind</option>
                    <option value="heat">Heat</option>
                    <option value="mix">Mix</option>
                    <option value="filter">Filter</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Success Message</label>
                  <input value={recSuccess} onChange={e => setRecSuccess(e.target.value)} required placeholder="Successfully created..." />
                </div>
                <div className="form-group">
                  <label>Failure Message</label>
                  <input value={recFailure} onChange={e => setRecFailure(e.target.value)} required placeholder="Failed to create..." />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}><Plus size={18} /> Add Recipe</button>
              </form>

              <div className="admin-list">
                <h3><Activity size={20} /> Current Recipes</h3>
                <div className="list-scroll-area">
                  {recipes.map(r => (
                    <div key={r.id} className="admin-list-item">
                      <div>
                        <h4>{r.name}</h4>
                        <p className="item-meta">
                          <span className="badge">{r.requiredAction}</span> Utensil: {r.requiredUtensil}
                        </p>
                      </div>
                      <button className="delete-btn" onClick={() => deleteRecipe(r.id)} title="Delete Recipe"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="admin-settings-panel">
              <div className="admin-form">
                <h3><Settings size={20} /> System Configuration</h3>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Practical Exam Mode</h4>
                    <p>Restrict access to the Learning Module. Useful during practical assessments to maintain integrity.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isLearningBlocked}
                      onChange={(e) => setIsLearningBlocked(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Practical Exam Camera Monitoring</h4>
                    <p>When enabled, students will be recorded during their practical sessions and locked into the screen.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isExamMode}
                      onChange={(e) => setIsExamMode(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Additional placeholders for future settings */}
                <div className="setting-row">
                  <div className="setting-info">
                    <h4>Maintenance Mode</h4>
                    <p>Disable the virtual lab completely for updates. (Coming Soon)</p>
                  </div>
                  <label className="toggle-switch disabled">
                    <input type="checkbox" disabled />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'recordings' && (
            <div className="admin-content-grid single-col">
              <div className="admin-list full-width">
                <h3><Video size={20} /> Student Exam Recordings</h3>
                <div className="list-scroll-area recordings-grid">
                  {recordings.length === 0 ? (
                    <p className="text-muted">No recordings found.</p>
                  ) : (
                    recordings.map(rec => (
                      <div key={rec.id} className="recording-card">
                        <div className="recording-info">
                          <h4>{rec.studentName}</h4>
                          <p className="text-muted">{new Date(rec.date).toLocaleString()}</p>
                        </div>
                        <div className="recording-actions">
                          <button className="btn-primary btn-sm" onClick={() => handlePlayRecording(rec)}>
                            <Play size={16} /> Play
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteRecording(rec.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {playingRecording && (
            <div className="video-modal-overlay">
              <div className="video-modal glass-panel">
                <button className="close-modal-btn" onClick={closePlayer}><X size={24} /></button>
                <video src={playingRecording} controls autoPlay className="modal-video-player" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
