import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc 
} from 'firebase/firestore';
import { BIBLE_BOOKS } from '../data/books';
import readingPlan from '../data/reading-plan.json';

const PERIOD_COLORS = {
  "Early World": "#00B4D8",
  "Patriarchs": "#9E2A2B",
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

// Lightweight custom canvas confetti particle launcher
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#E5C158', '#00B4D8', '#9E2A2B', '#D90429', '#38B000', '#7209B7'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.015;

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
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  animate();
}

export default function ProgressMatrix() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Progress states
  const [completedDays, setCompletedDays] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Modal day details state
  const [selectedDayNum, setSelectedDayNum] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [quickNoteStatus, setQuickNoteStatus] = useState(null); // 'saving' | 'saved'

  // Listen to completed days progress document (with auto-initialization write to bypass old security rules)
  useEffect(() => {
    if (!currentUser) return;
    
    const progressDocRef = doc(db, 'userProgress', currentUser.uid);
    let unsubscribe = null;
    let isMounted = true;

    // Write empty progress shell if missing so the document exists and rules are satisfied
    setDoc(progressDocRef, { userId: currentUser.uid }, { merge: true })
      .then(() => {
        if (!isMounted) return;
        unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCompletedDays(docSnap.data().completedDays || []);
          } else {
            setCompletedDays([]);
          }
          setLoadingProgress(false);
        }, (err) => {
          console.error("Firestore progress stream error:", err);
          setLoadingProgress(false);
        });
      })
      .catch((err) => {
        console.error("Error initializing progress document:", err);
        if (isMounted) setLoadingProgress(false);
      });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Listen to all user reflections notes
  useEffect(() => {
    if (!currentUser) return;
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserNotes(fetchedNotes);
    });
    return unsubscribe;
  }, [currentUser]);

  // Group days by theological epoch period
  const epochs = {};
  readingPlan.forEach(day => {
    if (!epochs[day.period]) {
      epochs[day.period] = [];
    }
    epochs[day.period].push(day);
  });

  const totalCompleted = completedDays.length;
  const progressPercent = ((totalCompleted / 365) * 100).toFixed(1);

  // Set of day numbers with notes
  const daysWithNotes = new Set(userNotes.map(n => n.podcastDay).filter(Boolean));

  // Toggle completion of a day
  const handleToggleDay = async (dayNum) => {
    if (!currentUser) return;

    const isCompleted = completedDays.includes(dayNum);
    let updated;
    if (isCompleted) {
      updated = completedDays.filter(d => d !== dayNum);
    } else {
      updated = [...completedDays, dayNum];
      triggerConfetti();
    }

    try {
      const progressDocRef = doc(db, 'userProgress', currentUser.uid);
      await setDoc(progressDocRef, { 
        userId: currentUser.uid, 
        completedDays: updated 
      }, { merge: true });
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Add a quick note in the day detail modal
  const handleAddQuickNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedDayNum) return;

    setQuickNoteStatus('saving');
    const planEntry = readingPlan.find(d => d.day === selectedDayNum);
    const firstReading = planEntry?.readings[0];

    try {
      const notesRef = collection(db, 'notes');
      
      const notePayload = {
        userId: currentUser.uid,
        bookId: firstReading ? BIBLE_BOOKS.find(b => b.usfmCode === firstReading.bookId)?.id || firstReading.bookId.toLowerCase() : 'genesis',
        chapter: firstReading ? String(firstReading.startChapter) : '1',
        verse: null,
        text: newNoteText,
        podcastDay: selectedDayNum,
        createdAt: Date.now()
      };

      await addDoc(notesRef, notePayload);

      setNewNoteText('');
      setQuickNoteStatus('saved');
      setTimeout(() => setQuickNoteStatus(null), 2000);
    } catch (err) {
      console.error("Error adding quick note:", err);
      setQuickNoteStatus(null);
    }
  };

  // Get details of selected day
  const selectedDayInfo = selectedDayNum ? readingPlan.find(d => d.day === selectedDayNum) : null;
  const selectedDayNotes = selectedDayNum ? userNotes.filter(n => n.podcastDay === selectedDayNum) : [];

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #101418 0%, #080A0C 100%)',
      padding: '40px 24px',
      color: 'var(--text-ivory)',
    }}>
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 32px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderBottom: '1px solid rgba(229, 193, 88, 0.1)',
        paddingBottom: '24px',
      }}>
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/')}
          style={{
            alignSelf: 'flex-start',
            background: 'none',
            border: 'none',
            color: 'var(--color-sacred-gold)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              color: 'var(--color-sacred-gold)',
              letterSpacing: '0.02em',
              marginBottom: '6px',
            }}>
              Progress Matrix
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-slate)' }}>
              Chronological Bible in a Year study tracker arranged by salvation history epochs.
            </p>
          </div>

          {/* Overall Progress Card */}
          <div className="glass-panel" style={{
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(229, 193, 88, 0.15)',
            borderRadius: '12px',
            minWidth: '280px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-slate)' }}>Total Progress:</span>
              <strong style={{ color: 'var(--color-sacred-gold)' }}>{totalCompleted} / 365 Days</strong>
            </div>
            
            {/* Progress Bar Container */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              height: '8px',
              width: '100%',
              overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                background: 'linear-gradient(90deg, var(--color-sacred-gold) 0%, #F59E0B 100%)',
                height: '100%',
                width: `${progressPercent}%`,
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 8px rgba(229, 193, 88, 0.5)',
              }} />
            </div>
            
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'right' }}>
              {progressPercent}% Complete
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {loadingProgress ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)' }}>
            Loading progress schema...
          </div>
        ) : (
          Object.entries(epochs).map(([periodName, days]) => {
            const periodColor = PERIOD_COLORS[periodName] || 'var(--color-sacred-gold)';
            
            // Calculate completed percentage for this epoch
            const epochCompleted = days.filter(d => completedDays.includes(d.day)).length;
            const epochTotal = days.length;
            const epochPercent = ((epochCompleted / epochTotal) * 100).toFixed(0);

            return (
              <section 
                key={periodName}
                style={{
                  borderLeft: `3px solid ${periodColor}`,
                  paddingLeft: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Epoch Title Block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '20px',
                      color: periodColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      {periodName}
                    </h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      Days {days[0].day} – {days[days.length - 1].day}
                    </span>
                  </div>
                  
                  {/* Mini-epoch progress marker */}
                  <span style={{
                    fontSize: '12px',
                    background: `${periodColor}15`,
                    color: periodColor === '#F7F5F0' ? 'var(--text-ivory)' : periodColor,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    border: `1px solid ${periodColor}30`,
                  }}>
                    {epochCompleted} / {epochTotal} Completed ({epochPercent}%)
                  </span>
                </div>

                {/* Grid of Days */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
                  gap: '10px',
                }}>
                  {days.map(day => {
                    const isCompleted = completedDays.includes(day.day);
                    const hasNotes = daysWithNotes.has(day.day);
                    
                    return (
                      <div
                        key={day.day}
                        onClick={() => setSelectedDayNum(day.day)}
                        className="glass-panel-interactive"
                        style={{
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          background: isCompleted ? periodColor : 'rgba(255, 255, 255, 0.02)',
                          border: isCompleted ? 'none' : `1px solid rgba(255, 255, 255, 0.08)`,
                          color: isCompleted ? 'var(--bg-midnight)' : 'var(--text-slate)',
                          transition: 'all 0.2s ease',
                          boxShadow: isCompleted ? `0 0 12px ${periodColor}40` : 'none',
                        }}
                      >
                        {day.day}
                        {hasNotes && (
                          <span style={{
                            position: 'absolute',
                            top: '2px',
                            right: '4px',
                            fontSize: '9px',
                            color: isCompleted ? 'rgba(8, 10, 12, 0.6)' : 'var(--color-sacred-gold)',
                          }}>
                            ★
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Day Overview Modal */}
      {selectedDayInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 7, 9, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '24px',
        }} onClick={() => setSelectedDayNum(null)}>
          <div 
            className="glass-panel fade-in" 
            style={{
              maxWidth: '540px',
              width: '100%',
              background: 'var(--bg-deep-charcoal)',
              border: `1px solid ${PERIOD_COLORS[selectedDayInfo.period]}40`,
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: `0 0 30px ${PERIOD_COLORS[selectedDayInfo.period]}20`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  background: `${PERIOD_COLORS[selectedDayInfo.period]}20`,
                  color: selectedDayInfo.period === 'The Church' ? 'var(--text-ivory)' : PERIOD_COLORS[selectedDayInfo.period],
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: `1px solid ${PERIOD_COLORS[selectedDayInfo.period]}40`,
                }}>
                  {selectedDayInfo.period}
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  color: 'var(--color-sacred-gold)',
                  marginTop: '10px',
                }}>
                  Day {selectedDayInfo.day}: {selectedDayInfo.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDayNum(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-slate)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Readings list */}
            <div>
              <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Today's Readings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedDayInfo.readings.map((r, idx) => {
                  const book = BIBLE_BOOKS.find(b => b.usfmCode === r.bookId);
                  const label = book ? `${book.name} ${r.startChapter}${r.endChapter !== r.startChapter ? `-${r.endChapter}` : ''}` : `${r.bookId} ${r.startChapter}`;
                  return (
                    <div 
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-ivory)',
                      }}
                    >
                      📖 {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Panel */}
            <div style={{
              display: 'flex',
              gap: '12px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '16px 0',
              alignItems: 'center',
            }}>
              {/* Mark Completed Button */}
              <button
                onClick={() => handleToggleDay(selectedDayInfo.day)}
                className={completedDays.includes(selectedDayInfo.day) ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {completedDays.includes(selectedDayInfo.day) ? (
                  <>✓ Completed</>
                ) : (
                  <>⚪ Mark Completed</>
                )}
              </button>

              {/* Open in Reader Button */}
              <button
                onClick={() => {
                  setSelectedDayNum(null);
                  navigate(`/reader?day=${selectedDayInfo.day}`);
                }}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderColor: 'rgba(229, 193, 88, 0.3)',
                  color: 'var(--color-sacred-gold)',
                }}
              >
                Open Reader →
              </button>
            </div>

            {/* Quick Reflections Journal Section */}
            <div>
              <h4 style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Your Day {selectedDayInfo.day} Reflections
              </h4>
              
              {/* Logged reflections list */}
              <div style={{
                maxHeight: '130px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '12px',
                paddingRight: '4px',
              }}>
                {selectedDayNotes.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic', padding: '6px 0' }}>
                    No reflections logged for this day yet.
                  </p>
                ) : (
                  selectedDayNotes.map(n => (
                    <div 
                      key={n.id}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(229, 193, 88, 0.08)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--text-slate)',
                        lineHeight: '1.4',
                      }}
                    >
                      <strong style={{ color: 'var(--color-sacred-gold)', fontSize: '10px', display: 'block', marginBottom: '2px' }}>
                        {BIBLE_BOOKS.find(b => b.id === n.bookId)?.name || n.bookId} {n.chapter}{n.verse ? `:${n.verse}` : ''}
                      </strong>
                      {n.text}
                    </div>
                  ))
                )}
              </div>

              {/* Quick note addition form */}
              <form onSubmit={handleAddQuickNote} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Jot down a quick thought..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(229, 193, 88, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--text-ivory)',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim() || quickNoteStatus === 'saving'}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {quickNoteStatus === 'saving' ? 'Saving...' : 'Add'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
