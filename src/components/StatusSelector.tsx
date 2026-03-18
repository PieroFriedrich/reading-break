import type { ReadingStatus } from '@/lib/types';

const statuses: { value: ReadingStatus; label: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'READING', label: 'Reading' },
  { value: 'FINISHED', label: 'Finished' },
  { value: 'DROPPED', label: 'Dropped' },
];

interface Props {
  value?: ReadingStatus;
  onChange: (status: ReadingStatus) => void;
  placeholder?: string;
}

export default function StatusSelector({ value, onChange, placeholder }: Props) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value as ReadingStatus)}
      className="text-sm border border-purple-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
