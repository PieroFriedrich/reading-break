'use client';

import { useState, useEffect, useRef } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import BookCard from './BookCard';

const PAGE_SIZE = 20;

interface Props {
  savedBooks: UserBook[];
  onSave: (book: Book, status: ReadingStatus) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onUpdateRating: (bookId: string, rating: number | null) => void;
  onUpdateProgress: (bookId: string, pages: number | null) => void;
  onUpdateFinishedAt: (bookId: string, date: string | null) => void;
  onRemove: (bookId: string) => void;
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] disabled:opacity-40 hover:bg-[#f0eae5] dark:hover:bg-[#251a14] transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-[#aa8a6e] dark:text-[#957060]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] disabled:opacity-40 hover:bg-[#f0eae5] dark:hover:bg-[#251a14] transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default function BookSearch({ savedBooks, onSave, onUpdateStatus, onUpdateRating, onUpdateProgress, onUpdateFinishedAt, onRemove }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [allTrending, setAllTrending] = useState<Book[]>([]);
  const [trendingPage, setTrendingPage] = useState(1);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savedMap = new Map(savedBooks.map((b) => [b.bookId, b]));

  useEffect(() => {
    fetch('/api/books/trending')
      .then((r) => r.json())
      .then((data) => {
        setAllTrending(data.books ?? []);
        setLoadingTrending(false);
      })
      .catch(() => { setLoadingTrending(false); });
  }, []);

  const fetchSearch = (q: string, page: number) => {
    setSearching(true);
    setError('');
    fetch(`/api/books/search?q=${encodeURIComponent(q)}&page=${page}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Search failed');
        setResults(data.books);
        setSearchTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
        setSearchTotal(0);
      })
      .finally(() => setSearching(false));
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setSearchTotal(0);
      setSearchPage(1);
      setError('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSearchPage(1);
      fetchSearch(query, 1);
    }, 400);
  }, [query]);

  const handleSearchPageChange = (page: number) => {
    setSearchPage(page);
    fetchSearch(query, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrendingPageChange = (page: number) => {
    setTrendingPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSearching = query.trim().length >= 2;
  const searchTotalPages = Math.ceil(searchTotal / PAGE_SIZE);
  const trendingTotalPages = Math.ceil(allTrending.length / PAGE_SIZE);
  const trendingBooks = allTrending.slice((trendingPage - 1) * PAGE_SIZE, trendingPage * PAGE_SIZE);

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
            <div className="space-y-4">
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
              <Pagination page={searchPage} totalPages={searchTotalPages} onChange={handleSearchPageChange} />
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
            <Pagination page={trendingPage} totalPages={trendingTotalPages} onChange={handleTrendingPageChange} />
          </div>
        )
      )}
    </div>
  );
}
