import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookDetail } from '@/lib/openLibrary';
import BookDetailActions from '@/components/BookDetailActions';

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBookDetail(id);

  if (!book) notFound();

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#9a7559] dark:text-[#c5ae9b] hover:text-[#4d352a] dark:hover:text-[#e8ddd8] transition-colors">
        ← Back
      </Link>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Cover */}
        <div className="flex-shrink-0 w-48 mx-auto sm:mx-0">
          <div className="relative w-48 h-72 bg-[#f0eae5] dark:bg-[#251a14] rounded-xl overflow-hidden shadow-md">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                fill
                className="object-contain p-2"
                sizes="192px"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-5xl text-gray-300">📖</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8] leading-snug">{book.title}</h1>
            {book.author && (
              <p className="text-[#9a7559] dark:text-[#c5ae9b] mt-1">{book.author}</p>
            )}
            <div className="flex flex-wrap gap-1 text-sm text-[#c5ae9b] dark:text-[#7a6055] mt-1">
              {book.publisher && <span>{book.publisher}</span>}
              {book.publisher && (book.publishDate || book.firstPublishDate) && <span>·</span>}
              {(book.publishDate || book.firstPublishDate) && (
                <span>{book.firstPublishDate ?? book.publishDate}</span>
              )}
            </div>
          </div>

          <BookDetailActions book={book} />
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">About this book</h2>
          <p className="text-[#634636] dark:text-[#c5ae9b] leading-relaxed whitespace-pre-line">{book.description}</p>
        </div>
      )}

      {/* Subjects */}
      {book.subjects && book.subjects.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {book.subjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 rounded-full text-sm bg-[#f0eae5] dark:bg-[#251a14] border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b]"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
