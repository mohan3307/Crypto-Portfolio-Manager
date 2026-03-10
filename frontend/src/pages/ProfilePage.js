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
      toast.success('Profile updated!');
    } catch (e) { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile Settings</div>
          <div className="page-subtitle">Manage your account details</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Profile Info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Information</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select className="form-input" value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Security</span>
          </div>
          <div style={{ padding: '16px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13px' }}>
            🔒 Your password is encrypted with bcrypt. We never store plain-text passwords.
          </div>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>

          {/* Stats */}
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
            <div className="card-title" style={{ marginBottom: '12px' }}>Account Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'JWT Auth', value: '✓ Active' },
                { label: 'Encryption', value: 'bcrypt 12' },
                { label: 'Session', value: '7 days' },
                { label: 'API Key', value: 'CMC Pro' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
