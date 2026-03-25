import type { Book, BookDetail, OLSearchResponse } from './types';

export async function getTrendingBooks(): Promise<Book[]> {
  const url = 'https://openlibrary.org/trending/daily.json?limit=20';
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch trending books');
  const data = await res.json();
  return data.works.map((doc: { key: string; title: string; author_name?: string[]; first_publish_year?: number; cover_i?: number }) => ({
    id: doc.key,
    title: doc.title,
    author: doc.author_name?.[0],
    publishDate: doc.first_publish_year?.toString(),
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined,
  }));
}

export async function getBookDetail(workId: string): Promise<BookDetail | null> {
  try {
    const workRes = await fetch(`https://openlibrary.org/works/${workId}.json`, {
      next: { revalidate: 86400 },
    });
    if (!workRes.ok) return null;
    const data = await workRes.json();

    let author: string | undefined;
    const authorKey = data.authors?.[0]?.author?.key;
    if (authorKey) {
      const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
        next: { revalidate: 86400 },
      });
      if (authorRes.ok) {
        const authorData = await authorRes.json();
        author = authorData.name;
      }
    }

    const description =
      typeof data.description === 'string'
        ? data.description
        : data.description?.value;

    const coverUrl = data.covers?.[0]
      ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
      : `https://covers.openlibrary.org/b/olid/${workId}-L.jpg`;

    return {
      id: `/works/${workId}`,
      title: data.title,
      author,
      coverUrl,
      description,
      subjects: data.subjects?.slice(0, 20),
      firstPublishDate: data.first_publish_date,
    };
  } catch {
    return null;
  }
}

export async function getBooksBySubject(subject: string, limit = 6): Promise<Book[]> {
  try {
    const url = `https://openlibrary.org/search.json?subject=${encodeURIComponent(subject)}&limit=${limit}&fields=key,title,author_name,publisher,first_publish_year,cover_i`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: OLSearchResponse = await res.json();
    return data.docs.map((doc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0],
      publisher: doc.publisher?.[0],
      publishDate: doc.first_publish_year?.toString(),
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
    }));
  } catch {
    return [];
  }
}

export async function getBooksByAuthor(author: string, limit = 6): Promise<Book[]> {
  try {
    const url = `https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=${limit}&fields=key,title,author_name,publisher,first_publish_year,cover_i`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: OLSearchResponse = await res.json();
    return data.docs.map((doc) => ({
      id: doc.key,
      title: doc.title,
      author: doc.author_name?.[0],
      publisher: doc.publisher?.[0],
      publishDate: doc.first_publish_year?.toString(),
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
    }));
  } catch {
    return [];
  }
}

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
