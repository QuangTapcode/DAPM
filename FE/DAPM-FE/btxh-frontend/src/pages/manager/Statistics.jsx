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
} from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';

const FALLBACK_DATA = [
  { month: 'T1', reception: 0, adoption: 0 },
  { month: 'T2', reception: 0, adoption: 0 },
  { month: 'T3', reception: 0, adoption: 0 },
  { month: 'T4', reception: 0, adoption: 0 },
  { month: 'T5', reception: 0, adoption: 0 },
  { month: 'T6', reception: 0, adoption: 0 },
];

function buildChartData(raw) {
  if (!raw) return FALLBACK_DATA;
  const { send = [], adopt = [] } = raw;
  const map = {};

  send.forEach(({ month, count }) => {
    const key = `T${month}`;
    map[key] = map[key] ?? { month: key, reception: 0, adoption: 0 };
    map[key].reception += count;
  });

  adopt.forEach(({ month, count }) => {
    const key = `T${month}`;
    map[key] = map[key] ?? { month: key, reception: 0, adoption: 0 };
    map[key].adoption += count;
  });

  const sorted = Object.values(map).sort(
    (a, b) => Number(a.month.slice(1)) - Number(b.month.slice(1))
  );
  return sorted.length ? sorted : FALLBACK_DATA;
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

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
    peach: {
      shell: 'bg-white border border-slate-200 text-slate-800',
      iconWrap: 'bg-orange-100 text-orange-600',
      chip: 'bg-orange-50 text-orange-700',
      note: 'text-slate-500',
      deco: 'bg-orange-50',
    },
    green: {
      shell: 'bg-white border border-slate-200 text-slate-800',
      iconWrap: 'bg-emerald-100 text-emerald-600',
      chip: 'bg-emerald-50 text-emerald-700',
      note: 'text-slate-500',
      deco: 'bg-emerald-50',
    },
    purple: {
      shell: 'bg-white border border-slate-200 text-slate-800',
      iconWrap: 'bg-violet-100 text-violet-600',
      chip: 'bg-violet-50 text-violet-700',
      note: 'text-slate-500',
      deco: 'bg-violet-50',
    },
  };
  const colors = toneMap[tone];

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${colors.shell}`}>
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full ${colors.deco}`} />
      <div className="relative">
        <div className="mb-8 flex items-start justify-between gap-3">
          {icon && <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.iconWrap}`}>{icon}</div>}
          {chip && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.chip}`}>{chip}</span>}
        </div>
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="mt-2 text-5xl font-bold tracking-tight">{value ?? 0}</div>
        <div className={`mt-4 text-sm ${colors.note}`}>{note}</div>
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
        {action && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {action}
          </span>
        )}
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
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-slate-500">{item.name}</span>
            <span className="font-semibold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Statistics() {
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(() => adminApi.getStats());
  const { data: monthlyRaw } = useFetch(() => adminApi.getRequestsByMonth());

  const chartData = buildChartData(monthlyRaw);
  const totalProfiles = (stats?.totalReceptionProfiles ?? 0) + (stats?.totalAdoptionProfiles ?? 0);
  const pendingProfiles = (stats?.pendingReceptionProfiles ?? 0) + (stats?.pendingAdoptionProfiles ?? 0);
  const totalRequests = (stats?.totalSendRequests ?? 0) + (stats?.totalAdoptionRequests ?? 0);
  const adoptionRate =
    stats?.totalAdoptionRequests && stats?.totalAdoptionProfiles
      ? Math.round((stats.totalAdoptionProfiles / stats.totalAdoptionRequests) * 100)
      : 0;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Thống kê hồ sơ và trẻ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tổng quan hồ sơ, tiến độ phê duyệt và tình trạng trẻ trong trung tâm.
          </p>
        </div>

        {statsError && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {statsError}
          </div>
        )}

        {statsLoading && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-700">
            Đang tải số liệu thống kê...
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FileIcon />}
            title="Tổng hồ sơ"
            value={totalProfiles}
            note="Tổng hồ sơ tiếp nhận và nhận nuôi đã lập"
            chip="Tất cả"
            tone="blue"
          />
          <StatCard
            icon={<UsersIcon />}
            title="Hồ sơ đang chờ duyệt"
            value={pendingProfiles}
            note="Đang trong giai đoạn xác minh và phê duyệt"
            chip="Cần xử lý"
            tone="peach"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            title="Tổng yêu cầu"
            value={totalRequests}
            note="Tổng yêu cầu gửi trẻ và nhận nuôi đã ghi nhận"
            chip="Nguồn vào"
            tone="blue"
            featured
          />
          <StatCard
            icon={<PercentIcon />}
            title="Tỷ lệ lập hồ sơ nhận nuôi"
            value={`${adoptionRate}%`}
            note="Tính trên tổng yêu cầu nhận nuôi đã có hồ sơ"
            chip="Hiệu quả xử lý"
            tone="purple"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Trẻ đang chăm sóc"
            value={stats?.childrenInCare ?? 0}
            note="Số trẻ hiện đang ở tại trung tâm"
            tone="blue"
          />
          <StatCard
            title="Trẻ chờ nhận nuôi"
            value={stats?.childrenWaitingAdoption ?? 0}
            note="Sẵn sàng ghép hồ sơ nhận nuôi"
            tone="peach"
          />
          <StatCard
            title="Trẻ đã nhận nuôi"
            value={stats?.childrenAdopted ?? 0}
            note="Đã về với gia đình mới"
            tone="green"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Tiếp nhận và nhận nuôi theo tháng"
            subtitle="So sánh số yêu cầu gửi trẻ và nhận nuôi từng tháng"
            action="Năm hiện tại"
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={10}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="reception" name="Tiếp nhận" fill="#93C5FD" radius={[10, 10, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="adoption" name="Nhận nuôi" fill="#60A5FA" radius={[10, 10, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#93C5FD]" />
                Tiếp nhận
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#60A5FA]" />
                Nhận nuôi
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Xu hướng biến động hồ sơ"
            subtitle="Diễn biến số liệu theo từng tháng dưới dạng xu hướng"
            action="Cập nhật mới"
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="statsRecFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="statsAdpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="reception" name="Tiếp nhận" stroke="#93C5FD" strokeWidth={3} fill="url(#statsRecFill)" />
                  <Area type="monotone" dataKey="adoption" name="Nhận nuôi" stroke="#60A5FA" strokeWidth={3} fill="url(#statsAdpFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Biểu đồ hỗ trợ trưởng phòng theo dõi tốc độ xử lý hồ sơ và biến động yêu cầu theo thời gian.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
