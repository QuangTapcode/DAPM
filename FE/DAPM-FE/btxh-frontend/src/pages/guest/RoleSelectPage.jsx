import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleSelectPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Reset context khi vào trang chọn chức năng
  useEffect(() => { sessionStorage.removeItem('nav_role_context'); }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-[560px]">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-extrabold text-[#1f2937]">
            Xin chào, {user?.fullName || 'bạn'}!
          </h1>
          <p className="mt-2 text-[17px] text-[#6b7280]">
            Bạn muốn sử dụng chức năng nào?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Gửi trẻ */}
          <button
            type="button"
            onClick={() => navigate('/gui-tre/tao-yeu-cau')}
            className="group flex flex-col items-center gap-5 rounded-[28px] border-2 border-[#E1ECF8] bg-white p-8 shadow-[0_14px_40px_rgba(42,74,122,0.07)] transition hover:-translate-y-1 hover:border-[#0D47A1] hover:shadow-[0_20px_50px_rgba(42,74,122,0.13)]"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3FF] text-5xl transition group-hover:bg-[#0D47A1] group-hover:text-white">
              👶
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#0D47A1]">Gửi trẻ</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Tạo yêu cầu gửi trẻ vào trung tâm bảo trợ
              </p>
            </div>
          </button>

          {/* Nhận nuôi */}
          <button
            type="button"
            onClick={() => navigate('/nhan-nuoi/ho-so')}
            className="group flex flex-col items-center gap-5 rounded-[28px] border-2 border-[#E1ECF8] bg-white p-8 shadow-[0_14px_40px_rgba(42,74,122,0.07)] transition hover:-translate-y-1 hover:border-[#0D47A1] hover:shadow-[0_20px_50px_rgba(42,74,122,0.13)]"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3FF] text-5xl transition group-hover:bg-[#0D47A1] group-hover:text-white">
              🏠
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#0D47A1]">Nhận nuôi</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Tạo đơn đăng ký nhận nuôi trẻ
              </p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mx-auto mt-8 block text-sm text-[#9ca3af] transition hover:text-[#6b7280]"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
