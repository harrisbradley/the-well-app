import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BIBLE_BOOKS } from '../src/data/books.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_DIR = path.join(__dirname, '../public/douay-rheims');

console.log('Running automated dataset validation across all 73 books...');

let totalChaptersCount = 0;
let totalVersesCount = 0;
let errors = [];

for (const book of BIBLE_BOOKS) {
  const filePath = path.join(DATASET_DIR, book.filename);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing file for ${book.name}: ${book.filename}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    errors.push(`Invalid JSON format in ${book.filename}: ${e.message}`);
    continue;
  }

  const chapters = Object.keys(data);
  if (chapters.length === 0) {
    errors.push(`Book ${book.name} (${book.filename}) contains 0 chapters!`);
    continue;
  }

  totalChaptersCount += chapters.length;

  for (const ch of chapters) {
    const verses = Object.keys(data[ch] || {});
    if (verses.length === 0) {
      errors.push(`Book ${book.name} chapter ${ch} has 0 verses!`);
    } else {
      totalVersesCount += verses.length;
    }
  }

  // Specifically check Issue #42 affected books
  if (book.id === 'job' && chapters.length < 42) {
    errors.push(`Job has only ${chapters.length} chapters (expected 42)!`);
  }
  if (book.id === 'numbers' && chapters.length < 36) {
    errors.push(`Numbers has only ${chapters.length} chapters (expected 36)!`);
  }
  if (book.id === '1corinthians' && chapters.length < 16) {
    errors.push(`1 Corinthians has only ${chapters.length} chapters (expected 16)!`);
  }
}

if (errors.length > 0) {
  console.error('❌ Validation Failed with errors:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log(`✅ Validation Passed!`);
  console.log(`- 73/73 Books Validated`);
  console.log(`- ${totalChaptersCount} Total Chapters`);
  console.log(`- ${totalVersesCount} Total Verses`);
}
