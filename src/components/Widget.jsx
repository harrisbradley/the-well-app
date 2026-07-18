import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { BIBLE_BOOKS } from '../data/books';
import readingPlan from '../data/reading-plan.json';

const PERIOD_COLORS = {
  "Early World": "#00B4D8",
  "Patriarchs": "#7A203B",
  "Egypt & Exodus": "#D90429",
  "Desert Wanderings": "#D4B26F",
  "Conquest and Judges": "#38B000",
  "Royal Kingdom": "#7209B7",
  "Divided Kingdom": "#495057",
  "Exile": "#0077B6",
  "Return": "#FFD166",
  "Maccabean Revolt": "#F77F00",
  "Messianic Fulfillment": "#E5C158",
  "The Church": "#F7F5F0"
};

// Canvas Confetti
function triggerWidgetConfetti(container) {
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';

  // Ensure container has relative positioning for the absolute canvas overlay
  container.style.position = 'relative';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const particles = [];
  const colors = ['#E5C158', '#00B4D8', '#9E2A2B', '#D90429', '#38B000', '#7209B7'];

  for (let i = 0; i < 40; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.7,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.8) * 10,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      opacity: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.025;

      if (p.opacity > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    }
  }

  animate();
}

export default function Widget() {
  const { currentUser, loading } = useAuth();
  const widgetRef = useRef(null);
  const [completedDays, setCompletedDays] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Listen to completed days progress document
  useEffect(() => {
    if (!currentUser) {
      setLoadingProgress(false);
      return;
    }
    const progressDocRef = doc(db, 'userProgress', currentUser.uid);
    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletedDays(docSnap.data().completedDays || []);
      } else {
        setCompletedDays([]);
      }
      setLoadingProgress(false);
    }, (err) => {
      console.error("Widget progress stream error:", err);
      setLoadingProgress(false);
    });
    return unsubscribe;
  }, [currentUser]);

  // Determine active day
  let activeDay = 1;
  const completedSet = new Set(completedDays);
  for (let d = 1; d <= 365; d++) {
    if (!completedSet.has(d)) {
      activeDay = d;
      break;
    }
  }

  // Parse URL day override
  const searchParams = new URLSearchParams(window.location.search);
  const urlDay = searchParams.get('day');
  const dayNum = urlDay ? parseInt(urlDay, 10) : activeDay;

  const planEntry = readingPlan.find(d => d.day === dayNum) || readingPlan[0];
  const periodColor = PERIOD_COLORS[planEntry.period] || 'var(--color-sacred-gold)';
  const isCompleted = completedDays.includes(dayNum);

  // Toggle completion status
  const handleToggleCompleted = async () => {
    if (!currentUser) return;
    let updated;
    if (isCompleted) {
      updated = completedDays.filter(d => d !== dayNum);
    } else {
      updated = [...completedDays, dayNum];
      triggerWidgetConfetti(widgetRef.current);
    }

    try {
      const progressDocRef = doc(db, 'userProgress', currentUser.uid);
      await setDoc(progressDocRef, { 
        userId: currentUser.uid, 
        completedDays: updated 
      }, { merge: true });
    } catch (err) {
      console.error("Widget progress update error:", err);
    }
  };

  const progressPercent = ((completedDays.length / 365) * 100).toFixed(1);

  if (loading || loadingProgress) {
    return (
      <div style={{
        boxSizing: 'border-box',
        width: '300px',
        height: '250px',
        background: 'rgba(10, 14, 18, 0.95)',
        color: 'var(--text-slate)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(229, 193, 88, 0.15)',
        borderRadius: '12px',
        fontSize: '12px',
        fontFamily: 'var(--font-sans)',
      }}>
        Loading Widget...
      </div>
    );
  }



  return (
    <div 
      ref={widgetRef}
      style={{
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      minWidth: '280px',
      minHeight: '230px',
      background: 'rgba(10, 14, 18, 0.95)',
      backdropFilter: 'blur(16px)',
      color: 'var(--text-ivory)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      border: '1px solid rgba(229, 193, 88, 0.15)',
      borderRadius: '12px',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'space-between',
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-sacred-gold)',
            fontSize: '14px',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            The Well
          </h2>
        </div>
        
        {/* Epoch color indicator badge */}
        <span style={{
          fontSize: '9px',
          background: `${periodColor}20`,
          color: planEntry.period === 'The Church' ? 'var(--text-ivory)' : periodColor,
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 700,
          textTransform: 'uppercase',
          border: `1px solid ${periodColor}30`,
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {planEntry.period}
        </span>
      </div>

      {/* Main Reading Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--text-ivory)',
            fontSize: '15px',
            margin: 0,
            fontWeight: '600'
          }}>
            Day {planEntry.day}
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {planEntry.title}
          </span>
        </div>

        {/* Readings List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '6px',
          padding: '8px 10px',
        }}>
          {planEntry.readings.map((r, idx) => {
            const book = BIBLE_BOOKS.find(b => b.usfmCode === r.bookId);
            const label = book ? `${book.name} ${r.startChapter}${r.endChapter !== r.startChapter ? `-${r.endChapter}` : ''}` : `${r.bookId} ${r.startChapter}`;
            return (
              <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: periodColor }}>•</span>
                <span style={{ fontWeight: 500, color: 'var(--text-slate)' }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer controls & progress */}
      {!currentUser ? (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(229, 193, 88, 0.04)',
          border: '1px dashed rgba(229, 193, 88, 0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-slate)' }}>🔒 Progress is locked</span>
          <button 
            onClick={() => window.open(window.location.origin + '/login', '_blank')}
            style={{
              background: 'var(--color-sacred-gold)',
              color: 'var(--bg-midnight)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(229, 193, 88, 0.2)',
            }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Completion Checkbox */}
            <button
              onClick={handleToggleCompleted}
              style={{
                background: isCompleted ? 'var(--color-sacred-gold)' : 'transparent',
                color: isCompleted ? 'var(--bg-midnight)' : 'var(--color-sacred-gold)',
                border: '1px solid var(--color-sacred-gold)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              {isCompleted ? '✓ Completed' : '⚪ Mark Done'}
            </button>

            {/* Open Reader link */}
            <a
              href={window.location.origin + '/reader?day=' + planEntry.day}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-sacred-gold)',
                fontSize: '11px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              Open Reader ↗
            </a>
          </div>

          {/* Mini progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', marginBottom: '3px' }}>
              <span>Plan Progress</span>
              <span>{completedDays.length} / 365 Days ({progressPercent}%)</span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
              height: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-sacred-gold) 0%, #F59E0B 100%)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
