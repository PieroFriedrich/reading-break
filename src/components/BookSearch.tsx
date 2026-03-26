'use client';

import { useState, useEffect, useRef } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import BookCard from './BookCard';

interface Props {
  savedBooks: UserBook[];
  onSave: (book: Book, status: ReadingStatus) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onUpdateRating: (bookId: string, rating: number | null) => void;
  onUpdateProgress: (bookId: string, pages: number | null) => void;
  onUpdateFinishedAt: (bookId: string, date: string | null) => void;
  onRemove: (bookId: string) => void;
}

export default function BookSearch({ savedBooks, onSave, onUpdateStatus, onUpdateRating, onUpdateProgress, onUpdateFinishedAt, onRemove }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedMap = new Map(savedBooks.map((b) => [b.bookId, b]));

  useEffect(() => {
    fetch('/api/books/trending')
      .then((r) => r.json())
      .then((data) => {
        setTrendingBooks(data.books ?? []);
        setLoadingTrending(false);
      })
      .catch(() => { setLoadingTrending(false); });
  }, []);

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

  const isSearching = query.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book…"
          className="w-full px-4 py-3 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] shadow-sm bg-white dark:bg-[#251a14] text-gray-800 dark:text-[#e8ddd8] placeholder-gray-400 dark:placeholder-[#7a6055] focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aa8a6e] dark:text-[#957060] text-sm">
            Searching…
          </span>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {isSearching ? (
        <>
          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  savedBook={savedMap.get(book.id)}
                  onSave={onSave}
                  onUpdateStatus={onUpdateStatus}
                  onUpdateRating={onUpdateRating}
                  onUpdateProgress={onUpdateProgress}
                  onUpdateFinishedAt={onUpdateFinishedAt}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
          {!searching && results.length === 0 && !error && (
            <p className="text-[#aa8a6e] dark:text-[#957060] text-sm text-center">No results found.</p>
          )}
        </>
      ) : loadingTrending ? (
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm">retrieving books...</p>
      ) : (
        trendingBooks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Trending Now
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trendingBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  savedBook={savedMap.get(book.id)}
                  onSave={onSave}
                  onUpdateStatus={onUpdateStatus}
                  onUpdateRating={onUpdateRating}
                  onUpdateProgress={onUpdateProgress}
                  onUpdateFinishedAt={onUpdateFinishedAt}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
