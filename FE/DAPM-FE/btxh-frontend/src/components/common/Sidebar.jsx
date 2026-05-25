import { NavLink } from 'react-router-dom';

export default function Sidebar({ menuItems }) {
  return (
    <nav className="flex-1 space-y-0.5 px-3 py-3">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/13 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.18)] ring-1 ring-white/15'
                : 'text-white/60 hover:bg-white/8 hover:text-white/90'
            }`
          }
        >
          {item.icon && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-75 group-hover:opacity-100">
              {item.icon}
            </span>
          )}
          <span className="truncate leading-none">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
