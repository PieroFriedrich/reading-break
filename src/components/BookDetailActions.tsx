'use client';

import { useState, useEffect } from 'react';
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
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook } = useUserBooks();
  const savedBook = userBooks.find((b) => b.bookId === book.id);
  const [pct, setPct] = useState(savedBook?.readingProgress ?? 0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setPct(savedBook?.readingProgress ?? 0);
  }, [savedBook?.readingProgress]);

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
          {savedBook.status === 'FINISHED' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#aa8a6e] dark:text-[#c5ae9b]">Finished on</span>
              <input
                type="date"
                defaultValue={savedBook.finishedAt?.slice(0, 10) ?? today}
                max={today}
                onBlur={(e) => updateFinishedAt(book.id, e.target.value || null)}
                className="text-sm bg-transparent border border-[#d4b896] dark:border-[#7a5540] rounded px-2 py-0.5 text-[#4d352a] dark:text-[#f0eae5]"
              />
            </div>
          )}

          {savedBook.status === 'READING' && (
            <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) => setPct(Number(e.target.value))}
                  onMouseUp={(e) => updateProgress(book.id, Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => updateProgress(book.id, Number((e.target as HTMLInputElement).value))}
                  className="flex-1 accent-green-500"
                />
                <span className="text-sm text-[#aa8a6e] dark:text-[#c5ae9b] w-10 text-right">{pct}%</span>
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
