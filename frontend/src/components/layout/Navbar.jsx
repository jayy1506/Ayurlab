import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, BookOpen, Shield, HelpCircle, LogOut, Lock, LayoutDashboard, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout, isAdmin, isFaculty, isFacultyOrAdmin } = useAuth();
  const { isExamMode, isLearningBlocked } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleHelpClick = () => {
    setIsDropdownOpen(false);
    navigate('/help');
  };

  const handleChangePasswordClick = () => {
    setIsDropdownOpen(false);
    navigate('/change-password');
  };

  const getUserDisplayName = () => {
    if (!currentUser) return '';
    if (currentUser.name) return currentUser.name;
    if (currentUser.displayName) return currentUser.displayName;
    const cachedName = localStorage.getItem('ayurveda_user_name_' + (currentUser.email || '').toLowerCase());
    if (cachedName) return cachedName;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'Scholar';
  };

  const getUserInitial = () => {
    const name = getUserDisplayName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (isExamMode && location.pathname === '/practical') {
    return (
      <nav className="navbar glass-panel">
        <div className="navbar-brand">
          <FlaskConical className="brand-icon" />
          <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Exam Mode Active</span>
        </div>
        <ul className="navbar-links">
          <li>
            <div className="nav-item" style={{ cursor: 'not-allowed', color: '#ff4d4d' }}>
              <Lock size={18} /> Screen Locked
            </div>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <FlaskConical className="brand-icon" />
        <Link to="/"><span>AI Ayurveda Lab</span></Link>
      </div>

      <ul className="navbar-links">
        {currentUser && (
          <li>
            <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          </li>
        )}
        <li>
          <Link to="/learning" className={`nav-item ${location.pathname === '/learning' ? 'active' : ''}`}>
            {isLearningBlocked ? <Lock size={18} /> : <BookOpen size={18} />} Learning
          </Link>
        </li>
        <li>
          <Link to="/practical" className={`nav-item ${location.pathname === '/practical' ? 'active' : ''}`}>
            <FlaskConical size={18} /> Practical
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
              <Shield size={18} /> Admin
            </Link>
          </li>
        )}
        {isFaculty && !isAdmin && (
          <li>
            <Link to="/faculty" className={`nav-item ${location.pathname === '/faculty' ? 'active' : ''}`}>
              <Shield size={18} /> Faculty Portal
            </Link>
          </li>
        )}

        {/* User Profile Avatar Icon with Dropdown Menu OR Login Button */}
        {currentUser ? (
          <li className="user-profile-menu-container" ref={dropdownRef}>
            <button 
              className={`user-profile-pill ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(prev => !prev)}
              aria-expanded={isDropdownOpen}
              aria-label="User profile menu"
              title={getUserDisplayName()}
            >
              <div className="user-avatar-circle">
                {getUserInitial()}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="user-dropdown-menu glass-panel">
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-large">
                    {getUserInitial()}
                  </div>
                  <div className="dropdown-user-info">
                    <h4 className="dropdown-user-name">{getUserDisplayName()}</h4>
                    <span className="dropdown-user-email">{currentUser.email || 'scholar@college.edu'}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span className={`role-badge ${isAdmin ? 'admin' : (isFaculty ? 'faculty' : 'scholar')}`}>
                        {isAdmin ? '🛡️ Administrator' : (isFaculty ? '🎓 Faculty Instructor' : '🌿 Scholar')}
                      </span>
                      <span className="role-badge scholar" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                        {currentUser.collegeId || 'COLLEGE_001'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-links-list">
                  {isAdmin ? (
                    <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate('/admin'); }}>
                      <Shield size={16} className="dropdown-item-icon" />
                      <div className="dropdown-item-text">
                        <strong>Admin Dashboard</strong>
                        <span>Student & Lab Management</span>
                      </div>
                    </button>
                  ) : isFaculty ? (
                    <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate('/faculty'); }}>
                      <Shield size={16} className="dropdown-item-icon" />
                      <div className="dropdown-item-text">
                        <strong>Faculty Portal</strong>
                        <span>Experiments & Lab Controls</span>
                      </div>
                    </button>
                  ) : (
                    <button className="dropdown-item" onClick={() => { setIsDropdownOpen(false); navigate('/dashboard'); }}>
                      <LayoutDashboard size={16} className="dropdown-item-icon" />
                      <div className="dropdown-item-text">
                        <strong>My Dashboard</strong>
                        <span>Formulation progress</span>
                      </div>
                    </button>
                  )}

                  <button className="dropdown-item" onClick={handleChangePasswordClick}>
                    <KeyRound size={16} className="dropdown-item-icon" />
                    <div className="dropdown-item-text">
                      <strong>Change Password</strong>
                      <span>Update account credentials</span>
                    </div>
                  </button>

                  <button className="dropdown-item" onClick={handleHelpClick}>
                    <HelpCircle size={16} className="dropdown-item-icon help-icon" />
                    <div className="dropdown-item-text">
                      <strong>Help & FAQs</strong>
                      <span>Guides, ratios & policies</span>
                    </div>
                  </button>
                </div>

                <div className="dropdown-divider"></div>

                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} className="dropdown-item-icon logout-icon" />
                  <div className="dropdown-item-text">
                    <strong>Logout</strong>
                    <span>Sign out of college session</span>
                  </div>
                </button>
              </div>
            )}
          </li>
        ) : (
          <li>
            <Link to="/login" className="login-btn">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
