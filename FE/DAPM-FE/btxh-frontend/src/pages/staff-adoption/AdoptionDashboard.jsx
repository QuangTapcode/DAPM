import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const cardClass =
  'rounded-[32px] border border-[#E1ECF8] bg-white shadow-[0_18px_50px_rgba(42,74,122,0.08)]';

function normalizeRequests(data) {
  const raw = Array.isArray(data) ? data : (data?.items ?? []);
  return raw.map((item) => ({
    id: item.maYeuCauNhan || item.id,
    tenNguoiNhan: item.tenNguoiNhan || 'Chưa rõ',
    ngheNghiep: item.ngheNghiep || 'Chưa cập nhật',
    thuNhapHangThang: item.thuNhapHangThang ?? null,
    ngayTao: item.ngayTao || item.createdAt,
    trangThai: item.trangThai || item.status || 'Chờ xử lý',
    soGiayTo: Array.isArray(item.giayTos) ? item.giayTos.length : 0,
  }));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

export default function AdoptionDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch(adoptionApi.getAll);

  const requests = normalizeRequests(data);

  const countByStatus = (status) =>
    requests.filter((item) => item.trangThai === status).length;

  const missingDocs = 0;

  const stats = [
    {
      label: 'Tổng yêu cầu',
      value: requests.length,
      icon: '📋',
      tone: 'bg-[#EAF3FF] text-[#0D47A1]',
    },
    {
      label: 'Chờ xử lý',
      value: countByStatus('Chờ xử lý'),
      icon: '⏳',
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Đang xem xét',
      value: countByStatus('Đang xem xét'),
      icon: '🔎',
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Chờ ghép trẻ',
      value: countByStatus('Chờ ghép trẻ'),
      icon: '🤝',
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Thiếu giấy tờ',
      value: missingDocs,
      icon: '📄',
      tone: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8FF] via-[#F8FBFF] to-[#EEF6FF]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-7 sm:px-8 lg:px-10">
        {/* Header */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="relative p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#DCEEFF]" />
            <div className="absolute bottom-0 right-32 h-20 w-20 rounded-full bg-[#EEF8FF]" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h1 className="mt-3 text-[36px] font-bold leading-tight !text-[#4B82C4] md:text-[46px]">
                  Tổng quan nhận nuôi
                </h1>

                <p className="mt-3 text-sm font-medium text-[#7D90AA]">
                  Xin chào, {user?.fullName || user?.HoTen || 'Cán bộ'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/can-bo-nhan-nuoi/danh-sach"
                  className="rounded-2xl bg-[#0D47A1] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#083778]"
                >
                  Xem yêu cầu
                </Link>

                <Link
                  to="/can-bo-nhan-nuoi/ho-so"
                  className="rounded-2xl border border-[#CFE0F5] bg-white px-6 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                >
                  Hồ sơ nhận nuôi
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* Stats */}
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className={`${cardClass} min-h-[165px] px-6 py-5 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(42,74,122,0.12)]`}
            >
              <div className="flex h-full flex-col justify-between">
                {/* Label + icon */}
                <div className="flex min-h-[56px] items-center justify-between gap-4">
                  <p className="m-0 flex-1 text-[15px] font-semibold leading-5 text-[#6F83A3]">
                    {item.label}
                  </p>

                  <div
                    className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] text-[22px] ${item.tone}`}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* Value */}
                <p
                  className="m-0 font-extrabold leading-none tracking-[-0.04em] text-[#0D47A1]"
                  style={{ fontSize: '58px' }}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Main */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.35fr)_320px] 2xl:grid-cols-[minmax(0,2.6fr)_330px]">          {/* Recent requests */}
          <div className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-[#E3ECF8] px-7 py-6">
              <div>
                <h2 className="text-xl font-bold text-[#0D47A1]">
                  Yêu cầu gần đây
                </h2>
              </div>

              <Link
                to="/can-bo-nhan-nuoi/danh-sach"
                className="text-sm font-bold text-[#4B82C4] hover:text-[#0D47A1]"
              >
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                    <tr>
                      <th className="px-5 py-4 font-bold">Mã yêu cầu</th>
                      <th className="px-5 py-4 font-bold">Người nhận nuôi</th>
                      <th className="px-5 py-4 font-bold">Nghề nghiệp</th>
                      <th className="px-5 py-4 font-bold">Ngày tạo</th>
                      <th className="px-5 py-4 font-bold">Thu nhập</th>
                      <th className="px-5 py-4 font-bold">Giấy tờ</th>
                      <th className="px-5 py-4 font-bold">Trạng thái</th>
                      <th className="px-5 py-4 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3FB]">
                    {requests.slice(0, 5).map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-[#F7FAFF]"
                      >
                        <td className="px-5 py-5 font-bold text-[#0D47A1]">
                          {item.id}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-[#26364A]">
                            {item.tenNguoiNhan}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-[#6F83A3]">
                          {item.ngheNghiep}
                        </td>

                        <td className="px-5 py-5 text-[#6F83A3]">
                          {formatDate(item.ngayTao)}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-[#26364A]">
                            {formatCurrency(item.thuNhapHangThang)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-[#26364A]">
                            {item.soGiayTo} tệp
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <Badge status={item.trangThai} size="md" />
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            to={`/can-bo-nhan-nuoi/chi-tiet/${item.id}`}
                            className="rounded-xl bg-[#0D47A1] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#083778]"
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {requests.length === 0 && (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-12 text-center text-sm text-[#8FA0B8]"
                        >
                          Không có yêu cầu nhận nuôi nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side cards */}
          <div className="space-y-7">
            <div className={`${cardClass} p-7`}>
              <h2 className="text-xl font-bold text-[#0D47A1]">
                Quy trình
              </h2>

              <div className="mt-6 space-y-4">
                {[
                  'Kiểm tra yêu cầu',
                  'Xác minh giấy tờ',
                  'Ghép trẻ',
                  'Gặp mặt',
                  'Lập hồ sơ',
                  'Hoàn tất',
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#0D47A1]">
                      {index + 1}
                    </div>
                    <p className="text-sm font-bold text-[#334155]">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-[#0D47A1] to-[#4DA3FF] p-7 text-white shadow-[0_18px_50px_rgba(42,74,122,0.16)]">
              <h2 className="text-xl font-bold">Ghi chú</h2>

              <p className="mt-3 text-sm leading-6 text-blue-50">
                Chỉ lập hồ sơ khi giấy tờ hợp lệ và kết quả gặp mặt phù hợp.
              </p>

              <div className="mt-5 flex flex-col items-stretch gap-3">
                <Link
                  to="/can-bo-nhan-nuoi/danh-sach"
                  className="w-full rounded-2xl bg-white px-4 py-2.5 text-center text-sm font-bold text-[#0D47A1] transition hover:bg-blue-50"
                >
                  Kiểm tra yêu cầu
                </Link>

                <Link
                  to="/can-bo-nhan-nuoi/ho-so"
                  className="w-full rounded-2xl border border-white/40 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Theo dõi hồ sơ
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}