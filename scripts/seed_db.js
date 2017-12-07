const db = require('../src/db');
const { readFile } = require('then-fs');
const sbd = require('sbd');

async function loadBook(title) {
  const chunks = sbd.sentences(await readFile(`scripts/books/${title}`, 'utf8'));

  return {title, chunks};
}

async function createBooks(titles) {
  for(let title of titles) {
    const book = await loadBook(title);
    await db.createBook(book.title, book.chunks);
  }
  console.log(`Created ${titles.length} books`);
  process.exit();
}

createBooks(['mark twain', 'sample'])
  .catch(error => console.log(error));
