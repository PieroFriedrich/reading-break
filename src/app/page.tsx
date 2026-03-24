'use client';

import BookSearch from '@/components/BookSearch';
import { useUserBooks } from '@/hooks/useUserBooks';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { userBooks, saveBook, updateStatus, removeBook } = useUserBooks();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">
          {user ? `Find your next book, ${user.username}` : 'Find your next book'}
        </h1>
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
