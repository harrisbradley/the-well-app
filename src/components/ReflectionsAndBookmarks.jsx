import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { BIBLE_BOOKS } from '../data/books';
import { getDaysForVerse, getReadingsForDay } from '../data/planHelper';
import { getVersesFromCitation } from '../data/liturgicalHelper';

const LITURGICAL_COLOR_MAP = {
  green: '#2D6A4F',
  white: '#E5C158',
  red: '#D90429',
  purple: '#7209B7',
  rose: '#D47391'
};

// Parse a verse range string (e.g. "5-7, 9") into an array of verse number strings
function parseVerseRange(rangeStr, maxVerses = 200) {
  if (!rangeStr) return [];
  const versesSet = new Set();
  const parts = String(rangeStr).split(',');

  parts.forEach(part => {
    const cleanPart = part.trim();
    if (!cleanPart) return;

    if (cleanPart.includes('-')) {
      const [startStr, endStr] = cleanPart.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= Math.min(max, maxVerses); i++) {
          versesSet.add(String(i));
        }
      }
    } else {
      const val = parseInt(cleanPart, 10);
      if (!Number.isNaN(val)) {
        versesSet.add(String(val));
      }
    }
  });

  return Array.from(versesSet);
}

// Strip custom transcription tags ([HEADING], [POETRY], [POETRY_INDENT]) for clean excerpt display
function cleanScriptureText(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/\[HEADING\].*?\[\/HEADING\]/g, ' ')
    .replace(/\[\/?POETRY_INDENT\]/g, ' ')
    .replace(/\[\/?POETRY\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTimestamp(ms) {
  if (!ms) return '';
  try {
    return new Date(ms).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

export default function ReflectionsAndBookmarks() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & Search States initialized from URL query params if present
  const [viewMode, setViewMode] = useState(() => searchParams.get('tab') || 'all'); // 'all' | 'favorites' | 'notes'
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'verse' | 'chapter' | 'day' | 'gospel'
  const [bookFilter, setBookFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'canonical'
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore Collections States
  const [notes, setNotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [customChapters, setCustomChapters] = useState({});
  const [bookCache, setBookCache] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  // Inline Note Editing States
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingNoteId, setSavingNoteId] = useState(null);

  // Sync tab selection with URL parameter
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const nextParams = new URLSearchParams(searchParams);
    if (mode === 'all') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', mode);
    }
    setSearchParams(nextParams, { replace: true });
  };

  // 1. Subscribe to User's Notes, Favorites, and Custom Scriptures
  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setFavorites([]);
      setCustomChapters({});
      setLoadingData(false);
      return;
    }

    let notesLoaded = false;
    let favsLoaded = false;

    const checkLoaded = () => {
      if (notesLoaded && favsLoaded) {
        setLoadingData(false);
      }
    };

    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', currentUser.uid)
    );
    const unsubNotes = onSnapshot(
      notesQuery,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotes(list);
        notesLoaded = true;
        checkLoaded();
      },
      (err) => {
        console.error('Error loading notes:', err);
        notesLoaded = true;
        checkLoaded();
      }
    );

    const favsQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', currentUser.uid)
    );
    const unsubFavs = onSnapshot(
      favsQuery,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFavorites(list);
        favsLoaded = true;
        checkLoaded();
      },
      (err) => {
        console.error('Error loading favorites:', err);
        favsLoaded = true;
        checkLoaded();
      }
    );

    const customQuery = query(
      collection(db, 'customScriptures'),
      where('userId', '==', currentUser.uid)
    );
    const unsubCustom = onSnapshot(
      customQuery,
      (snap) => {
        const map = {};
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.bookId && data.chapter && data.verses) {
            map[`${data.bookId}_${data.chapter}`] = data.verses;
          }
        });
        setCustomChapters(map);
      },
      (err) => {
        console.error('Error loading custom scriptures:', err);
      }
    );

    return () => {
      unsubNotes();
      unsubFavs();
      unsubCustom();
    };
  }, [currentUser]);

  // 2. Automatically fetch Douay-Rheims JSON for any books referenced in notes or favorites
  useEffect(() => {
    const referencedBookIds = new Set();
    favorites.forEach(f => {
      if (f.bookId) referencedBookIds.add(f.bookId);
    });
    notes.forEach(n => {
      if (n.bookId) referencedBookIds.add(n.bookId);
    });

    referencedBookIds.forEach(bookId => {
      if (bookCache[bookId]) return;
      const bookMeta = BIBLE_BOOKS.find(b => b.id === bookId);
      if (!bookMeta) return;

      fetch(`/douay-rheims/${encodeURIComponent(bookMeta.filename)}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch ${bookMeta.filename}`);
          return res.json();
        })
        .then(data => {
          setBookCache(prev => ({ ...prev, [bookId]: data }));
        })
        .catch(err => {
          console.error(`Error fetching scripture for ${bookId}:`, err);
        });
    });
  }, [favorites, notes, bookCache]);

  // Helper to resolve verse text for a given bookId, chapter, and verse range string
  const resolveVersePassage = useMemo(() => {
    return (bookId, chapter, verseRangeStr, gospelCitation = null) => {
      if (!bookId || !chapter) return { versesList: [], translation: null };

      const chKey = String(chapter);
      const customChapterVerses = customChapters[`${bookId}_${chKey}`];
      const drChapterVerses = bookCache[bookId]?.[chKey];
      const activeVerseMap = customChapterVerses || drChapterVerses;
      const translation = customChapterVerses
        ? 'RSV-CE Copy'
        : drChapterVerses
          ? 'Douay-Rheims'
          : null;

      if (!activeVerseMap) {
        return { versesList: [], translation: null };
      }

      let targetVerses = parseVerseRange(verseRangeStr);

      // If no explicit verse range on a Gospel note, derive verses from its liturgical citation
      if (targetVerses.length === 0 && gospelCitation) {
        const parsedCit = getVersesFromCitation(gospelCitation, bookId);
        const chSet = parsedCit?.chapters?.[chKey];
        if (chSet && chSet.size > 0) {
          targetVerses = Array.from(chSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        }
      }

      const versesList = targetVerses
        .map(vNum => {
          const raw = activeVerseMap[String(vNum)];
          if (!raw) return null;
          return {
            num: String(vNum),
            text: cleanScriptureText(raw)
          };
        })
        .filter(Boolean);

      return { versesList, translation };
    };
  }, [customChapters, bookCache]);

  // 3. Build unified, enriched items list
  const enrichedItems = useMemo(() => {
    const bookIndexMap = new Map(BIBLE_BOOKS.map((b, idx) => [b.id, idx]));

    const favItems = favorites.map(fav => {
      const bookMeta = BIBLE_BOOKS.find(b => b.id === fav.bookId);
      const { versesList, translation } = resolveVersePassage(fav.bookId, fav.chapter, fav.verse);
      const parsedNums = parseVerseRange(fav.verse);
      const firstVerseNum = parsedNums.length > 0 ? parseInt(parsedNums[0], 10) : 1;
      const matchingDays = bookMeta
        ? getDaysForVerse(`${bookMeta.usfmCode}.${fav.chapter}`)
        : [];

      return {
        uid: `fav_${fav.id}`,
        id: fav.id,
        itemType: 'favorite',
        scopeType: 'bookmark',
        bookId: fav.bookId,
        bookName: bookMeta?.name || fav.bookId,
        bookOrder: bookIndexMap.get(fav.bookId) ?? 999,
        chapter: String(fav.chapter || '1'),
        chapterNum: parseInt(fav.chapter || '1', 10),
        verse: fav.verse,
        firstVerseNum,
        versesList,
        translation,
        matchingDays,
        createdAt: fav.createdAt || 0,
        raw: fav
      };
    });

    const noteItems = notes.map(note => {
      const bookMeta = BIBLE_BOOKS.find(b => b.id === note.bookId);
      let scopeType = 'verse';
      if (note.isGospelNote) scopeType = 'gospel';
      else if (note.isDayNote) scopeType = 'day';
      else if (!note.verse) scopeType = 'chapter';

      const shouldResolveVerses = Boolean(note.verse) || Boolean(note.isGospelNote && note.gospelCitation);
      const { versesList, translation } = shouldResolveVerses
        ? resolveVersePassage(note.bookId, note.chapter, note.verse, note.gospelCitation)
        : { versesList: [], translation: null };

      const parsedNums = parseVerseRange(note.verse);
      const firstVerseNum = parsedNums.length > 0 ? parseInt(parsedNums[0], 10) : 0;
      const matchingDays = note.podcastDay
        ? [note.podcastDay]
        : bookMeta && note.chapter
          ? getDaysForVerse(`${bookMeta.usfmCode}.${note.chapter}`)
          : [];

      return {
        uid: `note_${note.id}`,
        id: note.id,
        itemType: 'note',
        scopeType,
        bookId: note.bookId,
        bookName: bookMeta?.name || note.bookId || 'Scripture',
        bookOrder: bookIndexMap.get(note.bookId) ?? 999,
        chapter: String(note.chapter || '1'),
        chapterNum: parseInt(note.chapter || '1', 10),
        verse: note.verse,
        firstVerseNum,
        text: note.text || '',
        isDayNote: Boolean(note.isDayNote),
        podcastDay: note.podcastDay || null,
        isGospelNote: Boolean(note.isGospelNote),
        liturgicalDate: note.liturgicalDate || null,
        feastName: note.feastName || null,
        liturgicalColor: note.liturgicalColor || null,
        gospelCitation: note.gospelCitation || null,
        versesList,
        translation,
        matchingDays,
        createdAt: note.createdAt || 0,
        updatedAt: note.updatedAt || null,
        raw: note
      };
    });

    return [...favItems, ...noteItems];
  }, [favorites, notes, resolveVersePassage]);

  // Distinct books that currently have at least one note or favorite
  const activeBooksInCollection = useMemo(() => {
    const bookIds = new Set(enrichedItems.map(i => i.bookId).filter(Boolean));
    return BIBLE_BOOKS.filter(b => bookIds.has(b.id));
  }, [enrichedItems]);

  // 4. Filter and Sort Items
  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = enrichedItems.filter(item => {
      // View Mode filter
      if (viewMode === 'favorites' && item.itemType !== 'favorite') return false;
      if (viewMode === 'notes' && item.itemType !== 'note') return false;

      // Note Scope filter (when viewing notes or all)
      if (viewMode !== 'favorites' && scopeFilter !== 'all') {
        if (item.itemType === 'favorite') return false;
        if (item.scopeType !== scopeFilter) return false;
      }

      // Book filter
      if (bookFilter !== 'all' && item.bookId !== bookFilter) return false;

      // Keyword search
      if (q) {
        const refString = `${item.bookName} ${item.chapter}${item.verse ? `:${item.verse}` : ''}`.toLowerCase();
        const noteText = (item.text || '').toLowerCase();
        const verseText = item.versesList.map(v => v.text).join(' ').toLowerCase();
        const feastText = (item.feastName || '').toLowerCase();
        const citationText = (item.gospelCitation || '').toLowerCase();
        const dayText = item.matchingDays?.map(d => `day ${d}`).join(' ') || '';

        const matches =
          refString.includes(q) ||
          noteText.includes(q) ||
          verseText.includes(q) ||
          feastText.includes(q) ||
          citationText.includes(q) ||
          dayText.includes(q);

        if (!matches) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
      if (sortBy === 'canonical') {
        if (a.bookOrder !== b.bookOrder) return a.bookOrder - b.bookOrder;
        if (a.chapterNum !== b.chapterNum) return a.chapterNum - b.chapterNum;
        if (a.firstVerseNum !== b.firstVerseNum) return a.firstVerseNum - b.firstVerseNum;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      // Default: 'newest'
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [enrichedItems, viewMode, scopeFilter, bookFilter, sortBy, searchQuery]);

  // Navigation helper to jump straight into Reader context
  const handleOpenInReader = (item) => {
    if (item.itemType === 'note') {
      if (item.isGospelNote && item.liturgicalDate) {
        const verseSuffix = item.verse ? `&verse=${encodeURIComponent(item.verse)}` : '';
        navigate(`/reader?gospel=${encodeURIComponent(item.liturgicalDate)}${verseSuffix}`);
        return;
      }
      if (item.isDayNote && item.podcastDay) {
        navigate(`/reader?day=${item.podcastDay}`);
        return;
      }
    }

    const params = new URLSearchParams();
    if (item.bookId) params.set('book', item.bookId);
    if (item.chapter) params.set('chapter', item.chapter);
    if (item.verse) params.set('verse', item.verse);
    navigate(`/reader?${params.toString()}`);
  };

  // CRUD Handlers
  const handleRemoveFavorite = async (favId) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'favorites', favId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleSaveNoteEdit = async (noteId) => {
    if (!editingText.trim()) return;
    setSavingNoteId(noteId);
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        text: editingText.trim(),
        updatedAt: Date.now()
      });
      setEditingNoteId(null);
      setEditingText('');
    } catch (err) {
      console.error('Error updating reflection:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this reflection?')) return;
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (err) {
      console.error('Error deleting reflection:', err);
    }
  };

  // Summary counts
  const totalBookmarks = favorites.length;
  const totalNotes = notes.length;
  const totalBooksCovered = activeBooksInCollection.length;

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at center, #101418 0%, #080A0C 100%)',
        padding: '40px 24px',
        color: 'var(--text-ivory)'
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: '1100px',
          margin: '0 auto 28px auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderBottom: '1px solid rgba(229, 193, 88, 0.12)',
          paddingBottom: '24px'
        }}
      >
        {/* Top Navigation Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-sacred-gold)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: 0
            }}
          >
            ← Back to Dashboard
          </button>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/reader?gospel=today')}
              style={{
                background: 'rgba(229, 193, 88, 0.12)',
                border: '1px solid rgba(229, 193, 88, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: 'var(--color-sacred-gold)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              👑 Today&apos;s Gospel
            </button>
            <button
              type="button"
              onClick={() => navigate('/reader')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(229, 193, 88, 0.2)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: 'var(--color-sacred-gold)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Open Reader →
            </button>
            <button
              type="button"
              onClick={() => navigate('/matrix')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(229, 193, 88, 0.2)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: 'var(--text-slate)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Progress Matrix
            </button>
          </div>
        </div>

        {/* Title & Summary Counters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                color: 'var(--color-sacred-gold)',
                marginBottom: '6px'
              }}
            >
              Reflections &amp; Bookmarks
            </h1>
            <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
              Your personal treasury of favorited Scripture verses, study notes, and liturgical reflections.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div
              className="glass-panel"
              style={{
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px',
                border: '1px solid rgba(56, 189, 248, 0.25)'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-serif)' }}>
                {totalBookmarks}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⭐ Bookmarks
              </span>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px',
                border: '1px solid rgba(229, 193, 88, 0.25)'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-sacred-gold)', fontFamily: 'var(--font-serif)' }}>
                {totalNotes}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ✍️ Reflections
              </span>
            </div>

            <div
              className="glass-panel"
              style={{
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px'
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-ivory)', fontFamily: 'var(--font-serif)' }}>
                {totalBooksCovered}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📚 Books
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Filter & Search Control Bar */}
        <section
          aria-label="Filter and search controls"
          className="glass-panel"
          style={{
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Top Row: View Mode Tabs & Search Input */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            {/* Primary Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All (${totalBookmarks + totalNotes})` },
                { id: 'favorites', label: `⭐ Bookmarks (${totalBookmarks})` },
                { id: 'notes', label: `✍️ Reflections (${totalNotes})` }
              ].map(tab => {
                const active = viewMode === tab.id;
                const isFavTab = tab.id === 'favorites';
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleViewModeChange(tab.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: active
                        ? isFavTab
                          ? 'rgba(56, 189, 248, 0.2)'
                          : 'var(--color-sacred-gold)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: active
                        ? isFavTab
                          ? '#38BDF8'
                          : 'var(--bg-midnight)'
                        : 'var(--text-slate)',
                      border: active
                        ? isFavTab
                          ? '1px solid #38BDF8'
                          : '1px solid var(--color-sacred-gold)'
                        : '1px solid rgba(229, 193, 88, 0.15)'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
              <input
                type="search"
                className="input-field"
                placeholder="Search verses, reflections, books, feasts, or Day #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '9px 34px 9px 14px',
                  fontSize: '13px'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-slate)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Second Row: Sub-type pills, Book selector, Sort order */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(229, 193, 88, 0.08)'
            }}
          >
            {/* Scope Filter Pills (Hidden when strictly on Bookmarks tab) */}
            {viewMode !== 'favorites' ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>
                  Note Type:
                </span>
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'verse', label: '📖 Verse' },
                  { id: 'chapter', label: '📑 Chapter' },
                  { id: 'day', label: '🎙️ BIAY Day' },
                  { id: 'gospel', label: '👑 Daily Gospel' }
                ].map(scope => {
                  const isSelected = scopeFilter === scope.id;
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setScopeFilter(scope.id)}
                      style={{
                        background: isSelected ? 'rgba(229, 193, 88, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                        color: isSelected ? 'var(--color-sacred-gold)' : 'var(--text-slate)',
                        border: isSelected ? '1px solid var(--color-sacred-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {scope.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#38BDF8' }}>
                Showing all bookmarked Scripture passages with full verse text
              </div>
            )}

            {/* Book Filter & Sort Dropdowns */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="book-filter-select" style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Book:
                </label>
                <select
                  id="book-filter-select"
                  value={bookFilter}
                  onChange={(e) => setBookFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-deep-charcoal)',
                    border: '1px solid rgba(229, 193, 88, 0.25)',
                    borderRadius: '6px',
                    color: 'var(--text-ivory)',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Books ({activeBooksInCollection.length})</option>
                  {activeBooksInCollection.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor="sort-order-select" style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sort:
                </label>
                <select
                  id="sort-order-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'var(--bg-deep-charcoal)',
                    border: '1px solid rgba(229, 193, 88, 0.25)',
                    borderRadius: '6px',
                    color: 'var(--color-sacred-gold)',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="canonical">Canonical Order (Gen → Rev)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Screen-reader live status announcement for filter/sort updates */}
        <p
          role="status"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap'
          }}
        >
          {`Showing ${filteredAndSortedItems.length} items, sorted by ${sortBy}`}
        </p>

        {/* Results Feed */}
        {loadingData ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '240px',
              gap: '14px'
            }}
          >
            <div
              className="pulse-gold"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid var(--color-sacred-gold)',
                borderTopColor: 'transparent'
              }}
            />
            <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
              Gathering your reflections and bookmarked verses...
            </p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '56px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '36px', opacity: 0.7 }}>
              {viewMode === 'favorites' ? '⭐' : '📜'}
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: 'var(--color-sacred-gold)'
              }}
            >
              No matching entries found
            </h2>
            <p style={{ color: 'var(--text-slate)', fontSize: '14px', maxWidth: '460px' }}>
              {searchQuery || bookFilter !== 'all' || scopeFilter !== 'all'
                ? 'Try clearing your search query or adjusting the active filters above.'
                : 'Select any verse in the Bible Reader to bookmark favorite passages or anchor study reflections.'}
            </p>
            {(searchQuery || bookFilter !== 'all' || scopeFilter !== 'all' || viewMode !== 'all') && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setBookFilter('all');
                  setScopeFilter('all');
                  handleViewModeChange('all');
                }}
                style={{ marginTop: '8px', padding: '8px 16px', fontSize: '12px' }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              paddingBottom: '60px'
            }}
          >
            {filteredAndSortedItems.map(item => {
              const isFavorite = item.itemType === 'favorite';
              const isEditing = editingNoteId === item.id && !isFavorite;
              const liturgicalHex = item.liturgicalColor
                ? LITURGICAL_COLOR_MAP[item.liturgicalColor.toLowerCase()] || '#E5C158'
                : '#E5C158';

              return (
                <article
                  key={item.uid}
                  className="glass-panel fade-in"
                  style={{
                    padding: '20px 24px',
                    border: isFavorite
                      ? '1px solid rgba(56, 189, 248, 0.3)'
                      : '1px solid rgba(229, 193, 88, 0.18)',
                    background: isFavorite
                      ? 'linear-gradient(135deg, rgba(16, 24, 34, 0.8) 0%, rgba(12, 18, 24, 0.7) 100%)'
                      : 'var(--bg-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '160px'
                  }}
                >
                  {/* Card Header: Reference Badge, Metadata Pills & Timestamp */}
                  <header
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {/* Primary Reference Heading */}
                      <h2
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 600,
                          margin: 0,
                          color: isFavorite ? '#38BDF8' : 'var(--color-sacred-gold)'
                        }}
                      >
                        {isFavorite ? (
                          `⭐ ${item.bookName} ${item.chapter}:${item.verse}`
                        ) : item.isGospelNote ? (
                          `👑 ${item.feastName || 'Daily Gospel'}`
                        ) : item.isDayNote ? (
                          `🎙️ Day ${item.podcastDay} Episode Reflection`
                        ) : item.verse ? (
                          `📖 ${item.bookName} ${item.chapter}:${item.verse}`
                        ) : (
                          `📑 ${item.bookName} ${item.chapter}`
                        )}
                      </h2>

                      {/* Item Type Pill */}
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isFavorite
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(229, 193, 88, 0.14)',
                          color: isFavorite ? '#38BDF8' : 'var(--color-sacred-gold)',
                          border: isFavorite
                            ? '1px solid rgba(56, 189, 248, 0.3)'
                            : '1px solid rgba(229, 193, 88, 0.25)'
                        }}
                      >
                        {isFavorite
                          ? 'Bookmarked Verse'
                          : item.scopeType === 'gospel'
                            ? 'Gospel Reflection'
                            : item.scopeType === 'day'
                              ? 'BIAY Episode Note'
                              : item.scopeType === 'chapter'
                                ? 'Chapter Note'
                                : 'Verse Note'}
                      </span>

                      {/* Liturgical Citation & Date Pill for Gospel Notes */}
                      {item.isGospelNote && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: `${liturgicalHex}22`,
                            color: liturgicalHex,
                            border: `1px solid ${liturgicalHex}55`,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 600
                          }}
                        >
                          {item.gospelCitation || `${item.bookName} ${item.chapter}`}
                          {item.liturgicalDate ? ` • ${item.liturgicalDate}` : ''}
                        </span>
                      )}

                      {/* BIAY Day Pill */}
                      {item.matchingDays && item.matchingDays.length > 0 && !item.isDayNote && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-slate)',
                            border: '1px solid rgba(229, 193, 88, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 500
                          }}
                        >
                          🎙️ Day {item.matchingDays[0]}
                          {getReadingsForDay(item.matchingDays[0])?.period
                            ? ` (${getReadingsForDay(item.matchingDays[0]).period})`
                            : ''}
                        </span>
                      )}

                      {/* Translation Source Badge when verses are displayed */}
                      {item.versesList.length > 0 && item.translation && (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'var(--text-dim)',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            padding: '2px 7px',
                            borderRadius: '6px'
                          }}
                        >
                          {item.translation}
                        </span>
                      )}
                    </div>

                    {/* Date Created / Updated */}
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {formatTimestamp(item.updatedAt || item.createdAt)}
                      {item.updatedAt ? ' (edited)' : ''}
                    </span>
                  </header>

                  {/* Resolved Scripture Verse Blockquote (for Bookmarks & Verse/Gospel Notes) */}
                  {item.versesList.length > 0 && (
                    <blockquote
                      style={{
                        margin: 0,
                        padding: '14px 18px',
                        borderRadius: '8px',
                        background: isFavorite
                          ? 'rgba(56, 189, 248, 0.06)'
                          : 'rgba(8, 10, 12, 0.45)',
                        borderLeft: isFavorite
                          ? '3px solid #38BDF8'
                          : '3px solid var(--color-sacred-gold)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '16px',
                        lineHeight: 1.75,
                        color: '#ECE8E1'
                      }}
                    >
                      {item.versesList.map((v, idx) => (
                        <span key={v.num} style={{ marginRight: idx < item.versesList.length - 1 ? '8px' : 0 }}>
                          <sup
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isFavorite ? '#38BDF8' : 'var(--color-sacred-gold)',
                              marginRight: '4px',
                              fontFamily: 'var(--font-sans)'
                            }}
                          >
                            {v.num}
                          </sup>
                          <span>{v.text}</span>
                        </span>
                      ))}
                    </blockquote>
                  )}

                  {/* Note Reflection Body or Inline Editor */}
                  {!isFavorite && (
                    isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <textarea
                          className="input-field"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            minHeight: '96px',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            resize: 'vertical'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingText('');
                            }}
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={savingNoteId === item.id}
                            onClick={() => handleSaveNoteEdit(item.id)}
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            {savingNoteId === item.id ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--text-ivory)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.65,
                          margin: 0
                        }}
                      >
                        {item.text}
                      </p>
                    )
                  )}

                  {/* Card Footer Actions */}
                  <footer
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenInReader(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isFavorite ? '#38BDF8' : 'var(--color-sacred-gold)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      Open in Reader →
                    </button>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {isFavorite ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FCA5A5',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Remove Bookmark
                        </button>
                      ) : (
                        !isEditing && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(item.id);
                                setEditingText(item.text);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-slate)',
                                fontSize: '12px',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(item.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#FCA5A5',
                                fontSize: '12px',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
