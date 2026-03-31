'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import BookCard from './BookCard';

interface Props {
  title: string;
  subject?: string;
  author?: string;
  excludeBookId: string;
}

export default function ExploreSection({ title, subject, author, excludeBookId }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook } = useUserBooks();
  const savedMap = new Map(userBooks.map((b) => [b.bookId, b]));

  useEffect(() => {
    if (!subject && !author) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ exclude: excludeBookId });
    if (subject) params.set('subject', subject);
    if (author) params.set('author', author);

    fetch(`/api/books/recommendations?${params}`)
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subject, author, excludeBookId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">{title}</h2>
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm">finding recommendations…</p>
      </div>
    );
  }

  if (books.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">{title}</h2>
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
