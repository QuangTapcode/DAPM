import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

/**
 * Shared loading / empty / error states so every list and detail page
 * shows a consistent, composed experience instead of a blank screen.
 *
 * Usage:
 *   <StateView loading={loading} error={error} empty={items.length === 0} onRetry={refetch}>
 *     {…real content…}
 *   </StateView>
 *
 * Or use the named pieces directly: <LoadingRows />, <EmptyState />, <ErrorState />.
 */

export function LoadingRows({ rows = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-[#EEF3FB] bg-white p-4"
        >
          <div className="skeleton h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3.5 w-1/3 rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Chưa có dữ liệu',
  description = 'Khi có dữ liệu, nội dung sẽ hiển thị ở đây.',
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D7E5F7] bg-[#FAFCFF] px-6 py-16 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#0D47A1]">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-base font-bold text-[#1A2B4B]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#7D90AA]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Không tải được dữ liệu',
  description = 'Đã có lỗi xảy ra. Vui lòng thử lại.',
  onRetry = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 px-6 py-16 text-center ${className}`}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle size={26} strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-base font-bold text-[#1A2B4B]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#7D90AA]">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 active:scale-[0.98]"
        >
          <RefreshCw size={15} />
          Thử lại
        </button>
      )}
    </div>
  );
}

export default function StateView({
  loading = false,
  error = null,
  empty = false,
  onRetry = null,
  rows = 5,
  emptyProps = {},
  children,
}) {
  if (loading) return <LoadingRows rows={rows} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (empty) return <EmptyState {...emptyProps} />;
  return children;
}
