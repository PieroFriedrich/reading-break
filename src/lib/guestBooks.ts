import type { Book, ReadingStatus, UserBook } from './types';

const STORAGE_KEY = 'rb_guest_books';

export function getGuestBooks(): UserBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserBook[]) : [];
  } catch {
    return [];
  }
}

function saveGuestBooks(books: UserBook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function addGuestBook(book: Book, status: ReadingStatus): UserBook {
  const books = getGuestBooks();
  const existing = books.find((b) => b.bookId === book.id);
  if (existing) {
    const updated = books.map((b) =>
      b.bookId === book.id ? { ...b, status, updatedAt: new Date().toISOString() } : b
    );
    saveGuestBooks(updated);
    return updated.find((b) => b.bookId === book.id)!;
  }
  const newBook: UserBook = {
    id: crypto.randomUUID(),
    userId: 'guest',
    bookId: book.id,
    bookTitle: book.title,
    bookCover: book.coverUrl,
    bookAuthor: book.author,
    bookPublisher: book.publisher,
    bookPublishDate: book.publishDate,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveGuestBooks([...books, newBook]);
  return newBook;
}

export function updateGuestBookStatus(bookId: string, status: ReadingStatus): void {
  const books = getGuestBooks().map((b) =>
    b.bookId === bookId ? { ...b, status, updatedAt: new Date().toISOString() } : b
  );
  saveGuestBooks(books);
}

export function updateGuestBookRating(bookId: string, rating: number | null): void {
  const books = getGuestBooks().map((b) =>
    b.bookId === bookId ? { ...b, rating: rating ?? undefined, updatedAt: new Date().toISOString() } : b
  );
  saveGuestBooks(books);
}

export function updateGuestBookProgress(bookId: string, pages: number | null): void {
  const books = getGuestBooks().map((b) =>
    b.bookId === bookId ? { ...b, readingProgress: pages ?? undefined, updatedAt: new Date().toISOString() } : b
  );
  saveGuestBooks(books);
}

export function removeGuestBook(bookId: string): void {
  saveGuestBooks(getGuestBooks().filter((b) => b.bookId !== bookId));
}

export function clearGuestBooks(): void {
  localStorage.removeItem(STORAGE_KEY);
}
