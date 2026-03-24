'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      setUser(data.user);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-[#4d352a] dark:text-[#e8ddd8] mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#4d352a] dark:text-[#e8ddd8] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] bg-white dark:bg-[#251a14] text-gray-800 dark:text-[#e8ddd8] placeholder-gray-400 dark:placeholder-[#7a6055] focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4d352a] dark:text-[#e8ddd8] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-[#ddd0c4] dark:border-[#3a2820] bg-white dark:bg-[#251a14] text-gray-800 dark:text-[#e8ddd8] placeholder-gray-400 dark:placeholder-[#7a6055] focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#8d6548] hover:bg-[#7a5540] text-[#f0eae5] font-medium transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-[#aa8a6e] dark:text-[#957060] text-center">
        No account?{' '}
        <Link href="/signup" className="text-[#4d352a] dark:text-[#e8ddd8] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
