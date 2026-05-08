import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildMonthlyChart(raw) {
  if (!raw?.send && !raw?.adopt) return [];

  // Gom tất cả year-month có mặt
  const keySet = new Set();
  (raw.send || []).forEach(r => keySet.add(`${r.year}-${String(r.month).padStart(2,'0')}`));
  (raw.adopt || []).forEach(r => keySet.add(`${r.year}-${String(r.month).padStart(2,'0')}`));

  const sendMap = Object.fromEntries((raw.send || []).map(r => [`${r.year}-${String(r.month).padStart(2,'0')}`, r.count]));
  const adoptMap = Object.fromEntries((raw.adopt || []).map(r => [`${r.year}-${String(r.month).padStart(2,'0')}`, r.count]));

  return [...keySet]
    .sort()
    .slice(-6) // chỉ lấy 6 tháng gần nhất
    .map(key => {
      const [, mm] = key.split('-');
      return { month: `T${parseInt(mm)}`, reception: sendMap[key] ?? 0, adoption: adoptMap[key] ?? 0 };
    });
}

function buildChildrenPie(statusMap) {
  if (!statusMap || typeof statusMap !== 'object') return [];
  const COLORS = {
    'Đang chăm sóc': '#60A5FA',
    'Chờ nhận nuôi': '#FBBF24',
    'Đã nhận nuôi': '#34D399',
    'Chờ tiếp nhận': '#A78BFA',
  };
  return Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
    color: COLORS[name] || '#94A3B8',
  }));
}

// ── Components ────────────────────────────────────────────────────────────────

