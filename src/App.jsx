import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [configStatus, setConfigStatus] = useState({
    initialized: false,
    apiKeyFound: false,
    projectIdFound: false,
  });

  useEffect(() => {
    // Check if Firebase environment variables are loaded
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    setConfigStatus({
      initialized: true,
      apiKeyFound: !!apiKey && apiKey !== 'your_api_key',
      projectIdFound: !!projectId && projectId !== 'your_project_id',
    });
  }, []);

  return (
    <div className="app-container">
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Pulsing Sacred Well Logo */}
        <div className="pulse-gold" style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229, 193, 88, 0.2) 0%, rgba(8, 10, 12, 0) 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--color-sacred-gold)" 
            strokeWidth="1.5"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Minimalist Water Well Outline */}
            <path d="M4 11h16M4 15h16" />
            <path d="M6 11V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
            <path d="M12 3v3" />
            <circle cx="12" cy="8" r="2" />
            <path d="M3 21h18" />
            <path d="M5 21v-6h14v6" />
          </svg>
        </div>

        {/* Welcome Text */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }} className="fade-in">
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            color: 'var(--color-sacred-gold)',
            marginBottom: '8px',
            letterSpacing: '0.02em',
          }}>
            The Well
          </h1>
          <p style={{
            color: 'var(--text-slate)',
            fontSize: '15px',
            fontWeight: 400,
          }}>
            Catholic Bible Study Companion — Project Initialized
          </p>
        </div>

        {/* Integration Status Panel */}
        <div className="glass-panel fade-in" style={{
          width: '100%',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--text-ivory)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(229, 193, 88, 0.1)',
            paddingBottom: '8px',
          }}>
            Integration Status
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-slate)' }}>Vite Development Server</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 8px',
                borderRadius: '4px',
              }}>
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-slate)' }}>React Framework</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 8px',
                borderRadius: '4px',
              }}>
                v19.2.7 READY
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-slate)' }}>Firebase Config Connection</span>
              {configStatus.apiKeyFound && configStatus.projectIdFound ? (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>
                  CONNECTED
                </span>
              ) : (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#F59E0B',
                  background: 'rgba(245, 158, 11, 0.15)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}>
                  PENDING .env CONFIG
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="fade-in" style={{ textAlign: 'center', width: '100%' }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}>
            To link your database, copy <code style={{ color: 'var(--color-sacred-gold)' }}>.env.example</code> to <code style={{ color: 'var(--color-sacred-gold)' }}>.env</code> and fill in your Firebase project credentials.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
