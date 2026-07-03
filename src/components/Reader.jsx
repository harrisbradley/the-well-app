import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BIBLE_BOOKS, CATEGORIES } from '../data/books';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';

export default function Reader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Selected Book and Chapter
  const [activeBook, setActiveBook] = useState(BIBLE_BOOKS[0]); // Default to Genesis
  const [activeChapter, setActiveChapter] = useState('1');
  
  // Scripture Content States
  const [verses, setVerses] = useState({});
  const [bookCache, setBookCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Annotations / Notes States
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteVerse, setNewNoteVerse] = useState(''); // Empty string means "Chapter Note"
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Layout & Mode States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesPanelOpen, setNotesPanelOpen] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [ascensionMode, setAscensionMode] = useState(false); // Toggle Ascension Press Companion Mode

  // Category navigation state
  const [expandedCategories, setExpandedCategories] = useState({
    'Pentateuch': true,
    'Historical': false,
    'Wisdom': false,
    'Prophets': false,
    'Gospels & Acts': false,
    'Epistles & Revelation': false
  });

  const scrollContainerRef = useRef(null);

  // Toggle Category Expand/Collapse
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Fetch and Cache Scripture JSON
  useEffect(() => {
    if (!activeBook || ascensionMode) return; // Skip fetching text if in Ascension mode
    const cacheKey = activeBook.id;

    if (bookCache[cacheKey]) {
      setVerses(bookCache[cacheKey][activeChapter] || {});
      return;
    }

    setLoading(true);
    setError(null);

    const url = `https://raw.githubusercontent.com/xxruyle/Bible-DouayRheims/main/Douay-Rheims/${encodeURIComponent(activeBook.filename)}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Network error loading text.');
        return res.json();
      })
      .then(data => {
        setBookCache(prev => ({ ...prev, [cacheKey]: data }));
        setVerses(data[activeChapter] || {});
        setLoading(false);
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      })
      .catch(err => {
        console.error(err);
        setError('Could not download scripture text. Please check your internet connection.');
        setLoading(false);
      });
  }, [activeBook, activeChapter, ascensionMode]);

  // Update local verses from cache in JSON mode when chapter shifts
  useEffect(() => {
    if (ascensionMode) return;
    const cacheKey = activeBook.id;
    if (bookCache[cacheKey]) {
      setVerses(bookCache[cacheKey][activeChapter] || {});
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [activeChapter, bookCache, ascensionMode, activeBook]);

  // Firestore Real-Time Notes Listener
  useEffect(() => {
    if (!currentUser || !activeBook) return;

    // Fetch notes matching userId, bookId, and chapter.
    // We sort client-side to avoid requiring the user to set up a composite index in Firestore.
    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', currentUser.uid),
      where('bookId', '==', activeBook.id),
      where('chapter', '==', activeChapter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort client-side: chapter notes first, then sorted by verse number numerically, then by creation date
      const sortedNotes = fetchedNotes.sort((a, b) => {
        const verseA = a.verse ? parseInt(a.verse, 10) : 0;
        const verseB = b.verse ? parseInt(b.verse, 10) : 0;
        
        if (verseA !== verseB) {
          return verseA - verseB;
        }
        
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      setNotes(sortedNotes);
    }, (err) => {
      console.error("Firestore notes stream error:", err);
    });

    return unsubscribe;
  }, [currentUser, activeBook, activeChapter]);

  // Note CRUD handlers
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      const notesRef = collection(db, 'notes');
      await addDoc(notesRef, {
        userId: currentUser.uid,
        bookId: activeBook.id,
        chapter: activeChapter,
        verse: newNoteVerse.trim() || null,
        text: newNoteText,
        createdAt: Date.now()
      });

      setNewNoteText('');
      setNewNoteVerse('');
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const handleUpdateNote = async (id) => {
    if (!editingText.trim()) return;

    try {
      const noteDocRef = doc(db, 'notes', id);
      await updateDoc(noteDocRef, {
        text: editingText,
        updatedAt: Date.now()
      });
      setEditingNoteId(null);
      setEditingText('');
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reflection?")) return;

    try {
      const noteDocRef = doc(db, 'notes', id);
      await deleteDoc(noteDocRef);
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleBookChange = (book) => {
    setActiveBook(book);
    setActiveChapter('1');
  };

  const handleChapterChange = (chapterNum) => {
    setActiveChapter(String(chapterNum));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const nextChapter = () => {
    const nextNum = parseInt(activeChapter, 10) + 1;
    if (nextNum <= activeBook.chapters) {
      setActiveChapter(String(nextNum));
    }
  };

  const prevChapter = () => {
    const prevNum = parseInt(activeChapter, 10) - 1;
    if (prevNum >= 1) {
      setActiveChapter(String(prevNum));
    }
  };

  const chaptersList = Array.from({ length: activeBook.chapters }, (_, i) => i + 1);

  // Ascension Press Bible URL generator
  const ascensionUrl = `https://app.ascensionpress.com/bible/books/${activeBook.ascensionCode}/${activeChapter}`;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-midnight)',
      color: 'var(--text-ivory)',
    }}>
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside style={{
        width: sidebarOpen && !distractionFree ? '320px' : '0px',
        opacity: sidebarOpen && !distractionFree ? 1 : 0,
        transform: sidebarOpen && !distractionFree ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'width var(--transition-normal), opacity var(--transition-normal), transform var(--transition-normal)',
        borderRight: sidebarOpen && !distractionFree ? '1px solid rgba(229, 193, 88, 0.12)' : 'none',
        background: 'var(--bg-deep-charcoal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 5,
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(229, 193, 88, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg 
              width="24" 
              height="24" 
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
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              color: 'var(--color-sacred-gold)',
              fontWeight: 600,
            }}>
              The Well Reader
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-slate)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Books List Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {CATEGORIES.map(category => {
            const isExpanded = expandedCategories[category];
            const categoryBooks = BIBLE_BOOKS.filter(b => b.category === category);
            
            return (
              <div key={category} style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => toggleCategory(category)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-sacred-gold)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    textAlign: 'left',
                  }}
                >
                  <span>{category}</span>
                  <span style={{ fontSize: '10px' }}>{isExpanded ? '▲' : '▼'}</span>
                </button>

                <div style={{
                  height: isExpanded ? 'auto' : '0px',
                  opacity: isExpanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'opacity 0.2s ease',
                  paddingLeft: '8px',
                  marginTop: '4px',
                }}>
                  {isExpanded && categoryBooks.map(book => {
                    const isSelected = activeBook.id === book.id;
                    return (
                      <button
                        key={book.id}
                        onClick={() => handleBookChange(book)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          background: isSelected ? 'rgba(229, 193, 88, 0.12)' : 'transparent',
                          border: 'none',
                          borderLeft: isSelected ? '2px solid var(--color-sacred-gold)' : '2px solid transparent',
                          color: isSelected ? 'var(--color-sacred-gold)' : 'var(--text-slate)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          borderRadius: '0 4px 4px 0',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {book.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(229, 193, 88, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
            {currentUser?.email}
          </span>
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. CENTER READING WORKSPACE */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        
        {/* Reading Header Toolbar */}
        {!distractionFree && (
          <header style={{
            height: '64px',
            borderBottom: '1px solid rgba(229, 193, 88, 0.12)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
            zIndex: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(229, 193, 88, 0.2)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: 'var(--color-sacred-gold)',
                    cursor: 'pointer',
                  }}
                >
                  ☰ Books
                </button>
              )}

              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                color: 'var(--color-sacred-gold)',
              }}>
                {activeBook.name} {activeChapter}
              </h2>
            </div>

            {/* Middle Toolbar Toggles: Reading Mode vs Ascension Companion Mode */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(8, 10, 12, 0.6)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(229, 193, 88, 0.1)' }}>
              <button
                onClick={() => setAscensionMode(false)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: !ascensionMode ? 'var(--color-sacred-gold)' : 'transparent',
                  color: !ascensionMode ? 'var(--bg-midnight)' : 'var(--text-slate)',
                  transition: 'all 0.2s',
                }}
              >
                Read Translation
              </button>
              <button
                onClick={() => setAscensionMode(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: ascensionMode ? 'var(--color-sacred-gold)' : 'transparent',
                  color: ascensionMode ? 'var(--bg-midnight)' : 'var(--text-slate)',
                  transition: 'all 0.2s',
                }}
              >
                Ascension Companion
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Font Sizers - Only visible when reading inline text */}
              {!ascensionMode && (
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <button 
                    onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                    style={{ padding: '6px 12px', border: 'none', background: 'transparent', color: 'var(--text-slate)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    A-
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', padding: '0 4px' }}>{fontSize}px</span>
                  <button 
                    onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
                    style={{ padding: '6px 12px', border: 'none', background: 'transparent', color: 'var(--text-slate)', cursor: 'pointer', fontSize: '13px' }}
                  >
                    A+
                  </button>
                </div>
              )}

              {/* Reflections toggle button */}
              <button
                onClick={() => setNotesPanelOpen(prev => !prev)}
                style={{
                  background: notesPanelOpen ? 'rgba(229, 193, 88, 0.15)' : 'transparent',
                  border: '1px solid rgba(229, 193, 88, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: 'var(--color-sacred-gold)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                📝 Reflections {notes.length > 0 ? `(${notes.length})` : ''}
              </button>

              <button
                onClick={() => setDistractionFree(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(229, 193, 88, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: 'var(--color-sacred-gold)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Focus Mode
              </button>
            </div>
          </header>
        )}

        {/* Exit Focus Floating Button */}
        {distractionFree && (
          <button
            onClick={() => setDistractionFree(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(20, 26, 32, 0.8)',
              border: '1px solid var(--color-card-border-focus)',
              borderRadius: '20px',
              padding: '8px 18px',
              color: 'var(--color-sacred-gold)',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: 'var(--shadow-glass)',
            }}
          >
            ✕ Exit Focus
          </button>
        )}

        {/* Chapter Selection Ribbon */}
        {!distractionFree && (
          <div style={{
            background: 'var(--bg-deep-charcoal)',
            borderBottom: '1px solid rgba(229, 193, 88, 0.08)',
            padding: '8px 24px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            {chaptersList.map(chapNum => {
              const chapStr = String(chapNum);
              const isActive = activeChapter === chapStr;
              return (
                <button
                  key={chapNum}
                  onClick={() => handleChapterChange(chapNum)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isActive ? 'var(--color-sacred-gold)' : 'transparent',
                    color: isActive ? 'var(--text-slate)' : 'var(--text-slate)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chapNum}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. CENTER VIEWPORT CONTENT */}
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: distractionFree ? '64px 24px' : '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: distractionFree ? '#06080A' : 'var(--bg-midnight)',
            transition: 'background-color var(--transition-slow)',
          }}
        >
          {ascensionMode ? (
            /* Mode B: Ascension Press Companion Mode */
            <div className="fade-in" style={{
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
              paddingTop: '40px',
              paddingBottom: '80px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(229, 193, 88, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(229, 193, 88, 0.2)',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-sacred-gold)" strokeWidth="1.2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--color-sacred-gold)', marginBottom: '12px' }}>
                Ascension Companion
              </h1>
              <p style={{ color: 'var(--text-slate)', fontSize: '15px', lineHeight: 1.6, marginBottom: '40px' }}>
                Open this chapter directly on the **Ascension Press Bible App** to read along with the Great Adventure timeline notes. Any notes you log in the right-side Reflections panel will be automatically linked to this chapter context!
              </p>

              {/* Big Launcher Button */}
              <a 
                href={ascensionUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '18px 36px',
                  fontSize: '16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(229, 193, 88, 0.2)',
                  marginBottom: '48px',
                }}
              >
                <span>Read {activeBook.name} {activeChapter} on Ascension ↗</span>
              </a>

              {/* Chapter Steppers */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={prevChapter}
                  disabled={activeChapter === '1'}
                  style={{ opacity: activeChapter === '1' ? 0.4 : 1 }}
                >
                  ← Previous Chapter
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={nextChapter}
                  disabled={parseInt(activeChapter, 10) >= activeBook.chapters}
                  style={{ opacity: parseInt(activeChapter, 10) >= activeBook.chapters ? 0.4 : 1 }}
                >
                  Next Chapter →
                </button>
              </div>

              {/* Windows Tiling Tip */}
              <div className="glass-panel" style={{
                padding: '20px',
                background: 'rgba(20, 26, 32, 0.4)',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-ivory)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💡 Homelab Tip: Side-by-Side Reading
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-slate)', lineHeight: 1.5 }}>
                  Use Windows snapping to tile your browser windows! Click and drag the Ascension Press tab to the left edge of your screen, and snap The Well App to the right side to type reflections in real-time as you read.
                </p>
              </div>
            </div>
          ) : (
            /* Mode A: Default Douay-Rheims Scripture Reader Column */
            <div style={{
              maxWidth: '680px',
              width: '100%',
            }}>
              {loading && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  gap: '16px',
                }}>
                  <div className="pulse-gold" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-sacred-gold)',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>Downloading scriptures...</p>
                </div>
              )}

              {error && !loading && (
                <div className="glass-panel" style={{
                  padding: '24px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#FCA5A5',
                  textAlign: 'center',
                  margin: '40px 0',
                }}>
                  <p style={{ fontSize: '15px', marginBottom: '16px' }}>{error}</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleBookChange(activeBook)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Retry Load
                  </button>
                </div>
              )}

              {!loading && !error && (
                <div className="fade-in" style={{ paddingBottom: '120px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--color-sacred-gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '8px',
                    }}>
                      {activeBook.name}
                    </p>
                    <h1 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '44px',
                      color: 'var(--text-ivory)',
                      fontWeight: 600,
                    }}>
                      Chapter {activeChapter}
                    </h1>
                    <hr style={{
                      width: '40px',
                      margin: '16px auto 0 auto',
                      border: 'none',
                      borderTop: '2px solid var(--color-sacred-gold)',
                      opacity: 0.7,
                    }} />
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.85',
                    color: '#ECE8E1',
                    textAlign: 'justify',
                  }}>
                    {Object.entries(verses).map(([verseNum, text]) => {
                      const cleanText = text.replace(/^\*/, '');
                      return (
                        <span key={verseNum} style={{ marginRight: '8px' }}>
                          <sup style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.6em',
                            fontWeight: 700,
                            color: 'var(--color-sacred-gold)',
                            marginRight: '4px',
                            verticalAlign: 'super',
                          }}>
                            {verseNum}
                          </sup>
                          {cleanText}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* 3. RIGHT SIDEBAR: REFLECTIONS & NOTE STACKING */}
      <aside style={{
        width: notesPanelOpen && !distractionFree ? '360px' : '0px',
        opacity: notesPanelOpen && !distractionFree ? 1 : 0,
        transform: notesPanelOpen && !distractionFree ? 'translateX(0)' : 'translateX(100%)',
        transition: 'width var(--transition-normal), opacity var(--transition-normal), transform var(--transition-normal)',
        borderLeft: notesPanelOpen && !distractionFree ? '1px solid rgba(229, 193, 88, 0.12)' : 'none',
        background: 'var(--bg-deep-charcoal)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 5,
      }}>
        {/* Reflections Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(229, 193, 88, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              color: 'var(--color-sacred-gold)',
              fontWeight: 600,
            }}>
              Reflections
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
              {activeBook.name} {activeChapter}
            </p>
          </div>
          <button 
            onClick={() => setNotesPanelOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-slate)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Notes Timeline Stack */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {notes.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-dim)',
              textAlign: 'center',
              padding: '40px 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <p style={{ fontSize: '13px' }}>No reflections logged for this chapter yet.</p>
              <p style={{ fontSize: '11px', marginTop: '6px' }}>Type in the field below to catalog your study notes.</p>
            </div>
          ) : (
            notes.map(note => {
              const isEditing = editingNoteId === note.id;
              return (
                <div 
                  key={note.id} 
                  className="glass-panel" 
                  style={{
                    padding: '16px',
                    background: 'rgba(8, 10, 12, 0.4)',
                    border: '1px solid rgba(229, 193, 88, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Note Header Metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--color-sacred-gold)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {note.verse ? `Verse ${note.verse}` : 'Chapter Note'}
                    </span>
                    
                    {/* Action Controls */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingText(note.text);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-slate)', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{ background: 'none', border: 'none', color: '#FCA5A5', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note Body Text */}
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea
                        className="input-field"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        style={{ minHeight: '80px', fontSize: '13px', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setEditingNoteId(null)}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateNote(note.id)}
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-ivory)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.5',
                    }}>
                      {note.text}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Note Creator Input Form */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(229, 193, 88, 0.1)',
          background: 'rgba(8, 10, 12, 0.6)'
        }}>
          <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="input-label" style={{ margin: 0, fontSize: '11px' }}>Verse Scope:</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 5, or leave blank"
                value={newNoteVerse}
                onChange={(e) => setNewNoteVerse(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ width: '130px', padding: '6px 10px', fontSize: '12px' }}
              />
            </div>

            <textarea
              className="input-field"
              placeholder={`Write note for ${activeBook.name} ${activeChapter}...`}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              style={{ minHeight: '100px', fontSize: '13px', resize: 'none' }}
              required
            />

            <button 
              className="btn btn-primary" 
              type="submit" 
              style={{ width: '100%', padding: '10px' }}
            >
              Add Reflection
            </button>
          </form>
        </div>
      </aside>

      {/* Embedded Spin Animation keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