function StatCard({ icon, title, value, note, chip, tone = 'blue', featured = false }) {
  const toneMap = {
    blue: {
      shell: featured
        ? 'bg-gradient-to-br from-[#1F6FBE] to-[#4EA2F0] text-white'
        : 'bg-white border border-slate-200 text-slate-800',
      iconWrap: featured ? 'bg-white/15 text-white' : 'bg-blue-100 text-[#1F6FBE]',
      chip: featured ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#1F6FBE]',
      note: featured ? 'text-white/80' : 'text-slate-500',
      deco: featured ? 'bg-white/10' : 'bg-blue-50',
    },
    peach: { shell: 'bg-white border border-slate-200 text-slate-800', iconWrap: 'bg-orange-100 text-orange-600', chip: 'bg-orange-50 text-orange-700', note: 'text-slate-500', deco: 'bg-orange-50' },
    green: { shell: 'bg-white border border-slate-200 text-slate-800', iconWrap: 'bg-emerald-100 text-emerald-600', chip: 'bg-emerald-50 text-emerald-700', note: 'text-slate-500', deco: 'bg-emerald-50' },
    purple: { shell: 'bg-white border border-slate-200 text-slate-800', iconWrap: 'bg-violet-100 text-violet-600', chip: 'bg-violet-50 text-violet-700', note: 'text-slate-500', deco: 'bg-violet-50' },
  };
  const c = toneMap[tone];

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${c.shell}`}>
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full ${c.deco}`} />
      <div className="relative">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.iconWrap}`}>
            {icon || <span className="text-xl">📊</span>}
          </div>
          {chip && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.chip}`}>{chip}</span>}
        </div>
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="mt-2 text-5xl font-bold tracking-tight">{value ?? '—'}</div>
        <div className={`mt-4 text-sm ${c.note}`}>{note}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{action}</span>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
      <div className="space-y-1.5">
        {payload.map(item => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-slate-500">{item.name}</span>
            <span className="font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Statistics() {
  const { data: stats, loading: loadingStats } = useFetch(adminApi.getStats);
  const { data: monthlyRaw, loading: loadingMonthly } = useFetch(adminApi.getRequestsByMonth);
  const { data: childrenStatus, loading: loadingPie } = useFetch(adminApi.getChildrenByStatus);

  const chartData = useMemo(() => buildMonthlyChart(monthlyRaw), [monthlyRaw]);
  const pieData = useMemo(() => buildChildrenPie(childrenStatus), [childrenStatus]);

  const totalRequests = (stats?.totalSendRequests ?? 0) + (stats?.totalAdoptionRequests ?? 0);
  const pendingTotal = (stats?.pendingSendRequests ?? 0) + (stats?.pendingAdoptionRequests ?? 0);
  const adoptionRate = stats?.totalSendRequests > 0
    ? Math.round((stats.totalAdoptionProfiles / stats.totalSendRequests) * 100)
    : 0;

  const loading = loadingStats || loadingMonthly || loadingPie;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Thống kê báo cáo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tổng quan hồ sơ, tiến độ đánh giá và kết quả tiếp nhận.
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<span className="text-xl">📋</span>}
            title="Tổng yêu cầu"
            value={totalRequests}
            note={`Gửi trẻ: ${stats?.totalSendRequests ?? 0} · Nhận nuôi: ${stats?.totalAdoptionRequests ?? 0}`}
            chip="Toàn hệ thống"
            tone="blue"
          />
          <StatCard
            icon={<span className="text-xl">⏳</span>}
            title="Đang chờ xử lý"
            value={pendingTotal}
            note={`Gửi trẻ: ${stats?.pendingSendRequests ?? 0} · Nhận nuôi: ${stats?.pendingAdoptionRequests ?? 0}`}
            chip="Cần xét duyệt"
            tone="peach"
          />
          <StatCard
            icon={<span className="text-xl">✅</span>}
            title="Hồ sơ nhận nuôi"
            value={stats?.totalAdoptionProfiles ?? 0}
            note={`Trẻ đã nhận nuôi: ${stats?.childrenAdopted ?? 0}`}
            chip="Hoàn tất"
            tone="blue"
            featured
          />
          <StatCard
            icon={<span className="text-xl">📈</span>}
            title="Tỷ lệ nhận nuôi"
            value={`${adoptionRate}%`}
            note="Hồ sơ nhận nuôi / tổng yêu cầu gửi trẻ"
            chip="Hiệu quả xử lý"
            tone="purple"
          />
        </div>

        {/* Row 2: children stats */}
        <div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            { label: 'Tổng trẻ', value: stats?.totalChildren ?? 0, color: 'text-[#1F6FBE]' },
            { label: 'Đang chăm sóc', value: stats?.childrenInCare ?? 0, color: 'text-sky-600' },
            { label: 'Chờ nhận nuôi', value: stats?.childrenWaitingAdoption ?? 0, color: 'text-amber-600' },
            { label: 'Đã nhận nuôi', value: stats?.childrenAdopted ?? 0, color: 'text-emerald-600' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`mt-2 text-4xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Yêu cầu theo tháng"
            subtitle="Số yêu cầu gửi trẻ và nhận nuôi trong 6 tháng gần nhất"
            action="6 tháng"
          >
            {chartData.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu theo tháng</p>
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={10}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                      <Bar dataKey="reception" name="Gửi trẻ" fill="#93C5FD" radius={[8,8,0,0]} maxBarSize={28} />
                      <Bar dataKey="adoption" name="Nhận nuôi" fill="#60A5FA" radius={[8,8,0,0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#93C5FD]" />Gửi trẻ</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#60A5FA]" />Nhận nuôi</span>
                </div>
              </>
            )}
          </ChartCard>

          <ChartCard title="Xu hướng theo tháng" subtitle="Diễn biến số liệu dưới dạng xu hướng" action="Cập nhật mới">
            {chartData.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu theo tháng</p>
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="receptionFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="adoptionFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="reception" name="Gửi trẻ" stroke="#93C5FD" strokeWidth={3} fill="url(#receptionFill)" />
                    <Area type="monotone" dataKey="adoption" name="Nhận nuôi" stroke="#60A5FA" strokeWidth={3} fill="url(#adoptionFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* Pie chart trạng thái trẻ */}
          <ChartCard title="Phân bố trạng thái trẻ" subtitle="Số lượng trẻ theo từng trạng thái hiện tại">
            {pieData.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">Chưa có dữ liệu</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* Thống kê người dùng */}
          <ChartCard title="Tổng quan người dùng" subtitle="Số lượng tài khoản trong hệ thống">
            <div className="grid grid-cols-2 gap-4 py-4">
              {[
                { label: 'Tổng tài khoản', value: stats?.totalUsers ?? 0, color: 'bg-blue-50 text-blue-700' },
                { label: 'Đang hoạt động', value: stats?.activeUsers ?? 0, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Hồ sơ tiếp nhận', value: stats?.totalReceptionProfiles ?? 0, color: 'bg-violet-50 text-violet-700' },
                { label: 'Hồ sơ nhận nuôi', value: stats?.totalAdoptionProfiles ?? 0, color: 'bg-amber-50 text-amber-700' },
              ].map(item => (
                <div key={item.label} className={`rounded-2xl p-5 ${item.color}`}>
                  <p className="text-sm font-medium opacity-80">{item.label}</p>
                  <p className="mt-2 text-4xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
