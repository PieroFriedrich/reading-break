import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateRequest } from '@/lib/auth';
import type { ReadingStatus, UserBook } from '@/lib/types';

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
  rating: number | null;
  reading_progress: number | null;
  finished_at: string | null;
  book_subjects: string | null;
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
    rating: row.rating ?? undefined,
    readingProgress: row.reading_progress ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    bookSubjects: row.book_subjects ? JSON.parse(row.book_subjects) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ books: [] });

  const status = request.nextUrl.searchParams.get('status');
  let rows: DbRow[];
  if (status) {
    rows = db
      .prepare('SELECT * FROM user_books WHERE user_id = ? AND status = ? ORDER BY updated_at DESC')
      .all(user.id, status) as DbRow[];
  } else {
    rows = db
      .prepare('SELECT * FROM user_books WHERE user_id = ? ORDER BY updated_at DESC')
      .all(user.id) as DbRow[];
  }

  return NextResponse.json({ books: rows.map(rowToUserBook) });
}

export async function POST(request: NextRequest) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { book, status } = body as {
    book: { id: string; title: string; author?: string; publisher?: string; publishDate?: string; coverUrl?: string; subjects?: string[] };
    status: ReadingStatus;
  };

  const id = crypto.randomUUID();
  const bookSubjectsJson = book.subjects?.length ? JSON.stringify(book.subjects) : null;

  db.prepare(`
    INSERT INTO user_books (id, user_id, book_id, book_title, book_cover, book_author, book_publisher, book_publish_date, status, book_subjects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, book_id) DO UPDATE SET
      status = excluded.status,
      book_title = excluded.book_title,
      book_cover = excluded.book_cover,
      book_author = excluded.book_author,
      book_publisher = excluded.book_publisher,
      book_publish_date = excluded.book_publish_date,
      book_subjects = COALESCE(excluded.book_subjects, book_subjects),
      updated_at = datetime('now')
  `).run(id, user.id, book.id, book.title, book.coverUrl ?? null, book.author ?? null, book.publisher ?? null, book.publishDate ?? null, status, bookSubjectsJson);

  const row = db
    .prepare('SELECT * FROM user_books WHERE user_id = ? AND book_id = ?')
    .get(user.id, book.id) as DbRow;

  return NextResponse.json({ book: rowToUserBook(row) }, { status: 201 });
}
