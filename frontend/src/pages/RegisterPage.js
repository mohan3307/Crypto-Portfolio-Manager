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
    <div className="v4-auth-container">
      {/* Dynamic Neural Background */}
      <div className="v4-neural-bg">
        <div className="v4-aura a1" />
        <div className="v4-aura a2" />
        <div className="v4-aura a3" />
      </div>

      <div className="v4-auth-card">
        <div className="v4-auth-header">
          <div style={{ width: 60, height: 60, background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, margin: '0 auto 24px' }}>⬡</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>CRYPTONOVA_TERMINAL</h1>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 900, letterSpacing: 4, marginTop: 8 }}>NEURAL_GATEWAY_V4.2</div>
        </div>

        {error && (
          <div className="v4-error-box">
             <span className="v4-error-tag">PROCESS_ERR:</span> {error.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="v4-auth-form">
          <div className="v4-form-field">
            <label>PERSONNEL_NAME</label>
            <div className="v4-input-wrap">
               <input 
                type="text" placeholder="OPERATOR_NAME"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
              />
            </div>
          </div>

          <div className="v4-form-field">
            <label>AUTHORITY_IDENTIFIER</label>
            <div className="v4-input-wrap">
               <input 
                type="email" placeholder="ACCESS_ID@PROTOCOL.SYS"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="v4-form-field">
              <label>SECRET_KEY</label>
              <div className="v4-input-wrap">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required 
                />
              </div>
            </div>
            <div className="v4-form-field">
              <label>VERIFY_KEY</label>
              <div className="v4-input-wrap">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required 
                />
              </div>
            </div>
          </div>

          <button className="v4-auth-btn pulse-main" type="submit" disabled={loading}>
            {loading ? 'INITIALIZING_CLUSTER...' : 'INITIALIZE_COMMAND_CORE'}
          </button>
        </form>

        <div className="v4-auth-footer">
          ALREADY ENROLLED? <Link to="/login">BRIDGE_ACCESS</Link>
        </div>
      </div>

      <style>{`
        .v4-auth-container { min-height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); padding: 40px 20px; }
        
        .v4-auth-card { width: 100%; maxWidth: 480px; background: #000; padding: 60px 48px; border: 2px solid var(--border); position: relative; z-index: 10; }
        
        .v4-auth-header { text-align: center; margin-bottom: 48px; }
        
        .v4-error-box { background: #000; border: 1px solid var(--red); padding: 16px; color: var(--red); font-size: 11px; font-weight: 900; margin-bottom: 32px; letter-spacing: 0.5px; border-radius: 2px; }
        
        .v4-auth-form { display: flex; flex-direction: column; gap: 24px; }
        .v4-form-field label { display: block; font-size: 9px; font-weight: 900; color: var(--text-dim); letter-spacing: 2.5px; margin-bottom: 12px; }
        .v4-input-wrap input { width: 100%; background: #000; border: 1px solid var(--border-strong); padding: 14px 20px; color: #fff; font-size: 14px; font-weight: 900; outline: none; border-radius: 2px; transition: 0.1s; }
        .v4-input-wrap input:focus { border-color: #fff; background: #080808; }

        .v4-auth-btn { background: #fff; border: 1px solid #fff; color: #000; padding: 18px; font-size: 11px; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.1s; margin-top: 20px; border-radius: 2px; }
        .v4-auth-btn:hover { background: #000; color: #fff; }
        .v4-auth-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .v4-auth-footer { text-align: center; margin-top: 48px; font-size: 10px; color: var(--text-dim); font-weight: 900; letter-spacing: 1px; }
        .v4-auth-footer a { color: #fff; text-decoration: none; margin-left: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #fff; }
        .v4-auth-footer a:hover { opacity: 0.7; }
      `}</style>
    </div>
  );
}
