import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { ReadingStatus, UserBook } from '@/lib/types';

const USER_ID = 'guest';

interface DbRow {
  id: string;
  user_id: string;
  book_id: string;
  book_title: string;
  book_cover: string | null;
  book_author: string | null;
  book_publisher: string | null;
  book_publish_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function rowToUserBook(row: DbRow): UserBook {
  return {
    id: row.id,
    userId: row.user_id,
    bookId: row.book_id,
    bookTitle: row.book_title,
    bookCover: row.book_cover ?? undefined,
    bookAuthor: row.book_author ?? undefined,
    bookPublisher: row.book_publisher ?? undefined,
    bookPublishDate: row.book_publish_date ?? undefined,
    status: row.status as ReadingStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');

  let rows: DbRow[];
  if (status) {
    rows = db
      .prepare('SELECT * FROM user_books WHERE user_id = ? AND status = ? ORDER BY updated_at DESC')
      .all(USER_ID, status) as DbRow[];
  } else {
    rows = db
      .prepare('SELECT * FROM user_books WHERE user_id = ? ORDER BY updated_at DESC')
      .all(USER_ID) as DbRow[];
  }

  return NextResponse.json({ books: rows.map(rowToUserBook) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { book, status } = body as { book: { id: string; title: string; author?: string; publisher?: string; publishDate?: string; coverUrl?: string }; status: ReadingStatus };

  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO user_books (id, user_id, book_id, book_title, book_cover, book_author, book_publisher, book_publish_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET
      status = excluded.status,
      book_title = excluded.book_title,
      book_cover = excluded.book_cover,
      book_author = excluded.book_author,
      book_publisher = excluded.book_publisher,
      book_publish_date = excluded.book_publish_date,
      updated_at = datetime('now')
  `).run(id, USER_ID, book.id, book.title, book.coverUrl ?? null, book.author ?? null, book.publisher ?? null, book.publishDate ?? null, status);

  const row = db
    .prepare('SELECT * FROM user_books WHERE user_id = ? AND book_id = ?')
    .get(USER_ID, book.id) as DbRow;

  return NextResponse.json({ book: rowToUserBook(row) }, { status: 201 });
}
