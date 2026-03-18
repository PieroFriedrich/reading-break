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
      <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">My Books</h1>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab.value
                ? 'bg-[#8d6548] dark:bg-[#5a3d2c] text-[#f0eae5]'
                : 'bg-[#f0eae5] dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] hover:border-[#9a7559] hover:text-[#634636] dark:hover:text-[#e8ddd8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[#c5ae9b] dark:text-[#7a6055] text-sm">Loading…</p>
      ) : userBooks.length === 0 ? (
        <p className="text-[#c5ae9b] dark:text-[#7a6055] text-sm">No books here yet.</p>
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
