const CONFIG = {
  // lowercase codes
  created:          { label: 'Đã tạo',              cls: 'bg-slate-100 text-slate-600   border-slate-200' },
  pending:          { label: 'Chờ xử lý',            cls: 'bg-amber-50  text-amber-700   border-amber-200' },
  reviewing:        { label: 'Đang xem xét',         cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  missing_info:     { label: 'Cần bổ sung',           cls: 'bg-orange-50 text-orange-700  border-orange-200'},
  invalid:          { label: 'Không hợp lệ',          cls: 'bg-red-50    text-red-600     border-red-200'   },
  approved:         { label: 'Đã duyệt',             cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  rejected:         { label: 'Từ chối',              cls: 'bg-red-50    text-red-600     border-red-200'   },
  completed:        { label: 'Đã hoàn tất',          cls: 'bg-blue-50   text-blue-700    border-blue-200'  },
  processing:       { label: 'Đang xử lý',           cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  waiting_matching: { label: 'Ghép trẻ',             cls: 'bg-violet-50 text-violet-700  border-violet-200'},
  waiting_approval: { label: 'Chờ TP duyệt',         cls: 'bg-indigo-50 text-indigo-700  border-indigo-200'},
  drafting:         { label: 'Đang lập',             cls: 'bg-slate-100 text-slate-600   border-slate-200' },

  // Vietnamese from DB
  'Đã tạo':         { label: 'Đã tạo',              cls: 'bg-slate-100 text-slate-600   border-slate-200' },
  'Chờ xử lý':      { label: 'Chờ xử lý',           cls: 'bg-amber-50  text-amber-700   border-amber-200' },
  'Đang xem xét':   { label: 'Đang xem xét',        cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  'Đang xử lý':     { label: 'Đang xử lý',          cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  'Ghép trẻ':       { label: 'Ghép trẻ',            cls: 'bg-violet-50 text-violet-700  border-violet-200'},
  'Cần bổ sung':    { label: 'Cần bổ sung',          cls: 'bg-orange-50 text-orange-700  border-orange-200'},
  'Thiếu thông tin':{ label: 'Cần bổ sung',          cls: 'bg-orange-50 text-orange-700  border-orange-200'},
  'Đã duyệt':       { label: 'Đã duyệt',            cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  'Từ chối':        { label: 'Từ chối',             cls: 'bg-red-50    text-red-600     border-red-200'   },
  'Đã hoàn tất':    { label: 'Đã hoàn tất',         cls: 'bg-blue-50   text-blue-700    border-blue-200'  },
  'Hoàn thành':     { label: 'Đã hoàn tất',         cls: 'bg-blue-50   text-blue-700    border-blue-200'  },
  'Đang lập':       { label: 'Đang lập',            cls: 'bg-slate-100 text-slate-600   border-slate-200' },
  'Chờ duyệt':      { label: 'Chờ TP duyệt',        cls: 'bg-indigo-50 text-indigo-700  border-indigo-200'},
  'Đang xác minh':  { label: 'Đang xác minh',       cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  'Đã tiếp nhận':   { label: 'Đã tiếp nhận',        cls: 'bg-teal-50   text-teal-700    border-teal-200'  },
  'Hợp lệ':         { label: 'Hợp lệ',              cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  'Không hợp lệ':   { label: 'Không hợp lệ',        cls: 'bg-red-50    text-red-600     border-red-200'   },
  'Hết hạn':        { label: 'Hết hạn',             cls: 'bg-rose-50   text-rose-600    border-rose-200'  },
  'Đã hủy':         { label: 'Đã hủy',              cls: 'bg-gray-100  text-gray-500    border-gray-200'  },
  // lịch gặp mặt
  'Chờ xác nhận':   { label: 'Chờ xác nhận',        cls: 'bg-amber-50  text-amber-700   border-amber-200' },
  'Đã xác nhận':    { label: 'Đã xác nhận',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  'Yêu cầu đổi lịch':{ label: 'Đổi lịch',          cls: 'bg-orange-50 text-orange-700  border-orange-200'},
  'Đã đổi lịch':    { label: 'Đã đổi lịch',         cls: 'bg-sky-50    text-sky-700     border-sky-200'   },
  'Đã gặp mặt':     { label: 'Đã gặp mặt',         cls: 'bg-blue-50   text-blue-700    border-blue-200'  },
  // kết quả gặp mặt
  'Phù hợp':        { label: 'Phù hợp',             cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  'Không phù hợp':  { label: 'Không phù hợp',       cls: 'bg-red-50    text-red-600     border-red-200'   },
  'Cần gặp lại':    { label: 'Cần gặp lại',         cls: 'bg-orange-50 text-orange-700  border-orange-200'},
  // trẻ
  'Đang chăm sóc':  { label: 'Đang chăm sóc',       cls: 'bg-teal-50   text-teal-700    border-teal-200'  },
  'Chờ nhận nuôi':  { label: 'Chờ nhận nuôi',       cls: 'bg-violet-50 text-violet-700  border-violet-200'},
  'Đã nhận nuôi':   { label: 'Đã nhận nuôi',        cls: 'bg-blue-50   text-blue-700    border-blue-200'  },
};

const FALLBACK = { label: '—', cls: 'bg-gray-100 text-gray-400 border-gray-200' };

function getBadgeConfig(status) {
  if (!status) return FALLBACK;
  return CONFIG[String(status).trim()] ?? FALLBACK;
}

export function Badge({ status, label, size = 'sm', className = '' }) {
  const cfg = getBadgeConfig(status);
  const text = label ?? cfg.label;

  const sizeClass =
    size === 'lg' ? 'px-3.5 py-1.5 text-xs gap-1.5' :
    size === 'md' ? 'px-3   py-1   text-xs gap-1.5' :
                   'px-2.5 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold leading-none ${sizeClass} ${cfg.cls} ${className}`}
    >
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60" />
      {text}
    </span>
  );
}

export default Badge;
