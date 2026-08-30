import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trash2, Plus, FlaskConical, Database, BookText, Settings, 
  Activity, ListFilter, Users, Leaf, Video, Play, X, UserPlus, 
  Search, Eye, EyeOff, Copy, RefreshCw, KeyRound, UserCheck, UserX, AlertCircle, 
  CheckCircle2, ShieldCheck, HelpCircle, GraduationCap, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { getAllRecordings, deleteRecording as deleteRecordingDB } from '../utils/db';
import { 
  getStudentsList, 
  addStudentAccount, 
  toggleStudentStatus, 
  resetStudentPass, 
  deleteStudentAccount,
  getFacultyList,
  addFacultyAccount,
  updateUserRole,
  toggleFacultyStatus,
  resetFacultyPass,
  deleteFacultyAccount
} from '../services/adminService';
import './Admin.css';

const Admin = () => {
  const { currentUser, isAdmin, authFetch } = useAuth();
  const {
    experiments, addExperiment, deleteExperiment,
    inventoryItems, addInventoryItem, deleteInventoryItem,
    recipes, addRecipe, deleteRecipe,
    isLearningBlocked, setIsLearningBlocked,
    isExamMode, setIsExamMode
  } = useData();

  const [activeTab, setActiveTab] = useState('students');

  // Notification Banner
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Student Management State
  const [students, setStudents] = useState([]);
  const [studentStats, setStudentStats] = useState({ totalStudents: 0, activeStudents: 0, disabledStudents: 0 });
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Faculty Management State
  const [faculty, setFaculty] = useState([]);
  const [facultyStats, setFacultyStats] = useState({ totalFaculty: 0, activeFaculty: 0, disabledFaculty: 0 });
  const [loadingFaculty, setLoadingFaculty] = useState(false);
  const [facultySearchTerm, setFacultySearchTerm] = useState('');
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [addFacultyError, setAddFacultyError] = useState('');
  const [addFacultyLoading, setAddFacultyLoading] = useState(false);

  // Modals & Dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addStudentError, setAddStudentError] = useState('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);

  const [viewingStudent, setViewingStudent] = useState(null);
  const [showViewedPassword, setShowViewedPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({}); // { [userId]: boolean }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm, confirmText, isDestructive }

  const togglePasswordReveal = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  // Fetch Students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const firestoreResult = await getStudentsList(currentUser?.collegeId);
      if (firestoreResult.students) {
        setStudents(firestoreResult.students);
        setStudentStats(firestoreResult.stats);
      }
    } catch (e) {
      console.warn('Error fetching students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch Faculty
  const fetchFaculty = async () => {
    setLoadingFaculty(true);
    try {
      const result = await getFacultyList(currentUser?.collegeId);
      if (result.faculty) {
        setFaculty(result.faculty);
        setFacultyStats(result.stats);
      }
    } catch (e) {
      console.warn('Error fetching faculty:', e);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      const recs = await getAllRecordings();
      setRecordings(recs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'faculty') {
      fetchFaculty();
    } else if (activeTab === 'recordings') {
      fetchRecordings();
    }
  }, [activeTab]);

  // Add Student Handler
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddStudentError('');
    setAddStudentLoading(true);

    const name = newStudentName.trim();
    const email = newStudentEmail.trim().toLowerCase();

    if (!name || !email) {
      setAddStudentError('Student name and email are required');
      setAddStudentLoading(false);
      return;
    }

    try {
      const newStudent = await addStudentAccount({
        name,
        email,
        collegeId: currentUser?.collegeId || 'COLLEGE_001',
      });

      setStudents(prev => [newStudent, ...prev.filter(s => s.email !== email)]);
      setStudentStats(prev => ({
        ...prev,
        totalStudents: prev.totalStudents + 1,
        activeStudents: prev.activeStudents + 1,
      }));

      setShowAddModal(false);
      setNewStudentName('');
      setNewStudentEmail('');
      showToast(`Student ${name} created successfully`);
    } catch (err) {
      setAddStudentError(err.message || 'Failed to add student');
    } finally {
      setAddStudentLoading(false);
    }
  };

  // Add Faculty Handler
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setAddFacultyError('');
    setAddFacultyLoading(true);

    const name = newFacultyName.trim();
    const email = newFacultyEmail.trim().toLowerCase();

    if (!name || !email) {
      setAddFacultyError('Faculty name and email are required');
      setAddFacultyLoading(false);
      return;
    }

    try {
      const newFaculty = await addFacultyAccount({
        name,
        email,
        collegeId: currentUser?.collegeId || 'COLLEGE_001',
      });

      setFaculty(prev => [newFaculty, ...prev.filter(f => f.email !== email)]);
      setFacultyStats(prev => ({
        ...prev,
        totalFaculty: prev.totalFaculty + 1,
        activeFaculty: prev.activeFaculty + 1,
      }));

      setShowAddFacultyModal(false);
      setNewFacultyName('');
      setNewFacultyEmail('');
      showToast(`Faculty member ${name} added successfully`);
    } catch (err) {
      setAddFacultyError(err.message || 'Failed to add faculty');
    } finally {
      setAddFacultyLoading(false);
    }
  };

  // Promote Student to Faculty
  const handlePromoteStudentToFaculty = (student) => {
    const sId = student._id || student.id;
    setConfirmDialog({
      title: 'Promote Student to Faculty',
      message: `Are you sure you want to promote ${student.name} (${student.email}) to Faculty? They will gain access to the Faculty Portal to manage experiments, herbs, recipes, and exam controls.`,
      confirmText: 'Promote to Faculty',
      isDestructive: false,
      onConfirm: async () => {
        // Remove from students state
        setStudents(prev => prev.filter(s => s._id !== sId && s.id !== sId));
        setStudentStats(prev => ({
          ...prev,
          totalStudents: Math.max(0, prev.totalStudents - 1),
          activeStudents: student.isActive !== false ? Math.max(0, prev.activeStudents - 1) : prev.activeStudents,
        }));

        // Add to faculty state
        setFaculty(prev => [{ ...student, role: 'faculty' }, ...prev]);
        setFacultyStats(prev => ({
          ...prev,
          totalFaculty: prev.totalFaculty + 1,
          activeFaculty: student.isActive !== false ? prev.activeFaculty + 1 : prev.activeFaculty,
        }));

        showToast(`${student.name} promoted to Faculty successfully!`);
        setConfirmDialog(null);

        // Async persistence
        updateUserRole(sId, student.email, 'faculty').catch(() => {});
      }
    });
  };

  // Demote Faculty to Student
  const handleDemoteFacultyToStudent = (facultyMember) => {
    const fId = facultyMember._id || facultyMember.id;
    setConfirmDialog({
      title: 'Demote Faculty to Student',
      message: `Change ${facultyMember.name}'s role back to Student? They will lose access to the Faculty Portal.`,
      confirmText: 'Demote to Student',
      isDestructive: true,
      onConfirm: async () => {
        setFaculty(prev => prev.filter(f => f._id !== fId && f.id !== fId));
        setFacultyStats(prev => ({
          ...prev,
          totalFaculty: Math.max(0, prev.totalFaculty - 1),
          activeFaculty: facultyMember.isActive !== false ? Math.max(0, prev.activeFaculty - 1) : prev.activeFaculty,
        }));

        setStudents(prev => [{ ...facultyMember, role: 'student' }, ...prev]);
        setStudentStats(prev => ({
          ...prev,
          totalStudents: prev.totalStudents + 1,
          activeStudents: facultyMember.isActive !== false ? prev.activeStudents + 1 : prev.activeStudents,
        }));

        showToast(`${facultyMember.name} changed to Student role`);
        setConfirmDialog(null);

        updateUserRole(fId, facultyMember.email, 'student').catch(() => {});
      }
    });
  };

  // Disable / Enable Student
  const handleToggleStatus = (student) => {
    const isDisabling = student.isActive;
    const actionName = isDisabling ? 'Disable' : 'Enable';
    const sId = student._id || student.id;

    setConfirmDialog({
      title: `${actionName} Student Account`,
      message: isDisabling 
        ? `Are you sure you want to disable ${student.name}'s account?`
        : `Are you sure you want to enable ${student.name}'s account?`,
      confirmText: `${actionName} Account`,
      isDestructive: isDisabling,
      onConfirm: async () => {
        setStudents(prev => prev.map(s => (s._id === sId || s.id === sId ? { ...s, isActive: !isDisabling } : s)));
        setStudentStats(prev => ({
          ...prev,
          activeStudents: isDisabling ? prev.activeStudents - 1 : prev.activeStudents + 1,
          disabledStudents: isDisabling ? prev.disabledStudents + 1 : prev.disabledStudents - 1,
        }));
        showToast(`Account for ${student.name} has been ${isDisabling ? 'disabled' : 'enabled'}`);
        setConfirmDialog(null);
        toggleStudentStatus(sId, !isDisabling).catch(() => {});
      },
    });
  };

  // Disable / Enable Faculty
  const handleToggleFacultyStatus = (facultyMember) => {
    const isDisabling = facultyMember.isActive;
    const actionName = isDisabling ? 'Disable' : 'Enable';
    const fId = facultyMember._id || facultyMember.id;

    setConfirmDialog({
      title: `${actionName} Faculty Account`,
      message: isDisabling 
        ? `Disable ${facultyMember.name}'s faculty access?`
        : `Enable ${facultyMember.name}'s faculty access?`,
      confirmText: `${actionName} Account`,
      isDestructive: isDisabling,
      onConfirm: async () => {
        setFaculty(prev => prev.map(f => (f._id === fId || f.id === fId ? { ...f, isActive: !isDisabling } : f)));
        setFacultyStats(prev => ({
          ...prev,
          activeFaculty: isDisabling ? prev.activeFaculty - 1 : prev.activeFaculty + 1,
          disabledFaculty: isDisabling ? prev.disabledFaculty + 1 : prev.disabledFaculty - 1,
        }));
        showToast(`Faculty account for ${facultyMember.name} ${isDisabling ? 'disabled' : 'enabled'}`);
        setConfirmDialog(null);
        toggleFacultyStatus(fId, !isDisabling).catch(() => {});
      },
    });
  };

  // Reset Student Password
  const handleResetPassword = (student) => {
    const sId = student._id || student.id;
    setConfirmDialog({
      title: 'Reset Student Password',
      message: `Reset password for ${student.name}? Password state will be restored to default (BAMS@123).`,
      confirmText: 'Reset Password',
      isDestructive: false,
      onConfirm: async () => {
        setStudents(prev => prev.map(s => (s._id === sId || s.id === sId ? { ...s, isDefaultPassword: true } : s)));
        showToast(`Password for ${student.name} reset to default initial password (BAMS@123)`);
        setConfirmDialog(null);
        resetStudentPass(sId).catch(() => {});
      },
    });
  };

  // Reset Faculty Password
  const handleResetFacultyPassword = (facultyMember) => {
    const fId = facultyMember._id || facultyMember.id;
    setConfirmDialog({
      title: 'Reset Faculty Password',
      message: `Reset password for ${facultyMember.name}? Password state will be restored to default (BAMS@123).`,
      confirmText: 'Reset Password',
      isDestructive: false,
      onConfirm: async () => {
        setFaculty(prev => prev.map(f => (f._id === fId || f.id === fId ? { ...f, isDefaultPassword: true } : f)));
        showToast(`Password for ${facultyMember.name} reset to default initial password (BAMS@123)`);
        setConfirmDialog(null);
        resetFacultyPass(fId).catch(() => {});
      },
    });
  };

  // Delete Student
  const handleDeleteStudent = (student) => {
    const sId = student._id || student.id;
    setConfirmDialog({
      title: 'Delete Student Record',
      message: `Are you sure you want to permanently delete ${student.name} (${student.email})?`,
      confirmText: 'Delete Permanently',
      isDestructive: true,
      onConfirm: async () => {
        setStudents(prev => prev.filter(s => s._id !== sId && s.id !== sId));
        setStudentStats(prev => ({
          ...prev,
          totalStudents: Math.max(0, prev.totalStudents - 1),
          activeStudents: student.isActive !== false ? Math.max(0, prev.activeStudents - 1) : prev.activeStudents,
          disabledStudents: student.isActive === false ? Math.max(0, prev.disabledStudents - 1) : prev.disabledStudents,
        }));
        showToast(`Student ${student.name} deleted`);
        setConfirmDialog(null);
        deleteStudentAccount(sId).catch(() => {});
      },
    });
  };

  // Delete Faculty
  const handleDeleteFaculty = (facultyMember) => {
    const fId = facultyMember._id || facultyMember.id;
    setConfirmDialog({
      title: 'Delete Faculty Record',
      message: `Are you sure you want to permanently delete ${facultyMember.name} (${facultyMember.email})?`,
      confirmText: 'Delete Permanently',
      isDestructive: true,
      onConfirm: async () => {
        setFaculty(prev => prev.filter(f => f._id !== fId && f.id !== fId));
        setFacultyStats(prev => ({
          ...prev,
          totalFaculty: Math.max(0, prev.totalFaculty - 1),
          activeFaculty: facultyMember.isActive !== false ? Math.max(0, prev.activeFaculty - 1) : prev.activeFaculty,
          disabledFaculty: facultyMember.isActive === false ? Math.max(0, prev.disabledFaculty - 1) : prev.disabledFaculty,
        }));
        showToast(`Faculty ${facultyMember.name} deleted`);
        setConfirmDialog(null);
        deleteFacultyAccount(fId).catch(() => {});
      },
    });
  };

  // Recordings Actions
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

  // Experiments
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
    showToast('Experiment added successfully');
  };

  // Inventory
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
    showToast('Inventory item added successfully');
  };

  // Recipes
  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!recName) return;

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
      ingredients: parsedIngredients,
      utensil: recUtensil,
      action: recAction,
      successMessage: recSuccess,
      failureMessage: recFailure
    });
    setRecName(''); setRecIngredients('');
    showToast('Simulation recipe added successfully');
  };

  // Filtered lists
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(term) ||
           (s.email || '').toLowerCase().includes(term);
  });

  const filteredFaculty = faculty.filter(f => {
    const term = facultySearchTerm.toLowerCase();
    return (f.name || '').toLowerCase().includes(term) ||
           (f.email || '').toLowerCase().includes(term);
  });

  return (
    <div className="admin-dashboard-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`admin-toast-banner ${toastMessage.type}`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
          <button className="toast-close" onClick={() => setToastMessage(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-header glass-panel leaf-card">
        <div className="admin-header-left">
          <div className="admin-college-badge">
            <ShieldCheck size={15} /> Super Administrator Hub
          </div>
          <h1>System & User Management</h1>
          <p className="text-muted">Master control panel for Students, Faculty Instructors, and Lab Experiments.</p>
        </div>
        <div className="admin-quick-status">
          <span className="admin-status-badge college">
            {currentUser?.collegeId || 'COLLEGE_001'}
          </span>
          <span className="admin-status-badge role">
            🛡️ Super Admin
          </span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="admin-summary-cards">
        <div className="summary-card" onClick={() => setActiveTab('students')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon"><Users size={28} /></div>
          <div className="summary-details">
            <h3>{studentStats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('faculty')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <GraduationCap size={28} />
          </div>
          <div className="summary-details">
            <h3>{facultyStats.totalFaculty}</h3>
            <p>Faculty Members</p>
          </div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('students')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <UserCheck size={28} />
          </div>
          <div className="summary-details">
            <h3>{studentStats.activeStudents}</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="summary-card" onClick={() => setActiveTab('experiments')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon"><FlaskConical size={28} /></div>
          <div className="summary-details">
            <h3>{experiments.length}</h3>
            <p>Lab Experiments</p>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Navigation Sidebar */}
        <aside className="admin-sidebar">
          <button className={`admin-tab ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Users size={18} /> Student Accounts ({students.length})
          </button>
          <button className={`admin-tab ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>
            <GraduationCap size={18} /> Faculty Members ({faculty.length})
          </button>
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

        {/* Main Content Area */}
        <main className="admin-main">
          {/* TAB 1: Student Management */}
          {activeTab === 'students' && (
            <div className="student-management-panel">
              <div className="panel-top-bar">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search students by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="panel-actions">
                  <button className="btn-outline refresh-btn" onClick={fetchStudents} title="Refresh directory">
                    <RefreshCw size={16} /> Refresh
                  </button>
                  <button className="btn-primary add-student-btn" onClick={() => setShowAddModal(true)}>
                    <UserPlus size={18} /> Add Student
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="students-table-container glass-panel leaf-card">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email Address</th>
                      <th>Status</th>
                      <th>Password</th>
                      <th>Enrolled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan="6" className="table-empty-state">Loading students...</td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty-state">No students found.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const sId = s._id || s.id;
                        const userEmail = (s.email || '').toLowerCase().trim();
                        const isPassUpdated = localStorage.getItem('ayurveda_pass_updated_' + userEmail) === 'true' || s.isDefaultPassword === false;
                        const userPass = localStorage.getItem('ayurveda_account_pass_' + userEmail) || s.displayPassword || (userEmail.includes('jaythakre128') ? 'FEAT@123' : (isPassUpdated ? 'FEAT@123' : 'BAMS@123'));
                        const isRevealed = !!revealedPasswords[sId];

                        return (
                          <tr key={sId} className={!s.isActive ? 'row-disabled' : ''}>
                            <td>
                              <div className="student-identity-cell">
                                <div className="student-avatar-small">
                                  {(s.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="student-name-text">{s.name}</strong>
                                  <span className="student-sub-badge">🌿 Student</span>
                                </div>
                              </div>
                            </td>
                            <td className="student-email-cell">{s.email}</td>
                            <td>
                              <span className={`status-pill ${s.isActive ? 'active' : 'disabled'}`}>
                                {s.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>
                              <div className="table-password-cell">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span className={`password-pill ${isPassUpdated ? 'custom' : 'default'}`}>
                                    {isPassUpdated ? '✨ Updated' : '⚠️ Default'}
                                  </span>
                                  <button 
                                    type="button" 
                                    className={`table-eye-btn ${isRevealed ? 'active' : ''}`}
                                    onClick={(e) => togglePasswordReveal(sId, e)}
                                    title={isRevealed ? "Hide password" : "Show updated password"}
                                  >
                                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                                {isRevealed && (
                                  <div className="table-password-badge">
                                    <code>{userPass}</code>
                                    <button 
                                      type="button" 
                                      className="mini-copy-btn" 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(userPass);
                                        showToast(`Password copied: ${userPass}`);
                                      }}
                                      title="Copy password"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-muted text-sm">
                              {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  type="button"
                                  className={`action-btn view ${isRevealed ? 'active' : ''}`} 
                                  onClick={(e) => togglePasswordReveal(sId, e)} 
                                  title={isRevealed ? "Hide Password" : "Show Password"}
                                >
                                  {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn promote" 
                                  onClick={() => handlePromoteStudentToFaculty(s)} 
                                  title="Promote to Faculty Member"
                                >
                                  <GraduationCap size={16} />
                                </button>
                                
                                <button 
                                  type="button"
                                  className={`action-btn ${s.isActive ? 'disable' : 'enable'}`}
                                  onClick={() => handleToggleStatus(s)} 
                                  title={s.isActive ? 'Disable account' : 'Enable account'}
                                >
                                  {s.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn reset" 
                                  onClick={() => handleResetPassword(s)} 
                                  title="Reset password to default (BAMS@123)"
                                >
                                  <KeyRound size={16} />
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn delete" 
                                  onClick={() => handleDeleteStudent(s)} 
                                  title="Delete student permanently"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Faculty Management */}
          {activeTab === 'faculty' && (
            <div className="student-management-panel">
              <div className="panel-top-bar">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search faculty by name or email..." 
                    value={facultySearchTerm}
                    onChange={(e) => setFacultySearchTerm(e.target.value)}
                  />
                </div>

                <div className="panel-actions">
                  <button className="btn-outline refresh-btn" onClick={fetchFaculty} title="Refresh faculty">
                    <RefreshCw size={16} /> Refresh
                  </button>
                  <button className="btn-primary add-student-btn" onClick={() => setShowAddFacultyModal(true)}>
                    <GraduationCap size={18} /> Add Faculty Member
                  </button>
                </div>
              </div>

              {/* Faculty Table */}
              <div className="students-table-container glass-panel leaf-card">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Faculty Member</th>
                      <th>Email Address</th>
                      <th>Status</th>
                      <th>Password</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingFaculty ? (
                      <tr>
                        <td colSpan="6" className="table-empty-state">Loading faculty members...</td>
                      </tr>
                    ) : filteredFaculty.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty-state">No faculty members found. Click "Add Faculty Member" or promote a student above.</td>
                      </tr>
                    ) : (
                      filteredFaculty.map((f) => {
                        const fId = f._id || f.id;
                        const userEmail = (f.email || '').toLowerCase().trim();
                        const isFacultyPassUpdated = localStorage.getItem('ayurveda_pass_updated_' + userEmail) === 'true' || f.isDefaultPassword === false;
                        const facultyPassVal = localStorage.getItem('ayurveda_account_pass_' + userEmail) || f.displayPassword || (isFacultyPassUpdated ? 'FEAT@123' : 'BAMS@123');
                        const isRevealed = !!revealedPasswords[fId];

                        return (
                          <tr key={fId} className={!f.isActive ? 'row-disabled' : ''}>
                            <td>
                              <div className="student-identity-cell">
                                <div className="student-avatar-small" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff' }}>
                                  {(f.name || 'F').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="student-name-text">{f.name}</strong>
                                  <span className="student-sub-badge" style={{ background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>🎓 Faculty</span>
                                </div>
                              </div>
                            </td>
                            <td className="student-email-cell">{f.email}</td>
                            <td>
                              <span className={`status-pill ${f.isActive ? 'active' : 'disabled'}`}>
                                {f.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>
                              <div className="table-password-cell">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span className={`password-pill ${isFacultyPassUpdated ? 'custom' : 'default'}`}>
                                    {isFacultyPassUpdated ? '✨ Updated' : '⚠️ Default'}
                                  </span>
                                  <button 
                                    type="button" 
                                    className={`table-eye-btn ${isRevealed ? 'active' : ''}`}
                                    onClick={(e) => togglePasswordReveal(fId, e)}
                                    title={isRevealed ? "Hide password" : "Show updated password"}
                                  >
                                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                                {isRevealed && (
                                  <div className="table-password-badge">
                                    <code>{facultyPassVal}</code>
                                    <button 
                                      type="button" 
                                      className="mini-copy-btn" 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(facultyPassVal);
                                        showToast(`Password copied: ${facultyPassVal}`);
                                      }}
                                      title="Copy password"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-muted text-sm">
                              {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  type="button"
                                  className={`action-btn view ${isRevealed ? 'active' : ''}`} 
                                  onClick={(e) => togglePasswordReveal(fId, e)} 
                                  title={isRevealed ? "Hide Password" : "Show Password"}
                                >
                                  {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn" 
                                  onClick={() => handleDemoteFacultyToStudent(f)} 
                                  title="Demote to Student"
                                  style={{ color: '#64748b' }}
                                >
                                  <ArrowDownLeft size={16} />
                                </button>

                                <button 
                                  type="button"
                                  className={`action-btn ${f.isActive ? 'disable' : 'enable'}`}
                                  onClick={() => handleToggleFacultyStatus(f)} 
                                  title={f.isActive ? 'Disable account' : 'Enable account'}
                                >
                                  {f.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn reset" 
                                  onClick={() => handleResetFacultyPassword(f)} 
                                  title="Reset password to default (BAMS@123)"
                                >
                                  <KeyRound size={16} />
                                </button>

                                <button 
                                  type="button"
                                  className="action-btn delete" 
                                  onClick={() => handleDeleteFaculty(f)} 
                                  title="Delete faculty member permanently"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Experiments */}
          {activeTab === 'experiments' && (
            <div className="admin-content-grid">
              <form className="admin-form" onSubmit={handleAddExperiment}>
                <h3><Plus size={20} /> Add New Experiment</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input value={expTitle} onChange={e => setExpTitle(e.target.value)} required placeholder="e.g. Sitopaladi Churna Formulation" />
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

          {/* TAB 3: Inventory */}
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

          {/* TAB 4: Recipes */}
          {activeTab === 'recipes' && (
            <div className="admin-content-grid">
              <form className="admin-form" onSubmit={handleAddRecipe}>
                <h3><Plus size={20} /> Add Compounding Recipe</h3>
                <div className="form-group">
                  <label>Recipe Name</label>
                  <input value={recName} onChange={e => setRecName(e.target.value)} required placeholder="e.g. Swaras Kalpana" />
                </div>
                <div className="form-group">
                  <label>Ingredients (format: item_id:amount, item_id:amount)</label>
                  <input value={recIngredients} onChange={e => setRecIngredients(e.target.value)} placeholder="tulsi_leaves:20, water:10" />
                </div>
                <div className="form-group">
                  <label>Utensil (Apparatus)</label>
                  <select value={recUtensil} onChange={e => setRecUtensil(e.target.value)}>
                    <option value="mortar_pestle">Mortar & Pestle (Khalva Yantra)</option>
                    <option value="pot">Heating Pot (Patra)</option>
                    <option value="cloth">Cloth Filter (Vastra)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Required Action</label>
                  <select value={recAction} onChange={e => setRecAction(e.target.value)}>
                    <option value="grind">Grind (Mardana)</option>
                    <option value="boil">Boil (Paka)</option>
                    <option value="filter">Filter (Galana)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Success Message</label>
                  <input value={recSuccess} onChange={e => setRecSuccess(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}><Plus size={18} /> Add Recipe</button>
              </form>

              <div className="admin-list">
                <h3><Activity size={20} /> Configured Recipes ({recipes.length})</h3>
                <div className="list-scroll-area">
                  {recipes.map(r => {
                    const ingredientsText = Array.isArray(r.ingredients)
                      ? r.ingredients.map(i => typeof i === 'string' ? i : `${i.id || i.name || 'item'}:${i.amount || 1}`).join(', ')
                      : (r.simulationSteps ? `${r.simulationSteps.length} compounding steps` : 'Standard Formulation');

                    return (
                      <div key={r.id} className="admin-list-item">
                        <div>
                          <h4>{r.name || r.title || 'Compounding Recipe'}</h4>
                          <p className="item-meta">
                            {r.action && r.utensil ? (
                              <>Action: <strong>{r.action}</strong> in <strong>{r.utensil}</strong></>
                            ) : (
                              <span>{ingredientsText}</span>
                            )}
                          </p>
                        </div>
                        <button className="delete-btn" onClick={() => deleteRecipe(r.id)} title="Delete Recipe"><Trash2 size={16} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Settings */}
          {activeTab === 'settings' && (
            <div className="admin-settings-panel glass-panel leaf-card">
              <h3><Settings size={22} /> Examination & Access Controls</h3>
              <p className="text-muted">Real-time restrictions applied across the Virtual Laboratory network.</p>
              
              <div className="setting-row">
                <div className="setting-info">
                  <h4>Disable Learning Mode</h4>
                  <p>When enabled, students cannot access theory, tutorial guides, or AI Tutor during practical sessions.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isLearningBlocked} 
                    onChange={e => setIsLearningBlocked(e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <h4>Practical Exam Mode</h4>
                  <p>Forces students into full-screen mode and enables automated webcam assessment recording during simulations.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isExamMode} 
                    onChange={e => setIsExamMode(e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: Recordings */}
          {activeTab === 'recordings' && (
            <div className="admin-recordings-panel">
              <div className="panel-top-bar">
                <h3><Video size={20} /> Practical Exam Recordings</h3>
                <button className="btn-outline refresh-btn" onClick={fetchRecordings}>
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              {recordings.length === 0 ? (
                <div className="table-empty-state glass-panel leaf-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <Video size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
                  <h4>No Exam Session Recordings Found</h4>
                  <p className="text-muted">When students complete practical assessments in Exam Mode, their recorded sessions will appear here.</p>
                </div>
              ) : (
                <div className="recordings-grid">
                  {recordings.map(r => (
                    <div key={r.id} className="recording-card glass-panel leaf-card">
                      <div className="recording-header">
                        <h4>{r.experimentTitle || 'Practical Exam Assessment'}</h4>
                        <span className="text-muted text-sm">{new Date(r.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="recording-body">
                        <p className="text-sm">Session ID: #{r.id}</p>
                      </div>
                      <div className="recording-actions">
                        <button className="btn-primary play-btn" onClick={() => handlePlayRecording(r)}>
                          <Play size={16} /> Watch Session
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteRecording(r.id)} title="Delete Recording">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Video Player Modal */}
      {playingRecording && (
        <div className="video-modal-backdrop" onClick={closePlayer}>
          <div className="video-modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closePlayer}><X size={20} /></button>
            <video src={playingRecording} controls autoPlay className="main-video-player" />
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card glass-panel leaf-card">
            <div className="modal-header">
              <div className="modal-header-icon">
                <UserPlus size={24} />
              </div>
              <div>
                <h3>Add New Student</h3>
                <p className="text-muted">Enter student's full name and college email</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            {addStudentError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{addStudentError}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="admin-modal-form">
              <div className="form-group">
                <label>Student Full Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Aarav Sharma" 
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>College Email Address <span className="required">*</span></label>
                <input 
                  type="email" 
                  placeholder="e.g. aarav.sharma@ayurveda.edu" 
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="default-password-info-box">
                <KeyRound size={18} className="info-icon" />
                <div>
                  <strong>Default Initial Password Assigned:</strong>
                  <span><code>BAMS@123</code> (automatically encrypted). Student will be prompted to optionally change it upon first login.</span>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-outline modal-cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={addStudentLoading} className="btn-primary">
                  {addStudentLoading ? 'Creating Student...' : 'Create Student Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Faculty */}
      {showAddFacultyModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card glass-panel leaf-card">
            <div className="modal-header">
              <div className="modal-header-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3>Add New Faculty Member</h3>
                <p className="text-muted">Create instructor account with access to Faculty Portal</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddFacultyModal(false)}><X size={20} /></button>
            </div>

            {addFacultyError && (
              <div className="modal-error-banner">
                <AlertCircle size={18} />
                <span>{addFacultyError}</span>
              </div>
            )}

            <form onSubmit={handleAddFaculty} className="admin-modal-form">
              <div className="form-group">
                <label>Faculty Full Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Rajesh Vaidya" 
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Faculty Email Address <span className="required">*</span></label>
                <input 
                  type="email" 
                  placeholder="e.g. rajesh.vaidya@ayurveda.edu" 
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  required
                />
              </div>

              <div className="default-password-info-box">
                <KeyRound size={18} className="info-icon" />
                <div>
                  <strong>Default Initial Password Assigned:</strong>
                  <span><code>BAMS@123</code>. Faculty member can log in and change their password in the Faculty Portal.</span>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-outline modal-cancel-btn" onClick={() => setShowAddFacultyModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={addFacultyLoading} className="btn-primary">
                  {addFacultyLoading ? 'Creating Faculty...' : 'Create Faculty Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Student / Faculty Details */}
      {viewingStudent && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card glass-panel leaf-card">
            <div className="modal-header">
              <div className="modal-header-icon">
                <Eye size={24} />
              </div>
              <div>
                <h3>{viewingStudent.role === 'faculty' ? 'Faculty Profile' : 'Student Profile'}</h3>
                <p className="text-muted">Account Information & Authorization Status</p>
              </div>
              <button className="modal-close-btn" onClick={() => { setViewingStudent(null); setShowViewedPassword(false); }}><X size={20} /></button>
            </div>

            <div className="student-profile-details">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <strong>{viewingStudent.name}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span>{viewingStudent.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role:</span>
                <span className={`status-pill ${viewingStudent.role === 'faculty' ? 'faculty' : 'active'}`}>
                  {viewingStudent.role === 'faculty' ? '🎓 Faculty Instructor' : '🌿 Student'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">College ID:</span>
                <span className="badge">{viewingStudent.collegeId || 'COLLEGE_001'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Account Status:</span>
                <span className={`status-pill ${viewingStudent.isActive ? 'active' : 'disabled'}`}>
                  {viewingStudent.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Password State:</span>
                {(() => {
                  const userEmail = (viewingStudent.email || '').toLowerCase();
                  const isViewPassUpdated = localStorage.getItem('ayurveda_pass_updated_' + userEmail) === 'true' || viewingStudent.isDefaultPassword === false;
                  return (
                    <span className={`password-pill ${isViewPassUpdated ? 'custom' : 'default'}`}>
                      {isViewPassUpdated ? '✨ Custom Password (Updated)' : '⚠️ Using Default (BAMS@123)'}
                    </span>
                  );
                })()}
              </div>

              {/* Secure Credentials View Box for Admin */}
              {(() => {
                const userEmail = (viewingStudent.email || '').toLowerCase();
                const isViewPassUpdated = localStorage.getItem('ayurveda_pass_updated_' + userEmail) === 'true' || viewingStudent.isDefaultPassword === false;
                const storedPassword = localStorage.getItem('ayurveda_account_pass_' + userEmail) || viewingStudent.displayPassword || (isViewPassUpdated ? 'FEAT@123' : 'BAMS@123');

                return (
                  <div className="admin-credential-lookup-box">
                    <div className="credential-box-header">
                      <KeyRound size={16} className="cred-icon" />
                      <strong>Account Password Credentials:</strong>
                    </div>

                    <div className="credential-value-row">
                      <code className="cred-code-text">
                        {showViewedPassword ? storedPassword : '••••••••••••'}
                      </code>
                      
                      <div className="credential-btns">
                        <button 
                          type="button" 
                          className="cred-btn"
                          onClick={() => setShowViewedPassword(prev => !prev)}
                          title={showViewedPassword ? "Hide Password" : "Show Password"}
                        >
                          {showViewedPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showViewedPassword ? 'Hide' : 'Reveal'}</span>
                        </button>

                        <button 
                          type="button" 
                          className="cred-btn copy-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(storedPassword);
                            showToast(`Password for ${viewingStudent.name} copied to clipboard!`);
                          }}
                          title="Copy Password to Clipboard"
                        >
                          <Copy size={15} />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    <p className="cred-notice-text">
                      {isViewPassUpdated 
                        ? '🔐 The user has set their own custom password. You can copy and share this with the user if they lost or forgot it.' 
                        : 'ℹ️ The user is currently using the initial default college password (BAMS@123).'}
                    </p>
                  </div>
                );
              })()}

              <div className="detail-row">
                <span className="detail-label">Registered Date:</span>
                <span>{viewingStudent.createdAt ? new Date(viewingStudent.createdAt).toLocaleString() : '—'}</span>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="btn-primary" onClick={() => { setViewingStudent(null); setShowViewedPassword(false); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Themed Confirmation Dialog */}
      {confirmDialog && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card confirm-modal glass-panel leaf-card">
            <div className="modal-header">
              <div className={`modal-header-icon ${confirmDialog.isDestructive ? 'destructive' : 'warning'}`}>
                <AlertCircle size={26} />
              </div>
              <div>
                <h3>{confirmDialog.title}</h3>
              </div>
            </div>

            <p className="confirm-message">{confirmDialog.message}</p>

            <div className="modal-footer-actions">
              <button type="button" className="btn-outline" onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button 
                type="button" 
                className={confirmDialog.isDestructive ? 'btn-danger' : 'btn-primary'}
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
