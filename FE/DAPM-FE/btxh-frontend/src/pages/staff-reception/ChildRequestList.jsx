import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
} from 'lucide-react';

import receptionApi from '../../api/receptionApi';
import { formatDate } from '../../utils/formatDate';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';
const actionButtonBase =
  'inline-flex h-10 w-[118px] items-center justify-center gap-2 rounded-2xl px-4 text-xs font-bold transition';
const STATUS_DB = {
  CHO_XU_LY: 'Chờ xử lý',
  DANG_XEM_XET: 'Đang xem xét',
  DA_TIEP_NHAN: 'Đã tiếp nhận',
  TU_CHOI: 'Từ chối',
  DA_HUY: 'Đã hủy',
};

const TABS = [
  { label: 'Tất cả', value: '', },
  { label: 'Chờ xử lý', value: STATUS_DB.CHO_XU_LY, },
  {
    label: 'Đang xem xét',
    value: STATUS_DB.DANG_XEM_XET,

  },
  {
    label: 'Đã tiếp nhận',
    value: STATUS_DB.DA_TIEP_NHAN,
  },
  { label: 'Từ chối', value: STATUS_DB.TU_CHOI, },
  { label: 'Đã hủy', value: STATUS_DB.DA_HUY, },
];

const TYPE_LABEL = {
  CME: 'Cha/Mẹ ruột',
  NTH: 'Người thân',
  CQDP: 'Cơ quan địa phương',
};

