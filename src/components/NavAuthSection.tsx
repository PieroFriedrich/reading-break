'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function NavAuthSection() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Mobile hamburger button */}
      <button
        className="sm:hidden text-[#e0d4cc] hover:text-[#f0eae5] transition-colors p-1"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden absolute top-14 right-0 left-0 bg-[#8d6548] border-t border-[#7a5540] shadow-md flex flex-col items-end px-4 py-3 gap-4 z-50">
          <Link
            href="/my-books"
            onClick={close}
            className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
          >
            {user ? `${user.username}'s books` : 'My Books'}
          </Link>
          <Link
            href="/explore"
            onClick={close}
            className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
          >
            Explore
          </Link>
          {!loading && user && (
            <Link
              href="/goals"
              onClick={close}
              className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
            >
              Goals
            </Link>
          )}
          {!loading && (
            user ? (
              <button
                onClick={() => { logout(); close(); }}
                className="text-left text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
                >
                  Sign up
                </Link>
              </>
            )
          )}
        </div>
      )}

      {/* Desktop links */}
      <Link
        href="/my-books"
        className="hidden sm:inline text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
      >
        {user ? `${user.username}'s books` : 'My Books'}
      </Link>

      <Link
        href="/explore"
        className="hidden sm:inline text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
      >
        Explore
      </Link>
      {!loading && (
        <>
          {user ? (
            <>
              <Link
                href="/goals"
                className="hidden sm:inline text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Goals
              </Link>
              <button
                onClick={logout}
                className="hidden sm:inline text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline text-sm font-medium text-[#e0d4cc] hover:text-[#f0eae5] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline text-sm font-medium bg-[#f0eae5] text-[#4d352a] hover:bg-white px-3 py-1 rounded-lg transition-colors"
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
