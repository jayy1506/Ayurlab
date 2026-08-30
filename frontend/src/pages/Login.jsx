import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { getCachedStudents } from '../services/adminService';
import DefaultPasswordModal from '../components/auth/DefaultPasswordModal';
import './Login.css';
import herbalScenery from '../assets/herbal_scenery.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isKnownUser, setIsKnownUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check if username is already known for this email
  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
    const trimmed = newEmail.trim().toLowerCase();
    
    if (trimmed) {
      // 1. Check local saved username for this specific user
      const savedName = localStorage.getItem('ayurveda_user_name_' + trimmed);
      if (savedName) {
        setUsername(savedName);
        setIsKnownUser(true);
        return;
      }

      // 2. Check admin directory cached students
      const cached = getCachedStudents();
      const match = cached.find(s => s.email.toLowerCase() === trimmed);
      if (match && match.name) {
        setUsername(match.name);
        setIsKnownUser(true);
        return;
      }

      setIsKnownUser(false);
    } else {
      setIsKnownUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password, username);
      const user = data?.user || {};
      setLoggedInUser(user);

      const emailKey = email.trim().toLowerCase();
      const isPassAlreadyChanged = localStorage.getItem('ayurveda_pass_updated_' + emailKey) === 'true';

      // Check if student or faculty is using default password and hasn't changed it yet
      if ((user.role === 'student' || user.role === 'faculty') && !isPassAlreadyChanged) {
        setShowDefaultModal(true);
      } else {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'faculty') {
          navigate('/faculty');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowDefaultModal(false);
    if (loggedInUser?.role === 'faculty') {
      navigate('/faculty');
    } else {
      navigate('/dashboard');
    }
  };

  const handleChangePasswordClick = () => {
    setShowDefaultModal(false);
    navigate('/change-password');
  };

  return (
    <div
      className="herbal-bg login-page-wrapper"
      style={{
        backgroundImage: `url(${herbalScenery})`,
      }}
    >
      <div className="login-card-container">
        <div className="login-card glass-panel leaf-card">
          <div className="login-header">
            <div className="login-icon-wrapper">
              <Sparkles size={30} />
            </div>
            <h2 className="login-title">Ayurveda Virtual Lab</h2>
            <p className="login-subtitle">
              Enter authorized college credentials to access the laboratory.
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertCircle size={18} className="error-icon" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="College email address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* If username is already known, show welcome badge; otherwise prompt to enter it once */}
            {isKnownUser ? (
              <div className="known-user-badge">
                <User size={15} />
                <span>Scholar Name: <strong>{username}</strong></span>
              </div>
            ) : (
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Your Name / Username (e.g. Rahul)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="input-group password-group">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="college-auth-notice">
            <ShieldCheck size={18} className="college-notice-icon" />
            <span>Restricted Portal: Access authorized for College Scholars & Faculty only.</span>
          </div>
        </div>
      </div>

      <DefaultPasswordModal
        isOpen={showDefaultModal}
        onContinue={handleContinue}
        onChangePassword={handleChangePasswordClick}
      />
    </div>
  );
};

export default Login;
