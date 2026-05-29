import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Eye, Search, SlidersHorizontal } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import meetingApi from '../../api/meetingApi';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { value: 'Đã xác nhận', label: 'Đã xác nhận' },
  { value: 'Yêu cầu đổi lịch', label: 'Yêu cầu đổi lịch' },
  { value: 'Đã gặp mặt', label: 'Đã gặp mặt' },
  { value: 'Đã hủy', label: 'Đã hủy' },
];

function StatusBadge({ status }) {
  const cls = {
    'Chờ xác nhận': 'bg-sky-50 text-sky-700 border-sky-200',
    'Đã xác nhận': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Yêu cầu đổi lịch': 'bg-amber-50 text-amber-700 border-amber-200',
    'Đã gặp mặt': 'bg-green-50 text-green-700 border-green-200',
    'Đã hủy': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[13px] font-bold ${cls[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status || 'Chưa xác định'}
    </span>
  );
}

export default function MeetingList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, loading } = useFetch(() => meetingApi.getAll({ limit: 200 }), []);

  const meetings = useMemo(() => {
    const items = Array.isArray(data) ? data : (data?.items || []);
    return items;
  }, [data]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return meetings.filter((m) => {
      const matchStatus = !statusFilter || m.trangThai === statusFilter;
      const searchable = [
        m.maLichGap,
        m.maYeuCauNhan,
        m.tenCanBo,
        m.diaDiem,
        m.trangThai,
      ].join(' ').toLowerCase();
      const matchKeyword = !kw || searchable.includes(kw);
      return matchStatus && matchKeyword;
    });
  }, [meetings, keyword, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#0D47A1]">
                <Calendar size={22} />
              </div>
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[40px]">
                Lịch hẹn gặp mặt
              </h1>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6F83A3]">
              Danh sách tất cả các lịch hẹn giữa cán bộ và người nhận nuôi.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-7 py-6 lg:px-7">
            <div className="grid gap-4 xl:grid-cols-[1fr_480px]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã lịch hẹn, mã yêu cầu, cán bộ, địa điểm..."
                  className="h-12 w-full rounded-xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 rounded-xl border border-[#D7E5F7] bg-white px-4 text-sm font-bold text-[#26364A] outline-none focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => { setKeyword(''); setStatusFilter(''); }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#CFE0F5] bg-white px-4 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                >
                  <SlidersHorizontal size={16} />
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-4">
            <p className="text-sm text-[#8FA0B8]">
              Hiển thị <span className="font-bold text-[#26364A]">{filtered.length}</span> / {meetings.length} lịch hẹn
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-[15px] font-semibold text-[#8FA0B8]">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#0D47A1]">
                <Calendar size={26} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-[15px] font-bold text-[#1A2B4B]">Không có lịch hẹn phù hợp</p>
              <p className="mt-1.5 text-sm text-[#8FA0B8]">Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[12px] uppercase tracking-[0.12em] text-[#8093AB]">
                  <tr>
                    <th className="px-7 py-5 font-bold">Mã lịch hẹn</th>
                    <th className="px-7 py-5 font-bold">Mã yêu cầu</th>
                    <th className="px-7 py-5 font-bold">Cán bộ</th>
                    <th className="px-7 py-5 font-bold">Thời gian</th>
                    <th className="px-7 py-5 font-bold">Địa điểm</th>
                    <th className="px-7 py-5 font-bold">Trạng thái</th>
                    <th className="w-[100px] px-7 py-5 text-right font-bold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF3FB]">
                  {filtered.map((m) => (
                    <tr key={m.maLichGap} className="transition hover:bg-[#F8FBFF] [&>td]:align-middle">
                      <td className="px-7 py-6">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1.5 text-[13px] font-extrabold tracking-wide text-[#0D47A1]">
                          {m.maLichGap || '—'}
                        </span>
                      </td>
                      <td className="px-7 py-6 text-sm font-semibold text-[#5F738F]">
                        {m.maYeuCauNhan || '—'}
                      </td>
                      <td className="px-7 py-6 text-sm font-semibold text-[#26364A]">
                        {m.tenCanBo || '—'}
                      </td>
                      <td className="px-7 py-6 text-sm font-semibold text-[#5F738F]">
                        {m.thoiGian
                          ? new Date(m.thoiGian).toLocaleString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-7 py-6 text-sm text-[#26364A]">
                        {m.diaDiem || '—'}
                      </td>
                      <td className="px-7 py-6">
                        <StatusBadge status={m.trangThai} />
                        {m.trangThai === 'Yêu cầu đổi lịch' && m.thoiGianDeXuatMoi && (
                          <p className="mt-1 text-xs text-amber-600">
                            Đề xuất: {new Date(m.thoiGianDeXuatMoi).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </td>
                      <td className="px-7 py-6 text-right">
                        {m.maYeuCauNhan && (
                          <button
                            type="button"
                            onClick={() => navigate(`/can-bo-nhan-nuoi/chi-tiet/${m.maYeuCauNhan}`)}
                            className="inline-flex h-11 items-center gap-1.5 rounded-2xl border border-[#CFE0F5] bg-white px-4 text-[13px] font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] active:scale-[0.97]"
                          >
                            <Eye size={15} />
                            Xem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
