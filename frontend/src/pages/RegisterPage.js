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
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ 
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="auth-card glass-heavy" style={{ 
        width: '100%', maxWidth: 460, padding: '40px', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 8 }}>⬡ CryptoNova</h1>
          <p style={{ fontSize: 11, color: '#4a5e78', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Institutional Portal</p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#eef2fa', marginBottom: 8 }}>Create account</h2>
          <p style={{ fontSize: 13, color: '#8899b4' }}>Initiate your professional portfolio instance</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 12, color: 'var(--red)', fontSize: 12, marginBottom: 24, textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4a5e78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</label>
            <input 
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none'
              }}
              type="text" placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4a5e78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</label>
            <input 
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none'
              }}
              type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4a5e78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12, padding: '10px 42px 10px 14px', color: '#fff', fontSize: 14, outline: 'none'
                  }}
                  type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required 
                />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#4a5e78' }}>
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4a5e78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm</label>
              <input 
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none'
                }}
                type={showPassword ? "text" : "password"} placeholder="••••••••"
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required 
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800, fontSize: 14, marginTop: 12, background: 'var(--blue)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            type="submit" disabled={loading}>
            {loading ? 'Creating Instance...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#4a5e78' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>

      <style>{`
        .glass-heavy { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px) saturate(200%); }
      `}</style>
    </div>
  );
}
