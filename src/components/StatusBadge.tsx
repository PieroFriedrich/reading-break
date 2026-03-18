import type { ReadingStatus } from '@/lib/types';

const styles: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-blue-100 text-blue-800',
  READING: 'bg-yellow-100 text-yellow-800',
  FINISHED: 'bg-green-100 text-green-800',
  DROPPED: 'bg-gray-100 text-gray-600',
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
