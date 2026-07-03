import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BIBLE_BOOKS, CATEGORIES } from '../data/books';
import { useAuth } from '../context/AuthContext';

export default function Reader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Selected Book and Chapter
  const [activeBook, setActiveBook] = useState(BIBLE_BOOKS[0]); // Default to Genesis
  const [activeChapter, setActiveChapter] = useState('1');
  
  // Verse and Cache states
  const [verses, setVerses] = useState({});
  const [bookCache, setBookCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default 18px

  // UI state for book list navigation
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
    if (!activeBook) return;
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
        // Scroll reading panel to top when changing book
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      })
      .catch(err => {
        console.error(err);
        setError('Could not download scripture text. Please check your internet connection.');
        setLoading(false);
      });
  }, [activeBook]);

  // Update verses locally when chapter changes (utilizing cached book data)
  useEffect(() => {
    const cacheKey = activeBook.id;
    if (bookCache[cacheKey]) {
      setVerses(bookCache[cacheKey][activeChapter] || {});
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [activeChapter, bookCache]);

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

  // Helper list for chapters rendering
  const chaptersList = Array.from({ length: activeBook.chapters }, (_, i) => i + 1);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-midnight)',
      color: 'var(--text-ivory)',
    }}>
      
      {/* 1. SIDEBAR NAVIGATION - Hides completely in distractionFree mode or on mobile if closed */}
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
                {/* Category Header */}
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

                {/* Category Books List */}
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

        {/* User Info / Logout Footer */}
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

      {/* 2. MAIN READING WORKSPACE */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        
        {/* Reading Header Toolbar (Control Panel) */}
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
              {/* Sidebar toggle button (hamburger) */}
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

              {/* Title & Location indicator */}
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                color: 'var(--color-sacred-gold)',
              }}>
                {activeBook.name} {activeChapter}
              </h2>
            </div>

            {/* Typography and Reading Mode controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Font Sizers */}
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

              {/* Distraction Free Button */}
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
                  transition: 'all var(--transition-fast)',
                }}
                title="Enter distraction-free mode"
              >
                Focus Mode
              </button>
            </div>
          </header>
        )}

        {/* Floating Focus Mode exit control button (Only visible in focus mode) */}
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
              transition: 'opacity 0.2s',
            }}
          >
            ✕ Exit Focus
          </button>
        )}

        {/* Chapter Selection Ribbon (horizontal list) */}
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
                    color: isActive ? 'var(--bg-midnight)' : 'var(--text-slate)',
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

        {/* 3. SCRIPTURE TEXT VIEWER COLUMN */}
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: distractionFree ? '64px 24px' : '40px 24px',
            display: 'flex',
            justifyContent: 'center',
            background: distractionFree ? '#06080A' : 'var(--bg-midnight)',
            transition: 'background-color var(--transition-slow)',
          }}
        >
          <div style={{
            maxWidth: '680px',
            width: '100%',
          }}>
            {/* Loading Indicator */}
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

            {/* Error Message */}
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

            {/* Scripture Verse Column */}
            {!loading && !error && (
              <div className="fade-in" style={{ paddingBottom: '120px' }}>
                {/* Chapter Heading decoration */}
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

                {/* Verses Renders */}
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.85',
                  color: '#ECE8E1', /* Traditional book-ish warm color */
                  textAlign: 'justify',
                }}>
                  {Object.entries(verses).map(([verseNum, text]) => {
                    // Strip starting asterisks if any, or render them cleanly
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
        </div>

      </main>

      {/* Embedded Spin Animation keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
