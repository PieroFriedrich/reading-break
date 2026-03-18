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
      <body className={`${geist.className} bg-[#f7f2ef] min-h-screen`}>
        <header className="bg-[#8d6548] border-b border-[#7a5540] shadow-sm">
          <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-[#f0eae5] text-lg tracking-tight">
              <img src="/reading-break-logo.svg" alt="Reading Break logo" height={32} width={32} />
              Reading Break
            </Link>
            <Link
              href="/my-books"
              className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
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
