import { 
  SUNDAY_GOSPELS, 
  WEEKDAY_ORDINARY_GOSPELS, 
  FIXED_SOLEMNITIES_AND_FEASTS 
} from './liturgicalData.js';
import { BIBLE_BOOKS } from './books.js';

/**
 * Computes Gregorian Easter Sunday for a given year (Meeus/Jones/Butcher algorithm).
 */
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function parseDateInput(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  return new Date(dateInput);
}

/**
 * Returns formatted YYYY-MM-DD string in local time.
 */
export function formatDateKey(d) {
  const date = parseDateInput(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sunday Liturgical Cycle (A, B, C).
 * Advent of Year X starts the cycle for Year X+1.
 */
export function getSundayCycle(date) {
  const d = parseDateInput(date);
  const year = d.getFullYear();
  
  // Check if after 1st Sunday of Advent
  const christmas = new Date(year, 11, 25);
  const christmasDayOfWeek = christmas.getDay();
  const daysToAdvent = ((christmasDayOfWeek + 7 - 0) % 7) + 21;
  const adventStart = new Date(year, 11, 25 - daysToAdvent);
  
  const cycleYear = d >= adventStart ? year + 1 : year;
  const mod = cycleYear % 3;
  if (mod === 1) return 'A';
  if (mod === 2) return 'B';
  return 'C';
}

/**
 * Weekday Liturgical Cycle (Cycle I = odd year, Cycle II = even year).
 */
export function getWeekdayCycle(date) {
  const d = parseDateInput(date);
  const year = d.getFullYear();
  return (year % 2 === 1) ? 'I' : 'II';
}

/**
 * Calculates local Catholic liturgical season, celebration title, color, and Gospel reading.
 */
export function getCalculatedLiturgicalDay(dateInput) {
  const d = parseDateInput(dateInput);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dateStr = formatDateKey(d);
  const monthDayStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dayOfWeekIndex = d.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekdayName = weekdayNames[dayOfWeekIndex];
  const isSunday = dayOfWeekIndex === 0;
  
  const cycle = getSundayCycle(d);
  const easter = getEasterDate(year);
  
  // Calculate key seasonal dates
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);
  
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);
  
  const christmas = new Date(year, 11, 25);
  const christmasDayOfWeek = christmas.getDay();
  const daysToAdvent = ((christmasDayOfWeek + 7 - 0) % 7) + 21;
  const adventStart = new Date(year, 11, 25 - daysToAdvent);
  
  // Epiphany & Baptism of the Lord
  const jan6 = new Date(year, 0, 6);
  const daysToSunday = (7 - jan6.getDay()) % 7;
  const baptismLord = new Date(year, 0, 6 + (daysToSunday === 0 ? 7 : daysToSunday));

  let season = 'ordinary';
  let seasonWeek = 1;
  let color = 'green';
  let celebrationTitle = '';
  let gospel = null;

  // 1. Check Fixed Solemnities and Major Feasts
  const fixedFeast = FIXED_SOLEMNITIES_AND_FEASTS[monthDayStr];
  if (fixedFeast && (!isSunday || fixedFeast.color !== 'green')) {
    celebrationTitle = fixedFeast.title;
    color = fixedFeast.color || 'white';
    gospel = {
      citation: fixedFeast.citation,
      bookId: fixedFeast.bookId,
      chapter: fixedFeast.chapter,
      startVerse: fixedFeast.startVerse,
      endVerse: fixedFeast.endVerse,
      title: fixedFeast.title,
      color: fixedFeast.color
    };
    return {
      date: d,
      dateStr,
      season: 'ordinary',
      seasonWeek: 1,
      weekday: weekdayName,
      cycle,
      celebrationTitle,
      color,
      gospel
    };
  }

  // 2. Determine Season
  if (d >= adventStart && d < christmas) {
    season = 'advent';
    color = 'purple';
    const diffDays = Math.floor((d - adventStart) / (1000 * 60 * 60 * 24));
    seasonWeek = Math.min(4, Math.floor(diffDays / 7) + 1);
    
    if (isSunday) {
      const sundayData = SUNDAY_GOSPELS.advent[seasonWeek]?.[cycle];
      celebrationTitle = sundayData?.title || `${seasonWeek}th Sunday of Advent`;
      color = sundayData?.color || 'purple';
      gospel = sundayData;
    } else {
      celebrationTitle = `${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} of the ${seasonWeek}${getOrdinalSuffix(seasonWeek)} Week of Advent`;
      gospel = { citation: 'Matthew 11:28-30', bookId: 'matthew', chapter: 11, startVerse: 28, endVerse: 30 };
    }
  } else if ((d.getMonth() === 11 && d.getDate() >= 25) || (d.getMonth() === 0 && d <= baptismLord)) {
    season = 'christmas';
    color = 'white';
    celebrationTitle = `Christmas Season - ${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}`;
    gospel = { citation: 'John 1:1-18', bookId: 'john', chapter: 1, startVerse: 1, endVerse: 18 };
  } else if (d >= ashWednesday && d < easter) {
    season = 'lent';
    color = 'purple';
    const diffDays = Math.floor((d - ashWednesday) / (1000 * 60 * 60 * 24));
    seasonWeek = Math.max(1, Math.min(6, Math.floor(diffDays / 7) + 1));
    
    if (isSunday) {
      const sundayData = SUNDAY_GOSPELS.lent[seasonWeek]?.[cycle];
      celebrationTitle = sundayData?.title || `${seasonWeek}th Sunday of Lent`;
      color = sundayData?.color || 'purple';
      gospel = sundayData;
    } else {
      celebrationTitle = `${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} of the ${seasonWeek}${getOrdinalSuffix(seasonWeek)} Week of Lent`;
      gospel = { citation: 'Matthew 6:1-6, 16-18', bookId: 'matthew', chapter: 6, startVerse: 1, endVerse: 18 };
    }
  } else if (d >= easter && d <= pentecost) {
    season = 'easter';
    color = 'white';
    const diffDays = Math.floor((d - easter) / (1000 * 60 * 60 * 24));
    seasonWeek = Math.min(7, Math.floor(diffDays / 7) + 1);
    
    if (isSunday) {
      const isPentecost = Math.abs(d - pentecost) < 86400000;
      const sundayData = isPentecost 
        ? SUNDAY_GOSPELS.easter.pentecost[cycle] 
        : SUNDAY_GOSPELS.easter[seasonWeek]?.[cycle];
      celebrationTitle = sundayData?.title || `${seasonWeek}th Sunday of Easter`;
      color = sundayData?.color || 'white';
      gospel = sundayData;
    } else {
      celebrationTitle = `${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} of the ${seasonWeek}${getOrdinalSuffix(seasonWeek)} Week of Easter`;
      gospel = { citation: 'John 3:16-21', bookId: 'john', chapter: 3, startVerse: 16, endVerse: 21 };
    }
  } else {
    // Ordinary Time
    season = 'ordinary';
    color = 'green';
    
    if (d < ashWednesday) {
      const diffDays = Math.floor((d - baptismLord) / (1000 * 60 * 60 * 24));
      seasonWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
    } else {
      // Ordinary Time Part 2
      const diffFromPentecost = Math.floor((d - pentecost) / (1000 * 60 * 60 * 24));
      const weeksFromAdvent = Math.floor((adventStart - d) / (1000 * 60 * 60 * 24 * 7));
      seasonWeek = Math.max(1, Math.min(34, 34 - weeksFromAdvent));
    }
    
    if (isSunday) {
      const sundayData = SUNDAY_GOSPELS.ordinary[seasonWeek]?.[cycle];
      celebrationTitle = sundayData?.title || `${seasonWeek}${getOrdinalSuffix(seasonWeek)} Sunday in Ordinary Time`;
      color = sundayData?.color || 'green';
      gospel = sundayData;
    } else {
      celebrationTitle = `${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)} of the ${seasonWeek}${getOrdinalSuffix(seasonWeek)} Week in Ordinary Time`;
      const weekdayGospel = WEEKDAY_ORDINARY_GOSPELS[seasonWeek]?.[weekdayName];
      if (weekdayGospel) {
        gospel = {
          ...weekdayGospel,
          title: celebrationTitle,
          color: 'green'
        };
      } else {
        gospel = { citation: 'Matthew 5:1-12', bookId: 'matthew', chapter: 5, startVerse: 1, endVerse: 12 };
      }
    }
  }

  return {
    date: d,
    dateStr,
    season,
    seasonWeek,
    weekday: weekdayName,
    cycle,
    celebrationTitle,
    color,
    gospel: gospel || { citation: 'Matthew 5:1-12', bookId: 'matthew', chapter: 5, startVerse: 1, endVerse: 12, title: celebrationTitle, color }
  };
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Fetches enriched liturgical day info (online with fast timeout and fallback).
 */
export async function getLiturgicalDayInfo(dateInput) {
  const localCalc = getCalculatedLiturgicalDay(dateInput);
  const dateStr = localCalc.dateStr;
  const cacheKey = `litcal_${dateStr}`;
  
  // Try localStorage cached enriched data
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...localCalc, ...parsed };
    }
  } catch (e) {
    // Ignore cache access issues
  }

  // Attempt online CalAPI fetch with 1.8s timeout
  try {
    const [y, m, d] = dateStr.split('-');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    
    const res = await fetch(`https://calapi.inadiutorium.cz/api/v0/en/calendars/default/${y}/${m}/${d}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      const celeb = data.celebrations?.[0];
      const enriched = {
        celebrationTitle: celeb?.title || localCalc.celebrationTitle,
        color: celeb?.colour || localCalc.color,
        season: data.season || localCalc.season,
        seasonWeek: data.season_week || localCalc.seasonWeek
      };

      // Check if celebratory feast has specific fixed Gospel match
      const monthDayStr = `${m}-${d}`;
      const fixedFeast = FIXED_SOLEMNITIES_AND_FEASTS[monthDayStr];
      if (fixedFeast && (celeb?.rank === 'solemnity' || celeb?.rank === 'feast' || celeb?.rank === 'memorial')) {
        enriched.gospel = {
          citation: fixedFeast.citation,
          bookId: fixedFeast.bookId,
          chapter: fixedFeast.chapter,
          startVerse: fixedFeast.startVerse,
          endVerse: fixedFeast.endVerse,
          title: celeb?.title || fixedFeast.title,
          color: celeb?.colour || fixedFeast.color
        };
      }

      const result = { ...localCalc, ...enriched };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(enriched));
      } catch (e) {}
      
      return result;
    }
  } catch (err) {
    // Network timeout or offline - seamlessly return local calculated data
  }

  return localCalc;
}

/**
 * Resolves a citation string (e.g. "Matthew 6:1-6, 16-18" or "Luke 21:25-28, 34-36" or "Matthew 26:14-27:66" or "John 15:26-27; 16:12-15")
 * into a structured object containing bookId and a map of chapter -> Set of verse numbers (as strings).
 */
export function getVersesFromCitation(citation, defaultBookId = null) {
  if (!citation) return { bookId: defaultBookId, chapters: {} };

  // Determine bookId
  let bookId = defaultBookId;
  const lowerCit = citation.toLowerCase();
  if (lowerCit.includes('matthew') || lowerCit.includes('matt') || lowerCit.includes('mt')) bookId = 'matthew';
  else if (lowerCit.includes('mark') || lowerCit.includes('mk')) bookId = 'mark';
  else if (lowerCit.includes('luke') || lowerCit.includes('lk')) bookId = 'luke';
  else if (lowerCit.includes('john') || lowerCit.includes('jn')) bookId = 'john';

  // Remove the book name from citation
  const rest = citation.replace(/^(?:1|2|3)?\s*[A-Za-z]+\s+/i, '').trim();

  // Chapters map: { "chapterNum": Set of verse strings }
  const chapters = {};

  // Check if citation contains semicolons separating chapter segments e.g. "15:26-27; 16:12-15" or "1:1-4; 4:14-21"
  const segments = rest.split(/\s*;\s*/);

  for (const seg of segments) {
    // Check for cross-chapter range like "26:14-27:66"
    const crossChapterMatch = seg.match(/^(\d+):(\d+)\s*-\s*(\d+):(\d+)$/);
    if (crossChapterMatch) {
      const startChap = parseInt(crossChapterMatch[1], 10);
      const startV = parseInt(crossChapterMatch[2], 10);
      const endChap = parseInt(crossChapterMatch[3], 10);
      const endV = parseInt(crossChapterMatch[4], 10);

      for (let ch = startChap; ch <= endChap; ch++) {
        const chStr = String(ch);
        if (!chapters[chStr]) chapters[chStr] = new Set();
        const minV = (ch === startChap) ? startV : 1;
        const maxV = (ch === endChap) ? endV : 150;
        for (let v = minV; v <= maxV; v++) {
          chapters[chStr].add(String(v));
        }
      }
      continue;
    }

    // Standard chapter segment: "21:25-28, 34-36" or "6:1-6, 16-18" or "5:1-12" or "5:13"
    const colonIdx = seg.indexOf(':');
    if (colonIdx === -1) continue;

    const chapNumStr = seg.substring(0, colonIdx).trim();
    const versePart = seg.substring(colonIdx + 1).trim();

    if (!chapters[chapNumStr]) chapters[chapNumStr] = new Set();

    // Split commas: e.g. "25-28", "34-36"
    const verseRanges = versePart.split(/\s*,\s*/);
    for (const vr of verseRanges) {
      if (vr.includes('-')) {
        const [s, e] = vr.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(s) && !isNaN(e)) {
          for (let v = s; v <= e; v++) {
            chapters[chapNumStr].add(String(v));
          }
        }
      } else {
        const singleV = parseInt(vr.trim(), 10);
        if (!isNaN(singleV)) {
          chapters[chapNumStr].add(String(singleV));
        }
      }
    }
  }

  return { bookId, chapters };
}

/**
 * Resolves a Gospel citation (e.g. "Matthew 19:3-12") to book, chapter, and verse range.
 */
export function parseGospelCitation(citation) {
  if (!citation) return null;
  
  // Format: "Matthew 19:3-12" or "Luke 1:26-38" or "John 20:1-9"
  const match = citation.match(/([1-3]?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);
  if (!match) return null;
  
  const rawBook = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const startVerse = parseInt(match[3], 10);
  const endVerse = match[4] ? parseInt(match[4], 10) : startVerse;
  
  let bookId = 'matthew';
  if (rawBook.includes('mark')) bookId = 'mark';
  else if (rawBook.includes('luke')) bookId = 'luke';
  else if (rawBook.includes('john')) bookId = 'john';
  
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  
  return {
    bookId,
    book,
    chapter,
    startVerse,
    endVerse,
    citation
  };
}

/**
 * Fetches and filters the verses for a Gospel reading from Douay-Rheims JSON text.
 */
export async function fetchGospelVerses(gospelObj) {
  if (!gospelObj) return null;
  
  const citationVerses = gospelObj.citation ? getVersesFromCitation(gospelObj.citation, gospelObj.bookId) : null;
  const bookId = citationVerses?.bookId || gospelObj.bookId;
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  if (!book) return null;
  
  try {
    const res = await fetch(`/douay-rheims/${encodeURIComponent(book.filename)}`);
    if (!res.ok) throw new Error('Failed to load Scripture');
    const chapterData = await res.json();
    const targetChapter = String(gospelObj.chapter);
    const allChapterVerses = chapterData[targetChapter] || {};
    
    // Slice only the verses in the range if specified
    const gospelVerses = {};
    if (citationVerses?.chapters?.[targetChapter] && citationVerses.chapters[targetChapter].size > 0) {
      for (const vNum of citationVerses.chapters[targetChapter]) {
        if (allChapterVerses[vNum]) {
          gospelVerses[vNum] = allChapterVerses[vNum];
        }
      }
    } else {
      const start = gospelObj.startVerse || 1;
      const end = gospelObj.endVerse || Object.keys(allChapterVerses).length;
      for (let v = start; v <= end; v++) {
        if (allChapterVerses[String(v)]) {
          gospelVerses[String(v)] = allChapterVerses[String(v)];
        }
      }
    }
    
    return {
      book,
      chapter: gospelObj.chapter,
      startVerse: gospelObj.startVerse || 1,
      endVerse: gospelObj.endVerse || Object.keys(allChapterVerses).length,
      verses: gospelVerses,
      allChapterVerses
    };
  } catch (err) {
    console.error('Error fetching Gospel verses:', err);
    return null;
  }
}
