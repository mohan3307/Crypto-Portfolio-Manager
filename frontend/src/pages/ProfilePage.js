import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'USD' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(profile);
      setUser(res.data.user);
      toast.success('IDENTITY_VECTOR_SYNCHRONIZED');
    } catch (e) { toast.error('PROTOCOL_FAILURE'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('PARITY_MISMATCH');
    if (passwords.newPassword.length < 6) return toast.error('ENTROPY_INSUFFICIENT');
    setSaving(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('ENCRYPTION_KEY_ROTATED');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.error || 'AUTH_REJECTION'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, padding: '24px 0', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 800, letterSpacing: 4, marginBottom: 6 }}>IDENTITY_CORE_v4.2</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -1 }}>PERSONNEL_METADATA</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Profile Info */}
        <div className="card" style={{ padding: 32, background: '#000' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 24 }}>NETWORK_PROFILE</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, padding: 24, border: '2px solid var(--border)', background: '#080808' }}>
            <div style={{ 
              width: 72, height: 72, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: -0.5, fontFamily: 'var(--font-mono)' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{user?.email}</div>
              <div style={{ fontSize: 8, color: 'var(--text-dim)', marginTop: 8, fontWeight: 900, letterSpacing: 1 }}>
                ENROLLED: {new Date(user?.createdAt).toLocaleDateString().toUpperCase()}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>DISPLAY_ALIAS</label>
              <input style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 14, fontWeight: 900, outline: 'none' }} 
                value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>AUTHORITY_ID</label>
              <input style={{ width: '100%', background: '#050505', border: '2px solid var(--border)', padding: '12px', color: 'var(--text-dim)', fontSize: 14, fontWeight: 900, outline: 'none', cursor: 'not-allowed' }} 
                value={user?.email} disabled />
            </div>
 
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>VALUATION_UNIT</label>
              <select style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 14, fontWeight: 900, outline: 'none' }}
                value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})}>
                <option value="USD">USD — US_DOLLAR</option>
                <option value="EUR">EUR — EURO_ZONE</option>
                <option value="GBP">GBP — BRITISH_POUND</option>
                <option value="INR">INR — INDIAN_RUPEE</option>
              </select>
            </div>
 
            <button type="submit" disabled={saving} 
              style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '14px', fontSize: 11, fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              {saving ? 'SYNCHRONIZING...' : 'UPDATE_IDENTITY_NODE'}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="card" style={{ padding: 32, background: '#000' }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 24 }}>SECURITY_PROTOCOL</div>
          
          <div style={{ padding: '16px', background: '#080808', border: '2px solid var(--border)', marginBottom: 32, color: 'var(--blue)', fontSize: 11, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}>
             ENCRYPTION_ACTIVE: SHA-512_HYPER_HASH. structural integrity verified. key rotation recommended every 90 days.
          </div>
 
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>CURRENT_AUTH_KEY</label>
              <input style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 14, outline: 'none' }}
                type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>NEW_AUTH_KEY</label>
              <input style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 14, outline: 'none' }}
                type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required />
            </div>
 
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>VERIFY_NEW_KEY</label>
              <input style={{ width: '100%', background: '#000', border: '2px solid var(--border)', padding: '12px', color: '#fff', fontSize: 14, outline: 'none' }}
                type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required />
            </div>
 
            <button type="submit" disabled={saving} 
              style={{ width: '100%', border: '2px solid var(--border)', background: '#000', color: '#fff', padding: '14px', fontSize: 11, fontWeight: 900, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
              {saving ? 'ROTATING...' : 'EXECUTE_KEY_ROTATION'}
            </button>
          </form>

          {/* Core Status */}
          <div style={{ marginTop: 32, padding: 20, background: '#050505', border: '2px solid var(--border)' }}>
             <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 20 }}>SYSTEM_AUTH_TELEMETRY</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { l: 'JWT_INTEGRITY', v: 'NOMINAL', c: 'var(--green)' },
                  { l: 'MFA_STATUS', v: 'OFFLINE', c: 'var(--red)' },
                  { l: 'GEO_LOCK', v: 'INACTIVE', c: 'var(--text-dim)' },
                  { l: 'SESSION_TTL', v: '168H_MAX', c: '#fff' }
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 800, marginBottom: 4, letterSpacing: 1 }}>{s.l}</div>
                    <div style={{ fontSize: 11, color: s.c, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{s.v}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .v4-row:hover { background: #0c0c0c !important; }
      `}</style>
    </div>
  );
}
