'use client';

import BookSearch from '@/components/BookSearch';
import WelcomeCard from '@/components/WelcomeCard';
import { useUserBooks } from '@/hooks/useUserBooks';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { userBooks, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook } = useUserBooks();
  const { user, loading: authLoading } = useAuth();

  return (
    <div className="space-y-6">
      <WelcomeCard show={!user && !authLoading} />
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
        onUpdateRating={updateRating}
        onUpdateProgress={updateProgress}
        onUpdateFinishedAt={updateFinishedAt}
        onRemove={removeBook}
      />
    </div>
  );
}
