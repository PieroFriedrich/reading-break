export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export interface OLSearchResponse {
  docs: OLSearchResult[];
  numFound?: number;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  publishDate?: string;
  coverUrl?: string;
}

export interface BookDetail extends Book {
  description?: string;
  subjects?: string[];
  firstPublishDate?: string;
}

export type ReadingStatus = 'WISHLIST' | 'READING' | 'FINISHED' | 'DROPPED';

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  bookAuthor?: string;
  bookPublisher?: string;
  bookPublishDate?: string;
  status: ReadingStatus;
  rating?: number;
  readingProgress?: number;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
