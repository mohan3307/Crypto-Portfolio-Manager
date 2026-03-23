import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('PARITY_ERR: Key mismatch');
    if (form.password.length < 6) return setError('ENTROPY_ERR: Insufficient length');
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'REGISTRATION_SEQUENCE_FAILURE');
    } finally { setLoading(false); }
  };

  return (
    <div className="register-page">
      <div className="auth-card glass animate-in">
        <div className="auth-header">
          <div className="logo-symbol">⬡</div>
          <h1>Create Account</h1>
          <p>Join the CryptoNova Trading Network</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input"
              type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input"
              type="email" placeholder="name@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input"
                type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <input 
                className="form-input"
                type="password" placeholder="••••••••"
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required 
              />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }} type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>

      <style>{`
        .register-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top left, #0a101f, #000); position: relative; padding: 40px 20px; }
        .auth-card { width: 100%; max-width: 460px; padding: 40px; border-radius: 12px; }
        .auth-header { text-align: center; margin-bottom: 30px; }
        .logo-symbol { font-size: 32px; background: var(--accent); color: #fff; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border-radius: 10px; }
        .auth-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 5px; color: #fff; }
        .auth-header p { color: var(--text-muted); font-size: 14px; }
        .auth-footer { margin-top: 25px; text-align: center; font-size: 14px; color: var(--text-muted); }
        .auth-footer a { color: var(--accent); font-weight: 600; text-decoration: none; }
      `}</style>
    </div>
  );
}
