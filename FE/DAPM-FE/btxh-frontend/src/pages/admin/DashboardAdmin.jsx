import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import adminApi from '../../api/adminApi';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const STATS_CONFIG = [
  {
    key: 'users',
    label: 'Tổng tài khoản',
    sub: 'Người dùng hệ thống',
    gradient: 'from-[#1565C0] to-[#0D47A1]',
    bgLight: 'bg-blue-50',
    textColor: 'text-[#0D47A1]',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    key: 'active',
    label: 'Đang hoạt động',
    sub: 'Tài khoản đã kích hoạt',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    key: 'locked',
    label: 'Bị khóa',
    sub: 'Tài khoản tạm dừng',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
  },
  {
    key: 'children',
    label: 'Tổng số trẻ',
    sub: 'Trong hệ thống',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
      </svg>
    ),
  },
];

function StatCard({ config, value, loading, index }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_4px_20px_rgba(13,71,161,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(13,71,161,0.15)] cursor-default"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top gradient accent */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#94A8BF]">
              {config.label}
            </p>
            {loading ? (
              <div className="skeleton mt-2 h-9 w-16 rounded-xl" />
            ) : (
              <p className={`mt-1.5 text-4xl font-bold leading-none ${config.textColor}`}>
                {value}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-[#B0C0D4]">{config.sub}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            {config.icon}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br ${config.gradient}`}
        style={{ opacity: 0, mixBlendMode: 'multiply' }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[#E2EAF4] bg-white p-3.5 shadow-[0_12px_32px_rgba(13,71,161,0.14)]">
      <p className="mb-2 text-xs font-bold text-[#8FA0B8] uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm font-semibold" style={{ color: p.color }}>
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#5C728A]">{p.name}:</span>
          <span className="text-[#1A2B4B]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoadingChart(true);
    adminApi.getRequestsByMonth()
      .then((res) => {
        // BE trả { send: [{year,month,count}], adopt: [{year,month,count}] }
        const send  = Array.isArray(res?.send)  ? res.send  : [];
        const adopt = Array.isArray(res?.adopt) ? res.adopt : [];
        const yearNum = Number(year);

        const mapped = MONTHS.map((label, i) => {
          const m = i + 1;
          const s = send.find(x => x.year === yearNum  && x.month === m)?.count ?? 0;
          const a = adopt.find(x => x.year === yearNum && x.month === m)?.count ?? 0;
          return { month: label, 'Gửi trẻ': s, 'Nhận nuôi': a };
        });
        setChartData(mapped);
      })
      .catch(() => setChartData(MONTHS.map(m => ({ month: m, 'Gửi trẻ': 0, 'Nhận nuôi': 0 }))))
      .finally(() => setLoadingChart(false));
  }, [year]);

  const totalUsers    = stats?.tongTaiKhoan  ?? stats?.totalUsers  ?? stats?.total    ?? 0;
  const activeUsers   = stats?.dangHoatDong  ?? stats?.activeUsers ?? stats?.active   ?? 0;
  const lockedUsers   = stats?.biKhoa        ?? stats?.lockedUsers ?? stats?.locked   ?? (totalUsers - activeUsers);
  const totalChildren = stats?.tongTre       ?? stats?.totalChildren ?? stats?.children ?? 0;
  const values = { users: totalUsers, active: activeUsers, locked: lockedUsers, children: totalChildren };

  const currentYear = new Date().getFullYear();
  const yearOptions = [String(currentYear - 1), String(currentYear)];

  const hasData = chartData.some(d => d['Gửi trẻ'] > 0 || d['Nhận nuôi'] > 0);

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#94A8BF]">Bảng điều khiển</p>
          <h1 className="mt-1.5 text-3xl font-bold text-[#0D47A1] leading-tight">
            Tổng quan hệ thống
          </h1>
          <p className="mt-1 text-sm text-[#8FA0B8]">
            Xin chào, <span className="font-semibold text-[#5C728A]">{user?.fullName || 'Quản trị viên'}</span>.
            Đây là tóm tắt hoạt động của hệ thống.
          </p>
        </div>
        <Link
          to="/admin/accounts"
          className="hidden lg:flex items-center gap-2 rounded-2xl border border-[#D5E5F5] bg-white px-4 py-2.5 text-sm font-semibold text-[#0D47A1] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0D47A1]/30 hover:shadow-md"
        >
          Quản lý tài khoản
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* ── Stat cards ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS_CONFIG.map((cfg, i) => (
          <StatCard key={cfg.key} config={cfg} value={values[cfg.key]} loading={loadingStats} index={i} />
        ))}
      </div>

      {/* ── Chart ──────────────────────────────── */}
      <div className="rounded-2xl border border-[#E2EAF4] bg-white p-6 shadow-[0_4px_20px_rgba(13,71,161,0.07)]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1A2B4B]">Thống kê yêu cầu theo tháng</h2>
            <p className="mt-0.5 text-[13px] text-[#94A8BF]">Tổng hợp yêu cầu gửi trẻ và nhận nuôi</p>
          </div>
          <div className="flex gap-1.5 rounded-2xl border border-[#E2EAF4] bg-[#F5F9FE] p-1">
            {yearOptions.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  year === y
                    ? 'bg-[#0D47A1] text-white shadow-md shadow-blue-200'
                    : 'text-[#8FA0B8] hover:text-[#0D47A1]'
                }`}
              >
                Năm {y}
              </button>
            ))}
          </div>
        </div>

        {loadingChart ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E2EAF4] border-t-[#0D47A1]" />
            <p className="text-sm text-[#B0C0D4]">Đang tải dữ liệu...</p>
          </div>
        ) : !hasData ? (
          <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-[#B0C0D4]">
            <svg className="h-10 w-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p className="text-sm font-medium">Chưa có dữ liệu cho năm {year}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={14} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF3FB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#B0C0D4', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#B0C0D4', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EEF4FC', rx: 6 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#5C728A', paddingTop: 12 }}
              />
              <Bar dataKey="Gửi trẻ"   fill="#0D47A1" radius={[5,5,0,0]} />
              <Bar dataKey="Nhận nuôi" fill="#2979FF" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mobile link */}
      <div className="flex justify-end lg:hidden">
        <Link to="/admin/accounts"
          className="rounded-2xl border border-[#D5E5F5] px-5 py-2.5 text-sm font-semibold text-[#0D47A1] hover:bg-[#EEF4FC] transition-colors">
          Quản lý tài khoản →
        </Link>
      </div>
    </div>
  );
}
