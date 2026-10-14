import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './Auth.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phoneNumber: '', rollNumber: '',
    department: 'CSE', year: 1, password: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSM'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email address is required';
    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(form.email)) return 'Enter a valid email address';
    if (!form.phoneNumber.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phoneNumber.trim())) return 'Enter a valid 10-digit phone number';
    if (!form.rollNumber.trim()) return 'University roll number is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        ...form,
        year: parseInt(form.year),
      });
      setSuccess(res.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
            <input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" placeholder="student@example.com" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-control" placeholder="10-digit mobile number" maxLength={10} />
          </div>

          <div className="form-group">
            <label>University Roll Number</label>
            <input name="rollNumber" value={form.rollNumber} onChange={handleChange} className="form-control" placeholder="e.g., 21EGECSE001" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={form.department} onChange={handleChange} className="form-control">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select name="year" value={form.year} onChange={handleChange} className="form-control">
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
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

          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" type={showPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} className="form-control" placeholder="Re-enter your password" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already signed up? <Link to="/login">Go to Login</Link>
        </p>
      </div>
    </div>
  );
}
