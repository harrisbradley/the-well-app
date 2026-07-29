import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { BIBLE_BOOKS } from '../src/data/books.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/douay-rheims');

// Explicit book ID mapping to BibleCorps filename prefixes
const BIBLECORPS_PREFIX_MAP = {
  'judith': '18-JDT',
  'james': '69-JAM',
  'jude': '75-JUD',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TheWellApp-Generator' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
      }
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseSfm(sfmContent) {
  const chapters = {};
  let currentChapter = null;
  let currentVerse = null;

  const lines = sfmContent.split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('\\c ')) {
      currentChapter = line.split(/\s+/)[1].trim();
      chapters[currentChapter] = {};
      currentVerse = null;
    } else if (line.startsWith('\\v ') && currentChapter) {
      const rest = line.substring(3).trim();
      const firstSpaceIdx = rest.indexOf(' ');
      if (firstSpaceIdx !== -1) {
        currentVerse = rest.substring(0, firstSpaceIdx).trim();
        let text = rest.substring(firstSpaceIdx + 1).trim();
        text = cleanUsfmText(text);
        if (text) {
          chapters[currentChapter][currentVerse] = text;
        }
      }
    } else if (currentChapter && currentVerse && !line.startsWith('\\')) {
      let text = cleanUsfmText(line);
      if (text) {
        if (chapters[currentChapter][currentVerse]) {
          chapters[currentChapter][currentVerse] += ' ' + text;
        } else {
          chapters[currentChapter][currentVerse] = text;
        }
      }
    }
  }

  // Clean up any double spaces in verses
  for (const ch of Object.keys(chapters)) {
    for (const v of Object.keys(chapters[ch])) {
      chapters[ch][v] = chapters[ch][v].replace(/\s+/g, ' ').trim();
    }
  }

  return chapters;
}

function cleanUsfmText(text) {
  return text
    .replace(/\\f[\s\S]*?\\f\*/g, '')  // Remove footnotes
    .replace(/\\x[\s\S]*?\\x\*/g, '')  // Remove cross references
    .replace(/\\[a-z0-9]+\*?/gi, '')    // Remove formatting markers (\p, \q, \q1, \r, etc.)
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('Fetching file index from BibleCorps repository...');
  const contentsRaw = await fetchUrl('https://api.github.com/repos/BibleCorps/ENG-B-DRC1750-pd-PSFM/contents');
  const filesList = JSON.parse(contentsRaw);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Processing ${BIBLE_BOOKS.length} Catholic Bible books...`);

  let successCount = 0;
  for (const book of BIBLE_BOOKS) {
    let matchingFile = null;

    if (BIBLECORPS_PREFIX_MAP[book.id]) {
      const targetPrefix = BIBLECORPS_PREFIX_MAP[book.id];
      matchingFile = filesList.find(f => f.name.startsWith(targetPrefix));
    } else {
      const code = book.usfmCode;
      matchingFile = filesList.find(f => f.name.includes(`-${code}-`) || f.name.startsWith(`${code}-`));
    }

    if (!matchingFile) {
      console.error(`❌ Could not find SFM file for book: ${book.id} (${book.name})`);
      continue;
    }

    const rawSfm = await fetchUrl(matchingFile.download_url);
    const parsedData = parseSfm(rawSfm);

    const outPath = path.join(OUTPUT_DIR, book.filename);
    fs.writeFileSync(outPath, JSON.stringify(parsedData, null, 2), 'utf8');

    const parsedChapters = Object.keys(parsedData).length;
    console.log(`[${++successCount}/${BIBLE_BOOKS.length}] ${book.name} -> ${book.filename} (${parsedChapters}/${book.chapters} chapters)`);
  }

  console.log('✨ Douay-Rheims dataset generation complete!');
}

main().catch(err => {
  console.error('Fatal error during dataset generation:', err);
  process.exit(1);
});
