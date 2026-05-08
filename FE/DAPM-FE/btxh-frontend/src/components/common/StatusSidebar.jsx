import Badge from './Badge';
import Button from './Button';

/**
 * StatusSidebar — BTXH Design System
 *
 * Panel bên phải trong các trang form, hiển thị:
 *  - Trạng thái hiện tại
 *  - Nút submit (accent/cam) + nút phụ
 *  - Hộp cảnh báo / lưu ý
 *  - Hộp hỗ trợ
 *
 * @example
 * <StatusSidebar
 *   status="pending"
 *   onSubmit={handleSubmit}
 *   onDraft={handleSaveDraft}
 *   loading={isSubmitting}
 *   notes={['Điền đầy đủ thông tin', 'Đính kèm giấy tờ']}
 * />
 */
export default function StatusSidebar({
  status,
  statusLabel,
  onSubmit,
  onDraft,
  loading = false,
  submitLabel = 'Gửi Đơn Đăng Ký',
  draftLabel  = 'Lưu Nháp',
  notes = [],
  helpPhone = '0961 234 567',
  children,
}) {
  return (
    <div className="space-y-4 w-full">
      {/* Trạng thái */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#1d4ed8] px-4 py-3">
          <p className="text-white text-sm font-semibold">Trạng thái hiện tại</p>
        </div>
        <div className="px-4 py-4 text-center">
          {status ? (
            <Badge status={status} label={statusLabel} size="md" />
          ) : (
            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium border border-gray-200">
              Chưa nộp
            </span>
          )}
        </div>

        {/* Actions */}
        {(onSubmit || onDraft) && (
          <div className="px-4 pb-4 space-y-2">
            {onSubmit && (
              <Button
                variant="accent"
                size="md"
                fullWidth
                loading={loading}
                onClick={onSubmit}
              >
                {submitLabel}
              </Button>
            )}
            {onDraft && (
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={onDraft}
                disabled={loading}
              >
                {draftLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lưu ý */}
      {notes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 2 0v-3a1 1 0 0 0-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-blue-800">Lưu ý quan trọng</p>
          </div>
          <ul className="space-y-1.5">
            {notes.map((note, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-blue-700">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hỗ trợ */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Cần hỗ trợ?</p>
        <p className="text-xs text-gray-500 mb-3">
          Liên hệ cán bộ hỗ trợ để được giải đáp thắc mắc về hồ sơ 24/7.
        </p>
        <a
          href={`tel:${helpPhone}`}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#1d4ed8] text-white text-sm font-medium rounded-lg hover:bg-[#1e40af] transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6z" />
          </svg>
          {helpPhone}
        </a>
      </div>

      {/* Slot content tùy chỉnh */}
      {children}
    </div>
  );
}
