import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { useFetch } from '../../hooks/useFetch';
import { childApi } from '../../api/childApi';
import { formatDate } from '../../utils/formatDate';

const card28 =
  'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.08)]';

const STATUS_DB = {
  CHO_XU_LY: 'Chờ xử lý',
  DA_TIEP_NHAN: 'Đã tiếp nhận',
  DA_HUY: 'Đã hủy',
};

const TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xử lý', value: STATUS_DB.CHO_XU_LY },
  { label: 'Đã tiếp nhận', value: STATUS_DB.DA_TIEP_NHAN },
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
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-400',
  },
  [STATUS_DB.DA_TIEP_NHAN]: {
    text: 'Đã tiếp nhận',
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-400',
  },
  [STATUS_DB.DA_HUY]: {
    text: 'Đã hủy',
    pill: 'bg-slate-50 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
  },
};

function StatusPill({ status }) {
  const m = STATUS_META[status] || {
    text: status || '—',
    pill: 'bg-slate-50 text-slate-500 border border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase whitespace-nowrap ${m.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.text}
    </span>
  );
}

function truncateText(value, max = 60) {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function mapRequestRow(item) {
  if (!item) return null;

  return {
    id: item.id || item.maYeuCauGuiTre,
    code: item.id || item.maYeuCauGuiTre,
    senderName: item.tenNguoiGui || item.maNguoiGui || '—',
    senderType:
      TYPE_LABEL[item.maLoaiNguoiGui] || item.tenLoaiNguoiGui || item.maLoaiNguoiGui || '—',
    relationship: item.quanHeVoiTre || '—',
    createdAt: item.createdAt || item.ngayTao,
    updatedAt: item.updatedAt || item.ngayCapNhat,
    status: item.status || item.trangThaiYC,
    note: item.lyDoGui || item.ghiChu || '',
  };
}

function StatCard({ label, value, colorBox, icon, link }) {
  const inner = (
    <div className={`${card28} p-5`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorBox}`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
            {label}
          </p>
          <p className="mt-0.5 text-[32px] font-bold leading-none text-[#0D47A1]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{inner}</Link> : inner;
}

export default function ReceptionDashboard() {
  const navigate = useNavigate();
  const basePath = useBasePath();
  const [tab, setTab] = useState('');

  const { data } = useFetch(() => childApi.getRequests());

  const requestsRaw = data?.items || data || [];

  const requests = useMemo(
    () => requestsRaw.map(mapRequestRow).filter(Boolean),
    [requestsRaw]
  );

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === STATUS_DB.CHO_XU_LY).length,
      accepted: requests.filter((r) => r.status === STATUS_DB.DA_TIEP_NHAN).length,
      cancelled: requests.filter((r) => r.status === STATUS_DB.DA_HUY).length,
    };
  }, [requests]);

  const filtered = tab ? requests.filter((r) => r.status === tab) : requests;

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-[36px] font-bold text-[#0D47A1]">
            Tổng quan tiếp nhận trẻ
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#73839B]">
            Theo dõi nhanh tình trạng hồ sơ gửi trẻ và xử lý các yêu cầu cần tiếp nhận.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Tổng yêu cầu"
            value={stats.total}
            colorBox="bg-[#EAF3FF] text-[#0D47A1]"
            icon={
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            }
            link={`${basePath}/yeu-cau`}
          />

          <StatCard
            label="Chờ xử lý"
            value={stats.pending}
            colorBox="bg-amber-50 text-amber-600"
            icon={
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            }
          />

          <StatCard
            label="Đã tiếp nhận"
            value={stats.accepted}
            colorBox="bg-emerald-50 text-emerald-600"
            icon={
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            }
            link={`${basePath}/tre`}
          />

          <StatCard
            label="Đã hủy"
            value={stats.cancelled}
            colorBox="bg-slate-50 text-slate-600"
            icon={
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            }
          />
        </div>

        {/* Request table */}
        <div className={`${card28} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#E3ECF8] px-6 py-5">
            <h3 className="text-[15px] font-bold text-[#0D47A1]">
              Danh sách yêu cầu gửi trẻ
            </h3>

            <div className="flex gap-1 rounded-2xl bg-[#F5F9FE] p-1">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`rounded-[16px] px-3 py-1.5 text-xs font-semibold transition-all ${tab === t.value
                    ? 'bg-[#0D47A1] text-white shadow-sm'
                    : 'text-[#8FA0B8] hover:text-[#334155]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-[#F0F5FC]">
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Mã yêu cầu
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Người gửi
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Loại người gửi
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Quan hệ với trẻ
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Ngày tạo
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Cập nhật
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Trạng thái
                  </th>
                  <th className="px-6 pb-3 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Ghi chú
                  </th>
                  <th className="w-[240px] px-6 pb-3 pt-4 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FC]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-sm text-[#8FA0B8]"
                    >
                      Không có hồ sơ nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`${basePath}/yeu-cau/${r.id}`)}
                      className="cursor-pointer transition-colors hover:bg-[#F8FBFF]"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-[#EAF3FF] px-2 py-0.5 text-[11px] font-bold text-[#0D47A1]">
                          #{r.code}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-[#334155]">
                        {r.senderName}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#334155]">
                        {r.senderType}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#334155]">
                        {r.relationship}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#334155]">
                        {formatDate(r.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-sm text-[#8FA0B8]">
                        {r.updatedAt ? formatDate(r.updatedAt) : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <StatusPill status={r.status} />
                      </td>

                      <td className="max-w-[260px] px-6 py-4 text-sm text-[#5B6B82]">
                        {truncateText(r.note, 70)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${basePath}/yeu-cau/${r.id}`);
                            }}
                            className="rounded-2xl bg-[#EAF3FF] px-3 py-2 text-xs font-semibold text-[#0D47A1] transition-colors hover:bg-[#DCE8F7]"
                          >
                            Xem chi tiết
                          </button>

                          {r.status === STATUS_DB.CHO_XU_LY && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`${basePath}/tao-ho-so/${r.id}`);
                              }}
                              className="rounded-2xl bg-[#0D47A1] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1565C0]"
                            >
                              Tiếp nhận
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[#E3ECF8] px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8FA0B8]">
              Hiển thị {filtered.length} / {requests.length} hồ sơ
            </p>

            <Link
              to={`${basePath}/yeu-cau`}
              className="text-xs font-semibold text-[#5F81BC] hover:text-[#0D47A1]"
            >
              Xem tất cả →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}