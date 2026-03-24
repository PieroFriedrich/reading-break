import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateRequest } from '@/lib/auth';
import type { ReadingStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const user = validateRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId } = await params;
  const decodedBookId = decodeURIComponent(bookId);
  const { status } = (await request.json()) as { status: ReadingStatus };

  const result = db
    .prepare(
      "UPDATE user_books SET status = ?, updated_at = datetime('now') WHERE user_id = ? AND book_id = ?"
    )
    .run(status, user.id, decodedBookId);

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
