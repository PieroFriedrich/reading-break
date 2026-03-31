import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/openLibrary';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10));

  if (q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const { books, total } = await searchBooks(q, (page - 1) * 20);
  return NextResponse.json({ books, total, page });
}
