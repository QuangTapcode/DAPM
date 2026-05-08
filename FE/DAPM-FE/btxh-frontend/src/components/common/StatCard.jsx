/**
 * StatCard — BTXH Design System
 *
 * Thẻ thống kê nhanh dùng cho Dashboard.
 * Có 4 màu accent: blue, orange, green, red.
 *
 * @example
 * <StatCard label="Hồ sơ chờ duyệt" value={12} accent="orange" icon={<ClockIcon />} />
 */
const ACCENTS = {
  blue:   { bar: 'bg-[#1d4ed8]', icon: 'bg-blue-100   text-[#1d4ed8]', value: 'text-[#1d4ed8]' },
  orange: { bar: 'bg-[#f97316]', icon: 'bg-orange-100 text-[#f97316]', value: 'text-[#f97316]' },
  green:  { bar: 'bg-[#16a34a]', icon: 'bg-green-100  text-[#16a34a]', value: 'text-[#16a34a]' },
  red:    { bar: 'bg-[#dc2626]', icon: 'bg-red-100    text-[#dc2626]', value: 'text-[#dc2626]' },
  purple: { bar: 'bg-[#7c3aed]', icon: 'bg-purple-100 text-[#7c3aed]', value: 'text-[#7c3aed]' },
};

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'blue',
  onClick,
}) {
  const colors = ACCENTS[accent] ?? ACCENTS.blue;
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-white rounded-xl shadow-md overflow-hidden text-left w-full',
        onClick ? 'hover:shadow-lg transition-shadow cursor-pointer' : '',
      ].join(' ')}
    >
      {/* Color accent bar */}
      <div className={`h-1 w-full ${colors.bar}`} />

      <div className="px-5 py-4 flex items-center gap-4">
        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
            <span className="w-5 h-5">{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${colors.value}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Tag>
  );
}
