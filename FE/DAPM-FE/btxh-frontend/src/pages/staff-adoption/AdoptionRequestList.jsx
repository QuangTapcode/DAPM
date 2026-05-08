import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const cardClass =
  'rounded-[28px] border border-[#DCE8F6] bg-white shadow-[0_14px_40px_rgba(42,74,122,0.06)]';

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xử lý', label: 'Chờ xử lý' },
  { key: 'Đang xem xét', label: 'Đang xem xét' },
  { key: 'Chờ ghép trẻ', label: 'Chờ ghép trẻ' },
  { key: 'Đã duyệt', label: 'Đã duyệt' },
  { key: 'Từ chối', label: 'Từ chối' },
];

function normalizeItem(item) {
  return {
    id: item.maYeuCauNhan || item.id,
    tenNguoiNhan: item.tenNguoiNhan || 'Chưa rõ',
    ngheNghiep: item.ngheNghiep || 'Chưa cập nhật',
    thuNhapHangThang: item.thuNhapHangThang ?? null,
    ngayTao: item.ngayTao || item.createdAt,
    trangThai: item.trangThai || item.status || 'Chờ xử lý',
    soGiayTo: Array.isArray(item.giayTos) ? item.giayTos.length : 0,
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined) return 'Chưa cập nhật';
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

export default function AdoptionRequestList() {
  const { data, loading, error } = useFetch(adoptionApi.getAll);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('all');

  const requests = useMemo(() => {
    const raw = Array.isArray(data) ? data : (data?.items ?? []);
    return raw.map(normalizeItem);
  }, [data]);

  const filteredRequests = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return requests.filter((item) => {
      const matchFilter = filter === 'all' || item.trangThai === filter;
      const matchKeyword = !kw || [item.id, item.tenNguoiNhan, item.ngheNghiep].join(' ').toLowerCase().includes(kw);
      return matchFilter && matchKeyword;
    });
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
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    filter === tab.key
                      ? 'bg-[#0D47A1] text-white shadow-sm'
                      : 'border border-[#D7E5F7] bg-white text-[#5E7597] hover:bg-[#F4F8FF]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="w-full xl:w-[460px]">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mã yêu cầu, tên, nghề nghiệp..."
                className="w-full rounded-2xl border border-[#D7E5F7] bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#E3ECF8] px-7 py-5">
            <div>
              <h2 className="text-lg font-bold text-[#0D47A1]">Yêu cầu nhận nuôi</h2>
              <p className="mt-1 text-sm text-[#8FA0B8]">
                Hiển thị {filteredRequests.length} / {requests.length} yêu cầu.
              </p>
            </div>
          </div>

          {error && (
            <div className="px-7 py-6 text-sm text-red-600 bg-red-50 border-b border-red-100">
              Lỗi tải dữ liệu: {error.message || 'Không thể kết nối Backend.'}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
                  {filteredRequests.map((item) => (
                    <tr key={item.id} className="transition hover:bg-[#F7FAFF]">
                      <td className="px-6 py-5 font-bold text-[#0D47A1]">{item.id}</td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#26364A]">{item.tenNguoiNhan}</p>
                      </td>
                      <td className="px-6 py-5 text-[#6F83A3]">{item.ngheNghiep}</td>
                      <td className="px-6 py-5 text-[#6F83A3]">{formatDate(item.ngayTao)}</td>
                      <td className="px-6 py-5 font-semibold text-[#26364A]">
                        {formatCurrency(item.thuNhapHangThang)}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-[#26364A]">{item.soGiayTo} tệp</span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge status={item.trangThai} size="md" />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/can-bo-nhan-nuoi/chi-tiet/${item.id}`}
                          className="rounded-xl bg-[#0D47A1] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#083778]"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan="8" className="px-6 py-14 text-center text-sm text-[#8FA0B8]">
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
