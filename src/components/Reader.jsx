import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getDaysForVerse, getReadingsForDay } from '../data/planHelper';
import YouTubePlayer from './YouTubePlayer';
import { useDayVideos } from '../hooks/useDayVideos';

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

// Helper to identify and tag headings and poetry/quotes in the raw scripture text
function tagPoetryAndHeadings(text) {
  const lines = text.split('\n');
  const processedLines = lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Ignore lines that start with numbers (verses)
    if (/^\d+/.test(trimmed)) return line;

    // Ignore footnote markers like "2.4b"
    if (/^\d+\.\d+/.test(trimmed)) return line;

    // Check if the raw line starts with spaces or tabs (poetry indents)
    const hasLeadingIndent = /^\s{2,}/.test(line) || /^\t/.test(line);

    // Check if it's title-case
    const words = trimmed.split(/\s+/);
    const isTitleCase = words.every(word => {
      const cleanWord = word.replace(/[.,;!?]/g, '');
      const lower = cleanWord.toLowerCase();
      const smallWords = ['of', 'the', 'and', 'in', 'on', 'a', 'an', 'to', 'for', 'by', 'with', 'from', 'at', 'but', 'nor', 'yet', 'so', 'is', 'was', 'were', 'be', 'or', 'as'];
      if (smallWords.includes(lower)) return true;
      return /^[A-Z“\"'\u2018-\u201d]/.test(cleanWord);
    });

    const isShort = trimmed.length > 3 && trimmed.length < 80;

    // 1. If it has a leading indent, tag it as indented poetry
    if (hasLeadingIndent) {
      return `[POETRY_INDENT]${trimmed}[/POETRY_INDENT]`;
    }

    // 2. If it is title case and short, it is a section heading
    if (isShort && isTitleCase) {
      return `[HEADING]${trimmed}[/HEADING]`;
    }

    // 3. If it is short, starts with a curly quote or ends with a curly quote, or is adjacent to indented poetry, tag it as poetry
    const startsWithQuote = /^[“\"'\u2018]/.test(trimmed);
    const endsWithQuote = /[”\"'\u2019]$/.test(trimmed);
    
    // Check neighbors for indentation to group the poem
    const prevLine = lines[index - 1] || '';
    const nextLine = lines[index + 1] || '';
    const neighborsHaveIndent = /^\s{2,}/.test(prevLine) || /^\s{2,}/.test(nextLine) || /^\t/.test(prevLine) || /^\t/.test(nextLine);

    if (isShort && (startsWithQuote || endsWithQuote || neighborsHaveIndent)) {
      return `[POETRY]${trimmed}[/POETRY]`;
    }

    return line;
  });
  return processedLines.join('\n');
}

// Helper function to parse pasted scripture text into structured verses
function parseBibleText(rawText) {
  const verseMap = {};
  
  // Clean rawText: strip BibleGateway footnotes [a], [b], [aa] and cross-references (A), (B)
  let cleanedText = rawText
    .replace(/\[[a-z]+\]/g, '')   // removes lowercase letters in brackets
    .replace(/\([A-Z]+\)/g, '');  // removes uppercase letters in parentheses

  // Tag section headings and poetry quotes in the text block before parsing out formatting newlines
  cleanedText = tagPoetryAndHeadings(cleanedText);

  // Matches verse markers like: "1 In the beginning", "[1] In the beginning", or "1. In the beginning"
  const regex = /(?:^|\s+)\[?(\d+)\]?\.?\s+([^]+?)(?=\s+\[?\d+\]?\.?\s+|$)/g;
  let match;
  let count = 0;
  let firstIndex = -1;

  // Find the index of the first match
  const tempRegex = new RegExp(regex);
  const firstMatch = tempRegex.exec(cleanedText);
  if (firstMatch) {
    firstIndex = firstMatch.index;
  }

  // If there is intro text before the first verse marker, treat it as Verse 1
  if (firstIndex > 0) {
    const leadText = cleanedText.substring(0, firstIndex).trim().replace(/\s+/g, ' ');
    if (leadText) {
      verseMap["1"] = leadText;
      count++;
    }
  }

  while ((match = regex.exec(cleanedText)) !== null) {
    const verseNum = match[1];
    const verseText = match[2].trim().replace(/\s+/g, ' ');
    // If we already assigned leading text to Verse 1, append this match
    if (verseNum === "1" && verseMap["1"]) {
      verseMap["1"] = (verseMap["1"] + " " + verseText).trim();
    } else {
      verseMap[verseNum] = verseText;
      count++;
    }
  }
  return { verseMap, count };
}

// Helper to format an array of selected verse numbers into a readable range string (e.g. "5-7, 9")
function formatVerseRange(versesArray) {
  if (!versesArray || versesArray.length === 0) return '';
  const sorted = [...versesArray].map(v => parseInt(v, 10)).sort((a, b) => a - b);
  
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = sorted[i];
      end = sorted[i];
    }
  }
  if (start === end) {
    ranges.push(`${start}`);
  } else {
    ranges.push(`${start}-${end}`);
  }
  return ranges.join(', ');
}

// Helper to parse a range string (e.g. "5-7, 9") back into an array of individual verse string keys
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
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        // Safety guard against massive ranges (e.g. 1-100000) from typos
        for (let i = min; i <= Math.min(max, maxVerses); i++) {
          versesSet.add(String(i));
        }
      }
    } else {
      const val = parseInt(cleanPart, 10);
      if (!isNaN(val)) {
        versesSet.add(String(val));
      }
    }
  });
  
  return Array.from(versesSet);
}

