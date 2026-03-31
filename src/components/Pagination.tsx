interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] disabled:opacity-40 hover:bg-[#f0eae5] dark:hover:bg-[#251a14] transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-[#aa8a6e] dark:text-[#957060]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-[#ddd0c4] dark:border-[#3a2820] text-[#8d6548] dark:text-[#c5ae9b] disabled:opacity-40 hover:bg-[#f0eae5] dark:hover:bg-[#251a14] transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
