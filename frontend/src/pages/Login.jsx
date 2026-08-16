import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import './Login.css';
import herbalScenery from '../assets/herbal_scenery.png';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google');
    }
    setLoading(false);
  };

  return (
    <div className="herbal-bg" style={{ 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: `url(${herbalScenery})`
    }}>
      <div className="login-card glass-panel leaf-card" style={{ padding: '3rem', borderRadius: '60px 4px 60px 4px' }}>
        <div className="login-header">
          <div className="icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary-color)' }}>
            <Sparkles size={32} />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Join the Lab'}</h2>
          <p className="text-muted" style={{ color: '#e2e8f0' }}>{isLogin ? 'Enter your details to access the lab.' : 'Sign up to start your journey.'}</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full" style={{ marginTop: '1rem', padding: '1rem' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="btn-outline w-full google-btn" style={{ padding: '0.8rem' }}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} />
          Google
        </button>

        <p className="toggle-auth text-muted" style={{ color: '#cbd5e1' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} className="toggle-link">
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
