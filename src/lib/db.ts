import Database from 'better-sqlite3';
import path from 'path';

const globalForDb = globalThis as { db?: Database.Database };

const db =
  globalForDb.db ??
  new Database(path.join(process.cwd(), 'data.db'));

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

db.pragma('journal_mode = WAL');

// Migrations — safe to run on every startup
try { db.exec('ALTER TABLE user_books ADD COLUMN rating INTEGER'); } catch {}
try { db.exec('ALTER TABLE user_books ADD COLUMN reading_progress INTEGER'); } catch {}
try { db.exec('UPDATE user_books SET reading_progress = NULL WHERE reading_progress > 100'); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS user_books (
    id               TEXT PRIMARY KEY,
    user_id          TEXT NOT NULL DEFAULT 'guest',
    book_id          TEXT NOT NULL,
    book_title       TEXT NOT NULL,
    book_cover       TEXT,
    book_author      TEXT,
    book_publisher   TEXT,
    book_publish_date TEXT,
    status           TEXT NOT NULL DEFAULT 'WISHLIST',
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    username        TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL
  );
`);

export default db;
