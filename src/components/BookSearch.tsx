'use client';

import { useState, useEffect, useRef } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import BookCard from './BookCard';

interface Props {
  savedBooks: UserBook[];
  onSave: (book: Book, status: ReadingStatus) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onRemove: (bookId: string) => void;
}

export default function BookSearch({ savedBooks, onSave, onUpdateStatus, onRemove }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedMap = new Map(savedBooks.map((b) => [b.bookId, b]));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setError('');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Search failed');
        setResults(data.books);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            Searching…
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              savedBook={savedMap.get(book.id)}
              onSave={onSave}
              onUpdateStatus={onUpdateStatus}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {!searching && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="text-gray-400 text-sm text-center">No results found.</p>
      )}
    </div>
  );
}
