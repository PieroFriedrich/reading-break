'use client';

import { useState, useRef, useEffect } from 'react';
import type { ReadingStatus } from '@/lib/types';

const statuses: { value: ReadingStatus; label: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'READING', label: 'Reading' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'DROPPED', label: 'Dropped' },
];

// Background when status is actively selected
const selectedStyles: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-pink-200 text-pink-900 border-pink-300',
  READING:  'bg-purple-200 text-purple-900 border-purple-300',
  FINISHED: 'bg-green-200 text-green-900 border-green-300',
  DROPPED:  'bg-gray-200 text-gray-700 border-gray-300',
};

// Hover background for each option in the dropdown (lighter/lower opacity)
const hoverStyles: Record<ReadingStatus, string> = {
  WISHLIST: 'hover:bg-pink-100',
  READING:  'hover:bg-purple-100',
  FINISHED: 'hover:bg-green-100',
  DROPPED:  'hover:bg-gray-100',
};

interface Props {
  value?: ReadingStatus;
  onChange: (status: ReadingStatus) => void;
  placeholder?: string;
}

export default function StatusSelector({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const selected = statuses.find((s) => s.value === value);

  return (
    <div ref={ref} className="relative text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-1 px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
          value
            ? selectedStyles[value]
            : 'bg-white border-purple-200 text-purple-400'
        }`}
      >
        <span>{selected?.label ?? placeholder ?? 'Add to list…'}</span>
        <svg
          className={`w-3 h-3 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-purple-100 rounded shadow-lg overflow-hidden">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => { onChange(s.value); setOpen(false); }}
              className={`w-full text-left px-2 py-1.5 transition-colors duration-150 ${hoverStyles[s.value]} ${
                s.value === value ? selectedStyles[s.value] : 'text-purple-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
