import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock3,
  Search,
  CheckCircle2,
  XCircle,
  UsersRound,
  HeartPulse,
  Eye,
  ArrowUpRight,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react';

import { useBasePath } from '../../hooks/useBasePath';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import { formatDate } from '../../utils/formatDate';

const cardClass =
  'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.07)]';

const STATUS_DB = {
  CHO_XU_LY: 'Chờ xử lý',
  DANG_XEM_XET: 'Đang xem xét',
  DA_TIEP_NHAN: 'Đã tiếp nhận',
  TU_CHOI: 'Từ chối',
  DA_HUY: 'Đã hủy',
};

const STATUS_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xử lý', value: STATUS_DB.CHO_XU_LY },
  { label: 'Đang xem xét', value: STATUS_DB.DANG_XEM_XET },
  { label: 'Đã tiếp nhận', value: STATUS_DB.DA_TIEP_NHAN },
  { label: 'Từ chối', value: STATUS_DB.TU_CHOI },
  { label: 'Đã hủy', value: STATUS_DB.DA_HUY },
];

const TYPE_LABEL = {
  CME: 'Cha/Mẹ ruột',
  NTH: 'Người thân',
  CQDP: 'Cơ quan địa phương',
};

const STATUS_META = {
  [STATUS_DB.CHO_XU_LY]: {
    text: 'Chờ xử lý',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  [STATUS_DB.DANG_XEM_XET]: {
    text: 'Đang xem xét',
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  [STATUS_DB.DA_TIEP_NHAN]: {
    text: 'Đã tiếp nhận',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  [STATUS_DB.TU_CHOI]: {
    text: 'Từ chối',
    pill: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
  [STATUS_DB.DA_HUY]: {
    text: 'Đã hủy',
    pill: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const DEMO_REQUESTS = [
  {
    MaYeuCauGuiTre: 'YCGT0001',
    TenNguoiGui: 'Trần Thị Gửi',
    MaLoaiNguoiGui: 'NTH',
    QuanHeVoiTre: 'Bà ngoại',
    LyDoGui: 'Gia đình khó khăn, không đủ điều kiện chăm sóc trẻ.',
    NgayTao: '2026-03-01T00:00:00Z',
    NgayCapNhat: '2026-03-02T00:00:00Z',
    TrangThaiYC: STATUS_DB.DA_TIEP_NHAN,
    GhiChu: 'Hồ sơ hợp lệ, trẻ đã được tiếp nhận vào trung tâm.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0002',
    TenNguoiGui: 'Nguyễn Văn Minh',
    MaLoaiNguoiGui: 'CME',
    QuanHeVoiTre: 'Cha ruột',
    LyDoGui: 'Cha/mẹ bệnh nặng, chưa thể chăm sóc trẻ.',
    NgayTao: '2026-04-10T00:00:00Z',
    NgayCapNhat: null,
    TrangThaiYC: STATUS_DB.CHO_XU_LY,
    GhiChu: 'Chờ cán bộ tiếp nhận kiểm tra thông tin và giấy tờ.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0003',
    TenNguoiGui: 'UBND Phường Hòa Khánh Bắc',
    MaLoaiNguoiGui: 'CQDP',
    QuanHeVoiTre: 'Cơ quan địa phương',
    LyDoGui: 'Trẻ có hoàn cảnh đặc biệt cần được bảo trợ.',
    NgayTao: '2026-04-14T00:00:00Z',
    NgayCapNhat: '2026-04-15T00:00:00Z',
    TrangThaiYC: STATUS_DB.DANG_XEM_XET,
    GhiChu: 'Đang xác minh giấy tờ pháp lý và thông tin trẻ.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0004',
    TenNguoiGui: 'Lê Thị Hạnh',
    MaLoaiNguoiGui: 'CME',
    QuanHeVoiTre: 'Mẹ ruột',
    LyDoGui: 'Thông tin chưa đủ điều kiện tiếp nhận.',
    NgayTao: '2026-04-16T00:00:00Z',
    NgayCapNhat: '2026-04-17T00:00:00Z',
    TrangThaiYC: STATUS_DB.TU_CHOI,
    GhiChu: 'Từ chối do giấy tờ chưa hợp lệ.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0005',
    TenNguoiGui: 'Phạm Quốc Nam',
    MaLoaiNguoiGui: 'NTH',
    QuanHeVoiTre: 'Cậu ruột',
    LyDoGui: 'Người gửi đã hủy yêu cầu.',
    NgayTao: '2026-04-18T00:00:00Z',
    NgayCapNhat: '2026-04-19T00:00:00Z',
    TrangThaiYC: STATUS_DB.DA_HUY,
    GhiChu: 'Yêu cầu đã được hủy.',
  },
];

function StatusPill({ status }) {
  const meta = STATUS_META[status] || {
    text: status || '—',
    pill: 'bg-slate-50 text-slate-500 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold whitespace-nowrap ${meta.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.text}
    </span>
  );
}

function truncateText(value, max = 70) {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function mapRequestRow(item) {
  if (!item) return null;

  return {
    id: item.id || item.MaYeuCauGuiTre,
    code: item.code || item.MaYeuCauGuiTre,
    senderName: item.senderName || item.TenNguoiGui || item.MaNguoiGui || '—',
    senderType:
      TYPE_LABEL[item.senderTypeCode || item.MaLoaiNguoiGui] ||
      item.MaLoaiNguoiGui ||
      '—',
    relationship: item.relationship || item.QuanHeVoiTre || '—',
    reason: item.reason || item.LyDoGui || '',
    createdAt: item.createdAt || item.NgayTao,
    updatedAt: item.updatedAt || item.NgayCapNhat,
    status: item.status || item.TrangThaiYC,
    note: item.note || item.GhiChu || '',
  };
}
function StatCard({ label, value, icon, tone, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[30px] border bg-white p-6 text-left shadow-[0_14px_36px_rgba(42,74,122,0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(42,74,122,0.12)] ${active
        ? 'border-[#0D47A1] ring-4 ring-[#0D47A1]/10'
        : 'border-[#E3ECF8]'
        }`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#EAF3FF] opacity-80 transition group-hover:scale-110" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8FA0B8]">
            {label}
          </p>
          <p className="mt-4 !text-[48px] font-black leading-none text-[#0D47A1]">
            {value}
          </p>
        </div>

        <div
          className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${tone}`}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}
function QuickActionCard({ title, description, icon, to, accent = 'blue' }) {
  const accentMap = {
    blue: {
      icon: 'bg-[#EAF3FF] text-[#0D47A1]',
      line: 'from-[#0D47A1] to-[#5AA7FF]',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-600',
      line: 'from-emerald-500 to-teal-400',
    },
    violet: {
      icon: 'bg-violet-50 text-violet-600',
      line: 'from-violet-500 to-indigo-400',
    },
    rose: {
      icon: 'bg-rose-50 text-rose-600',
      line: 'from-rose-500 to-orange-400',
    },
  };

  const tone = accentMap[accent] || accentMap.blue;

  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-[30px] border border-[#E3ECF8] bg-white p-6 shadow-[0_14px_36px_rgba(42,74,122,0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(42,74,122,0.12)]"
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tone.line}`} />

      <div className="flex items-start justify-between gap-5">
        <div className="flex gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${tone.icon}`}
          >
            {icon}
          </div>

          <div>
            <h3 className="mt-2 text-[18px] font-extrabold text-[#1E3A5F]">
              {title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#7D90AA]">
              {description}
            </p>
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F9FE] text-[#8FA0B8] transition group-hover:bg-[#0D47A1] group-hover:text-white">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </Link>
  );
}
export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const basePath = useBasePath();

  const [tab, setTab] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data } = useFetch(receptionApi.getAll);

  const requestsRaw = data?.items?.length > 0 ? data.items : DEMO_REQUESTS;

  const requests = useMemo(
    () => requestsRaw.map(mapRequestRow).filter(Boolean),
    [requestsRaw]
  );

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === STATUS_DB.CHO_XU_LY).length,
      reviewing: requests.filter((r) => r.status === STATUS_DB.DANG_XEM_XET).length,
      accepted: requests.filter((r) => r.status === STATUS_DB.DA_TIEP_NHAN).length,
      rejected: requests.filter((r) => r.status === STATUS_DB.TU_CHOI).length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return requests.filter((item) => {
      const matchStatus = !tab || item.status === tab;

      const searchable = [
        item.code,
        item.senderName,
        item.senderType,
        item.relationship,
        item.reason,
        item.status,
        item.note,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchStatus && matchKeyword;
    });
  }, [requests, tab, keyword]);

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Tổng quan tiếp nhận trẻ
            </h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#73839B]">
              Theo dõi yêu cầu gửi trẻ, kiểm tra hồ sơ tiếp nhận, quản lý trẻ đã vào trung tâm
              và các thông tin sức khỏe liên quan đến trẻ.
            </p>
          </div>

          <Link
            to={`${basePath}/yeu-cau`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(13,71,161,0.18)] transition hover:bg-[#083778]"
          >
            <ShieldCheck size={17} />
            Xử lý yêu cầu
          </Link>
        </header>
        {/* Stats */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Tổng yêu cầu"
            value={stats.total}
            active={tab === ''}
            onClick={() => setTab('')}
            tone="bg-[#EAF3FF] text-[#0D47A1]"
            icon={<ClipboardList size={24} />}
          />

          <StatCard
            label="Chờ xử lý"
            value={stats.pending}
            active={tab === STATUS_DB.CHO_XU_LY}
            onClick={() => setTab(STATUS_DB.CHO_XU_LY)}
            tone="bg-amber-50 text-amber-600"
            icon={<Clock3 size={24} />}
          />

          <StatCard
            label="Đang xem xét"
            value={stats.reviewing}
            active={tab === STATUS_DB.DANG_XEM_XET}
            onClick={() => setTab(STATUS_DB.DANG_XEM_XET)}
            tone="bg-sky-50 text-sky-600"
            icon={<Search size={24} />}
          />

          <StatCard
            label="Đã tiếp nhận"
            value={stats.accepted}
            active={tab === STATUS_DB.DA_TIEP_NHAN}
            onClick={() => setTab(STATUS_DB.DA_TIEP_NHAN)}
            tone="bg-emerald-50 text-emerald-600"
            icon={<CheckCircle2 size={24} />}
          />

          <StatCard
            label="Từ chối"
            value={stats.rejected}
            active={tab === STATUS_DB.TU_CHOI}
            onClick={() => setTab(STATUS_DB.TU_CHOI)}
            tone="bg-red-50 text-red-600"
            icon={<XCircle size={24} />}
          />
        </section>
        {/* Quick actions */}
        <section className="grid gap-5 lg:grid-cols-4">
          <QuickActionCard
            title="Yêu cầu gửi trẻ"
            description="Xem và xử lý các yêu cầu gửi trẻ."
            icon={<ClipboardList size={24} />}
            to={`${basePath}/yeu-cau`}
            accent="blue"
          />

          <QuickActionCard
            title="Hồ sơ tiếp nhận"
            description="Theo dõi các hồ sơ tiếp nhận trẻ."
            icon={<FolderPlus size={24} />}
            to={`${basePath}/ho-so-tiep-nhan`}
            accent="violet"
          />

          <QuickActionCard
            title="Trẻ trong trung tâm"
            description="Quản lý trẻ được nhận chính thức vào trung tâm."
            icon={<UsersRound size={24} />}
            to={`${basePath}/tre`}
            accent="green"
          />

          <QuickActionCard
            title="Sức khỏe trẻ"
            description="Theo dõi sức khỏe và tiêm chủng của trẻ."
            icon={<HeartPulse size={24} />}
            to={`${basePath}/suc-khoe`}
            accent="rose"
          />
        </section>

        {/* Request table */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[#E3ECF8] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-[20px] font-bold text-[#0D47A1]">
                  Yêu cầu gửi trẻ gần đây
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#8FA0B8]">
                  Hiển thị {filtered.length} / {requests.length} yêu cầu.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex gap-1 rounded-2xl bg-[#EEF4FB] p-1">
                  {STATUS_TABS.map((item) => {
                    const active = tab === item.value;

                    return (
                      <button
                        key={item.value || 'all'}
                        type="button"
                        onClick={() => setTab(item.value)}
                        className={`rounded-[16px] px-3 py-2 text-xs font-bold transition ${active
                          ? 'bg-[#0D47A1] text-white shadow-sm'
                          : 'text-[#6F83A3] hover:bg-white hover:text-[#0D47A1]'
                          }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full md:w-[360px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                  />

                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm mã yêu cầu, người gửi, lý do..."
                    className="w-full rounded-2xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-[#F7FAFF]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Mã yêu cầu
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Người gửi
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Loại người gửi
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Quan hệ
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Cập nhật
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Ghi chú
                  </th>
                  <th className="w-[170px] px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF3FB]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-14 text-center text-sm text-[#8FA0B8]"
                    >
                      Không có yêu cầu gửi trẻ phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`${basePath}/yeu-cau/${item.id}`)}
                      className="cursor-pointer transition hover:bg-[#F8FBFF]"
                    >
                      <td className="px-6 py-5">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                          {item.code}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-[#26364A]">
                          {item.senderName}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                        {item.senderType}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5F738F]">
                        {item.relationship}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5F738F]">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#8FA0B8]">
                        {item.updatedAt ? formatDate(item.updatedAt) : '—'}
                      </td>

                      <td className="px-6 py-5">
                        <StatusPill status={item.status} />
                      </td>

                      <td className="max-w-[300px] px-6 py-5 text-sm leading-6 text-[#5F738F]">
                        {truncateText(item.note || item.reason, 80)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${basePath}/yeu-cau/${item.id}`);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#EAF3FF] px-4 py-2 text-xs font-bold text-[#0D47A1] transition hover:bg-[#DCE8F7]"
                          >
                            <Eye size={14} />
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#E3ECF8] px-6 py-4">
            <Link
              to={`${basePath}/yeu-cau`}
              className="text-xs font-bold text-[#5F81BC] hover:text-[#0D47A1]"
            >
              Xem tất cả →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}