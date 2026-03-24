'use client';

import { useState, useMemo } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import BookCard from '@/components/BookCard';

const STATUS_TABS: { label: string; value: ReadingStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Wishlist', value: 'WISHLIST' },
  { label: 'Reading', value: 'READING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Dropped', value: 'DROPPED' },
];

type SortBy = 'date_added' | 'title' | 'author' | 'rating';

function sortBooks(books: UserBook[], sortBy: SortBy): UserBook[] {
  return [...books].sort((a, b) => {
    if (sortBy === 'title') return a.bookTitle.localeCompare(b.bookTitle);
    if (sortBy === 'author') return (a.bookAuthor ?? '').localeCompare(b.bookAuthor ?? '');
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
    return b.createdAt.localeCompare(a.createdAt); // date_added desc
  });
}

export default function MyBooksPage() {
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortBy>('date_added');
  const { userBooks, loading, saveBook, updateStatus, updateRating, updateProgress, removeBook } = useUserBooks();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of userBooks) {
      map[b.status] = (map[b.status] ?? 0) + 1;
    }
    return map;
  }, [userBooks]);

  const filteredBooks = useMemo(() => {
    const filtered = activeFilter ? userBooks.filter((b) => b.status === activeFilter) : userBooks;
    return sortBooks(filtered, sortBy);
  }, [userBooks, activeFilter, sortBy]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">My Books</h1>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count = tab.value ? (counts[tab.value] ?? 0) : userBooks.length;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tab.value
                    ? 'bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5]'
                    : 'bg-[#f0eae5] dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] hover:border-[#9a7559] hover:text-[#634636] dark:hover:text-[#e8ddd8]'
                }`}
              >
                {tab.label}{count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="text-sm px-3 py-1.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] bg-white dark:bg-[#251a14] text-[#4d352a] dark:text-[#e8ddd8] focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="date_added">Date added</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="rating">Highest rating</option>
        </select>
      </div>

      {loading ? (
        <p className="text-[#c5ae9b] dark:text-[#7a6055] text-sm">Loading…</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-[#c5ae9b] dark:text-[#7a6055] text-sm">No books here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((ub) => {
            const book: Book = {
              id: ub.bookId,
              title: ub.bookTitle,
              author: ub.bookAuthor,
              publisher: ub.bookPublisher,
              publishDate: ub.bookPublishDate,
              coverUrl: ub.bookCover,
            };
            return (
              <BookCard
                key={ub.id}
                book={book}
                savedBook={ub}
                onSave={saveBook}
                onUpdateStatus={updateStatus}
                onUpdateRating={updateRating}
                onUpdateProgress={updateProgress}
                onRemove={removeBook}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
