import type { Book, OLSearchResponse } from './types';

export async function searchBooks(query: string): Promise<Book[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,publisher,first_publish_year,cover_i`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch from Open Library');

  const data: OLSearchResponse = await res.json();

  return data.docs.map((doc) => ({
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.[0],
    publisher: doc.publisher?.[0],
    publishDate: doc.first_publish_year?.toString(),
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined,
  }));
}
