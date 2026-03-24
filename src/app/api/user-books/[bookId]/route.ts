import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId } = await params;
  const decodedBookId = decodeURIComponent(bookId);
  const body = await request.json();
  const { status, rating, readingProgress } = body;

  const setClauses: string[] = ["updated_at = datetime('now')"];
  const values: unknown[] = [];

  if (status !== undefined) { setClauses.push('status = ?'); values.push(status); }
  if ('rating' in body) { setClauses.push('rating = ?'); values.push(rating ?? null); }
  if ('readingProgress' in body) { setClauses.push('reading_progress = ?'); values.push(readingProgress ?? null); }

  values.push(user.id, decodedBookId);

  const result = db
    .prepare(`UPDATE user_books SET ${setClauses.join(', ')} WHERE user_id = ? AND book_id = ?`)
    .run(...values);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId } = await params;
  const decodedBookId = decodeURIComponent(bookId);

  db.prepare('DELETE FROM user_books WHERE user_id = ? AND book_id = ?').run(
    user.id,
    decodedBookId
  );

  return new NextResponse(null, { status: 204 });
}
