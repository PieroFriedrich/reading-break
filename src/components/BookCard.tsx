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

export default function BookCard({ book, savedBook, onSave, onUpdateStatus, onUpdateRating, onUpdateProgress, onRemove }: Props) {
  const isSaved = !!savedBook;
  const bookPageUrl = `/books/${book.id.replace('/works/', '')}`;

  return (
    <div className="flex flex-col bg-[#f0eae5] dark:bg-[#8d6548] rounded-xl shadow-sm border border-[#ede3db] dark:border-[#7a5540] hover:shadow-md transition-shadow">
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

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={bookPageUrl} className="block">
          <h3 className="font-semibold text-[#4d352a] dark:text-[#f0eae5] text-sm leading-snug line-clamp-2 hover:underline">{book.title}</h3>

          {book.author && (
            <p className="text-xs text-[#9a7559] dark:text-[#e0d4cc] line-clamp-1 mt-1">{book.author}</p>
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
              {savedBook.status === 'READING' && onUpdateProgress && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    defaultValue={savedBook.readingProgress ?? ''}
                    placeholder="0"
                    onBlur={(e) => {
                      const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      onUpdateProgress(book.id, isNaN(val as number) ? null : val);
                    }}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-[#ddd0c4] dark:border-[#5a3d2c] bg-white dark:bg-[#7a5540] text-[#4d352a] dark:text-[#f0eae5] focus:outline-none focus:ring-1 focus:ring-green-400"
                  />
                  <span className="text-xs text-[#aa8a6e] dark:text-[#e0d4cc]">pages read</span>
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
