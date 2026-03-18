import type { ReadingStatus } from '@/lib/types';

const styles: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-[#ede3db] text-[#634636]',
  READING: 'bg-green-100 text-green-800',
  FINISHED: 'bg-emerald-100 text-emerald-800',
  DROPPED: 'bg-gray-100 text-gray-500',
};

const labels: Record<ReadingStatus, string> = {
  WISHLIST: 'Wishlist',
  READING: 'Reading',
  FINISHED: 'Finished',
  DROPPED: 'Dropped',
};

export default function StatusBadge({ status }: { status: ReadingStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
