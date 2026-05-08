import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const cardClass =
  'rounded-[28px] border border-[#DCE8F6] bg-white shadow-[0_14px_40px_rgba(42,74,122,0.06)]';

const fallbackRequests = [
  {
    MaYeuCauNhan: 'YCNN0006',
    TenNguoiNhan: 'Nguyễn Minh Anh',
    SDTNguoiNhan: '0901234567',
    NgheNghiep: 'Nhân viên văn phòng',
    ThuNhapHangThang: 18000000,
    NgayTao: '2026-03-18',
    TrangThai: 'Chờ xử lý',
    SoGiayTo: 4,
    SoGiayToHopLe: 2,
  },
  {
    MaYeuCauNhan: 'YCNN0005',
    TenNguoiNhan: 'Trần Quốc Huy',
    SDTNguoiNhan: '0912345678',
    NgheNghiep: 'Kỹ sư xây dựng',
    ThuNhapHangThang: 25000000,
    NgayTao: '2026-03-17',
    TrangThai: 'Đang xem xét',
    SoGiayTo: 4,
    SoGiayToHopLe: 4,
  },
  {
    MaYeuCauNhan: 'YCNN0004',
    TenNguoiNhan: 'Lê Thanh Mai',
    SDTNguoiNhan: '0987654321',
    NgheNghiep: 'Giáo viên',
    ThuNhapHangThang: 22000000,
    NgayTao: '2026-03-15',
    TrangThai: 'Chờ ghép trẻ',
    SoGiayTo: 4,
    SoGiayToHopLe: 4,
  },
  {
    MaYeuCauNhan: 'YCNN0003',
    TenNguoiNhan: 'Phạm Hoàng Nam',
    SDTNguoiNhan: '0934567890',
    NgheNghiep: 'Chủ hộ kinh doanh',
    ThuNhapHangThang: 30000000,
    NgayTao: '2026-03-12',
    TrangThai: 'Đã duyệt',
    SoGiayTo: 4,
    SoGiayToHopLe: 4,
  },
  {
    MaYeuCauNhan: 'YCNN0002',
    TenNguoiNhan: 'Võ Thị Hạnh',
    SDTNguoiNhan: '0977777777',
    NgheNghiep: 'Kế toán',
    ThuNhapHangThang: 16000000,
    NgayTao: '2026-03-10',
    TrangThai: 'Từ chối',
    SoGiayTo: 3,
    SoGiayToHopLe: 1,
  },
];

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xử lý', label: 'Chờ xử lý' },
  { key: 'Chờ ghép trẻ', label: 'Chờ ghép trẻ' },
  { key: 'Đã duyệt', label: 'Đã duyệt' },
  { key: 'Từ chối', label: 'Từ chối' },
  { key: 'Đã hoàn tất', label: 'Đã hoàn tất' },
];

function normalizeRequests(data) {
  const raw = Array.isArray(data) ? data : data?.items;

  if (!raw || raw.length === 0) return fallbackRequests;

  return raw.map((item) => ({
    MaYeuCauNhan: item.MaYeuCauNhan || item.maYeuCauNhan || item.id,
    TenNguoiNhan:
      item.TenNguoiNhan || item.tenNguoiNhan || item.adopterName || 'Chưa rõ',
    SDTNguoiNhan:
      item.SDTNguoiNhan || item.sdtNguoiNhan || item.phone || 'Chưa cập nhật',
    NgheNghiep:
      item.NgheNghiep || item.ngheNghiep || item.job || 'Chưa cập nhật',
    ThuNhapHangThang:
      item.ThuNhapHangThang ?? item.thuNhapHangThang ?? item.monthlyIncome,
    NgayTao: item.NgayTao || item.ngayTao || item.createdAt,
    TrangThai: item.TrangThai || item.trangThai || item.status || 'Chờ xử lý',
    SoGiayTo: item.SoGiayTo ?? item.soGiayTo ?? item.totalDocuments ?? 0,
    SoGiayToHopLe:
      item.SoGiayToHopLe ?? item.soGiayToHopLe ?? item.validDocuments ?? 0,
  }));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function getStaffDisplayStatus(status) {
  if (status === 'Đang xem xét') return 'Chờ xử lý';
  return status;
}

export default function AdoptionRequestList() {
  const { data, loading } = useFetch(adoptionApi.getAll);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('all');

  const requests = useMemo(() => normalizeRequests(data), [data]);

  const filteredRequests = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return requests.filter((item) => {
      const displayStatus = getStaffDisplayStatus(item.TrangThai);

      const matchFilter = filter === 'all' || displayStatus === filter;

      const searchable = [
        item.MaYeuCauNhan,
        item.TenNguoiNhan,
        item.SDTNguoiNhan,
        item.NgheNghiep,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchFilter && matchKeyword;
    });
  }, [requests, keyword, filter]);

  return (
    <div className="min-h-screen bg-[#F4F8FF]">
      <div className="mx-auto max-w-[1720px] space-y-6 px-5 py-7 sm:px-8 lg:px-10">
        {/* Header đơn giản, không bọc khung */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#DCE8F6] pb-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Cán bộ quản lý nhận nuôi
            </p>

            <h1 className="mt-2 text-[34px] font-bold leading-tight !text-[#0D47A1] md:text-[42px]">
              Danh sách yêu cầu nhận nuôi
            </h1>
          </div>

          <Link
            to="/can-bo-nhan-nuoi/dashboard"
            className="w-fit rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#EEF6FF]"
          >
            Quay về tổng quan
          </Link>
        </header>

        {/* Bộ lọc */}
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
                placeholder="Tìm theo mã yêu cầu, tên, số điện thoại..."
                className="w-full rounded-2xl border border-[#D7E5F7] bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Table */}
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
              <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Mã yêu cầu</th>
                    <th className="px-6 py-4 font-bold">Người nhận nuôi</th>
                    <th className="px-6 py-4 font-bold">Nghề nghiệp</th>
                    <th className="px-6 py-4 font-bold">Ngày tạo</th>
                    <th className="px-6 py-4 font-bold">Thu nhập</th>
                    <th className="px-6 py-4 font-bold">Giấy tờ</th>
                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                    <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {filteredRequests.map((item) => {
                    const displayStatus = getStaffDisplayStatus(item.TrangThai);

                    return (
                      <tr
                        key={item.MaYeuCauNhan}
                        className="transition hover:bg-[#F7FAFF]"
                      >
                        <td className="px-6 py-5 font-bold text-[#0D47A1]">
                          {item.MaYeuCauNhan}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#26364A]">
                            {item.TenNguoiNhan}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.SDTNguoiNhan}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-[#6F83A3]">
                          {item.NgheNghiep}
                        </td>

                        <td className="px-6 py-5 text-[#6F83A3]">
                          {formatDate(item.NgayTao)}
                        </td>

                        <td className="px-6 py-5 font-semibold text-[#26364A]">
                          {formatCurrency(item.ThuNhapHangThang)}
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-bold text-[#26364A]">
                            {item.SoGiayToHopLe}/{item.SoGiayTo}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <Badge status={displayStatus} size="md" />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <Link
                            to={`/can-bo-nhan-nuoi/chi-tiet/${item.MaYeuCauNhan}`}
                            className="rounded-xl bg-[#0D47A1] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#083778]"
                          >
                            Xem chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
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