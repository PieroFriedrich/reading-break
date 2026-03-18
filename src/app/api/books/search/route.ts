import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/openLibrary';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';

  if (q.trim().length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const books = await searchBooks(q);
  return NextResponse.json({ books });
}
