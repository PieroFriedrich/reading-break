import Image from 'next/image';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import StatusBadge from './StatusBadge';
import StatusSelector from './StatusSelector';

interface Props {
  book: Book;
  savedBook?: UserBook;
  onSave: (book: Book, status: ReadingStatus) => void;
  onUpdateStatus: (bookId: string, status: ReadingStatus) => void;
  onRemove: (bookId: string) => void;
}

export default function BookCard({ book, savedBook, onSave, onUpdateStatus, onRemove }: Props) {
  const isSaved = !!savedBook;

  return (
    <div className="flex flex-col bg-[#f0eae5] rounded-xl shadow-sm border border-[#ede3db] hover:shadow-md transition-shadow">
      <div className="relative w-full h-52 bg-[#f7f2ef] flex items-center justify-center rounded-t-xl overflow-hidden">
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
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-[#4d352a] text-sm leading-snug line-clamp-2">{book.title}</h3>

        {book.author && (
          <p className="text-xs text-[#9a7559] line-clamp-1">{book.author}</p>
        )}

        <div className="flex flex-wrap gap-1 text-xs text-[#c5ae9b]">
          {book.publisher && <span className="line-clamp-1">{book.publisher}</span>}
          {book.publisher && book.publishDate && <span>·</span>}
          {book.publishDate && <span>{book.publishDate}</span>}
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          {isSaved ? (
            <>
              <div className="flex items-center justify-between">
                <StatusBadge status={savedBook.status} />
                <button
                  onClick={() => onRemove(book.id)}
                  className="text-xs text-green-600 hover:text-green-800 transition-colors"
                >
                  Remove
                </button>
              </div>
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
