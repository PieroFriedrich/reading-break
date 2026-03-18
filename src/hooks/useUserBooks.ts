'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Book, ReadingStatus, UserBook } from '@/lib/types';

export function useUserBooks(statusFilter?: ReadingStatus) {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    const url = statusFilter
      ? `/api/user-books?status=${statusFilter}`
      : '/api/user-books';
    const res = await fetch(url);
    const data = await res.json();
    setUserBooks(data.books);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const saveBook = useCallback(async (book: Book, status: ReadingStatus) => {
    await fetch('/api/user-books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, status }),
    });
    await fetchBooks();
  }, [fetchBooks]);

  const updateStatus = useCallback(async (bookId: string, status: ReadingStatus) => {
    setUserBooks((prev) =>
      prev.map((b) => (b.bookId === bookId ? { ...b, status } : b))
    );
    await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }, []);

  const removeBook = useCallback(async (bookId: string) => {
    setUserBooks((prev) => prev.filter((b) => b.bookId !== bookId));
    await fetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
    });
  }, []);

  return { userBooks, loading, saveBook, updateStatus, removeBook };
}
