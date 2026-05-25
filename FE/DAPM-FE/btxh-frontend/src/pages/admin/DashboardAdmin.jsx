import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import adminApi from '../../api/adminApi';

const card28 = 'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.08)]';

const MONTH_LABELS = ['TH1','TH2','TH3','TH4','TH5','TH6','TH7','TH8','TH9','TH10','TH11','TH12'];

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    adminApi.getRequestsByMonth()
      .then((res) => {
        const raw = Array.isArray(res) ? res : (res?.items || res?.data || []);
        const yearNum = Number(year);
        const filtered = raw.filter((item) => {
          const d = new Date(item.thang || item.month || item.nam || '');
          return !isNaN(d) ? d.getFullYear() === yearNum : true;
        });

        if (filtered.length > 0) {
          const mapped = MONTH_LABELS.map((label, i) => {
            const match = filtered.find((item) => {
              const d = new Date(item.thang || item.month || '');
              return d.getMonth() === i;
            });
            return { month: label, value: match?.soLuong ?? match?.count ?? match?.total ?? 0 };
          });
          setChartData(mapped);
        } else {
          setChartData(MONTH_LABELS.map((label) => ({ month: label, value: 0 })));
        }
      })
      .catch(() => setChartData(MONTH_LABELS.map((label) => ({ month: label, value: 0 }))))
      .finally(() => setLoadingChart(false));
  }, [year]);

  const totalUsers   = stats?.tongTaiKhoan ?? stats?.totalUsers ?? stats?.total ?? 0;
  const activeUsers  = stats?.dangHoatDong ?? stats?.activeUsers ?? stats?.active ?? 0;
  const lockedUsers  = stats?.biKhoa ?? stats?.lockedUsers ?? stats?.locked ?? (totalUsers - activeUsers);
  const totalChildren = stats?.tongTre ?? stats?.totalChildren ?? stats?.children ?? 0;

  const STATS = [
    {
      label: 'Tổng số tài khoản',
      value: loadingStats ? '—' : totalUsers,
      colorBox: 'bg-[#EAF3FF] text-[#0D47A1]',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
    },
    {
      label: 'Đang hoạt động',
      value: loadingStats ? '—' : activeUsers,
      colorBox: 'bg-emerald-50 text-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
    },
    {
      label: 'Tài khoản bị khóa',
      value: loadingStats ? '—' : lockedUsers,
      colorBox: 'bg-red-50 text-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      ),
    },
    {
      label: 'Tổng số trẻ em',
      value: loadingStats ? '—' : totalChildren,
      colorBox: 'bg-amber-50 text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [String(currentYear - 1), String(currentYear)];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[36px] font-bold text-[#0D47A1] leading-none">Bảng điều khiển hệ thống</h1>
        <p className="text-sm text-[#8FA0B8] mt-2">Xin chào, {user?.fullName || 'Quản trị viên'}. Đây là tóm tắt hoạt động trong ngày.</p>
      </div>

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

      <div className={`${card28} p-6`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[15px] font-bold text-[#0D47A1]">Thống kê yêu cầu theo tháng</h2>
            <p className="text-xs text-[#8FA0B8] mt-0.5">Tổng yêu cầu gửi trẻ và nhận nuôi theo tháng</p>
          </div>
          <div className="flex gap-1">
            {yearOptions.map((y) => (
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
        {loadingChart ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-[#8FA0B8]">Đang tải...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F5FC" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8FA0B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#8FA0B8' }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip
                contentStyle={{ borderRadius: 16, border: '1px solid #E3ECF8', boxShadow: '0 8px 24px rgba(42,74,122,0.1)', fontSize: 12 }}
                cursor={{ fill: '#EAF3FF' }}
              />
              <Bar dataKey="value" name="Số yêu cầu" fill="#0D47A1" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-end">
        <Link to="/admin/accounts"
          className="rounded-2xl border border-[#DCE8F7] px-5 py-2.5 text-xs font-semibold text-[#0D47A1] hover:bg-[#EAF3FF] transition-colors">
          Quản lý tài khoản →
        </Link>
      </div>
    </div>
  );
}
