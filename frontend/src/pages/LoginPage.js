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
    <div className="v4-auth-container">
      {/* Dynamic Neural Background */}
      <div className="v4-neural-bg">
        <div className="v4-aura a1" />
        <div className="v4-aura a2" />
        <div className="v4-aura a3" />
      </div>

      <div className="v4-auth-card">
        <div className="v4-auth-header">
          <div style={{ width: 60, height: 60, background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, margin: '0 auto 24px' }}>⬢</div>
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
            <label>AUTHORITY_IDENTIFIER</label>
            <div className="v4-input-wrap">
               <input 
                type="email" placeholder="ACCESS_ID@PROTOCOL.SYS"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
              />
            </div>
          </div>

          <div className="v4-form-field">
            <label>AUTHENTICATION_KEY</label>
            <div className="v4-input-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="v4-toggle-pw">
                {showPassword ? '🔓' : '🔒'}
              </button>
            </div>
          </div>

          <button className="v4-auth-btn" type="submit" disabled={loading}>
            {loading ? 'INITIATING_SEQUENCE...' : 'ENGAGE_BRIDGE_ACCESS'}
          </button>
        </form>

        <div className="v4-auth-footer">
          UNREGISTERED PERSONNEL? <Link to="/register">INITIALIZE_NEURAL_ENROLLMENT</Link>
        </div>
      </div>

      <style>{`
        .v4-auth-container { min-height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); position: relative; overflow: hidden; }
        
        .v4-neural-bg { position: absolute; inset: 0; z-index: 1; overflow: hidden; opacity: 0.6; pointer-events: none; }
        .v4-aura { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; animation: v4-aura-drift 15s infinite alternate; }
        .a1 { width: 600px; height: 600px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); top: -100px; left: -100px; }
        .a2 { width: 500px; height: 500px; background: radial-gradient(circle, #8b5cf6 0%, transparent 70%); bottom: -50px; right: -50px; animation-duration: 20s; }
        .a3 { width: 400px; height: 400px; background: radial-gradient(circle, #10b981 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-duration: 25s; }

        @keyframes v4-aura-drift {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(5%, 5%) scale(1.1); }
        }

        .v4-auth-card { width: 100%; maxWidth: 460px; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); padding: 60px 48px; border: 2px solid var(--border); position: relative; z-index: 10; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        
        .v4-auth-header { text-align: center; margin-bottom: 48px; }
        
        .v4-error-box { background: #000; border: 1px solid var(--red); padding: 16px; color: var(--red); font-size: 11px; font-weight: 900; margin-bottom: 32px; letter-spacing: 0.5px; border-radius: 2px; }
        
        .v4-auth-form { display: flex; flex-direction: column; gap: 32px; }
        .v4-form-field label { display: block; font-size: 9px; font-weight: 900; color: var(--text-dim); letter-spacing: 2.5px; margin-bottom: 12px; }
        .v4-input-wrap { position: relative; }
        .v4-input-wrap input { width: 100%; background: #000; border: 1px solid var(--border-strong); padding: 16px 20px; color: #fff; font-size: 15px; font-weight: 900; outline: none; border-radius: 2px; transition: 0.1s; }
        .v4-input-wrap input:focus { border-color: #fff; background: #080808; }
        .v4-toggle-pw { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; cursor: pointer; color: var(--text-dim); transition: 0.1s; display: flex; align-items: center; }
        .v4-toggle-pw:hover { color: #fff; }
 
        .v4-auth-btn { background: #fff; border: 1px solid #fff; color: #000; padding: 18px; font-size: 11px; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.1s; margin-top: 10px; border-radius: 2px; }
        .v4-auth-btn:hover { background: #000; color: #fff; }
        .v4-auth-btn:disabled { opacity: 0.3; cursor: not-allowed; }
 
        .v4-auth-footer { text-align: center; margin-top: 48px; font-size: 10px; color: var(--text-dim); font-weight: 900; letter-spacing: 1px; }
        .v4-auth-footer a { color: #fff; text-decoration: none; margin-left: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #fff; }
        .v4-auth-footer a:hover { opacity: 0.7; }
      `}</style>
    </div>
  );
}
