/**
 * Button — BTXH Design System
 *
 * Variants:
 *  primary   — xanh dương (#1d4ed8)   dùng cho hành động chính trong nội dung
 *  accent    — cam (#f97316)           dùng cho nút submit / CTA quan trọng nhất
 *  secondary — trắng viền xám         dùng cho Hủy, Lưu nháp
 *  outline   — trắng viền xanh        dùng cho hành động phụ có màu
 *  danger    — đỏ                     dùng cho Từ chối, Xóa
 *  success   — xanh lá               dùng cho Duyệt
 *  ghost     — trong suốt xám        dùng cho icon-only, breadcrumb action
 */
const VARIANTS = {
  primary: 'btn-primary-gradient text-white shadow-sm',
  accent: 'btn-accent-gradient text-white shadow-sm',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
  outline: 'bg-white hover:bg-blue-50 text-[var(--c-primary-start)] border border-[var(--c-primary-start)]',
  danger: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-sm',
  success: 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs rounded',
  sm: 'px-3.5 py-1.5 text-sm rounded',
  md: 'px-5 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-lg',
  xl: 'px-8 py-3 text-base rounded-lg',
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8] focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner /> : icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
