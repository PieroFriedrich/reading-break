import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { validateRequest } from '@/lib/auth';

type Period = 'week' | 'month' | 'year';

function getPeriodStart(period: Period): string {
  const now = new Date();
  if (period === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    return d.toISOString().slice(0, 10);
  }
  if (period === 'month') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }
  return `${now.getFullYear()}-01-01`;
}

interface BookRow {
  book_id: string;
  book_title: string;
  book_author: string | null;
  book_cover: string | null;
  finished_at: string;
}

function getFinishedBooks(userId: string, period: Period) {
  const start = getPeriodStart(period);
  const rows = db
    .prepare(
      `SELECT book_id, book_title, book_author, book_cover, finished_at
       FROM user_books
       WHERE user_id = ? AND status = 'FINISHED' AND finished_at >= ?
       ORDER BY finished_at DESC`
    )
    .all(userId, start) as BookRow[];
  return rows.map((r) => ({
    bookId: r.book_id,
    bookTitle: r.book_title,
    bookAuthor: r.book_author ?? undefined,
    bookCover: r.book_cover ?? undefined,
    finishedAt: r.finished_at,
  }));
}

export async function GET(request: NextRequest) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = db
    .prepare('SELECT period, target FROM user_goals WHERE user_id = ?')
    .all(user.id) as { period: string; target: number }[];

  const goalMap = new Map(rows.map((r) => [r.period, r.target]));

  const periods: Period[] = ['week', 'month', 'year'];
  const goals = periods.map((period) => {
    const target = goalMap.get(period) ?? null;
    const books = target !== null ? getFinishedBooks(user.id, period) : [];
    return {
      period,
      target,
      progress: books.length,
      books,
    };
  });

  return NextResponse.json({ goals });
}

export async function DELETE(request: NextRequest) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { period } = await request.json() as { period: Period };
  if (!['week', 'month', 'year'].includes(period)) {
    return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
  }

  db.prepare('DELETE FROM user_goals WHERE user_id = ? AND period = ?').run(user.id, period);
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { period, target } = body as { period: Period; target: number };

  if (!['week', 'month', 'year'].includes(period) || typeof target !== 'number' || target < 1) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  db.prepare(
    `INSERT INTO user_goals (id, user_id, period, target)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, period) DO UPDATE SET target = excluded.target, updated_at = datetime('now')`
  ).run(crypto.randomUUID(), user.id, period, target);

  return NextResponse.json({ success: true });
}