const STATUS_META = {
  [STATUS_DB.CHO_XU_LY]: {
    label: 'Chờ xử lý',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  [STATUS_DB.DANG_XEM_XET]: {
    label: 'Đang xem xét',
    cls: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  [STATUS_DB.DA_TIEP_NHAN]: {
    label: 'Đã tiếp nhận',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  [STATUS_DB.TU_CHOI]: {
    label: 'Từ chối',
    cls: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
  [STATUS_DB.DA_HUY]: {
    label: 'Đã hủy',
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const DEMO_REQUESTS = [
  {
    MaYeuCauGuiTre: 'YCGT0001',
    TenNguoiGui: 'Trần Thị Gửi',
    MaLoaiNguoiGui: 'NTH',
    QuanHeVoiTre: 'Bà ngoại',
    TenTre: 'Nguyễn An',
    LyDoGui: 'Gia đình khó khăn, không đủ điều kiện chăm sóc trẻ.',
    NgayTao: '2026-03-01T00:00:00Z',
    NgayCapNhat: '2026-03-02T00:00:00Z',
    TrangThaiYC: 'Đã tiếp nhận',
    GhiChu: 'Hồ sơ hợp lệ, trẻ đã được tiếp nhận vào trung tâm.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0002',
    TenNguoiGui: 'Nguyễn Văn Minh',
    MaLoaiNguoiGui: 'CME',
    QuanHeVoiTre: 'Cha ruột',
    TenTre: 'Nguyễn Minh Khang',
    LyDoGui: 'Cha/mẹ bệnh nặng, chưa thể chăm sóc trẻ.',
    NgayTao: '2026-04-10T00:00:00Z',
    NgayCapNhat: null,
    TrangThaiYC: 'Chờ xử lý',
    GhiChu: 'Chờ cán bộ tiếp nhận kiểm tra thông tin và giấy tờ.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0003',
    TenNguoiGui: 'UBND Phường Hòa Khánh Bắc',
    MaLoaiNguoiGui: 'CQDP',
    QuanHeVoiTre: 'Cơ quan địa phương',
    TenTre: 'Lê Minh',
    LyDoGui: 'Trẻ có hoàn cảnh đặc biệt cần được bảo trợ.',
    NgayTao: '2026-04-14T00:00:00Z',
    NgayCapNhat: '2026-04-15T00:00:00Z',
    TrangThaiYC: 'Đang xem xét',
    GhiChu: 'Đang xác minh giấy tờ pháp lý và thông tin trẻ.',
  },
  {
    MaYeuCauGuiTre: 'YCGT0004',
    TenNguoiGui: 'Lê Thị Hạnh',
    MaLoaiNguoiGui: 'CME',
    QuanHeVoiTre: 'Mẹ ruột',
    TenTre: 'Lê Bảo',
    LyDoGui: 'Thông tin chưa đủ điều kiện tiếp nhận.',
    NgayTao: '2026-04-16T00:00:00Z',
    NgayCapNhat: '2026-04-17T00:00:00Z',
    TrangThaiYC: 'Từ chối',
    GhiChu: 'Từ chối do giấy tờ chưa hợp lệ.',
  },
];

function normalizeStatus(value) {
  const status = String(value || '').trim();

  if (status === 'pending') return STATUS_DB.CHO_XU_LY;
  if (status === 'reviewing') return STATUS_DB.DANG_XEM_XET;
  if (status === 'approved') return STATUS_DB.DA_TIEP_NHAN;
  if (status === 'rejected') return STATUS_DB.TU_CHOI;
  if (status === 'cancelled') return STATUS_DB.DA_HUY;

  return status || STATUS_DB.CHO_XU_LY;
}

function truncateText(value, max = 80) {
  if (!value) return '—';
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function getChildName(item) {
  return (
    item.childName ||
    item.TenTre ||
    item.HoTenTre ||
    item.thongTinTreTam?.HoTen ||
    item.thongTinTreTam?.hoTen ||
    item.treTam?.HoTen ||
    item.treTam?.hoTen ||
    'Chưa cập nhật'
  );
}

function mapRequest(item) {
  if (!item) return null;

  const id = item.id || item.MaYeuCauGuiTre;

  return {
    id,
    code: item.code || item.MaYeuCauGuiTre || id,
    senderName:
      item.senderName ||
      item.TenNguoiGui ||
      item.nguoiGui?.HoTen ||
      item.nguoiGui?.hoTen ||
      item.MaNguoiGui ||
      '—',
    senderType:
      TYPE_LABEL[item.senderTypeCode || item.MaLoaiNguoiGui] ||
      item.senderType ||
      item.MaLoaiNguoiGui ||
      '—',
    relationship: item.relationship || item.QuanHeVoiTre || '—',
    childName: getChildName(item),
    reason: item.reason || item.LyDoGui || item.lyDo?.TenLyDo || '',
    createdAt: item.createdAt || item.NgayTao,
    updatedAt: item.updatedAt || item.NgayCapNhat,
    status: normalizeStatus(item.status || item.TrangThaiYC),
    note: item.note || item.GhiChu || '',
  };
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || {
    label: status || '—',
    cls: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold whitespace-nowrap ${meta.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
function RequestAction({ status, onClick }) {
  const processing =
    status === STATUS_DB.CHO_XU_LY || status === STATUS_DB.DANG_XEM_XET;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${actionButtonBase} ${processing
        ? 'bg-[#0D47A1] text-white hover:bg-[#083778]'
        : 'border border-[#CFE0F5] bg-white text-[#0D47A1] hover:bg-[#F4F8FF]'
        }`}
    >
      <Eye size={14} />
      {processing ? 'Xử lý' : 'Xem'}
    </button>
  );
}
function EmptyState({ text }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-sm font-semibold text-[#8FA0B8]">{text}</p>
    </div>
  );
}

export default function ChildRequestList() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('');
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchRequests() {
      try {
        setLoading(true);
        setError('');

        const response = await receptionApi.getAll({
          page: 1,
          limit: 999,
          status: tab || undefined,
        });

        if (ignore) return;

        const list = response?.items?.length ? response.items : DEMO_REQUESTS;
        setItems(list);
      } catch (err) {
        if (ignore) return;

        console.error('Không thể tải danh sách yêu cầu gửi trẻ:', err);
        setError('');
        setItems(DEMO_REQUESTS);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      ignore = true;
    };
  }, [tab]);

  const requests = useMemo(() => {
    return (items || []).map(mapRequest).filter(Boolean);
  }, [items]);

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return requests.filter((item) => {
      const matchStatus = !tab || item.status === tab;

      const searchable = [
        item.code,
        item.senderName,
        item.senderType,
        item.relationship,
        item.childName,
        item.reason,
        item.status,
        item.note,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchStatus && matchKeyword;
    });
  }, [requests, keyword, tab]);

  const openDetail = (id) => {
    navigate(`/can-bo-tiep-nhan/yeu-cau/${id}`);
  };

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Cán bộ tiếp nhận trẻ
            </p>

            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Danh sách yêu cầu gửi trẻ
            </h1>
          </div>
        </header>

        <section className={cardClass}>
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5 lg:px-7">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div className="rounded-[24px] border border-[#DCE8F6] bg-[#EEF4FB] p-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {TABS.map((item) => {
                    const active = tab === item.value;

                    return (
                      <button
                        key={item.value || 'all'}
                        type="button"
                        onClick={() => setTab(item.value)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${active
                          ? 'bg-white text-[#0D47A1] shadow-[0_8px_24px_rgba(31,42,61,0.08)]'
                          : 'text-[#6F83A3] hover:bg-white/70 hover:text-[#0D47A1]'
                          }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative w-full xl:w-[460px]">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                />

                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã yêu cầu, người gửi, tên trẻ, lý do..."
                  className="w-full rounded-2xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0D47A1]">
                Yêu cầu gửi trẻ
              </h2>
              <p className="mt-1 text-sm text-[#8FA0B8]">
                Hiển thị {filteredItems.length} / {requests.length} yêu cầu.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
            </div>
          ) : error ? (
            <EmptyState text={error} />
          ) : filteredItems.length === 0 ? (
            <EmptyState text="Không có yêu cầu gửi trẻ phù hợp." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Mã yêu cầu</th>
                    <th className="px-6 py-4 font-bold">Người gửi</th>
                    <th className="px-6 py-4 font-bold">Loại người gửi</th>
                    <th className="px-6 py-4 font-bold">Quan hệ với trẻ</th>
                    <th className="px-6 py-4 font-bold">Trẻ tạm</th>
                    <th className="px-6 py-4 font-bold">Ngày tạo</th>
                    <th className="px-6 py-4 font-bold">Cập nhật</th>
                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                    <th className="px-6 py-4 font-bold">Ghi chú</th>
                    <th className="w-[150px] px-6 py-4 text-right font-bold">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {filteredItems.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => openDetail(request.id)}
                      className="cursor-pointer transition hover:bg-[#F8FBFF]"
                    >
                      <td className="px-6 py-5">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                          {request.code}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-[#26364A]">
                          {request.senderName}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                        {request.senderType}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5F738F]">
                        {request.relationship}
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#26364A]">
                          {request.childName}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5F738F]">
                        {formatDate(request.createdAt)}
                      </td>

                      <td className="px-6 py-5 text-sm text-[#8FA0B8]">
                        {request.updatedAt ? formatDate(request.updatedAt) : '—'}
                      </td>

                      <td className="px-6 py-5">
                        <StatusPill status={request.status} />
                      </td>

                      <td className="max-w-[280px] px-6 py-5 text-sm leading-6 text-[#5F738F]">
                        {truncateText(request.note || request.reason, 80)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <RequestAction
                            status={request.status}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(request.id);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#E4EAF2] px-7 py-4">
            <p className="text-xs font-semibold text-[#7D90AA]">
              Chọn thao tác để xử lý chi tiết
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}