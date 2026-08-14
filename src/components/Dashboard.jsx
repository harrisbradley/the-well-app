import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  }

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #101418 0%, #080A0C 100%)',
      padding: '40px 24px',
    }}>
      <header style={{
        maxWidth: '1000px',
        margin: '0 auto 32px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(229, 193, 88, 0.1)',
        paddingBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--color-sacred-gold)" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 11h16M4 15h16" />
            <path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
            <path d="M12 3v3" />
            <circle cx="12" cy="8" r="2" />
            <path d="M3 21h18" />
            <path d="M5 21v-6h14v6" />
          </svg>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            color: 'var(--color-sacred-gold)',
            letterSpacing: '0.02em',
          }}>
            The Well
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-slate)' }}>
            {currentUser?.email || 'Guest User'}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-panel fade-in" style={{ padding: '24px 20px', textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '28px',
            color: 'var(--color-sacred-gold)',
            marginBottom: '16px',
          }}>
            Welcome to Your Study Companion
          </h2>
          <p style={{
            color: 'var(--text-slate)',
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            fontSize: '15px',
            lineHeight: 1.6,
          }}>
            Your account is set up and protected by Firebase Authentication. You can now access your private reflections, scripture annotations, character wiki profiles, and reading tracking.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            textAlign: 'left',
          }}>
            <div 
              className="glass-panel-interactive" 
              style={{ padding: '24px', border: '1px solid rgba(229, 193, 88, 0.3)' }}
              onClick={() => navigate('/reader?gospel=today')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-sacred-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  👑 Catholic Liturgy
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(229, 193, 88, 0.15)', color: 'var(--color-sacred-gold)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  Today's Reading
                </span>
              </div>
              <h3 style={{ color: 'var(--color-sacred-gold)', marginBottom: '8px', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                Daily Gospel
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginBottom: '16px', lineHeight: 1.4 }}>
                Read today's Roman Rite Gospel passage with liturgical season metadata and personal reflections.
              </p>
              <span style={{ fontSize: '12px', color: 'var(--color-sacred-gold)', fontWeight: 600 }}>READ TODAY'S GOSPEL →</span>
            </div>

            <div 
              className="glass-panel-interactive" 
              style={{ padding: '24px' }}
              onClick={() => navigate('/reader')}
            >
              <h3 style={{ color: 'var(--color-sacred-gold)', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                Bible Reader
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginBottom: '16px' }}>
                Browse all 73 Catholic books, select chapters, highlight verses, and anchor notes.
              </p>
              <span style={{ fontSize: '12px', color: 'var(--color-sacred-gold)', fontWeight: 600 }}>ENTER READER →</span>
            </div>

            <div 
              className="glass-panel-interactive" 
              style={{ padding: '24px' }}
              onClick={() => navigate('/matrix')}
            >
              <h3 style={{ color: 'var(--color-sacred-gold)', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                Progress Matrix
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginBottom: '16px' }}>
                Track your journey through the 365-day Bible in a Year reading plan.
              </p>
              <span style={{ fontSize: '12px', color: 'var(--color-sacred-gold)', fontWeight: 600 }}>VIEW PROGRESS MATRIX →</span>
            </div>

            <div 
              className="glass-panel-interactive" 
              style={{ padding: '24px' }}
              onClick={() => window.open('/widget?mode=gospel', '_blank')}
            >
              <h3 style={{ color: 'var(--color-sacred-gold)', marginBottom: '12px', fontSize: '18px', fontFamily: 'var(--font-serif)' }}>
                Family Portal Widget
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginBottom: '16px' }}>
                Embeddable micro-widget for the Harris Family Portal with Daily Gospel and BIAY tabs.
              </p>
              <span style={{ fontSize: '12px', color: 'var(--color-sacred-gold)', fontWeight: 600 }}>LAUNCH WIDGET ↗</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
