import { Link } from 'react-router-dom';

/**
 * PageHeader — BTXH Design System
 *
 * Tiêu đề trang kèm breadcrumb và nút hành động tùy chọn.
 *
 * @example
 * <PageHeader
 *   title="Danh sách tài khoản"
 *   breadcrumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Tài khoản' }]}
 *   action={<Button>+ Thêm mới</Button>}
 * />
 */
export default function PageHeader({ title, subtitle, breadcrumbs, action }) {
  return (
    <div className="mb-5">
      {/* Breadcrumb */}
      {breadcrumbs?.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-[#1d4ed8] transition">{crumb.label}</Link>
              ) : (
                <span className="text-gray-600">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
