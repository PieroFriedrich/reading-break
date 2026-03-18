'use client';

import { useState } from 'react';
import type { Book, ReadingStatus } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import BookCard from '@/components/BookCard';

const TABS: { label: string; value: ReadingStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Wishlist', value: 'WISHLIST' },
  { label: 'Reading', value: 'READING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Dropped', value: 'DROPPED' },
];

export default function MyBooksPage() {
  const [activeFilter, setActiveFilter] = useState<ReadingStatus | undefined>(undefined);
  const { userBooks, loading, saveBook, updateStatus, removeBook } = useUserBooks(activeFilter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-900">My Books</h1>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab.value
                ? 'bg-purple-700 text-white'
                : 'bg-white border border-purple-200 text-purple-600 hover:border-purple-500 hover:text-purple-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-purple-300 text-sm">Loading…</p>
      ) : userBooks.length === 0 ? (
        <p className="text-purple-300 text-sm">No books here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userBooks.map((ub) => {
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
                onRemove={removeBook}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
