import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    setSlowNotice(false);
    const slowTimer = setTimeout(() => setSlowNotice(true), 4000);

    try {
      const res = await login(email.trim(), password);
      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlowNotice(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🍽️</span>
          <h1>Welcome Back</h1>
          <p>Sign in to SmartMeal — Anurag University Canteen</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className="form-control" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="pwd-wrap">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }} className="form-control" placeholder="Enter your password" />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {slowNotice && (
            <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.4' }}>
              ⏳ Connecting to backend... If the free cloud server was idle, it may take 30–50 seconds to wake up.
            </p>
          )}
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>

        <div className="auth-tagline">
          "Book Your Meal. Pay Online. Collect on Time."
        </div>
      </div>
    </div>
  );
}
