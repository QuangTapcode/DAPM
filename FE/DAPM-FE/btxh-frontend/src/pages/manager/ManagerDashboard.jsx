import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import adminApi from '../../api/adminApi';
import receptionApi from '../../api/receptionApi';
import adoptionApi from '../../api/adoptionApi';
import { REQUEST_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const FALLBACK_MONTHLY_DATA = [
  { month: 'T1', reception: 5, adoption: 2 },
  { month: 'T2', reception: 7, adoption: 3 },
  { month: 'T3', reception: 6, adoption: 4 },
  { month: 'T4', reception: 9, adoption: 3 },
  { month: 'T5', reception: 8, adoption: 5 },
  { month: 'T6', reception: 11, adoption: 6 },
];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
      <path d="M4 13l2 5h12l2-5" />
      <path d="M9 13h6" />
    </svg>
  );
}

function StatCard({ title, value, note, chip, icon, tone = 'blue', featured = false }) {
  const toneMap = {
    blue: {
      wrap: featured
        ? 'bg-gradient-to-br from-[#1E73BE] via-[#2D86D6] to-[#4B9FF1] text-white'
        : 'bg-white border border-slate-200 text-slate-800',
      icon: featured ? 'bg-white/15 text-white' : 'bg-blue-100 text-[#1565A9]',
      chip: featured ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#1565A9]',
      note: featured ? 'text-white/80' : 'text-slate-500',
      deco: featured ? 'bg-white/10' : 'bg-blue-50',
    },
    peach: {
      wrap: 'bg-white border border-slate-200 text-slate-800',
      icon: 'bg-orange-100 text-orange-700',
      chip: 'bg-orange-50 text-orange-700',
      note: 'text-slate-500',
      deco: 'bg-orange-50',
    },
    green: {
      wrap: 'bg-white border border-slate-200 text-slate-800',
      icon: 'bg-emerald-100 text-emerald-700',
      chip: 'bg-emerald-50 text-emerald-700',
      note: 'text-slate-500',
      deco: 'bg-emerald-50',
    },
    violet: {
      wrap: 'bg-white border border-slate-200 text-slate-800',
      icon: 'bg-violet-100 text-violet-700',
      chip: 'bg-violet-50 text-violet-700',
      note: 'text-slate-500',
      deco: 'bg-violet-50',
    },
  };

  const c = toneMap[tone];

  return (
    <div className={`relative overflow-hidden rounded-[26px] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${c.wrap}`}>
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${c.deco}`} />
      <div className="relative">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.icon}`}>
            {icon}
          </div>
          {chip && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.chip}`}>
              {chip}
            </span>
          )}
        </div>

        <p className="text-sm font-medium opacity-90">{title}</p>
        <div className="mt-2 text-5xl font-bold tracking-tight">{value}</div>
        <p className={`mt-4 text-sm ${c.note}`}>{note}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[30px] font-bold leading-tight text-slate-800 max-sm:text-xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action && (
          <div className="flex gap-2">
            {Array.isArray(action)
              ? action.map((item) => (
                <span
                  key={item.label}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${item.active
                    ? 'bg-[#1565A9] text-white'
                    : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {item.label}
                </span>
              ))
              : (
                <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500">
                  {action}
                </span>
              )}
          </div>
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

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getInitials(name = 'Người dùng') {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((item) => item[0])
      .join('')
      .toUpperCase() || 'ND'
  );
}

function isWithinLastDays(dateValue, days = 30) {
  if (!dateValue) return false;
  const time = new Date(dateValue).getTime();
  if (Number.isNaN(time)) return false;
  const now = Date.now();
  return now - time <= days * 24 * 60 * 60 * 1000;
}

function getStatusValue(status) {
  return typeof status === 'string' ? status.toLowerCase() : status;
}

function LatestRequestItem({ item }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-1 py-2">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#1565A9]">
        {getInitials(item.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
        <div className="mt-0.5 text-xs text-slate-500">
          Đã nộp: {formatDate(item.createdAt)}
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${item.type === 'adoption'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-blue-50 text-[#1565A9]'
          }`}
      >
        {item.type === 'adoption' ? 'Nhận nuôi' : 'Gửi trẻ'}
      </span>
    </div>
  );
}

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const { data: statsData } = useFetch(() => adminApi.getStats());
  const { data: receptionData } = useFetch(() => receptionApi.getAll());
  const { data: adoptionData } = useFetch(() => adoptionApi.getAll());

  const receptions = useMemo(() => getItems(receptionData), [receptionData]);
  const adoptions = useMemo(() => getItems(adoptionData), [adoptionData]);

  const dashboard = useMemo(() => {
    const pendingReceptionCount = receptions.filter(
      (item) => getStatusValue(item.status) === REQUEST_STATUS.PENDING
    ).length;

    const pendingAdoptionCount = adoptions.filter(
      (item) => getStatusValue(item.status) === REQUEST_STATUS.PENDING
    ).length;

    const lastMonthReceptionCount = receptions.filter((item) =>
      isWithinLastDays(item.createdAt, 30)
    ).length;

    const lastMonthAdoptionCount = adoptions.filter((item) => {
      const compareDate = item.approvedAt || item.updatedAt || item.createdAt;
      return isWithinLastDays(compareDate, 30);
    }).length;

    const recentRequests = [
      ...receptions.map((item) => ({
        id: `reception-${item.id}`,
        name: item.senderName || item.parentName || item.fullName || 'Người yêu cầu',
        createdAt: item.createdAt,
        type: 'reception',
      })),
      ...adoptions.map((item) => ({
        id: `adoption-${item.id}`,
        name: item.adopterName || item.applicantName || item.fullName || 'Người yêu cầu',
        createdAt: item.createdAt,
        type: 'adoption',
      })),
    ]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    const statusChartData = [
      {
        name: 'Gửi trẻ',
        pending: pendingReceptionCount,
        approved: receptions.filter(
          (item) => getStatusValue(item.status) === REQUEST_STATUS.APPROVED
        ).length,
      },
      {
        name: 'Nhận nuôi',
        pending: pendingAdoptionCount,
        approved: adoptions.filter(
          (item) => getStatusValue(item.status) === REQUEST_STATUS.APPROVED
        ).length,
      },
    ];

    return {
      pendingApprovalCount: pendingReceptionCount + pendingAdoptionCount,
      currentChildren:
        statsData?.currentChildren ??
        statsData?.childrenInCenter ??
        statsData?.yearlyChildren ??
        0,
      lastMonthAdoptions:
        statsData?.lastMonthAdoptions ?? lastMonthAdoptionCount,
      lastMonthReceptions:
        statsData?.lastMonthReceptions ?? lastMonthReceptionCount,
      monthlyTrend:
        statsData?.monthlyData ??
        statsData?.monthlyTrend ??
        FALLBACK_MONTHLY_DATA,
      latestRequests:
        statsData?.latestRequests?.length > 0
          ? statsData.latestRequests
          : recentRequests,
      statusChartData,
    };
  }, [statsData, receptions, adoptions]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard trưởng phòng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi hồ sơ cần phê duyệt, số trẻ hiện tại và tình hình tiếp nhận gần đây.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<MailIcon />}
            title="Hồ sơ cần phê duyệt"
            value={dashboard.pendingApprovalCount}
            note="Các hồ sơ đang chờ trưởng phòng xem xét"
            chip="Ưu tiên xử lý"
            tone="blue"
          />

          <StatCard
            icon={<HomeIcon />}
            title="Số trẻ hiện tại của trung tâm"
            value={dashboard.currentChildren}
            note="Tổng số trẻ đang được quản lý tại thời điểm hiện tại"
            chip="Cập nhật mới"
            tone="peach"
          />

          <StatCard
            icon={<CheckIcon />}
            title="Nhận nuôi 1 tháng gần nhất"
            value={dashboard.lastMonthAdoptions}
            note="Số hồ sơ nhận nuôi hoàn tất trong 30 ngày gần đây"
            tone="green"
          />

          <StatCard
            icon={<InboxIcon />}
            title="Tiếp nhận 1 tháng gần nhất"
            value={dashboard.lastMonthReceptions}
            note="Số trẻ được tiếp nhận trong 30 ngày gần đây"
            tone="blue"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
          <div className="space-y-6">
            <ChartCard
              title="Xu hướng hồ sơ"
              subtitle="Dữ liệu tổng hợp theo từng tháng"
              action={[
                { label: '6 tháng', active: false },
                { label: '1 năm', active: true },
              ]}
            >
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.monthlyTrend}>
                    <defs>
                      <linearGradient id="receptionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9BC7EC" stopOpacity={0.42} />
                        <stop offset="95%" stopColor="#9BC7EC" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="adoptionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1565A9" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#1565A9" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="#E7EDF4" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 16 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="reception"
                      name="Tiếp nhận"
                      stroke="#8CB9DF"
                      strokeWidth={4}
                      fill="url(#receptionGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="adoption"
                      name="Nhận nuôi"
                      stroke="#1565A9"
                      strokeWidth={4}
                      fill="url(#adoptionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Tình trạng xử lý hồ sơ"
              subtitle="So sánh hồ sơ chờ duyệt và hồ sơ đã duyệt theo từng nhóm"
              action="Tổng quan"
            >
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard.statusChartData} barGap={12}>
                    <CartesianGrid vertical={false} stroke="#E7EDF4" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: 16 }}
                    />
                    <Bar
                      dataKey="pending"
                      name="Chờ duyệt"
                      fill="#CFE1F3"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={34}
                    />
                    <Bar
                      dataKey="approved"
                      name="Đã duyệt"
                      fill="#2D86D6"
                      radius={[10, 10, 0, 0]}
                      maxBarSize={34}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[30px] font-bold leading-tight text-slate-800 max-sm:text-xl">
                  Hồ sơ mới nhất
                </h2>
              </div>

              <button
                onClick={() => navigate('/truong-phong/cho-duyet')}
                className="text-sm font-semibold text-[#1565A9] hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {dashboard.latestRequests.length > 0 ? (
                dashboard.latestRequests.map((item) => (
                  <LatestRequestItem key={item.id} item={item} />
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có hồ sơ mới.
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/truong-phong/cho-duyet')}
              className="mt-6 w-full rounded-2xl bg-[#D9E9F8] px-4 py-3 text-sm font-semibold text-[#1565A9] transition hover:bg-[#CDE0F4]"
            >
              Xử lý hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}