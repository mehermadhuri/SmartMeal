import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './Auth.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email address is required';
    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(form.email)) return 'Enter a valid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    setSlowNotice(false);
    const slowTimer = setTimeout(() => setSlowNotice(true), 4000);

    try {
      const res = await authAPI.register(form);
      setSuccess(res.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1>Create Account</h1>
          <p>Join SmartMeal — Anurag University Canteen</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} className="form-control" placeholder="John Doe" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" placeholder="student@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="pwd-wrap">
              <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange} className="form-control" placeholder="Minimum 6 characters" />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {slowNotice && (
            <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.4' }}>
              ⏳ Connecting to backend... If the free cloud server was idle, it may take 30–50 seconds to wake up.
            </p>
          )}
        </form>

        <p className="auth-footer">
          Already signed up? <Link to="/login">Go to Login</Link>
        </p>
      </div>
    </div>
  );
}
