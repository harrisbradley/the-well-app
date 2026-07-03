import React from 'react';

export default function Widget() {
  return (
    <div style={{
      boxSizing: 'border-box',
      width: '100%',
      height: '100vh',
      background: 'rgba(20, 26, 32, 0.4)',
      backdropFilter: 'blur(12px)',
      color: 'var(--text-ivory)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      border: '1px solid rgba(229, 193, 88, 0.1)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--color-sacred-gold)" 
          strokeWidth="1.5"
        >
          <path d="M4 11h16M4 15h16" />
          <path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
          <path d="M12 3v3" />
          <circle cx="12" cy="8" r="2" />
          <path d="M3 21h18" />
        </svg>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          color: 'var(--color-sacred-gold)',
          fontSize: '18px',
          letterSpacing: '0.02em',
        }}>
          The Well Widget
        </h2>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-slate)', marginBottom: '16px' }}>
        harris-homelab Hub Active
      </p>

      <div className="glass-panel" style={{
        background: 'rgba(8, 10, 12, 0.6)',
        width: '100%',
        padding: '16px',
        borderRadius: 'var(--radius-sm)',
      }}>
        <p style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Today's Readings
        </p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-ivory)' }}>
          Day 1: Genesis 1–2; Psalm 19
        </p>
        <div style={{
          marginTop: '12px',
          height: '4px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{ width: '0%', height: '100%', background: 'var(--color-sacred-gold)' }}></div>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>
          Progress: 0% (Day 1 of 365)
        </p>
      </div>
    </div>
  );
}
