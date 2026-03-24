'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  show: boolean;
}

export default function WelcomeCard({ show }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && !localStorage.getItem('rb_welcomed')) {
      setVisible(true);
    }
  }, [show]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem('rb_welcomed', '1');
    setVisible(false);
  }

  function handleNav(path: string) {
    localStorage.setItem('rb_welcomed', '1');
    router.push(path);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-[#f7f2ef] dark:bg-[#251a14] rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8]">Welcome to Reading Break</h2>
          <p className="text-sm text-[#aa8a6e] dark:text-[#957060] mt-2">
            Track the books you&apos;ve read, are reading, or want to read.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => handleNav('/signup')}
            className="w-full py-2.5 rounded-xl bg-[#8d6548] hover:bg-[#7a5540] text-[#f0eae5] font-medium transition-colors"
          >
            Create an account
          </button>
          <button
            onClick={() => handleNav('/login')}
            className="w-full py-2.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] text-[#4d352a] dark:text-[#e8ddd8] hover:bg-[#ede3db] dark:hover:bg-[#3a2820] font-medium transition-colors"
          >
            Log in
          </button>
        </div>
        <button
          onClick={dismiss}
          className="text-sm text-[#aa8a6e] dark:text-[#957060] hover:text-[#4d352a] dark:hover:text-[#e8ddd8] transition-colors"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}
