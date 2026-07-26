/**
 * Helper utilities for managing and embedding YouTube videos for Bible in a Year days.
 */

/**
 * Extracts a YouTube Video ID from various URL formats or returns the ID if already clean.
 * @param {string} input - YouTube URL or Video ID
 * @returns {string|null} 11-character YouTube video ID, or null if invalid.
 */
export function extractYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  
  // 1. Direct 11-char ID format (alphanumeric, underscores, hyphens)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Standard watch URL: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 3. Shortened URL: youtu.be/ID
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // 4. Embed URL: youtube.com/embed/ID
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // 5. Shorts URL: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  return null;
}

/**
 * Generates an iframe embed URL for a given YouTube Video ID or URL.
 * @param {string} input - YouTube URL or Video ID
 * @param {object} options - Options like autoplay, enablejsapi, etc.
 * @returns {string|null} Embed URL for iframe src.
 */
export function getYouTubeEmbedUrl(input, options = {}) {
  const videoId = extractYouTubeId(input);
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    ...options
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Fallback search URL if no video ID is associated yet.
 * @param {number|string} dayNum 
 * @returns {string} YouTube search URL for the Bible in a Year episode
 */
export function getYouTubeSearchUrl(dayNum) {
  const query = encodeURIComponent(`Bible in a Year Day ${dayNum} Fr Mike Schmitz Ascension`);
  return `https://www.youtube.com/results?search_query=${query}`;
}
