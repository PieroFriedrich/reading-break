'use client';

import type { Book, ReadingStatus } from '@/lib/types';
import { useUserBooks } from '@/hooks/useUserBooks';
import StatusSelector from './StatusSelector';

function StarRating({ rating, onRate }: { rating?: number; onRate: (v: number | null) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(rating === star ? null : star)}
          className="text-2xl leading-none transition-colors"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= (rating ?? 0) ? 'text-[#c17f3a]' : 'text-[#d4b896] dark:text-[#5a3d2c]'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function BookDetailActions({ book }: { book: Book }) {
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, removeBook } = useUserBooks();
  const savedBook = userBooks.find((b) => b.bookId === book.id);

  return (
    <div className="flex flex-col gap-3">
      {savedBook ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => removeBook(book.id)}
              className="text-sm text-green-600 hover:text-green-800 transition-colors"
            >
              Remove from list
            </button>
          </div>

          {savedBook.status === 'FINISHED' && (
            <StarRating
              rating={savedBook.rating}
              onRate={(value) => updateRating(book.id, value)}
            />
          )}

          {savedBook.status === 'READING' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                defaultValue={savedBook.readingProgress ?? ''}
                placeholder="0"
                onBlur={(e) => {
                  const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                  updateProgress(book.id, isNaN(val as number) ? null : val);
                }}
                className="w-20 px-2 py-1 text-sm rounded-lg border border-[#ddd0c4] dark:border-[#5a3d2c] bg-white dark:bg-[#251a14] text-[#4d352a] dark:text-[#f0eae5] focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              <span className="text-sm text-[#aa8a6e] dark:text-[#c5ae9b]">pages read</span>
            </div>
          )}

          <div className="w-48">
            <StatusSelector
              value={savedBook.status}
              onChange={(status: ReadingStatus) => updateStatus(book.id, status)}
            />
          </div>
        </>
      ) : (
        <div className="w-48">
          <StatusSelector
            placeholder="Add to list…"
            onChange={(status: ReadingStatus) => saveBook(book, status)}
          />
        </div>
      )}
    </div>
  );
}
