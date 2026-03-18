import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reading Break',
  description: 'Track your reading list',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-purple-50 min-h-screen`}>
        <header className="bg-purple-900 border-b border-purple-800 shadow-sm">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-white text-lg tracking-tight">
              Reading Break
            </Link>
            <Link
              href="/my-books"
              className="text-sm font-medium text-purple-200 hover:text-white transition-colors"
            >
              My Books
            </Link>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
