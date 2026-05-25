import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import logoImg from '../../assets/favicon.svg';

const ICONS = {
  dashboard: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  users: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  folder: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L11 7h10a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  child: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  ),
  chart: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  history: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  file: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  health: (
    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
  ),
};

const MENU_BY_ROLE = {
  [ROLES.ADMIN]: [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: ICONS.dashboard },
    { path: '/admin/accounts', label: 'Quản lý tài khoản', icon: ICONS.users },
  ],
  [ROLES.STAFF_RECEPTION]: [
    { path: '/can-bo-tiep-nhan/dashboard', label: 'Tổng quan', icon: ICONS.dashboard },
    { path: '/can-bo-tiep-nhan/yeu-cau', label: 'Yêu cầu gửi trẻ', icon: ICONS.folder },
    { path: '/can-bo-tiep-nhan/ho-so-tiep-nhan', label: 'Hồ sơ tiếp nhận', icon: ICONS.file },
    { path: '/can-bo-tiep-nhan/tre', label: 'Quản lý trẻ', icon: ICONS.child },
    { path: '/can-bo-tiep-nhan/suc-khoe', label: 'Sức khỏe trẻ', icon: ICONS.health },
  ],
  [ROLES.STAFF_ADOPTION]: [
    { path: '/can-bo-nhan-nuoi/dashboard', label: 'Tổng quan', icon: ICONS.dashboard },
    { path: '/can-bo-nhan-nuoi/danh-sach', label: 'Yêu cầu nhận nuôi', icon: ICONS.folder },
    { path: '/can-bo-nhan-nuoi/ho-so', label: 'Theo dõi nhận nuôi', icon: ICONS.child },
  ],
  [ROLES.MANAGER]: [
    { path: '/truong-phong/dashboard', label: 'Tổng quan', icon: ICONS.dashboard },
    { path: '/truong-phong/cho-duyet', label: 'Hồ sơ', icon: ICONS.folder },
    { path: '/truong-phong/lichsu-hoso', label: 'Lịch sử hồ sơ', icon: ICONS.history },
    { path: '/truong-phong/thong-ke', label: 'Thống kê', icon: ICONS.chart },
  ],
};

const ROLE_LABEL = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.STAFF_RECEPTION]: 'Cán bộ tiếp nhận',
  [ROLES.STAFF_ADOPTION]: 'Cán bộ nhận nuôi',
  [ROLES.MANAGER]: 'Trưởng phòng',
};

const ROLE_COLOR = {
  [ROLES.ADMIN]: 'from-violet-500 to-purple-600',
  [ROLES.STAFF_RECEPTION]: 'from-blue-500 to-cyan-500',
  [ROLES.STAFF_ADOPTION]: 'from-emerald-500 to-teal-500',
  [ROLES.MANAGER]: 'from-amber-500 to-orange-500',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = MENU_BY_ROLE[user?.role] || [];
  const roleLabel = ROLE_LABEL[user?.role] || 'Người dùng';
  const avatarGradient = ROLE_COLOR[user?.role] || 'from-blue-500 to-indigo-600';
  const initial = (user?.fullName || 'U')[0].toUpperCase();

  const handleLogout = () => { logout?.(); navigate('/dang-nhap'); };

  return (
    <div className="flex min-h-screen bg-[#EEF4FC]">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex h-screen w-[232px] flex-col"
        style={{ background: 'linear-gradient(175deg, #050e1f 0%, #081a3a 50%, #0a2451 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-24 -left-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/40">
            <img src={logoImg} alt="Logo" className="h-5 w-5 object-contain brightness-0 invert" />
          </div>
          <div>
            <p className="text-[12px] font-bold leading-tight text-white/90 tracking-wide">TRUNG TÂM</p>
            <p className="text-[10px] leading-tight text-white/40 tracking-wider">BẢO TRỢ XÃ HỘI</p>
          </div>
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Điều hướng</p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar menuItems={menuItems} />
        </div>

        {/* User card */}
        <div className="shrink-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarGradient} text-sm font-bold text-white shadow-lg`}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white/90 leading-tight">
                  {user?.fullName || 'Người dùng'}
                </p>
                <p className="text-[11px] text-white/40 leading-tight mt-0.5">{roleLabel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[12.5px] font-medium text-white/50 transition-all duration-200 hover:bg-red-500/15 hover:text-red-300"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <div className="ml-[232px] flex-1 min-h-screen">
        <main className="p-6 lg:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
