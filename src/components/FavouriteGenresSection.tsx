'use client';

import { useState, useEffect } from 'react';
import type { Book, UserBook } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import BookCard from './BookCard';

interface Props {
  finishedBooks: UserBook[];
}

export default function FavouriteGenresSection({ finishedBooks }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook } = useUserBooks();
  const savedMap = new Map(userBooks.map((b) => [b.bookId, b]));

  const bookIds = finishedBooks.map((b) => b.bookId).join(',');

  useEffect(() => {
    if (finishedBooks.length === 0) {
      setLoading(false);
      return;
    }

    async function load() {
      // Collect stored subjects first
      const subjectsByBook = new Map<string, string[]>();
      finishedBooks.forEach((b) => {
        if (b.bookSubjects?.length) subjectsByBook.set(b.bookId, b.bookSubjects);
      });

      // For books missing subjects, fetch from Open Library (up to 5)
      const missing = finishedBooks.filter((b) => !b.bookSubjects?.length).slice(0, 5);
      await Promise.all(
        missing.map(async (b) => {
          try {
            const workId = b.bookId.replace('/works/', '');
            const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
            if (!res.ok) return;
            const data = await res.json();
            const subjects: string[] = data.subjects?.slice(0, 10) ?? [];
            if (subjects.length) subjectsByBook.set(b.bookId, subjects);
          } catch {}
        })
      );

      // Count subject frequency across all finished books
      const counts = new Map<string, number>();
      subjectsByBook.forEach((subjects) => {
        subjects.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
      });

      const topGenres = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s);

      if (topGenres.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch books for each top genre in parallel, then merge & dedupe
      const results = await Promise.all(
        topGenres.map((genre) =>
          fetch(`/api/books/recommendations?subject=${encodeURIComponent(genre)}&exclude=`)
            .then((r) => r.json())
            .then((data): Book[] => data.books ?? [])
            .catch((): Book[] => [])
        )
      );

      const seen = new Set<string>();
      const merged: Book[] = [];
      for (const list of results) {
        for (const book of list) {
          if (!seen.has(book.id)) {
            seen.add(book.id);
            merged.push(book);
          }
        }
      }

      setBooks(merged.slice(0, 10));
      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookIds]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">Based on your favourite genres</h2>
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm">finding recommendations…</p>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">Based on your favourite genres</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            savedBook={savedMap.get(book.id)}
            onSave={saveBook}
            onUpdateStatus={updateStatus}
            onUpdateRating={updateRating}
            onUpdateProgress={updateProgress}
            onUpdateFinishedAt={updateFinishedAt}
            onRemove={removeBook}
          />
        ))}
      </div>
    </div>
  );
}
