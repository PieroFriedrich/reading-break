'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function NavAuthSection() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/my-books"
        className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
      >
        {user ? `${user.username}'s books` : 'My Books'}
      </Link>
      {!loading && (
        <>
          {user ? (
            <>
              <Link
                href="/goals"
                className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Goals
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-[#f0eae5] text-[#4d352a] hover:bg-white px-3 py-1 rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </>
      )}
      <ThemeToggle />
    </div>
  );
}
