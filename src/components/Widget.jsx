import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { BIBLE_BOOKS } from '../data/books';
import readingPlan from '../data/reading-plan.json';
import { 
  getLiturgicalDayInfo, 
  getCalculatedLiturgicalDay, 
  formatDateKey, 
  fetchGospelVerses,
  parseDateInput
} from '../data/liturgicalHelper.js';

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

const LITURGICAL_COLOR_MAP = {
  green: '#2D6A4F',
  white: '#E5C158',
  red: '#D90429',
  purple: '#7209B7',
  rose: '#D47391'
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

  // Parse URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode = searchParams.get('mode') === 'gospel' ? 'gospel' : 'biay';
  const urlDate = searchParams.get('date');
  const urlDay = searchParams.get('day');

  // Widget Mode: 'gospel' | 'biay'
  const [activeTab, setActiveTab] = useState(initialMode);

  // BIAY States
  const [completedDays, setCompletedDays] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Gospel States
  const [completedGospelDays, setCompletedGospelDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => urlDate ? parseDateInput(urlDate) : new Date());
  const [liturgicalInfo, setLiturgicalInfo] = useState(() => getCalculatedLiturgicalDay(urlDate || new Date()));
  const [gospelVersesData, setGospelVersesData] = useState(null);
  const [loadingGospelText, setLoadingGospelText] = useState(false);

  // Listen to user progress (BIAY completed days + Gospel completed days)
  useEffect(() => {
    if (!currentUser) {
      setLoadingProgress(false);
      return;
    }
    const progressDocRef = doc(db, 'userProgress', currentUser.uid);
    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedDays(data.completedDays || []);
        setCompletedGospelDays(data.completedGospelDays || []);
      } else {
        setCompletedDays([]);
        setCompletedGospelDays([]);
      }
      setLoadingProgress(false);
    }, (err) => {
      console.error("Widget progress stream error:", err);
      setLoadingProgress(false);
    });
    return unsubscribe;
  }, [currentUser]);

  // Load enriched liturgical info and scripture text for selected Gospel date
  useEffect(() => {
    let isCurrent = true;
    const dateKey = formatDateKey(selectedDate);
    const calculated = getCalculatedLiturgicalDay(selectedDate);
    setLiturgicalInfo(calculated);

    // Fetch enriched online data if available
    getLiturgicalDayInfo(selectedDate).then(info => {
      if (!isCurrent) return;
      setLiturgicalInfo(info);
      
      // Load Gospel scripture verses
      if (info?.gospel) {
        setLoadingGospelText(true);
        fetchGospelVerses(info.gospel).then(versesRes => {
          if (!isCurrent) return;
          setGospelVersesData(versesRes);
          setLoadingGospelText(false);
        }).catch(() => {
          if (isCurrent) setLoadingGospelText(false);
        });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedDate]);

  // BIAY Day Calculation
  let activeBIAYDay = 1;
  const completedSet = new Set(completedDays);
  for (let d = 1; d <= 365; d++) {
    if (!completedSet.has(d)) {
      activeBIAYDay = d;
      break;
    }
  }
  const dayNum = urlDay ? parseInt(urlDay, 10) : activeBIAYDay;
  const planEntry = readingPlan.find(d => d.day === dayNum) || readingPlan[0];
  const periodColor = PERIOD_COLORS[planEntry.period] || 'var(--color-sacred-gold)';
  const isBIAYCompleted = completedDays.includes(dayNum);

  // Gospel Day Completion Check
  const currentDateKey = formatDateKey(selectedDate);
  const isGospelCompleted = completedGospelDays.includes(currentDateKey);
  const litColorHex = LITURGICAL_COLOR_MAP[liturgicalInfo?.color?.toLowerCase()] || '#E5C158';

  // Toggle BIAY completion
  const handleToggleBIAY = async () => {
    if (!currentUser) return;
    let updated;
    if (isBIAYCompleted) {
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
      console.error("Widget BIAY progress update error:", err);
    }
  };

  // Toggle Gospel completion
  const handleToggleGospel = async () => {
    if (!currentUser) return;
    let updated;
    if (isGospelCompleted) {
      updated = completedGospelDays.filter(d => d !== currentDateKey);
    } else {
      updated = [...completedGospelDays, currentDateKey];
      triggerWidgetConfetti(widgetRef.current);
    }

    try {
      const progressDocRef = doc(db, 'userProgress', currentUser.uid);
      await setDoc(progressDocRef, { 
        userId: currentUser.uid, 
        completedGospelDays: updated 
      }, { merge: true });
    } catch (err) {
      console.error("Widget Gospel progress update error:", err);
    }
  };

  // Step Gospel date forward or backward
  const handleStepDate = (days) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  const progressPercent = ((completedDays.length / 365) * 100).toFixed(1);
  const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());

  if (loading || loadingProgress) {
    return (
      <div style={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        minHeight: '260px',
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
        minHeight: '280px',
        background: 'radial-gradient(circle at top, #141A20 0%, #0A0E12 100%)',
        backdropFilter: 'blur(16px)',
        color: 'var(--text-ivory)',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px',
        border: '1px solid rgba(229, 193, 88, 0.2)',
        borderRadius: '12px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Top Header & Tab Toggle Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🛡️</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-sacred-gold)',
            fontSize: '14px',
            margin: 0,
            letterSpacing: '0.03em',
            fontWeight: 700
          }}>
            The Well
          </h2>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid rgba(229, 193, 88, 0.15)',
        }}>
          <button
            onClick={() => setActiveTab('gospel')}
            style={{
              background: activeTab === 'gospel' ? 'var(--color-sacred-gold)' : 'transparent',
              color: activeTab === 'gospel' ? '#080A0C' : 'var(--text-slate)',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Daily Gospel
          </button>
          <button
            onClick={() => setActiveTab('biay')}
            style={{
              background: activeTab === 'biay' ? 'var(--color-sacred-gold)' : 'transparent',
              color: activeTab === 'biay' ? '#080A0C' : 'var(--text-slate)',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            BIAY Plan
          </button>
        </div>
      </div>

      {/* TAB CONTENT: DAILY GOSPEL */}
      {activeTab === 'gospel' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
          
          {/* Liturgical Date & Feast Banner */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderLeft: `3px solid ${litColorHex}`,
            borderRadius: '4px',
            padding: '6px 8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: litColorHex,
                  boxShadow: `0 0 6px ${litColorHex}80`,
                  display: 'inline-block'
                }} />
                <span style={{ fontSize: '10px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Date Nav Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => handleStepDate(-1)}
                  title="Previous Day"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-slate)',
                    borderRadius: '4px',
                    width: '18px',
                    height: '18px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  ‹
                </button>
                {!isToday && (
                  <button
                    onClick={handleSetToday}
                    title="Go to Today"
                    style={{
                      background: 'rgba(229, 193, 88, 0.1)',
                      border: '1px solid rgba(229, 193, 88, 0.3)',
                      color: 'var(--color-sacred-gold)',
                      borderRadius: '4px',
                      padding: '1px 4px',
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Today
                  </button>
                )}
                <button
                  onClick={() => handleStepDate(1)}
                  title="Next Day"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-slate)',
                    borderRadius: '4px',
                    width: '18px',
                    height: '18px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            <div style={{
              fontSize: '11px',
              color: 'var(--text-ivory)',
              fontWeight: 600,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {liturgicalInfo?.celebrationTitle || 'Daily Gospel'}
            </div>
          </div>

          {/* Gospel Citation & Verse Text Reader Snippet */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(229, 193, 88, 0.1)',
            borderRadius: '6px',
            padding: '8px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(229, 193, 88, 0.1)', paddingBottom: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: 'var(--color-sacred-gold)',
                fontWeight: 700
              }}>
                📖 {liturgicalInfo?.gospel?.citation || 'Gospel Reading'}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                Douay-Rheims
              </span>
            </div>

            {loadingGospelText ? (
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '6px 0' }}>
                Loading Scripture passage...
              </div>
            ) : gospelVersesData?.verses && Object.keys(gospelVersesData.verses).length > 0 ? (
              <div style={{ fontSize: '11px', lineHeight: 1.5, color: 'var(--text-slate)', paddingTop: '4px' }}>
                {Object.entries(gospelVersesData.verses).map(([vNum, text]) => (
                  <span key={vNum} style={{ display: 'inline', marginRight: '4px' }}>
                    <sup style={{ color: 'var(--color-sacred-gold)', fontSize: '9px', marginRight: '2px', fontWeight: 600 }}>{vNum}</sup>
                    {text}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '4px 0' }}>
                {liturgicalInfo?.gospel?.citation ? `Gospel passage ready for study: ${liturgicalInfo.gospel.citation}` : 'No Gospel assigned for this date.'}
              </div>
            )}
          </div>

          {/* Footer Actions for Gospel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            {currentUser ? (
              <button
                onClick={handleToggleGospel}
                style={{
                  background: isGospelCompleted ? 'var(--color-sacred-gold)' : 'transparent',
                  color: isGospelCompleted ? '#080A0C' : 'var(--color-sacred-gold)',
                  border: '1px solid var(--color-sacred-gold)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                }}
              >
                {isGospelCompleted ? '✓ Read Today' : '⚪ Mark Read'}
              </button>
            ) : (
              <button 
                onClick={() => window.open(window.location.origin + '/login', '_blank')}
                style={{
                  background: 'rgba(229, 193, 88, 0.15)',
                  color: 'var(--color-sacred-gold)',
                  border: '1px solid rgba(229, 193, 88, 0.3)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            )}

            <a
              href={`${window.location.origin}/reader?gospel=${currentDateKey}`}
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
              Open in Reader ↗
            </a>
          </div>

        </div>
      ) : (
        /* TAB CONTENT: BIBLE IN A YEAR (BIAY) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'space-between' }}>
          {/* Epoch color indicator badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '9px',
              background: `${periodColor}20`,
              color: planEntry.period === 'The Church' ? 'var(--text-ivory)' : periodColor,
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              textTransform: 'uppercase',
              border: `1px solid ${periodColor}30`,
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {planEntry.period}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              Fr. Mike Schmitz Plan
            </span>
          </div>

          {/* Main Reading Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--text-ivory)',
                fontSize: '14px',
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
              padding: '6px 8px',
            }}>
              {planEntry.readings.map((r, idx) => {
                const book = BIBLE_BOOKS.find(b => b.usfmCode === r.bookId);
                const label = book ? `${book.name} ${r.startChapter}${r.endChapter !== r.startChapter ? `-${r.endChapter}` : ''}` : `${r.bookId} ${r.startChapter}`;
                return (
                  <div key={idx} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              borderRadius: '6px',
              padding: '6px 10px',
              boxSizing: 'border-box',
              width: '100%',
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-slate)' }}>🔒 Progress locked</span>
              <button 
                onClick={() => window.open(window.location.origin + '/login', '_blank')}
                style={{
                  background: 'var(--color-sacred-gold)',
                  color: 'var(--bg-midnight)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handleToggleBIAY}
                  style={{
                    background: isBIAYCompleted ? 'var(--color-sacred-gold)' : 'transparent',
                    color: isBIAYCompleted ? 'var(--bg-midnight)' : 'var(--color-sacred-gold)',
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
                  {isBIAYCompleted ? '✓ Completed' : '⚪ Mark Done'}
                </button>

                <a
                  href={`${window.location.origin}/reader?day=${planEntry.day}`}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-dim)', marginBottom: '2px' }}>
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
      )}
    </div>
  );
}
