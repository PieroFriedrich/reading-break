import { NextRequest, NextResponse } from 'next/server';
import { getBooksBySubject, getBooksByAuthor } from '@/lib/openLibrary';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subject = searchParams.get('subject');
  const author = searchParams.get('author');
  const exclude = searchParams.get('exclude');

  if (!subject && !author) {
    return NextResponse.json({ books: [] });
  }

  const [subjectBooks, authorBooks] = await Promise.all([
    subject ? getBooksBySubject(subject, 6) : Promise.resolve([]),
    author ? getBooksByAuthor(author, 6) : Promise.resolve([]),
  ]);

  const filtered = (books: typeof subjectBooks) =>
    books.filter((b) => b.id !== exclude);

  const authorPicks = filtered(authorBooks).slice(0, 3);
  const authorIds = new Set(authorPicks.map((b) => b.id));
  const remaining = 5 - authorPicks.length;
  const subjectPicks = filtered(subjectBooks)
    .filter((b) => !authorIds.has(b.id))
    .slice(0, remaining);

  return NextResponse.json({ books: [...authorPicks, ...subjectPicks] });
}
