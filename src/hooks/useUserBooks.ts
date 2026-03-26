'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGuestBooks,
  addGuestBook,
  updateGuestBookStatus,
  updateGuestBookRating,
  updateGuestBookProgress,
  updateGuestBookFinishedAt,
  removeGuestBook,
} from '@/lib/guestBooks';

export function useUserBooks(statusFilter?: ReadingStatus) {
  const { user, loading: authLoading } = useAuth();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    if (user) {
      const url = statusFilter ? `/api/user-books?status=${statusFilter}` : '/api/user-books';
      const res = await fetch(url);
      const data = await res.json();
      setUserBooks(data.books ?? []);
    } else {
      const books = getGuestBooks();
      setUserBooks(statusFilter ? books.filter((b) => b.status === statusFilter) : books);
    }
    setLoading(false);
  }, [user, statusFilter]);

  useEffect(() => {
    if (!authLoading) fetchBooks();
  }, [authLoading, fetchBooks]);

  const saveBook = useCallback(
    async (book: Book, status: ReadingStatus) => {
      if (user) {
        await fetch('/api/user-books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book, status }),
        });
        await fetchBooks();
      } else {
        const newBook = addGuestBook(book, status);
        setUserBooks((prev) => {
          const exists = prev.find((b) => b.bookId === book.id);
          return exists
            ? prev.map((b) => (b.bookId === book.id ? newBook : b))
            : [...prev, newBook];
        });
      }
    },
    [user, fetchBooks]
  );

  const updateStatus = useCallback(
    async (bookId: string, status: ReadingStatus) => {
      setUserBooks((prev) => prev.map((b) => (b.bookId === bookId ? { ...b, status } : b)));
      if (user) {
        await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
      } else {
        updateGuestBookStatus(bookId, status);
      }
    },
    [user]
  );

  const updateRating = useCallback(
    async (bookId: string, rating: number | null) => {
      setUserBooks((prev) => prev.map((b) => (b.bookId === bookId ? { ...b, rating: rating ?? undefined } : b)));
      if (user) {
        await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        });
      } else {
        updateGuestBookRating(bookId, rating);
      }
    },
    [user]
  );

  const updateProgress = useCallback(
    async (bookId: string, pages: number | null) => {
      setUserBooks((prev) => prev.map((b) => (b.bookId === bookId ? { ...b, readingProgress: pages ?? undefined } : b)));
      if (user) {
        await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readingProgress: pages }),
        });
      } else {
        updateGuestBookProgress(bookId, pages);
      }
    },
    [user]
  );

  const updateFinishedAt = useCallback(
    async (bookId: string, date: string | null) => {
      setUserBooks((prev) => prev.map((b) => (b.bookId === bookId ? { ...b, finishedAt: date ?? undefined } : b)));
      if (user) {
        await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finishedAt: date }),
        });
      } else {
        updateGuestBookFinishedAt(bookId, date);
      }
    },
    [user]
  );

  const removeBook = useCallback(
    async (bookId: string) => {
      setUserBooks((prev) => prev.filter((b) => b.bookId !== bookId));
      if (user) {
        await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, { method: 'DELETE' });
      } else {
        removeGuestBook(bookId);
      }
    },
    [user]
  );

  return { userBooks, loading: authLoading || loading, saveBook, updateStatus, updateRating, updateProgress, updateFinishedAt, removeBook };
}
