import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'AUTHENTICATION_SEQUENCE_TERMINATED');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="auth-card glass animate-in">
        <div className="auth-header">
          <div className="logo-symbol">⬢</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your CryptoNova Terminal</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input"
              type="email" placeholder="name@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pw-toggle">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '10px' }} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>

      <style>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top left, #0a101f, #000); position: relative; }
        .auth-card { width: 100%; max-width: 420px; padding: 40px; border-radius: 12px; }
        .auth-header { text-align: center; margin-bottom: 30px; }
        .logo-symbol { font-size: 32px; background: var(--accent); color: #fff; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border-radius: 10px; }
        .auth-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 5px; color: #fff; }
        .auth-header p { color: var(--text-muted); font-size: 14px; }
        .pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; }
        .auth-footer { margin-top: 25px; text-align: center; font-size: 14px; color: var(--text-muted); }
        .auth-footer a { color: var(--accent); font-weight: 600; text-decoration: none; }
      `}</style>
    </div>
  );
}
