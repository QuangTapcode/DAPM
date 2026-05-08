/**
 * Pagination — BTXH Design System
 */
export default function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const range = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }
  const showStartEllipsis = range[0] > 2;
  const showEndEllipsis   = range[range.length - 1] < totalPages - 1;

  const btnBase = 'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition border';
  const active  = 'bg-[#1d4ed8] border-[#1d4ed8] text-white shadow-sm';
  const inactive = 'bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-[#1d4ed8] hover:text-[#1d4ed8]';
  const disabled = 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed';

  return (
    <div className={`flex items-center justify-center gap-1 mt-4 ${className}`}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} ${page === 1 ? disabled : inactive}`}
        aria-label="Trang trước"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
        </svg>
      </button>

      {/* First page */}
      {range[0] > 1 && (
        <button onClick={() => onPageChange(1)} className={`${btnBase} ${inactive}`}>1</button>
      )}
      {showStartEllipsis && <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>}

      {range.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${p === page ? active : inactive}`}
        >
          {p}
        </button>
      ))}

      {showEndEllipsis && <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>}
      {range[range.length - 1] < totalPages && (
        <button onClick={() => onPageChange(totalPages)} className={`${btnBase} ${inactive}`}>{totalPages}</button>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} ${page === totalPages ? disabled : inactive}`}
        aria-label="Trang sau"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
