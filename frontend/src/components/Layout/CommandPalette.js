import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands = [
    { label: 'Go to Dashboard', hint: 'G D', action: () => navigate('/dashboard') },
    { label: 'Go to Trading Terminal', hint: 'G T', action: () => navigate('/trading') },
    { label: 'Go to Portfolio', hint: 'G P', action: () => navigate('/portfolio') },
    { label: 'Go to Analytics', hint: 'G A', action: () => navigate('/analytics') },
    { label: 'Open Execution Blade', hint: 'E B', action: () => {} },
    { label: 'Toggle High Contrast', hint: 'T H', action: () => {} },
    { label: 'Neural Alpha Scan', hint: 'N S', action: () => {} },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (!isOpen) return;
      if (e.key === 'ArrowDown') setSelectedIndex(p => (p + 1) % filtered.length);
      if (e.key === 'ArrowUp') setSelectedIndex(p => (p - 1 + filtered.length) % filtered.length);
      if (e.key === 'Enter') {
        filtered[selectedIndex]?.action();
        onClose(false);
      }
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={() => onClose(false)}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            autoFocus
            className="cmd-input"
            placeholder="Search commands or navigate..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
          />
          <div className="cmd-kbd">ESC</div>
        </div>
        <div className="cmd-list">
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>No commands found...</div>
          ) : filtered.map((cmd, i) => (
            <div 
              key={cmd.label}
              className={`cmd-item ${i === selectedIndex ? 'active' : ''}`}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => { cmd.action(); onClose(false); }}
            >
              <span className="cmd-item-label">{cmd.label}</span>
              <span className="cmd-item-hint">{cmd.hint}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 22px', background: 'var(--bg-void)', borderTop: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)' }}>
          <span>↑↓ to navigate • Enter to select</span>
          <span>CryptoNova Terminal v4.2</span>
        </div>
      </div>
    </div>
  );
}
