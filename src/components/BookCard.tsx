'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import StatusSelector from './StatusSelector';

interface Props {
  book: Book;
  savedBook?: UserBook;
  onSave: (book: Book, status: ReadingStatus) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onUpdateRating?: (bookId: string, rating: number | null) => void;
  onUpdateProgress?: (bookId: string, pages: number | null) => void;
  onUpdateFinishedAt?: (bookId: string, date: string | null) => void;
  onRemove: (bookId: string) => void;
}

function StarRating({
  rating,
  onRate,
}: {
  rating?: number;
  onRate: (value: number | null) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(rating === star ? null : star)}
          className="text-lg leading-none transition-colors"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={star <= (rating ?? 0) ? 'text-[#c17f3a]' : 'text-[#d4b896] dark:text-[#5a3d2c]'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function BookCard({ book, savedBook, onSave, onUpdateStatus, onUpdateRating, onUpdateProgress, onUpdateFinishedAt, onRemove }: Props) {
  const isSaved = !!savedBook;
  const bookPageUrl = `/books/${book.id.replace('/works/', '')}`;
  const [pct, setPct] = useState(savedBook?.readingProgress ?? 0);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setPct(savedBook?.readingProgress ?? 0);
  }, [savedBook?.readingProgress]);

  return (
    <div className="flex flex-col bg-[#f0eae5] dark:bg-[#8d6548] rounded-xl shadow-sm border border-[#7a5540] hover:shadow-md transition-shadow">
      <Link href={bookPageUrl} className="relative block w-full h-52 bg-[#f7f2ef] dark:bg-[#1c1410] flex items-center justify-center rounded-t-xl overflow-hidden">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <span className="text-4xl text-gray-300">📖</span>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1 bg-[#8d6548] rounded-b-xl">
        <Link href={bookPageUrl} className="block">
          <h3 className="font-semibold text-[#f0eae5] text-sm leading-snug line-clamp-2 hover:underline">{book.title}</h3>

          {book.author && (
            <p className="text-xs text-[#e0d4cc] line-clamp-1 mt-1">{book.author}</p>
          )}

          <div className="flex flex-wrap gap-1 text-xs text-[#c5ae9b] dark:text-[#c5ae9b] mt-1">
            {book.publisher && <span className="line-clamp-1">{book.publisher}</span>}
            {book.publisher && book.publishDate && <span>·</span>}
            {book.publishDate && <span>{book.publishDate}</span>}
          </div>
        </Link>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isSaved ? (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => onRemove(book.id)}
                  className="text-xs text-green-600 hover:text-green-800 transition-colors"
                >
                  Remove
                </button>
              </div>
              {savedBook.status === 'FINISHED' && onUpdateRating && (
                <StarRating
                  rating={savedBook.rating}
                  onRate={(value) => onUpdateRating(book.id, value)}
                />
              )}
              {savedBook.status === 'FINISHED' && onUpdateFinishedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#c5ae9b]">Finished on</span>
                  <input
                    type="date"
                    defaultValue={savedBook.finishedAt?.slice(0, 10) ?? today}
                    max={today}
                    onBlur={(e) => onUpdateFinishedAt(book.id, e.target.value || null)}
                    className="text-xs bg-transparent border border-[#7a5540] rounded px-1 py-0.5 text-[#f0eae5]"
                  />
                </div>
              )}
              {savedBook.status === 'READING' && onUpdateProgress && (
                <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={pct}
                      onChange={(e) => setPct(Number(e.target.value))}
                      onMouseUp={(e) => onUpdateProgress(book.id, Number((e.target as HTMLInputElement).value))}
                      onTouchEnd={(e) => onUpdateProgress(book.id, Number((e.target as HTMLInputElement).value))}
                      className="flex-1 accent-green-500"
                    />
                    <span className="text-xs text-[#c5ae9b] w-8 text-right">{pct}%</span>
                </div>
              )}
              <StatusSelector
                value={savedBook.status}
                onChange={(status) => onUpdateStatus(book.id, status)}
              />
            </>
          ) : (
            <StatusSelector
              placeholder="Add to list…"
              onChange={(status) => onSave(book, status)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
