import clsx from 'clsx';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | 'dots')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'dots') {
      pages.push('dots');
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1 my-4">
      <button
        className="btn-ghost text-xs px-2 py-1"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        {'\u2039'}
      </button>
      {pages.map((p, i) =>
        p === 'dots' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-600 text-sm">
            {'\u2026'}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={clsx(
              'min-w-[2rem] min-h-[2rem] rounded-taiga text-sm font-semibold flex items-center justify-center transition-colors',
              p === page
                ? 'bg-gray-100 text-gray-700'
                : 'bg-gray-300 text-link-primary hover:bg-link-primary hover:text-white',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="btn-ghost text-xs px-2 py-1"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        {'\u203A'}
      </button>
    </nav>
  );
}
