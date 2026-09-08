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

const WIDGET_THEMES = {
  midnight: {
    bg: 'radial-gradient(circle at top, #141A20 0%, #0A0E12 100%)',
    cardBorder: 'rgba(229, 193, 88, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    textPrimary: '#F7F5F0',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    accentGold: '#E5C158',
    accentGoldText: '#080A0C',
    switcherBg: 'rgba(0, 0, 0, 0.4)',
    switcherBorder: 'rgba(229, 193, 88, 0.15)',
    bannerBg: 'rgba(255, 255, 255, 0.02)',
    boxBg: 'rgba(0, 0, 0, 0.25)',
    boxBorder: 'rgba(229, 193, 88, 0.1)',
    btnBg: 'rgba(255, 255, 255, 0.05)',
    btnBorder: 'rgba(255, 255, 255, 0.1)',
    progressBarBg: 'rgba(255, 255, 255, 0.05)',
    colorScheme: 'dark',
  },
  sunlight: {
    bg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    cardBorder: '#CBD5E1',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    textPrimary: '#0F172A',
    textMuted: '#475569',
    textDim: '#64748B',
    accentGold: '#B45309',
    accentGoldText: '#FFFFFF',
    switcherBg: '#F1F5F9',
    switcherBorder: '#CBD5E1',
    bannerBg: '#F8FAFC',
    boxBg: '#F1F5F9',
    boxBorder: '#E2E8F0',
    btnBg: '#E2E8F0',
    btnBorder: '#CBD5E1',
    progressBarBg: '#E2E8F0',
    colorScheme: 'light',
  },
  coastal: {
    bg: 'radial-gradient(circle at top, #16263d 0%, #0b1320 100%)',
    cardBorder: 'rgba(56, 189, 248, 0.25)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    textPrimary: '#F0F6FC',
    textMuted: '#8BA2BE',
    textDim: '#627D9D',
    accentGold: '#38BDF8',
    accentGoldText: '#080A0C',
    switcherBg: 'rgba(11, 19, 32, 0.6)',
    switcherBorder: '#233F63',
    bannerBg: 'rgba(255, 255, 255, 0.03)',
    boxBg: 'rgba(14, 24, 39, 0.6)',
    boxBorder: '#233F63',
    btnBg: 'rgba(255, 255, 255, 0.06)',
    btnBorder: '#233F63',
    progressBarBg: 'rgba(255, 255, 255, 0.06)',
    colorScheme: 'dark',
  },
  hearth: {
    bg: 'radial-gradient(circle at top, #2b2520 0%, #181512 100%)',
    cardBorder: 'rgba(245, 158, 11, 0.25)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    textPrimary: '#FAF5ED',
    textMuted: '#A89A8C',
    textDim: '#7D7063',
    accentGold: '#F59E0B',
    accentGoldText: '#181512',
    switcherBg: 'rgba(24, 21, 18, 0.6)',
    switcherBorder: '#44382E',
    bannerBg: 'rgba(255, 255, 255, 0.03)',
    boxBg: 'rgba(26, 22, 19, 0.6)',
    boxBorder: '#44382E',
    btnBg: 'rgba(255, 255, 255, 0.06)',
    btnBorder: '#44382E',
    progressBarBg: 'rgba(255, 255, 255, 0.06)',
    colorScheme: 'dark',
  },
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
  // Theme State & postMessage Listener
  const [themeKey, setThemeKey] = useState(() => {
    const p = searchParams.get('theme');
    return (p && WIDGET_THEMES[p]) ? p : 'midnight';
  });

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'PORTAL_THEME_CHANGE' && event.data.theme) {
        if (WIDGET_THEMES[event.data.theme]) {
          setThemeKey(event.data.theme);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const currentTheme = WIDGET_THEMES[themeKey] || WIDGET_THEMES.midnight;

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
  const periodColor = PERIOD_COLORS[planEntry.period] || currentTheme.accentGold;
  const isBIAYCompleted = completedDays.includes(dayNum);

  // Gospel Day Completion Check
  const currentDateKey = formatDateKey(selectedDate);
  const isGospelCompleted = completedGospelDays.includes(currentDateKey);
  const baseLitColor = LITURGICAL_COLOR_MAP[liturgicalInfo?.color?.toLowerCase()];
  const litColorHex = (liturgicalInfo?.color?.toLowerCase() === 'white' && themeKey === 'sunlight')
    ? '#B45309'
    : (baseLitColor || currentTheme.accentGold);

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
        background: currentTheme.bg,
        color: currentTheme.textMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${currentTheme.cardBorder}`,
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
        background: currentTheme.bg,
        backdropFilter: 'blur(16px)',
        color: currentTheme.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        padding: '14px',
        border: `1px solid ${currentTheme.cardBorder}`,
        borderRadius: '12px',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'space-between',
        boxShadow: currentTheme.boxShadow,
        transition: 'background 0.25s ease, border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Top Header & Tab Toggle Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🛡️</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            color: currentTheme.accentGold,
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
          background: currentTheme.switcherBg,
          borderRadius: '6px',
          padding: '2px',
          border: `1px solid ${currentTheme.switcherBorder}`,
        }}>
          <button
            onClick={() => setActiveTab('gospel')}
            style={{
              background: activeTab === 'gospel' ? currentTheme.accentGold : 'transparent',
              color: activeTab === 'gospel' ? currentTheme.accentGoldText : currentTheme.textMuted,
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
              background: activeTab === 'biay' ? currentTheme.accentGold : 'transparent',
              color: activeTab === 'biay' ? currentTheme.accentGoldText : currentTheme.textMuted,
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
            background: currentTheme.bannerBg,
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
                <span style={{ fontSize: '10px', color: currentTheme.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Date Nav Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => handleStepDate(-1)}
                  title="Previous Day"
                  style={{
                    background: currentTheme.btnBg,
                    border: `1px solid ${currentTheme.btnBorder}`,
                    color: currentTheme.textMuted,
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
                      background: themeKey === 'sunlight' ? 'rgba(180, 83, 9, 0.1)' : 'rgba(229, 193, 88, 0.1)',
                      border: `1px solid ${currentTheme.accentGold}40`,
                      color: currentTheme.accentGold,
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
                    background: currentTheme.btnBg,
                    border: `1px solid ${currentTheme.btnBorder}`,
                    color: currentTheme.textMuted,
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
              color: currentTheme.textPrimary,
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
            background: currentTheme.boxBg,
            border: `1px solid ${currentTheme.boxBorder}`,
            borderRadius: '6px',
            padding: '8px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${currentTheme.boxBorder}`, paddingBottom: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                color: currentTheme.accentGold,
                fontWeight: 700
              }}>
                📖 {liturgicalInfo?.gospel?.citation || 'Gospel Reading'}
              </span>
              <span style={{ fontSize: '9px', color: currentTheme.textDim }}>
                Douay-Rheims
              </span>
            </div>

            {loadingGospelText ? (
              <div style={{ fontSize: '11px', color: currentTheme.textDim, fontStyle: 'italic', padding: '6px 0' }}>
                Loading Scripture passage...
              </div>
            ) : gospelVersesData?.verses && Object.keys(gospelVersesData.verses).length > 0 ? (
              <div style={{ fontSize: '11px', lineHeight: 1.5, color: currentTheme.textMuted, paddingTop: '4px' }}>
                {Object.entries(gospelVersesData.verses).map(([vNum, text]) => (
                  <span key={vNum} style={{ display: 'inline', marginRight: '4px' }}>
                    <sup style={{ color: currentTheme.accentGold, fontSize: '9px', marginRight: '2px', fontWeight: 600 }}>{vNum}</sup>
                    {text}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: currentTheme.textDim, fontStyle: 'italic', padding: '4px 0' }}>
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
                  background: isGospelCompleted ? currentTheme.accentGold : 'transparent',
                  color: isGospelCompleted ? currentTheme.accentGoldText : currentTheme.accentGold,
                  border: `1px solid ${currentTheme.accentGold}`,
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
                  background: `${currentTheme.accentGold}20`,
                  color: currentTheme.accentGold,
                  border: `1px solid ${currentTheme.accentGold}50`,
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
                color: currentTheme.accentGold,
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
              color: planEntry.period === 'The Church' ? currentTheme.textPrimary : periodColor,
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
            <span style={{ fontSize: '10px', color: currentTheme.textDim }}>
              Fr. Mike Schmitz Plan
            </span>
          </div>

          {/* Main Reading Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                color: currentTheme.textPrimary,
                fontSize: '14px',
                margin: 0,
                fontWeight: '600'
              }}>
                Day {planEntry.day}
              </h3>
              <span style={{ fontSize: '11px', color: currentTheme.textDim, fontStyle: 'italic', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {planEntry.title}
              </span>
            </div>

            {/* Readings List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              background: currentTheme.boxBg,
              border: `1px solid ${currentTheme.boxBorder}`,
              borderRadius: '6px',
              padding: '6px 8px',
            }}>
              {planEntry.readings.map((r, idx) => {
                const book = BIBLE_BOOKS.find(b => b.usfmCode === r.bookId);
                const label = book ? `${book.name} ${r.startChapter}${r.endChapter !== r.startChapter ? `-${r.endChapter}` : ''}` : `${r.bookId} ${r.startChapter}`;
                return (
                  <div key={idx} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: periodColor }}>•</span>
                    <span style={{ fontWeight: 500, color: currentTheme.textMuted }}>{label}</span>
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
              background: `${currentTheme.accentGold}10`,
              border: `1px dashed ${currentTheme.accentGold}40`,
              borderRadius: '6px',
              padding: '6px 10px',
              boxSizing: 'border-box',
              width: '100%',
            }}>
              <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>🔒 Progress locked</span>
              <button 
                onClick={() => window.open(window.location.origin + '/login', '_blank')}
                style={{
                  background: currentTheme.accentGold,
                  color: currentTheme.accentGoldText,
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
                    background: isBIAYCompleted ? currentTheme.accentGold : 'transparent',
                    color: isBIAYCompleted ? currentTheme.accentGoldText : currentTheme.accentGold,
                    border: `1px solid ${currentTheme.accentGold}`,
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
                    color: currentTheme.accentGold,
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: currentTheme.textDim, marginBottom: '2px' }}>
                  <span>Plan Progress</span>
                  <span>{completedDays.length} / 365 Days ({progressPercent}%)</span>
                </div>
                <div style={{
                  background: currentTheme.progressBarBg,
                  borderRadius: '4px',
                  height: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${currentTheme.accentGold} 0%, #F59E0B 100%)`,
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
