import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import logoImg from '../../assets/favicon.svg';

const ICONS = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  child: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 14c3.314 0 6-2.239 6-5s-2.686-5-6-5-6 2.239-6 5 2.686 5 6 5zm0 0c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 3v18m4-14v14m4-10v10M7 13v8M3 17v4" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-3-6.708" />
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
    { path: '/can-bo-tiep-nhan/tre', label: 'Quản lý trẻ', icon: ICONS.child },
  ],
  [ROLES.STAFF_ADOPTION]: [
    { path: '/can-bo-nhan-nuoi/dashboard', label: 'Tổng quan', icon: ICONS.dashboard },
    { path: '/can-bo-nhan-nuoi/danh-sach', label: 'Yêu cầu nhận nuôi', icon: ICONS.folder },
    { path: '/can-bo-nhan-nuoi/ho-so', label: 'Hồ sơ nhận nuôi', icon: ICONS.child },
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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = MENU_BY_ROLE[user?.role] || [];
  const roleLabel = ROLE_LABEL[user?.role] || 'Người dùng hệ thống';

  const handleLogout = () => {
    logout?.();
    navigate('/dang-nhap');
  };

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      {/* Sidebar cố định theo màn hình */}
      <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-60 flex-col border-r border-[#E3ECF8] bg-[#F8FAFC]">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-[#E3ECF8] px-5 py-5">
          <img src={logoImg} alt="Logo" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide leading-tight text-[#334155]">
              Trung tâm
            </p>
            <p className="text-[10px] leading-tight text-[#8FA0B8]">
              Bảo trợ xã hội
            </p>
          </div>
        </div>

        {/* Menu cuộn riêng */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar menuItems={menuItems} />
        </div>

        {/* User + logout luôn nằm dưới */}
        <div className="shrink-0 border-t border-[#E3ECF8] px-4 py-4">
          <div className="mb-2 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#0D47A1]">
              {(user?.fullName || 'A')[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#334155]">
                {user?.fullName || 'Người dùng'}
              </p>
              <p className="text-[10px] text-[#8FA0B8]">{roleLabel}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-60 min-h-screen">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}