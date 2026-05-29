import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_REDIRECT } from '../../utils/constants';

import logoImg from '../../assets/favicon.svg';
import bellImg from '../../assets/notification.png';
import userImg from '../../assets/avt_acc.png';
import chevronDownImg from '../../assets/down-arrow.png';

const ROLE_NAV = {
  [ROLES.SENDER]: [
    { to: '/', label: 'Trang chủ' },
    { to: '/gui-tre/tao-yeu-cau', label: 'Gửi trẻ' },
    { to: '/gui-tre/trang-thai', label: 'Đơn gửi trẻ' },
    { to: '/gui-tre/thong-tin-tre', label: 'Thông tin trẻ' },
    { to: '/gui-tre/ho-so', label: 'Thông tin cá nhân' },
  ],
  [ROLES.ADOPTER]: [
    { to: '/', label: 'Trang chủ' },
    { to: '/nhan-nuoi/tao-don', label: 'Nhận nuôi' },
    { to: '/nhan-nuoi/trang-thai', label: 'Đơn nhận nuôi' },
    { to: '/nhan-nuoi/ho-so', label: 'Thông tin cá nhân' },
  ],
  [ROLES.STAFF_RECEPTION]: [
    { to: '/can-bo-tiep-nhan/dashboard', label: 'Tổng quan' },
    { to: '/can-bo-tiep-nhan/yeu-cau', label: 'Yêu cầu gửi trẻ' },
    { to: '/can-bo-tiep-nhan/tre', label: 'Quản lý trẻ' },
  ],
  [ROLES.STAFF_ADOPTION]: [
    { to: '/can-bo-nhan-nuoi/dashboard', label: 'Tổng quan' },
    { to: '/can-bo-nhan-nuoi/danh-sach', label: 'Đơn nhận nuôi' },
  ],
  [ROLES.MANAGER]: [
    { to: '/truong-phong/dashboard', label: 'Tổng quan' },
    { to: '/truong-phong/cho-duyet', label: 'Hồ sơ' },
    { to: '/truong-phong/lichsu-hoso', label: 'Lịch sử hồ sơ' },
    { to: '/truong-phong/thong-ke', label: 'Thống kê' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Tổng quan' },
    { to: '/admin/accounts', label: 'Tài khoản' },
    { to: '/admin/roles', label: 'Phân quyền' },
  ],
};

const GUEST_NAV = [
  { to: '/', label: 'Trang chủ' },
  { to: '/huong-dan', label: 'Hướng dẫn' },
];

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = user ? (ROLE_NAV[user.role] ?? []) : GUEST_NAV;

  const isDualCitizenRole =
    user?.roles?.includes('NGGT') && user?.roles?.includes('NGNN');

  const currentRoleLabel =
    user?.role === ROLES.SENDER ? 'Người gửi trẻ' :
      user?.role === ROLES.ADOPTER ? 'Người nhận nuôi' :
        '';

  const switchRoleLabel =
    user?.role === ROLES.SENDER ? 'Nhận nuôi' :
      user?.role === ROLES.ADOPTER ? 'Gửi trẻ' :
        '';

  const handleSwitchRole = () => {
    const newRole = user?.role === ROLES.SENDER ? ROLES.ADOPTER : ROLES.SENDER;

    setDropdownOpen(false);
    navigate('/');
    
    setTimeout(() => {
      updateUser({ role: newRole });
    }, 0);
  };
  return (
    <header
      className="sticky top-0 z-40 border-b border-[#bfd4e5] shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #daeeff 0%, #c8e8fa 40%, #d6f0fb 100%)',
      }}
    >
      <div className="w-full px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-[96px]">
          {/* LEFT */}
          <Link to="/" className="flex items-center gap-4 justify-self-start">
            <img
              src={logoImg}
              alt="Logo trung tâm"
              className="w-[54px] h-[54px] object-contain"
            />

            <div className="flex flex-col justify-center gap-[8px]">
              <p className="text-[14px] font-medium leading-none text-[#4c647d]">
                Hệ thống quản lý
              </p>
              <p className="text-[18px] font-bold leading-none tracking-tight text-[#0D47A1]">
                TRUNG TÂM BẢO TRỢ XÃ HỘI
              </p>
            </div>
          </Link>

          {/* CENTER */}
          <nav className="flex items-center justify-center gap-12">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  [
                    'relative inline-flex items-center justify-center',
                    'text-[17px] font-semibold transition-colors duration-200',
                    'text-[#596f86] hover:text-[#0D47A1]',
                    'after:absolute after:left-0 after:-bottom-[8px] after:h-[2px] after:w-full',
                    'after:origin-center after:scale-x-0 after:transition-transform after:duration-200',
                    'after:bg-[#0D47A1]',
                    isActive ? 'text-[#0D47A1] after:scale-x-100' : 'hover:after:scale-x-100',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-3 justify-self-end">
            {user ? (
              <>
                {isDualCitizenRole && currentRoleLabel && (
                  <div className="hidden xl:flex flex-col justify-center rounded-2xl bg-white/45 border border-white/60 px-4 py-2 shadow-sm">
                    <span className="text-[14px] font-bold text-[#0D47A1] leading-none">
                      {currentRoleLabel}
                    </span>
                  </div>
                )}
                <button className="relative h-11 w-11 flex items-center justify-center rounded-full hover:bg-white/80 transition">
                  <img
                    src={bellImg}
                    alt="Thông báo"
                    className="w-8 h-8 object-contain"
                  />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex w-[280px] items-center gap-3 rounded-2xl bg-white/70 hover:bg-white/85 px-3 py-2.5 transition"                  >
                    <img
                      src={userImg}
                      alt="Người dùng"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[14px] font-semibold leading-none text-[#163b68]">
                        {user.fullName || 'Người dùng'}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-[#5c7692]">
                        {user.email}
                      </p>
                    </div>

                    <img
                      src={chevronDownImg}
                      alt="Mở menu"
                      className="w-4 h-4 object-contain opacity-70"
                    />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-[62px] z-20 w-[280px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-lg">                        {isDualCitizenRole && switchRoleLabel && (
                        <>
                          <button
                            onClick={handleSwitchRole}
                            className="flex w-full items-center justify-center px-4 py-2 text-center text-sm font-semibold text-[#163b68] hover:bg-[#eef7ff] transition"                          >
                            {switchRoleLabel}
                          </button>

                          <div className="my-1 h-px bg-gray-100" />
                        </>
                      )}

                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-center px-4 py-2 text-center text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/dang-ky"
                  className="px-5 py-3 rounded-xl bg-white/70 text-[15px] font-semibold text-[#0D47A1] transition hover:bg-white"
                >
                  Đăng ký
                </Link>

                <Link
                  to="/dang-nhap"
                  className="px-5 py-3 rounded-xl bg-[#0D47A1] text-[15px] font-semibold text-white transition hover:bg-[#0b3d89]"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}