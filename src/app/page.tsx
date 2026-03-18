'use client';

import BookSearch from '@/components/BookSearch';
import { useUserBooks } from '@/hooks/useUserBooks';

export default function Home() {
  const { userBooks, saveBook, updateStatus, removeBook } = useUserBooks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">Find your next book</h1>
        <p className="text-[#aa8a6e] dark:text-[#957060] text-sm mt-1">Search and add books to your reading list.</p>
      </div>
      <BookSearch
        savedBooks={userBooks}
        onSave={saveBook}
        onUpdateStatus={updateStatus}
        onRemove={removeBook}
      />
    </div>
  );
}
