/**
 * SectionCard — BTXH Design System
 *
 * Component thẻ phần trong form, có header xanh + body trắng.
 * Dùng để bọc từng nhóm fields trong trang form nhiều phần.
 *
 * @example
 * <SectionCard icon={<PersonIcon />} title="Thông tin người gửi trẻ">
 *   <FormField ... />
 * </SectionCard>
 */
export default function SectionCard({ icon, title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden mb-4 ${className}`}>
      {/* Blue header bar */}
      <div className="bg-[#1d4ed8] px-5 py-3 flex items-center gap-2.5">
        {icon && (
          <span className="flex-shrink-0 text-white/90 w-5 h-5">{icon}</span>
        )}
        <h2 className="text-white font-semibold text-sm tracking-wide">{title}</h2>
      </div>

      {/* White body */}
      <div className="p-5">{children}</div>
    </div>
  );
}
