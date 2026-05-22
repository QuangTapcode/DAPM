import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const cardClass =
  'rounded-[28px] border border-[#DCE8F6] bg-white shadow-[0_14px_40px_rgba(42,74,122,0.06)]';

const STATUS = {
  VERIFYING: 'Đang xác minh',
  MATCHING_CHILD: 'Chờ ghép trẻ',
  APPROVED: 'Đã duyệt',
  PRE_REJECTED: 'Từ chối sơ bộ',
};

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: STATUS.VERIFYING, label: 'Đang xác minh' },
  { key: STATUS.MATCHING_CHILD, label: 'Chờ ghép trẻ' },
  { key: STATUS.APPROVED, label: 'Đã duyệt' },
  { key: STATUS.PRE_REJECTED, label: 'Từ chối sơ bộ' },
];

const statusPriority = {
  [STATUS.VERIFYING]: 1,
  [STATUS.MATCHING_CHILD]: 2,
  [STATUS.APPROVED]: 3,
  [STATUS.PRE_REJECTED]: 4,
};

function getResponseItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;

  return [];
}

function normalizeRequests(data) {
  const raw = getResponseItems(data);

  return raw.map((item) => ({
    maYeuCauNhan: item.maYeuCauNhan || item.MaYeuCauNhan || item.id || '',
    maNguoiNhan: item.maNguoiNhan || item.MaNguoiNhan || item.adopterId || '',
    tenNguoiNhan:
      item.tenNguoiNhan || item.TenNguoiNhan || item.adopterName || 'Chưa rõ',
    sdtNguoiNhan:
      item.sdtNguoiNhan || item.SDTNguoiNhan || item.phone || 'Chưa cập nhật',

    thuNhapHangThang:
      item.thuNhapHangThang ?? item.ThuNhapHangThang ?? item.monthlyIncome ?? 0,
    soConDangNuoi: item.soConDangNuoi ?? item.SoConDangNuoi ?? 0,
    tinhTrangHonNhan:
      item.tinhTrangHonNhan || item.TinhTrangHonNhan || 'Chưa cập nhật',
    loaiNoiO: item.loaiNoiO || item.LoaiNoiO || 'Chưa cập nhật',
    quanHeVoiTre: item.quanHeVoiTre || item.QuanHeVoiTre || 'Không',

    ngayTao: item.ngayTao || item.NgayTao || item.createdAt,
    trangThai:
      item.trangThai || item.TrangThai || item.status || STATUS.VERIFYING,

    soGiayTo: item.soGiayTo ?? item.SoGiayTo ?? item.totalDocuments ?? 0,
    soGiayToHopLe:
      item.soGiayToHopLe ?? item.SoGiayToHopLe ?? item.validDocuments ?? 0,

    diemUuTien: item.diemUuTien ?? item.DiemUuTien ?? 0,
    hopLeSoBo: item.hopLeSoBo ?? item.HopLeSoBo ?? false,
    lyDoTuChoiSoBo:
      item.lyDoTuChoiSoBo || item.LyDoTuChoiSoBo || '',
  }));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function formatDocumentCount(item) {
  const submitted = Number(item.soGiayToHopLe || 0);
  const required = Number(item.soGiayTo || 0);

  if (required <= 0) return 'Chưa có';

  return `${submitted}/${required}`;
}

function getTime(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortByPriority(a, b) {
  const statusA = statusPriority[a.trangThai] ?? 99;
  const statusB = statusPriority[b.trangThai] ?? 99;

  if (statusA !== statusB) {
    return statusA - statusB;
  }

  const scoreA = Number(a.diemUuTien || 0);
  const scoreB = Number(b.diemUuTien || 0);

  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }

  return getTime(a.ngayTao) - getTime(b.ngayTao);
}

function getPriorityLabel(score) {
  const value = Number(score || 0);

  if (value >= 7) return 'Ưu tiên cao';
  if (value >= 4) return 'Ưu tiên vừa';
  return 'Ưu tiên thấp';
}

function getPriorityClass(score) {
  const value = Number(score || 0);

  if (value >= 7) {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  if (value >= 4) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export default function AdoptionRequestList() {
  const { data, loading } = useFetch(() =>
    adoptionApi.getAll({
      page: 1,
      limit: 500,
    })
  );

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('all');

  const requests = useMemo(() => {
    return normalizeRequests(data).sort(sortByPriority);
  }, [data]);

  const filteredRequests = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return requests
      .filter((item) => {
        const matchFilter = filter === 'all' || item.trangThai === filter;

        const searchable = [
          item.maYeuCauNhan,
          item.maNguoiNhan,
          item.tenNguoiNhan,
          item.sdtNguoiNhan,
          item.tinhTrangHonNhan,
          item.loaiNoiO,
          item.quanHeVoiTre,
          item.trangThai,
          item.diemUuTien,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchKeyword = !kw || searchable.includes(kw);

        return matchFilter && matchKeyword;
      })
      .sort(sortByPriority);
  }, [requests, keyword, filter]);

  return (
    <div className="min-h-screen bg-[#F4F8FF]">
      <div className="mx-auto max-w-[1720px] space-y-6 px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DCE8F6] pb-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Cán bộ quản lý nhận nuôi
            </p>

            <h1 className="mt-2 text-[34px] font-bold leading-tight !text-[#0D47A1] md:text-[42px]">
              Danh sách yêu cầu nhận nuôi
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6F83A3]">
              Hồ sơ được ưu tiên theo trạng thái cần xử lý, điểm ưu tiên cao hơn
              và ngày tạo sớm hơn.
            </p>
          </div>

          <Link
            to="/can-bo-nhan-nuoi/dashboard"
            className="w-fit rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#EEF6FF]"
          >
            Quay về tổng quan
          </Link>
        </header>

        <section className={`${cardClass} p-5`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => {
                const active = filter === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${active
                      ? 'bg-[#0D47A1] text-white shadow-sm'
                      : 'border border-[#D7E5F7] bg-white text-[#5E7597] hover:bg-[#F4F8FF]'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="w-full xl:w-[460px]">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mã, tên, số điện thoại, trạng thái, điểm..."
                className="w-full rounded-2xl border border-[#D7E5F7] bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white"
              />
            </div>
          </div>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#E3ECF8] px-7 py-5">
            <div>
              <h2 className="text-lg font-bold text-[#0D47A1]">
                Yêu cầu nhận nuôi
              </h2>
              <p className="mt-1 text-sm text-[#8FA0B8]">
                Hiển thị {filteredRequests.length} / {requests.length} yêu cầu.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Mã yêu cầu</th>
                    <th className="px-6 py-4 font-bold">Người nhận nuôi</th>
                    <th className="px-6 py-4 font-bold">Ngày tạo</th>
                    <th className="px-6 py-4 font-bold">Thu nhập</th>
                    <th className="px-6 py-4 font-bold">Điểm ưu tiên</th>
                    <th className="px-6 py-4 font-bold">Điều kiện</th>
                    <th className="px-6 py-4 font-bold">Giấy tờ</th>
                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                    <th className="px-6 py-4 text-right font-bold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {filteredRequests.map((item) => (
                    <tr
                      key={item.maYeuCauNhan}
                      className="transition hover:bg-[#F7FAFF]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#0D47A1]">
                          {item.maYeuCauNhan}
                        </p>
                        <p className="mt-1 text-xs text-[#8FA0B8]">
                          {item.maNguoiNhan}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-[#26364A]">
                          {item.tenNguoiNhan}
                        </p>
                        <p className="mt-1 text-xs text-[#8FA0B8]">
                          {item.sdtNguoiNhan}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-[#6F83A3]">
                        {formatDate(item.ngayTao)}
                      </td>

                      <td className="px-6 py-5 font-semibold text-[#26364A]">
                        {formatCurrency(item.thuNhapHangThang)}
                      </td>

                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex min-w-[92px] items-center justify-center rounded-2xl border px-3 py-2 ${getPriorityClass(
                            item.diemUuTien
                          )}`}
                        >
                          <span className="text-lg font-extrabold">
                            {item.diemUuTien}
                          </span>
                        </div>

                        <p className="mt-2 text-xs font-semibold text-[#8FA0B8]">
                          {getPriorityLabel(item.diemUuTien)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#26364A]">
                          {item.tinhTrangHonNhan}
                        </p>
                        <p className="mt-1 text-xs text-[#8FA0B8]">
                          {item.quanHeVoiTre} • {item.loaiNoiO}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-bold text-[#26364A]">
                          Đủ yêu cầu: {formatDocumentCount(item)}
                        </p>
                        <p className="mt-1 text-xs text-[#8FA0B8]">
                          Chờ cán bộ xác minh từng giấy tờ
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <Badge status={item.trangThai} size="md" />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/can-bo-nhan-nuoi/chi-tiet/${item.maYeuCauNhan || item.MaYeuCauNhan}`}
                          className="rounded-xl bg-[#0D47A1] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#083778]"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-14 text-center text-sm text-[#8FA0B8]"
                      >
                        Không tìm thấy yêu cầu nhận nuôi phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}