export default function Reader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Search Parameters & Daily Plan Mode States
  const [searchParams, setSearchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const videoParam = searchParams.get('video');
  const [selectedPodcastDay, setSelectedPodcastDay] = useState(null);
  const [filterMode, setFilterMode] = useState('chapter'); // 'chapter' or 'day'
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Custom Day Videos Hook
  const { getVideoForDay, hasCustomVideo, saveVideoUrl, deleteVideoUrl } = useDayVideos();

  // Selected Book and Chapter
  const [activeBook, setActiveBook] = useState(BIBLE_BOOKS[0]); // Default to Genesis
  const [activeChapter, setActiveChapter] = useState('1');
  
  // Scripture Content States
  const [verses, setVerses] = useState({});
  const [bookCache, setBookCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Translation Selection
  const [activeTranslation, setActiveTranslation] = useState('douay-rheims'); // 'douay-rheims' or 'rsv-ce'
  const [customVerses, setCustomVerses] = useState(null); // Holds privately transcribed RSV-CE chapter data
  
  // Transcription Input Form States
  const [transcriptionInput, setTranscriptionInput] = useState('');
  const [detectedCount, setDetectedCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [saveError, setSaveError] = useState(null);

  // Annotations / Notes States
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteVerse, setNewNoteVerse] = useState(''); // Empty string means "Chapter Note"
  const [activeSelectedVerses, setActiveSelectedVerses] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteScope, setNoteScope] = useState('verse'); // 'verse' | 'chapter' | 'day'

  // Favorite Verses States
  const [favorites, setFavorites] = useState([]);
  const [favoritedVerses, setFavoritedVerses] = useState([]);

  // Layout & Mode States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notesPanelOpen, setNotesPanelOpen] = useState(true);
  const [distractionFree, setDistractionFree] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default 18px
  const [ascensionMode, setAscensionMode] = useState(true); // Default to Ascension Companion Mode

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

  // Compute active chapter's corresponding podcast days
  const matchingDays = getDaysForVerse(`${activeBook.usfmCode}.${activeChapter}`);

  const isCurrentActiveDayReading = selectedPodcastDay && 
    getReadingsForDay(selectedPodcastDay)?.readings.some(r => 
      r.bookId === activeBook.usfmCode && 
      parseInt(activeChapter, 10) >= r.startChapter && 
      parseInt(activeChapter, 10) <= r.endChapter
    );

  // Toggle Category Expand/Collapse
  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Fetch and Cache Scripture JSON (for Douay-Rheims)
  useEffect(() => {
    if (!activeBook || ascensionMode || activeTranslation === 'rsv-ce') return;
    const cacheKey = activeBook.id;

    if (bookCache[cacheKey]) {
      setVerses(bookCache[cacheKey][activeChapter] || {});
      return;
    }

    setLoading(true);
    setError(null);

    const url = `/douay-rheims/${encodeURIComponent(activeBook.filename)}`;

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
  }, [activeBook, activeChapter, ascensionMode, activeTranslation]);

  // Update local verses from cache in JSON mode when chapter shifts
  useEffect(() => {
    if (ascensionMode || activeTranslation === 'rsv-ce') return;
    const cacheKey = activeBook.id;
    if (bookCache[cacheKey]) {
      setVerses(bookCache[cacheKey][activeChapter] || {});
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [activeChapter, bookCache, ascensionMode, activeBook, activeTranslation]);

  // Always scroll reader container to top when book or chapter changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [activeBook, activeChapter]);

  // Selected Verse Click Handlers
  const handleVerseClick = (e, verseNum) => {
    e.stopPropagation(); // Prevent bubbling up to the container's deselect handler
    let newSelection = [];
    
    if (e.shiftKey && activeSelectedVerses.length > 0) {
      // Shift key range select
      const lastSelected = parseInt(activeSelectedVerses[activeSelectedVerses.length - 1], 10);
      const clicked = parseInt(verseNum, 10);
      const min = Math.min(lastSelected, clicked);
      const max = Math.max(lastSelected, clicked);
      
      const range = [];
      for (let i = min; i <= max; i++) {
        range.push(String(i));
      }
      newSelection = Array.from(new Set([...activeSelectedVerses, ...range]));
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl / Cmd key toggle select
      if (activeSelectedVerses.includes(verseNum)) {
        newSelection = activeSelectedVerses.filter(v => v !== verseNum);
      } else {
        newSelection = [...activeSelectedVerses, verseNum];
      }
    } else {
      // Standard single click select: toggle off if already selected singly
      if (activeSelectedVerses.length === 1 && activeSelectedVerses[0] === verseNum) {
        newSelection = [];
      } else {
        newSelection = [verseNum];
      }
    }
    
    setActiveSelectedVerses(newSelection);
    setNewNoteVerse(formatVerseRange(newSelection));
    if (newSelection.length > 0) {
      setNoteScope('verse');
    }
    setNotesPanelOpen(true);

    // If there is an existing note for this verse, highlight and scroll to its card in drawer
    const noteForVerse = notes.find(n => 
      !n.isDayNote && 
      n.bookId === activeBook.id && 
      String(n.chapter) === String(activeChapter) && 
      n.verse && 
      parseVerseRange(n.verse).includes(String(verseNum))
    );
    if (noteForVerse) {
      setActiveNoteId(noteForVerse.id);
      setTimeout(() => {
        const cardEl = document.getElementById(`note-card-${noteForVerse.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const handleNoteCardClick = (note) => {
    setActiveNoteId(note.id);

    // If note belongs to a specific scripture reference in a different book/chapter, switch to it
    if (!note.isDayNote && note.bookId) {
      const targetBook = BIBLE_BOOKS.find(b => b.id === note.bookId);
      if (targetBook && (targetBook.id !== activeBook.id || String(note.chapter) !== String(activeChapter))) {
        setActiveBook(targetBook);
        if (note.chapter) {
          setActiveChapter(String(note.chapter));
        }
      }
    }

    if (note.verse) {
      const parsedVerses = parseVerseRange(note.verse);
      setActiveSelectedVerses(parsedVerses);
      setNewNoteVerse(formatVerseRange(parsedVerses));
      setNoteScope('verse');
      if (parsedVerses.length > 0) {
        setTimeout(() => {
          const firstVerseEl = document.getElementById(`verse-${parsedVerses[0]}`);
          if (firstVerseEl) {
            firstVerseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    } else if (note.isDayNote) {
      setActiveSelectedVerses([]);
      setNewNoteVerse('');
      setNoteScope('day');
    } else {
      setActiveSelectedVerses([]);
      setNewNoteVerse('');
      setNoteScope('chapter');
    }
  };

  const clearSelectedVerse = () => {
    setActiveSelectedVerses([]);
    setNewNoteVerse('');
    setNoteScope('chapter');
  };

  // Handle Search Params for Daily Plan Mode
  useEffect(() => {
    if (dayParam) {
      const dayNum = parseInt(dayParam, 10);
      if (dayNum >= 1 && dayNum <= 365) {
        setSelectedPodcastDay(dayNum);
        setFilterMode('day');
        if (videoParam === '1') {
          setShowVideoPlayer(true);
        }
        
        // Find readings for this day
        const planEntry = getReadingsForDay(dayNum);
        if (planEntry && planEntry.readings.length > 0) {
          // Select the first reading
          const firstReading = planEntry.readings[0];
          const resolved = BIBLE_BOOKS.find(b => b.usfmCode === firstReading.bookId);
          if (resolved) {
            setActiveBook(resolved);
            setActiveChapter(String(firstReading.startChapter));
          }
        }
      }
    }
  }, [dayParam, videoParam]);

  // Firestore Real-Time Notes Listener
  useEffect(() => {
    if (!currentUser) return;

    const notesRef = collection(db, 'notes');
    let q;
    if (filterMode === 'day' && selectedPodcastDay) {
      q = query(
        notesRef,
        where('userId', '==', currentUser.uid),
        where('podcastDay', '==', parseInt(selectedPodcastDay, 10))
      );
    } else {
      if (!activeBook) return;
      q = query(
        notesRef,
        where('userId', '==', currentUser.uid),
        where('bookId', '==', activeBook.id),
        where('chapter', '==', activeChapter)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const sortedNotes = fetchedNotes.sort((a, b) => {
        if (filterMode === 'day') {
          return (a.createdAt || 0) - (b.createdAt || 0);
        }
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
  }, [currentUser, activeBook, activeChapter, filterMode, selectedPodcastDay]);

  // Firestore Private Custom Scripture Listener (for RSV-CE user copy)
  useEffect(() => {
    // Clear previous chapter's content to avoid a flash of stale text while loading
    setCustomVerses(null);

    if (!currentUser || !activeBook || activeTranslation !== 'rsv-ce') {
      return;
    }

    const docId = `${currentUser.uid}_${activeBook.id}_${activeChapter}`;
    const docRef = doc(db, 'customScriptures', docId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCustomVerses(docSnap.data().verses || {});
      } else {
        setCustomVerses(null);
      }
    }, (err) => {
      console.error("Firestore custom scriptures fetch error:", err);
      setCustomVerses(null); // Ensure state is reset if fetch fails (e.g. permission or network issues)
    });

    return unsubscribe;
  }, [currentUser, activeBook, activeChapter, activeTranslation]);

  // Firestore Realtime Favorites Listener
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setFavoritedVerses([]);
      return;
    }

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favList = [];
      snapshot.forEach(docSnap => {
        favList.push({ id: docSnap.id, ...docSnap.data() });
      });

      favList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setFavorites(favList);

      const currentChapterFavs = favList
        .filter(f => f.bookId === activeBook.id && String(f.chapter) === String(activeChapter))
        .map(f => String(f.verse));
      
      setFavoritedVerses(currentChapterFavs);
    }, (err) => {
      console.error("Firestore favorites stream error:", err);
    });

    return unsubscribe;
  }, [currentUser, activeBook, activeChapter]);

  // Favorite Verse Handlers
  const toggleFavoriteVerse = async (verseNum) => {
    if (!activeBook || !activeChapter || !verseNum) return;
    const vStr = String(verseNum);
    const isFav = favoritedVerses.includes(vStr);

    // Optimistic UI state update
    if (isFav) {
      setFavoritedVerses(prev => prev.filter(v => v !== vStr));
      setFavorites(prev => prev.filter(f => !(f.bookId === activeBook.id && String(f.chapter) === String(activeChapter) && String(f.verse) === vStr)));
    } else {
      setFavoritedVerses(prev => [...prev, vStr]);
      setFavorites(prev => [{
        id: `${currentUser?.uid || 'guest'}_${activeBook.id}_${activeChapter}_${vStr}`,
        userId: currentUser?.uid || 'guest',
        bookId: activeBook.id,
        chapter: String(activeChapter),
        verse: vStr,
        createdAt: Date.now()
      }, ...prev]);
    }

    if (!currentUser) return;
    const docId = `${currentUser.uid}_${activeBook.id}_${activeChapter}_${vStr}`;
    const docRef = doc(db, 'favorites', docId);

    try {
      if (isFav) {
        await deleteDoc(docRef);
      } else {
        const payload = {
          userId: currentUser.uid,
          bookId: activeBook.id,
          chapter: String(activeChapter),
          verse: vStr,
          verseRef: `${activeBook.id}_${activeChapter}_${vStr}`,
          createdAt: Date.now()
        };
        await setDoc(docRef, payload);
      }
    } catch (err) {
      console.error("Error toggling favorite verse in Firestore:", err);
    }
  };

  const toggleFavoriteSelectedVerses = async () => {
    if (activeSelectedVerses.length === 0) return;
    const allSelectedAreFav = activeSelectedVerses.every(v => favoritedVerses.includes(String(v)));

    if (allSelectedAreFav) {
      setFavoritedVerses(prev => prev.filter(v => !activeSelectedVerses.map(String).includes(v)));
    } else {
      setFavoritedVerses(prev => Array.from(new Set([...prev, ...activeSelectedVerses.map(String)])));
    }

    if (!currentUser) return;

    for (const vNum of activeSelectedVerses) {
      const vStr = String(vNum);
      const docId = `${currentUser.uid}_${activeBook.id}_${activeChapter}_${vStr}`;
      const docRef = doc(db, 'favorites', docId);

      try {
        if (allSelectedAreFav) {
          await deleteDoc(docRef);
        } else {
          if (!favoritedVerses.includes(vStr)) {
            const payload = {
              userId: currentUser.uid,
              bookId: activeBook.id,
              chapter: String(activeChapter),
              verse: vStr,
              verseRef: `${activeBook.id}_${activeChapter}_${vStr}`,
              createdAt: Date.now()
            };
            await setDoc(docRef, payload);
          }
        }
      } catch (err) {
        console.error("Error batch toggling favorite verses:", err);
      }
    }
  };

  // Note CRUD handlers
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    try {
      const notesRef = collection(db, 'notes');
      
      const notePayload = {
        userId: currentUser.uid,
        bookId: activeBook.id,
        chapter: activeChapter,
        text: newNoteText,
        createdAt: Date.now()
      };

      const targetDay = selectedPodcastDay || (matchingDays && matchingDays.length > 0 ? matchingDays[0] : null);

      if (noteScope === 'day' && targetDay) {
        notePayload.isDayNote = true;
        notePayload.podcastDay = targetDay;
        notePayload.verse = null;
      } else if (noteScope === 'chapter') {
        notePayload.isDayNote = false;
        notePayload.verse = null;
        if (targetDay) notePayload.podcastDay = targetDay;
      } else {
        notePayload.isDayNote = false;
        notePayload.verse = newNoteVerse.trim() || null;
        if (targetDay) notePayload.podcastDay = targetDay;
      }

      await addDoc(notesRef, notePayload);

      setNewNoteText('');
      setNewNoteVerse('');
      setActiveSelectedVerses([]);
      setActiveNoteId(null);
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

  // Custom Scripture Transcribing Handlers
  const handleInputChange = (e) => {
    const text = e.target.value;
    setTranscriptionInput(text);
    const { count } = parseBibleText(text);
    setDetectedCount(count);
  };

  const handleSaveTranscription = async (e) => {
    e.preventDefault();
    if (!transcriptionInput.trim()) return;

    setSaveStatus('saving');
    setSaveError(null);
    const { verseMap, count } = parseBibleText(transcriptionInput);

    if (count === 0) {
      alert("No verse numbers detected. Make sure the pasted text has numbers preceding the verses (e.g., '1 In the beginning...').");
      setSaveStatus(null);
      return;
    }

    try {
      const docId = `${currentUser.uid}_${activeBook.id}_${activeChapter}`;
      const docRef = doc(db, 'customScriptures', docId);

      await setDoc(docRef, {
        userId: currentUser.uid,
        bookId: activeBook.id,
        chapter: activeChapter,
        verses: verseMap,
        createdAt: Date.now()
      });

      setSaveStatus('saved');
      setTranscriptionInput('');
      setDetectedCount(0);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Error saving custom scriptures:", err);
      setSaveStatus('error');
      setSaveError(err.message || String(err));
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

  const versesWithNotes = [];
  notes.forEach(note => {
    if (!note.isDayNote && note.verse && note.bookId === activeBook.id && String(note.chapter) === String(activeChapter)) {
      const parsed = parseVerseRange(note.verse);
      parsed.forEach(v => {
        if (!versesWithNotes.includes(v)) {
          versesWithNotes.push(v);
        }
      });
    }
  });

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
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span>{activeBook.name} {activeChapter}</span>
                {matchingDays.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                    color: PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)',
                    border: `1px solid ${PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'rgba(229, 193, 88, 0.2)'}`,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {matchingDays.map(d => `Day ${d}`).join(', ')}
                  </span>
                )}
              </h2>
            </div>

            {/* Middle Toolbar Toggles */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Translation Selection Selector */}
              {!ascensionMode && (
                <select
                  value={activeTranslation}
                  onChange={(e) => setActiveTranslation(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(229, 193, 88, 0.2)',
                    borderRadius: '6px',
                    color: 'var(--color-sacred-gold)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="douay-rheims" style={{ background: 'var(--bg-midnight)', color: 'var(--text-ivory)' }}>Douay-Rheims (Local)</option>
                  <option value="rsv-ce" style={{ background: 'var(--bg-midnight)', color: 'var(--text-ivory)' }}>RSV-CE (My Copy)</option>
                </select>
              )}

              {/* Font Sizers */}
              {!ascensionMode && (activeTranslation === 'douay-rheims' || customVerses) && (
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

              {/* Progress Matrix navigation button */}
              <button
                onClick={() => navigate(selectedPodcastDay ? `/matrix?day=${selectedPodcastDay}` : '/matrix')}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(229, 193, 88, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  color: 'var(--color-sacred-gold)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                title="Go to Progress Matrix"
              >
                📊 Matrix
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

        {/* Daily Plan Readings Bar */}
        {selectedPodcastDay && (
          <div style={{
            background: 'rgba(229, 193, 88, 0.04)',
            borderBottom: '1px solid rgba(229, 193, 88, 0.12)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: PERIOD_COLORS[getReadingsForDay(selectedPodcastDay)?.period] || 'var(--color-sacred-gold)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
              }} />
              <span style={{ fontSize: '13px', color: 'var(--text-ivory)' }}>
                Daily Plan: <strong style={{ color: 'var(--color-sacred-gold)' }}>Day {selectedPodcastDay}</strong> ({getReadingsForDay(selectedPodcastDay)?.period})
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Readings:</span>
              {getReadingsForDay(selectedPodcastDay)?.readings.map((r, idx) => {
                const book = BIBLE_BOOKS.find(b => b.usfmCode === r.bookId);
                if (!book) return null;
                const label = `${book.name} ${r.startChapter}${r.endChapter !== r.startChapter ? `-${r.endChapter}` : ''}`;
                
                // Check if this reading is active
                const isSelected = activeBook.usfmCode === r.bookId && 
                  parseInt(activeChapter, 10) >= r.startChapter && 
                  parseInt(activeChapter, 10) <= r.endChapter;
                  
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveBook(book);
                      setActiveChapter(String(r.startChapter));
                    }}
                    style={{
                      background: isSelected ? 'var(--color-sacred-gold)' : 'rgba(255,255,255,0.05)',
                      border: isSelected ? 'none' : '1px solid rgba(229, 193, 88, 0.2)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      color: isSelected ? 'var(--bg-midnight)' : 'var(--color-sacred-gold)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowVideoPlayer(!showVideoPlayer)}
                style={{
                  background: showVideoPlayer ? 'var(--color-sacred-gold)' : 'rgba(229, 193, 88, 0.15)',
                  border: '1px solid rgba(229, 193, 88, 0.4)',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  color: showVideoPlayer ? 'var(--bg-midnight)' : 'var(--color-sacred-gold)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                📺 {showVideoPlayer ? 'Hide Video' : 'Watch Video'}
              </button>
              <button
                onClick={() => navigate(`/matrix?day=${selectedPodcastDay}`)}
                style={{
                  background: 'rgba(229, 193, 88, 0.12)',
                  border: '1px solid rgba(229, 193, 88, 0.3)',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  color: 'var(--color-sacred-gold)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              >
                ← Back to Matrix
              </button>
              <button
                onClick={() => {
                  setSelectedPodcastDay(null);
                  setSearchParams({});
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FCA5A5',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  textDecoration: 'underline',
                }}
              >
                Exit Plan
              </button>
            </div>
          </div>
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
              const chapDays = getDaysForVerse(`${activeBook.usfmCode}.${chapStr}`);
              const hasPlan = chapDays.length > 0;
              const firstDay = hasPlan ? chapDays[0] : null;
              const period = firstDay ? getReadingsForDay(firstDay)?.period : null;
              const dotColor = period ? PERIOD_COLORS[period] : null;

              return (
                <div key={chapNum} style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => handleChapterChange(chapNum)}
                    title={hasPlan ? `Podcast Day: ${chapDays.map(d => `Day ${d}`).join(', ')} (${period})` : 'Not in reading plan'}
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
                  {hasPlan && (
                    <span style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--bg-midnight)' : dotColor,
                    }} />
                  )}
                </div>
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
            width: '100%',
          }}
        >
          {ascensionMode ? (
            /* Mode B: Clean Ascension Press Launcher Dashboard */
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
              {matchingDays.length > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                  padding: '6px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(229, 193, 88, 0.1)',
                  borderRadius: '20px',
                  fontSize: '13px',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)',
                    boxShadow: `0 0 8px ${PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)'}`,
                  }}></span>
                  <span style={{ color: 'var(--text-slate)' }}>
                    Podcast {matchingDays.length === 1 ? 'Day' : 'Days'}: 
                    <strong style={{ color: 'var(--color-sacred-gold)', marginLeft: '4px' }}>
                      {matchingDays.map(d => `Day ${d}`).join(', ')}
                    </strong>
                  </span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>•</span>
                  <span style={{
                    color: PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                  }}>
                    {getReadingsForDay(matchingDays[0])?.period}
                  </span>
                </div>
              )}
              <p style={{ color: 'var(--text-slate)', fontSize: '15px', lineHeight: 1.6, marginBottom: '40px' }}>
                Because the Ascension Press website has strict security rules blocking in-app embedding, you can open the active chapter directly in a pinned side-tab. Any notes you log on the right side will automatically bind to this scripture reference!
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
                <span>Open {activeBook.name} {activeChapter} on Ascension ↗</span>
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

              {/* Tiling Tip */}
              <div className="glass-panel" style={{
                padding: '20px',
                background: 'rgba(20, 26, 32, 0.4)',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-ivory)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💡 Homelab Tip: Windows Tiling
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-slate)', lineHeight: 1.5 }}>
                  Snap your browser windows side-by-side! Click and drag the Ascension Press tab to the left edge of your monitor, and keep The Well App on the right side. This aligns your notes stack perfectly with your reading!
                </p>
              </div>
            </div>
          ) : (
            /* Mode A: Default Scripture Reader View */
            <div style={{
              maxWidth: '680px',
              width: '100%',
            }}>
              {/* Check if in RSV-CE mode and there is NO custom scripture transcribed yet */}
              {activeTranslation === 'rsv-ce' && !customVerses ? (
                /* TRANSCRIPTION BOX EDITOR */
                <div className="glass-panel fade-in" style={{
                  padding: '32px',
                  background: 'rgba(20, 26, 32, 0.6)',
                  border: '1px solid rgba(229, 193, 88, 0.15)',
                  margin: '40px 0',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-sacred-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Transcribe Chapter Text
                    </span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--text-ivory)', marginTop: '4px' }}>
                      RSV-CE: {activeBook.name} {activeChapter}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-slate)', marginTop: '8px', lineHeight: 1.5 }}>
                      No private scripture copy saved for this chapter. Paste the text from your Bible window below. We will parse the verses and save it securely in your Firebase database.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <textarea
                      className="input-field"
                      placeholder={`Paste RSV-CE ${activeBook.name} ${activeChapter} verses here...\n\nExample:\n1 In the beginning God created...\n2 And the earth was void...`}
                      value={transcriptionInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveTranscription(e);
                        }
                      }}
                      style={{ minHeight: '220px', fontSize: '13px', fontFamily: 'var(--font-serif)', lineHeight: 1.6, resize: 'vertical' }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: detectedCount > 0 ? 'var(--color-sacred-gold)' : 'var(--text-slate)' }}>
                          {detectedCount > 0 ? `✅ Detected ${detectedCount} verses` : 'Waiting for verse formatting...'}
                        </span>

                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={handleSaveTranscription}
                          disabled={saveStatus === 'saving'}
                          style={{ padding: '10px 24px', fontSize: '13px' }}
                        >
                          {saveStatus === 'saving' ? 'Saving...' : 'Save Private Copy'}
                        </button>
                      </div>

                      {saveStatus === 'error' && saveError && (
                        <div style={{ color: '#FCA5A5', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>
                          ❌ Error: {saveError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* RENDER STANDARD BIBLE TEXT */
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
                      {activeBook.name} ({activeTranslation === 'rsv-ce' ? 'RSV-CE Copy' : 'Douay-Rheims'})
                    </p>
                    <h1 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '44px',
                      color: isCurrentActiveDayReading ? 'var(--color-sacred-gold)' : 'var(--text-ivory)',
                      fontWeight: 600,
                      textShadow: isCurrentActiveDayReading ? '0 0 15px rgba(229, 193, 88, 0.4)' : 'none',
                      transition: 'text-shadow 0.3s ease, color 0.3s ease',
                    }}>
                      Chapter {activeChapter}
                    </h1>
                    {matchingDays.length > 0 && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '12px',
                        padding: '4px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(229, 193, 88, 0.1)',
                        borderRadius: '20px',
                        fontSize: '12px',
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)',
                          boxShadow: `0 0 8px ${PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)'}`,
                        }}></span>
                        <span style={{ color: 'var(--text-slate)' }}>
                          Podcast {matchingDays.length === 1 ? 'Day' : 'Days'}: 
                          <strong style={{ color: 'var(--color-sacred-gold)', marginLeft: '4px' }}>
                            {matchingDays.map(d => `Day ${d}`).join(', ')}
                          </strong>
                        </span>
                        <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>•</span>
                        <span style={{
                          color: PERIOD_COLORS[getReadingsForDay(matchingDays[0])?.period] || 'var(--color-sacred-gold)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          letterSpacing: '0.05em',
                        }}>
                          {getReadingsForDay(matchingDays[0])?.period}
                        </span>
                      </div>
                    )}
                    <hr style={{
                      width: '40px',
                      margin: '16px auto 0 auto',
                      border: 'none',
                      borderTop: '2px solid var(--color-sacred-gold)',
                      opacity: 0.7,
                    }} />
                  </div>

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
                    <div 
                      onClick={clearSelectedVerse}
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.85',
                        color: '#ECE8E1',
                        textAlign: 'justify',
                        cursor: 'default',
                        padding: '16px 0',
                      }}
                    >
                      {activeTranslation === 'rsv-ce' && customVerses ? (
                        /* Render Transcribed RSV-CE Verses */
                        Object.entries(customVerses).map(([verseNum, text]) => {
                          // Regex to split by HEADING, POETRY, and POETRY_INDENT blocks
                          const tokenRegex = /(\[HEADING\].*?\[\/HEADING\]|\[POETRY\].*?\[\/POETRY\]|\[POETRY_INDENT\].*?\[\/POETRY_INDENT\])/g;
                          const parts = text.split(tokenRegex);
                          const isSelected = activeSelectedVerses.includes(verseNum);
                          const hasNote = versesWithNotes.includes(verseNum);

                          if (parts.length > 1) {
                            return (
                              <span key={verseNum} style={{ display: 'inline' }}>
                                {parts.map((part, idx) => {
                                  if (part.startsWith('[HEADING]')) {
                                    const content = part.replace('[HEADING]', '').replace('[/HEADING]', '');
                                    return (
                                      <span key={idx} style={{ display: 'block', margin: '32px 0 16px 0', textAlign: 'left' }}>
                                        <h3 style={{
                                          fontFamily: 'var(--font-serif)',
                                          fontSize: '20px',
                                          color: 'var(--color-sacred-gold)',
                                          fontWeight: 600,
                                          margin: 0
                                        }}>
                                          {content}
                                        </h3>
                                      </span>
                                    );
                                  } else if (part.startsWith('[POETRY_INDENT]')) {
                                    const content = part.replace('[POETRY_INDENT]', '').replace('[/POETRY_INDENT]', '');
                                    return (
                                      <span key={idx} style={{ display: 'block', paddingLeft: '48px', fontStyle: 'italic', margin: '6px 0', color: '#E2DCD2' }}>
                                        {content}
                                      </span>
                                    );
                                  } else if (part.startsWith('[POETRY]')) {
                                    const content = part.replace('[POETRY]', '').replace('[/POETRY]', '');
                                    return (
                                      <span key={idx} style={{ display: 'block', paddingLeft: '24px', fontStyle: 'italic', margin: '6px 0', color: '#E2DCD2' }}>
                                        {content}
                                      </span>
                                    );
                                  } else {
                                    if (!part.trim()) return null;
                                    return (
                                      <span 
                                        key={idx}
                                        id={`verse-${verseNum}`}
                                        onClick={(e) => handleVerseClick(e, verseNum)}
                                        style={{ 
                                          marginRight: '8px',
                                          cursor: 'pointer',
                                          background: isSelected 
                                            ? 'rgba(229, 193, 88, 0.28)' 
                                            : (isFav ? 'rgba(229, 193, 88, 0.15)' : (hasNote ? 'rgba(229, 193, 88, 0.10)' : 'transparent')),
                                          borderBottom: isSelected 
                                            ? '2px solid var(--color-sacred-gold)' 
                                            : (isFav ? '1.5px solid rgba(229, 193, 88, 0.6)' : (hasNote ? '1px dashed rgba(229, 193, 88, 0.7)' : 'none')),
                                          padding: '2px 4px',
                                          borderRadius: '4px',
                                          transition: 'all 0.2s ease',
                                          boxShadow: isSelected ? '0 0 10px rgba(229, 193, 88, 0.25)' : 'none',
                                        }}
                                        className="readable-verse"
                                      >
                                        {idx === 0 && (
                                          <sup style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '0.65em',
                                            fontWeight: 700,
                                            color: 'var(--color-sacred-gold)',
                                            marginRight: '4px',
                                            verticalAlign: 'super',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                          }}>
                                            {verseNum}
                                            {hasNote && <span title="Has Note" style={{ color: 'var(--color-sacred-gold)' }}>📝</span>}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavoriteVerse(verseNum);
                                              }}
                                              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '0 1px',
                                                margin: 0,
                                                cursor: 'pointer',
                                                color: isFav ? 'var(--color-sacred-gold)' : 'rgba(255, 255, 255, 0.25)',
                                                fontSize: '1.1em',
                                                lineHeight: 1,
                                                transition: 'all 0.15s ease',
                                                transform: isFav ? 'scale(1.15)' : 'scale(1)',
                                              }}
                                            >
                                              {isFav ? '★' : '☆'}
                                            </button>
                                          </sup>
                                        )}
                                        {part.trim()}
                                      </span>
                                    );
                                  }
                                })}
                              </span>
                            );
                          }

                          const isFav = favoritedVerses.includes(verseNum);
                          return (
                            <span 
                              key={verseNum} 
                              id={`verse-${verseNum}`}
                              onClick={(e) => handleVerseClick(e, verseNum)}
                              style={{ 
                                marginRight: '8px',
                                cursor: 'pointer',
                                background: isSelected 
                                  ? 'rgba(229, 193, 88, 0.28)' 
                                  : (isFav ? 'rgba(229, 193, 88, 0.15)' : (hasNote ? 'rgba(229, 193, 88, 0.10)' : 'transparent')),
                                borderBottom: isSelected 
                                  ? '2px solid var(--color-sacred-gold)' 
                                  : (isFav ? '1.5px solid rgba(229, 193, 88, 0.6)' : (hasNote ? '1px dashed rgba(229, 193, 88, 0.7)' : 'none')),
                                padding: '2px 4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 10px rgba(229, 193, 88, 0.25)' : 'none',
                              }}
                              className="readable-verse"
                            >
                              <sup style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.65em',
                                fontWeight: 700,
                                color: 'var(--color-sacred-gold)',
                                marginRight: '4px',
                                verticalAlign: 'super',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}>
                                {verseNum}
                                {hasNote && <span title="Has Note" style={{ color: 'var(--color-sacred-gold)' }}>📝</span>}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavoriteVerse(verseNum);
                                  }}
                                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 1px',
                                    margin: 0,
                                    cursor: 'pointer',
                                    color: isFav ? 'var(--color-sacred-gold)' : 'rgba(255, 255, 255, 0.25)',
                                    fontSize: '1.1em',
                                    lineHeight: 1,
                                    transition: 'all 0.15s ease',
                                    transform: isFav ? 'scale(1.15)' : 'scale(1)',
                                  }}
                                >
                                  {isFav ? '★' : '☆'}
                                </button>
                              </sup>
                              {text}
                            </span>
                          );
                        })
                      ) : (
                        /* Render Static CDN Douay-Rheims Verses */
                        Object.entries(verses).map(([verseNum, text]) => {
                          const cleanText = text.replace(/^\*/, '');
                          const isSelected = activeSelectedVerses.includes(verseNum);
                          const hasNote = versesWithNotes.includes(verseNum);
                          return (
                            <span 
                              key={verseNum} 
                              id={`verse-${verseNum}`}
                              onClick={(e) => handleVerseClick(e, verseNum)}
                              style={{ 
                                marginRight: '8px',
                                cursor: 'pointer',
                                background: isSelected 
                                  ? 'rgba(229, 193, 88, 0.28)' 
                                  : (hasNote ? 'rgba(229, 193, 88, 0.10)' : 'transparent'),
                                borderBottom: isSelected 
                                  ? '2px solid var(--color-sacred-gold)' 
                                  : (hasNote ? '1px dashed rgba(229, 193, 88, 0.7)' : 'none'),
                                padding: '2px 4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 10px rgba(229, 193, 88, 0.25)' : 'none',
                              }}
                              className="readable-verse"
                            >
                              <sup style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.6em',
                                fontWeight: 700,
                                color: 'var(--color-sacred-gold)',
                                marginRight: '4px',
                                verticalAlign: 'super',
                              }}>
                                {verseNum}
                                {hasNote && <span style={{ marginLeft: '2px', color: 'var(--color-sacred-gold)' }}>★</span>}
                              </sup>
                              {cleanText}
                            </span>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Transcribed Text Controls (Edit/Delete Option) */}
                  {activeTranslation === 'rsv-ce' && customVerses && !loading && (
                    <div style={{ marginTop: '56px', display: 'flex', gap: '16px', justifyContent: 'center', borderTop: '1px solid rgba(229, 193, 88, 0.1)', paddingTop: '24px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          // Compile verses back into plaintext format for editing
                          let compiled = "";
                          Object.entries(customVerses).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)).forEach(([num, text]) => {
                            compiled += `${num} ${text}\n`;
                          });
                          setTranscriptionInput(compiled);
                          setDetectedCount(Object.keys(customVerses).length);
                          setCustomVerses(null); // Triggers editor display
                        }}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        ✏️ Edit Chapter Text
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete your privately saved text for this chapter?")) {
                            try {
                              const docId = `${currentUser.uid}_${activeBook.id}_${activeChapter}`;
                              await deleteDoc(doc(db, 'customScriptures', docId));
                            } catch (err) {
                              console.error("Error deleting custom scripture:", err);
                            }
                          }
                        }}
                        style={{ fontSize: '12px', padding: '6px 14px', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        🗑️ Delete Private Copy
                      </button>
                    </div>
                  )}
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
              {filterMode === 'day' ? `Podcast Day ${selectedPodcastDay || '?'}` : `${activeBook.name} ${activeChapter}`}
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

        {/* Note Filters */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(229, 193, 88, 0.08)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <button
            onClick={() => setFilterMode('chapter')}
            style={{
              flex: 1,
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: filterMode === 'chapter' ? 'rgba(229, 193, 88, 0.12)' : 'transparent',
              color: filterMode === 'chapter' ? 'var(--color-sacred-gold)' : 'var(--text-slate)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📖 Chapter
          </button>
          
          <button
            onClick={() => {
              setFilterMode('day');
              if (!selectedPodcastDay) {
                if (matchingDays && matchingDays.length > 0) {
                  setSelectedPodcastDay(matchingDays[0]);
                } else {
                  setSelectedPodcastDay(1);
                }
              }
            }}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: 'none',
              background: filterMode === 'day' ? 'rgba(229, 193, 88, 0.12)' : 'transparent',
              color: filterMode === 'day' ? 'var(--color-sacred-gold)' : 'var(--text-slate)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🎙️ Day
          </button>

          <button
            onClick={() => setFilterMode('favorites')}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: '4px',
              border: 'none',
              background: filterMode === 'favorites' ? 'rgba(229, 193, 88, 0.12)' : 'transparent',
              color: filterMode === 'favorites' ? 'var(--color-sacred-gold)' : 'var(--text-slate)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ⭐ Favorites ({favorites.length})
          </button>
        </div>

        {/* Day Selector dropdown */}
        {filterMode === 'day' && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(8, 10, 12, 0.2)',
            borderBottom: '1px solid rgba(229, 193, 88, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-slate)' }}>Select Day:</span>
            <select
              value={selectedPodcastDay || 1}
              onChange={(e) => setSelectedPodcastDay(parseInt(e.target.value, 10))}
              style={{
                background: 'var(--bg-deep-charcoal)',
                border: '1px solid rgba(229, 193, 88, 0.2)',
                borderRadius: '4px',
                color: 'var(--color-sacred-gold)',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {Array.from({ length: 365 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d} style={{ background: 'var(--bg-midnight)', color: 'var(--text-ivory)' }}>
                  Day {d} ({getReadingsForDay(d)?.period})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notes / Favorites Timeline Stack */}
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
              <p style={{ fontSize: '13px' }}>
                {filterMode === 'day' ? `No reflections logged for Day ${selectedPodcastDay || '?'}.` : 'No reflections logged for this chapter yet.'}
              </p>
              <p style={{ fontSize: '11px', marginTop: '6px' }}>Type in the field below to catalog your study notes.</p>
            </div>
          ) : (
            notes.map(note => {
              const isEditing = editingNoteId === note.id;
              const isCardActive = activeNoteId === note.id;
              return (
                <div 
                  key={note.id} 
                  id={`note-card-${note.id}`}
                  onClick={() => handleNoteCardClick(note)}
                  className="glass-panel" 
                  style={{
                    padding: '16px',
                    background: isCardActive ? 'rgba(229, 193, 88, 0.08)' : 'rgba(8, 10, 12, 0.4)',
                    border: isCardActive ? '1px solid var(--color-sacred-gold)' : '1px solid rgba(229, 193, 88, 0.12)',
                    boxShadow: isCardActive ? '0 0 14px rgba(229, 193, 88, 0.2)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Note Header Metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--color-sacred-gold)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {note.isDayNote ? (
                          `🎙️ Day ${note.podcastDay} Episode Reflection`
                        ) : note.verse ? (
                          `📖 ${BIBLE_BOOKS.find(b => b.id === note.bookId)?.name || activeBook.name} ${note.chapter}:${note.verse}`
                        ) : (
                          `📑 ${BIBLE_BOOKS.find(b => b.id === note.bookId)?.name || activeBook.name} ${note.chapter}`
                        )}
                      </span>
                      {note.podcastDay && !note.isDayNote && (
                        <span style={{
                          fontSize: '10px',
                          background: 'rgba(229, 193, 88, 0.12)',
                          color: 'var(--color-sacred-gold)',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontWeight: 500,
                        }}>
                          Day {note.podcastDay}
                        </span>
                      )}
                    </div>
                    
                    {/* Action Controls */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isEditing && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNoteId(note.id);
                              setEditingText(note.text);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-slate)', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Scope Selection Selector Pills */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attach To:</span>
              
              <button
                type="button"
                onClick={() => setNoteScope('verse')}
                style={{
                  background: noteScope === 'verse' ? 'var(--color-sacred-gold)' : 'rgba(255,255,255,0.05)',
                  color: noteScope === 'verse' ? 'var(--bg-midnight)' : 'var(--text-slate)',
                  border: '1px solid rgba(229, 193, 88, 0.2)',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📖 Verse {newNoteVerse ? `(${newNoteVerse})` : ''}
              </button>

              <button
                type="button"
                onClick={() => {
                  setNoteScope('chapter');
                  setActiveSelectedVerses([]);
                  setNewNoteVerse('');
                }}
                style={{
                  background: noteScope === 'chapter' ? 'var(--color-sacred-gold)' : 'rgba(255,255,255,0.05)',
                  color: noteScope === 'chapter' ? 'var(--bg-midnight)' : 'var(--text-slate)',
                  border: '1px solid rgba(229, 193, 88, 0.2)',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📑 Chapter ({activeBook.name} {activeChapter})
              </button>

              {activeSelectedVerses.length > 0 && (
                <button
                  type="button"
                  onClick={toggleFavoriteSelectedVerses}
                  style={{
                    background: activeSelectedVerses.every(v => favoritedVerses.includes(String(v))) 
                      ? 'var(--color-sacred-gold)' 
                      : 'rgba(229, 193, 88, 0.12)',
                    color: activeSelectedVerses.every(v => favoritedVerses.includes(String(v))) 
                      ? 'var(--bg-midnight)' 
                      : 'var(--color-sacred-gold)',
                    border: '1px solid rgba(229, 193, 88, 0.3)',
                    borderRadius: '12px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginLeft: 'auto',
                  }}
                >
                  {activeSelectedVerses.every(v => favoritedVerses.includes(String(v))) ? '★ Favorited' : '☆ Favorite'}
                </button>
              )}

              {(selectedPodcastDay || (matchingDays && matchingDays.length > 0)) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteScope('day');
                      setActiveSelectedVerses([]);
                      setNewNoteVerse('');
                    }}
                    style={{
                      background: noteScope === 'day' ? 'var(--color-sacred-gold)' : 'rgba(255,255,255,0.05)',
                      color: noteScope === 'day' ? 'var(--bg-midnight)' : 'var(--text-slate)',
                      border: '1px solid rgba(229, 193, 88, 0.2)',
                      borderRadius: '12px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    🎙️ Day {selectedPodcastDay || matchingDays[0]} Episode
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideoPlayer(true)}
                    style={{
                      background: 'rgba(229, 193, 88, 0.12)',
                      color: 'var(--color-sacred-gold)',
                      border: '1px solid rgba(229, 193, 88, 0.3)',
                      borderRadius: '12px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    📺 Watch Video
                  </button>
                </>
              )}
            </div>

            {/* Verse Range Input (Shown if scope is Verse) */}
            {noteScope === 'verse' && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label className="input-label" style={{ margin: 0, fontSize: '11px' }}>Verse Scope:</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 5, or select in text"
                    value={newNoteVerse}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9,\-\s]/g, '');
                      setNewNoteVerse(val);
                      const parsed = parseVerseRange(val);
                      setActiveSelectedVerses(parsed);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNote(e);
                      }
                    }}
                    style={{ width: '120px', padding: '6px 10px', fontSize: '12px' }}
                  />
                </div>
                {newNoteVerse && (
                  <button
                    type="button"
                    onClick={clearSelectedVerse}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-sacred-gold)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            <textarea
              className="input-field"
              placeholder={
                noteScope === 'day' 
                  ? `Write Episode reflection for Day ${selectedPodcastDay || matchingDays[0]}...` 
                  : noteScope === 'chapter' 
                    ? `Write Chapter note for ${activeBook.name} ${activeChapter}...` 
                    : `Write Verse reflection for ${activeBook.name} ${activeChapter}${newNoteVerse ? `:${newNoteVerse}` : ''}...`
              }
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNote(e);
                }
              }}
              style={{ minHeight: '100px', fontSize: '13px', resize: 'none' }}
            />

            <button 
              className="btn btn-primary" 
              type="button"
              onClick={handleAddNote}
              style={{ width: '100%', padding: '10px' }}
            >
              Add Reflection
            </button>
          </div>
        </div>
      </aside>

      {/* Floating YouTube Video Player */}
      {showVideoPlayer && (selectedPodcastDay || (matchingDays && matchingDays.length > 0)) && (
        <YouTubePlayer
          day={selectedPodcastDay || matchingDays[0]}
          dayTitle={getReadingsForDay(selectedPodcastDay || matchingDays[0])?.title}
          videoUrl={getVideoForDay(selectedPodcastDay || matchingDays[0])}
          isCustomVideo={hasCustomVideo(selectedPodcastDay || matchingDays[0])}
          onSaveVideoUrl={saveVideoUrl}
          onDeleteVideoUrl={deleteVideoUrl}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}

      {/* Embedded CSS for spin animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .readable-verse {
          transition: background-color 0.15s ease, border-bottom 0.15s ease;
        }
        .readable-verse:hover {
          background-color: rgba(229, 193, 88, 0.08) !important;
        }
      `}</style>
    </div>
  );
}
