const CONFIG = {
  // lowercase
  created: { label: 'Đã tạo', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  reviewing: { label: 'Đang xem xét', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  missing_info: { label: 'Cần bổ sung', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  invalid: { label: 'Không hợp lệ', cls: 'bg-red-100 text-red-700 border-red-200' },
  approved: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Từ chối', cls: 'bg-red-100 text-red-700 border-red-200' },
  completed: { label: 'Đã hoàn tất', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Đang xử lý', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  waiting_matching: { label: 'Chờ ghép trẻ', cls: 'bg-violet-100 text-violet-800 border-violet-200' },
  waiting_approval: { label: 'Chờ trưởng phòng duyệt', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  drafting: { label: 'Đang lập', cls: 'bg-slate-100 text-slate-700 border-slate-200' },

  // uppercase
  CREATED: { label: 'Đã tạo', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  PENDING: { label: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  REVIEWING: { label: 'Đang xem xét', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  MISSING_INFO: { label: 'Cần bổ sung', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  PROCESSING: { label: 'Đang xử lý', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Từ chối', cls: 'bg-red-100 text-red-700 border-red-200' },
  COMPLETED: { label: 'Đã hoàn tất', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  WAITING_MATCHING: { label: 'Chờ ghép trẻ', cls: 'bg-violet-100 text-violet-800 border-violet-200' },
  WAITING_APPROVAL: { label: 'Chờ trưởng phòng duyệt', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  DRAFTING: { label: 'Đang lập', cls: 'bg-slate-100 text-slate-700 border-slate-200' },

  // tiếng Việt từ SQL Server
  'Đã tạo': { label: 'Đã tạo', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  'Chờ xử lý': { label: 'Chờ xử lý', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Đang xem xét': { label: 'Đang xem xét', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  'Chờ ghép trẻ': { label: 'Chờ ghép trẻ', cls: 'bg-violet-100 text-violet-800 border-violet-200' },
  'Cần bổ sung': { label: 'Cần bổ sung', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Thiếu thông tin': { label: 'Cần bổ sung', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Không hợp lệ': { label: 'Không hợp lệ', cls: 'bg-red-100 text-red-700 border-red-200' },
  'Đã duyệt': { label: 'Đã duyệt', cls: 'bg-green-100 text-green-800 border-green-200' },
  'Từ chối': { label: 'Từ chối', cls: 'bg-red-100 text-red-700 border-red-200' },
  'Đã hoàn tất': { label: 'Đã hoàn tất', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Hoàn thành': { label: 'Đã hoàn tất', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Đang lập': { label: 'Đang lập', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  'Chờ duyệt': { label: 'Chờ trưởng phòng duyệt', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },

  // lịch gặp mặt
  'Chờ xác nhận': { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Đã xác nhận': { label: 'Đã xác nhận', cls: 'bg-green-100 text-green-800 border-green-200' },
  'Yêu cầu đổi lịch': { label: 'Yêu cầu đổi lịch', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Đã đổi lịch': { label: 'Đã đổi lịch', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
  'Đã gặp mặt': { label: 'Đã gặp mặt', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Đã hủy': { label: 'Đã hủy', cls: 'bg-gray-100 text-gray-700 border-gray-200' },

  // kết quả gặp mặt
  'Phù hợp': { label: 'Phù hợp', cls: 'bg-green-100 text-green-800 border-green-200' },
  'Không phù hợp': { label: 'Không phù hợp', cls: 'bg-red-100 text-red-700 border-red-200' },
  'Cần gặp lại': { label: 'Cần gặp lại', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const FALLBACK = {
  label: '—',
  cls: 'bg-gray-100 text-gray-600 border-gray-200',
};

function getBadgeConfig(status) {
  if (!status) return FALLBACK;

  const key = String(status).trim();

  return CONFIG[key] ?? FALLBACK;
}

export function Badge({ status, label, size = 'sm', className = '' }) {
  const cfg = getBadgeConfig(status);
  const text = label ?? cfg.label;

  const sizeClass =
    size === 'md'
      ? 'px-3 py-1 text-xs'
      : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClass} ${cfg.cls} ${className}`}>
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-70" />{text}</span>
  );
}
export default Badge;