'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import BookCard from './BookCard';

interface Props {
  subjects: string[];
  author: string | undefined;
  currentBookId: string;
}

export default function BookRecommendations({ subjects, author, currentBookId }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook } = useUserBooks();
  const savedMap = new Map(userBooks.map((b) => [b.bookId, b]));

  useEffect(() => {
    const subject = subjects[0];
    if (!subject && !author) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ exclude: currentBookId });
    if (subject) params.set('subject', subject);
    if (author) params.set('author', author);

    fetch(`/api/books/recommendations?${params}`)
      .then((r) => r.json())
      .then((data) => setBooks(data.books ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjects, author, currentBookId]);

  if (loading) {
    return <p className="text-[#aa8a6e] dark:text-[#957060] text-sm">finding recommendations…</p>;
  }

  if (books.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">You may also like</h2>
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
