const VARIANTS = {
  primary:   'btn-primary-gradient text-white',
  accent:    'btn-accent-gradient text-white',
  secondary: 'bg-white text-[#334155] border border-[#D5E0EE] shadow-sm hover:bg-[#F5F9FE] hover:border-[#B8D0EC] active:scale-[0.98]',
  outline:   'bg-white text-[#0D47A1] border border-[#0D47A1]/30 hover:bg-[#EEF4FC] hover:border-[#0D47A1] active:scale-[0.98]',
  danger:    'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] hover:from-red-600 hover:to-rose-700 hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)] active:scale-[0.98]',
  success:   'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)] hover:from-emerald-600 hover:to-teal-700 hover:shadow-[0_8px_20px_rgba(16,185,129,0.34)] active:scale-[0.98]',
  ghost:     'bg-transparent text-[#5C728A] hover:bg-[#EEF4FC] hover:text-[#0D47A1] active:scale-[0.97]',
};

const SIZES = {
  xs: 'px-2.5 py-1    text-[11px] rounded-lg  font-semibold',
  sm: 'px-3.5 py-1.5  text-xs     rounded-xl  font-semibold',
  md: 'px-5   py-2.5  text-sm     rounded-2xl font-semibold',
  lg: 'px-6   py-3    text-sm     rounded-2xl font-bold',
  xl: 'px-8   py-3.5  text-base   rounded-2xl font-bold',
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
        'inline-flex items-center justify-center gap-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]/50 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
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
