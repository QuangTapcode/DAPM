import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import adminApi from '../../api/adminApi';

const card28 = 'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.08)]';

const DATA_2023 = [120,145,110,160,130,175,140,155,125,170,145,190];
const DATA_2024 = [140,160,130,180,155,210,170,195,150,220,180,240];
const MONTHS = ['TH1','TH2','TH3','TH4','TH5','TH6','TH7','TH8','TH9','TH10','TH11','TH12'];

const ACTIVITIES = [
  { icon: '👤', label: 'Đã thêm tài khoản mới', name: '"NV_Thanh"',  time: '10 phút trước', by: 'Quản trị viên A', nameColor: 'text-[#0D47A1]' },
  { icon: '🔑', label: 'Đổi mật khẩu tài khoản', name: '"User_04"', time: '1 giờ trước',    by: 'Tự động',        nameColor: 'text-[#0D47A1]' },
  { icon: '🛡️', label: 'Cập nhật phân quyền cho nhóm', name: 'Nhân viên Y tế', time: '4 giờ trước', by: 'Quản trị viên B', nameColor: 'text-[#334155]' },
  { icon: '⚠️', label: 'Phát hiện đăng nhập lạ từ IP', name: '192.168.1.1', time: '6 giờ trước', by: 'Bảo mật hệ thống', nameColor: 'text-red-500' },
];

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [year, setYear] = useState('2024');
  const { data: userData } = useFetch(() => adminApi.getUsers({ limit: 1000 }));

  const allUsers   = userData?.items || [];
  const total      = allUsers.length;
  const active     = allUsers.filter(u => u.isActive !== false).length;
  const locked     = total - active;

  const STATS = [
    {
      label: 'Tổng số tài khoản', value: total,
      colorBox: 'bg-[#EAF3FF] text-[#0D47A1]', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      label: 'Đang hoạt động', value: active,
      colorBox: 'bg-emerald-50 text-emerald-600', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      label: 'Tài khoản bị khóa', value: locked,
      colorBox: 'bg-red-50 text-red-500', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      ),
    },
    {
      label: 'Lượt đăng nhập hôm nay', value: total > 0 ? total * 4 : 0,
      colorBox: 'bg-amber-50 text-amber-600', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
        </svg>
      ),
    },
  ];

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    value: year === '2024' ? DATA_2024[i] : DATA_2023[i],
  }));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-[36px] font-bold text-[#0D47A1] leading-none">Bảng điều khiển hệ thống</h1>
        <p className="text-sm text-[#8FA0B8] mt-2">Xin chào, {user?.fullName || 'Quản trị viên'}. Đây là tóm tắt hoạt động trong ngày.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <div key={i} className={`${card28} p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.colorBox}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">{s.label}</p>
              <p className="text-[32px] font-bold text-[#0D47A1] leading-none mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* BAR CHART */}
        <div className={`${card28} lg:col-span-2 p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-bold text-[#0D47A1]">Thống kê tài khoản tạo mới</h2>
              <p className="text-xs text-[#8FA0B8] mt-0.5">Dữ liệu đăng ký mới theo tháng</p>
            </div>
            <div className="flex gap-1">
              {['2023', '2024'].map(y => (
                <button key={y} onClick={() => setYear(y)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-colors ${
                    year === y
                      ? 'bg-[#0D47A1] text-white shadow-md'
                      : 'border border-[#E3ECF8] text-[#5F81BC] hover:bg-[#EAF3FF]'
                  }`}>
                  Năm {y}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F5FC" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8FA0B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#8FA0B8' }} axisLine={false} tickLine={false}/>
              <Tooltip
                contentStyle={{ borderRadius: 16, border: '1px solid #E3ECF8', boxShadow: '0 8px 24px rgba(42,74,122,0.1)', fontSize: 12 }}
                cursor={{ fill: '#EAF3FF' }}
              />
              <Bar dataKey="value" fill="#0D47A1" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ACTIVITY */}
        <div className={`${card28} p-6 flex flex-col`}>
          <div className="border-b border-[#F0F5FC] pb-4 mb-4">
            <h2 className="text-[15px] font-bold text-[#0D47A1]">Hoạt động gần đây</h2>
            <p className="text-xs text-[#8FA0B8] mt-0.5">Nhật ký truy cập và thay đổi</p>
          </div>
          <div className="flex-1 space-y-4">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-2xl bg-[#F5F9FE] flex items-center justify-center text-base shrink-0">{a.icon}</div>
                <div className="min-w-0">
                  <p className="text-sm text-[#334155] leading-snug">
                    {a.label} <span className={`font-semibold ${a.nameColor}`}>{a.name}</span>
                  </p>
                  <p className="text-[11px] text-[#8FA0B8] mt-0.5">{a.time} · {a.by}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/accounts"
            className="mt-4 w-full py-2.5 rounded-2xl border border-[#DCE8F7] text-xs font-semibold text-[#0D47A1] hover:bg-[#EAF3FF] transition-colors text-center block">
            XEM TẤT CẢ NHẬT KÝ →
          </Link>
        </div>
      </div>
    </div>
  );
}
