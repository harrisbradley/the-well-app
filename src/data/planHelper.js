import { BIBLE_BOOKS } from './books';
import readingPlan from './reading-plan.json';

/**
 * Resolves a book identifier (ID, USFM code, or name) to the standard book object.
 * @param {string} bookIdent - The book identifier (e.g. 'genesis', 'GEN', 'Genesis').
 * @returns {object|null} The book object from books.js, or null if not found.
 */
export function resolveBook(bookIdent) {
  if (!bookIdent) return null;
  const clean = bookIdent.toLowerCase().trim();
  return BIBLE_BOOKS.find(b => 
    (b.id && b.id.toLowerCase() === clean) || 
    (b.usfmCode && b.usfmCode.toLowerCase() === clean) || 
    (b.name && b.name.toLowerCase() === clean)
  ) || null;
}

/**
 * Parses a scripture coordinate string (e.g., 'GEN.1.1', 'genesis.1', or 'GEN') into its components.
 * @param {string} coordinate - The coordinate string.
 * @returns {object|null} Parsed object with book object, chapter (number or null), and verse (string or null).
 */
export function parseCoordinate(coordinate) {
  if (!coordinate) return null;
  const parts = String(coordinate).split('.');
  const bookIdent = parts[0];
  const chapter = parts.length > 1 ? parseInt(parts[1], 10) : null;
  const verse = parts.length > 2 ? parts[2] : null;
  
  const book = resolveBook(bookIdent);
  if (!book) return null;
  
  return {
    book,
    chapter: isNaN(chapter) ? null : chapter,
    verse
  };
}

/**
 * Gets the reading plan entry for a specific day.
 * @param {number|string} day - The day number (1-365).
 * @returns {object|null} The plan entry (day, readings, period), or null.
 */
export function getReadingsForDay(day) {
  const dayNum = parseInt(day, 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 365) return null;
  return readingPlan.find(p => p.day === dayNum) || null;
}

/**
 * Finds all podcast days (1-365) that cover a given scripture coordinate.
 * @param {string} coordinate - The coordinate string (e.g. 'GEN.1.1', 'GEN.1', 'genesis').
 * @returns {number[]} Array of day numbers (1-365) containing the coordinate.
 */
export function getDaysForVerse(coordinate) {
  const parsed = parseCoordinate(coordinate);
  if (!parsed) return [];
  
  const usfm = parsed.book.usfmCode;
  const ch = parsed.chapter;
  
  const matchingDays = [];
  
  for (const entry of readingPlan) {
    for (const r of entry.readings) {
      if (r.bookId === usfm) {
        // If chapter is specified, check if it falls in the range
        if (ch !== null) {
          if (ch >= r.startChapter && ch <= r.endChapter) {
            matchingDays.push(entry.day);
            break; // Avoid adding the same day multiple times
          }
        } else {
          // If no chapter is specified, any match for this book counts
          matchingDays.push(entry.day);
          break;
        }
      }
    }
  }
  
  return matchingDays;
}
