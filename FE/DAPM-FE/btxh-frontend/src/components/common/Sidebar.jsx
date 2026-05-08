import { NavLink } from 'react-router-dom';
/**
 * Sidebar — BTXH Design System
 *
 * @param {Array}  menuItems  — [{ path, label, icon? }]
 * @param {string} [title]    — override section title
 */
export default function Sidebar({ menuItems, title }) {
  return (
    <aside className="flex h-full w-full flex-shrink-0 flex-col border-r border-[#E5E7EB] bg-[#F8FAFC] text-[#475569] shadow-[4px_0_18px_rgba(15,23,42,0.04)]">
      {title && (
        <div className="border-b border-[#E5E7EB] px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
            {title}
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-2 px-3 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${isActive
                ? 'bg-[#2F80ED] text-white font-semibold shadow-[0_8px_18px_rgba(47,128,237,0.22)]'
                : 'text-[#64748B] hover:bg-white hover:text-[#334155] hover:shadow-sm'
              }`
            }
          >
            {item.icon && (
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center group-hover:text-[#334155]">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}