'use client';

import { useState } from 'react';
import { useUserBooks } from '@/hooks/useUserBooks';
import ExploreSection from '@/components/ExploreSection';
import FavouriteGenresSection from '@/components/FavouriteGenresSection';

const GENRES = [
  'Fiction',
  'Mystery',
  'Science Fiction',
  'History',
  'Biography',
  'Fantasy',
  'Romance',
  'Self-Help',
  'Thriller',
  'Philosophy',
];

export default function ExplorePage() {
  const { userBooks, loading } = useUserBooks();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const finished = userBooks
    .filter((b) => b.status === 'FINISHED')
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));

  const reading = userBooks.filter((b) => b.status === 'READING');

  const sourcebooks = [...finished, ...reading]
    .filter((b) => b.bookAuthor || b.bookSubjects?.length)
    .slice(0, 3);

  const showPersonalised = !loading && sourcebooks.length > 0;
  const showColdStart = !loading && sourcebooks.length === 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">Explore</h1>
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm mt-1">Discover books you might enjoy.</p>
      </div>

      {loading && (
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm">Loading…</p>
      )}

      {showPersonalised && finished.length > 0 && (
        <FavouriteGenresSection finishedBooks={finished} />
      )}

      {showPersonalised && sourcebooks.map((book) => (
        <ExploreSection
          key={book.bookId}
          title={`Because you read ${book.bookTitle}`}
          subject={book.bookSubjects?.[0]}
          author={book.bookAuthor}
          excludeBookId={book.bookId}
        />
      ))}

      {showColdStart && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#4d352a] dark:text-[#e8ddd8]">Browse by genre</h2>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedGenre === genre
                      ? 'bg-[#8d6548] border-[#8d6548] text-white'
                      : 'border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] hover:bg-[#f0eae5] dark:hover:bg-[#251a14]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {selectedGenre && (
            <ExploreSection
              key={selectedGenre}
              title={selectedGenre}
              subject={selectedGenre}
              excludeBookId=""
            />
          )}
        </div>
      )}
    </div>
  );
}
