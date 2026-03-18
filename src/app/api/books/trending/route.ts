import { NextResponse } from 'next/server';
import { getTrendingBooks } from '@/lib/openLibrary';

export async function GET() {
  try {
    const books = await getTrendingBooks();
    return NextResponse.json({ books });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch trending books' },
      { status: 500 }
    );
  }
}
