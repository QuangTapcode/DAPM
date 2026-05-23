import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import adoptionApi from '../../api/adoptionApi';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass = 'rounded-3xl border border-slate-200 bg-white shadow-sm';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';

const primaryButton =
  'rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50';

const secondaryButton =
  'rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50';

const meetingStatusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { key: 'Đã xác nhận', label: 'Đã xác nhận' },
  { key: 'Đã gặp mặt', label: 'Đã gặp mặt' },
  { key: 'Cần gặp lại', label: 'Cần gặp lại' },
];

const profileStatusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Đang lập', label: 'Đang lập' },
  { key: 'Chờ duyệt', label: 'Chờ duyệt' },
  { key: 'Đã duyệt', label: 'Đã duyệt' },
  { key: 'Đã hoàn tất', label: 'Đã hoàn tất' },
  { key: 'Từ chối', label: 'Từ chối' },
];

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center text-sm text-slate-500">
        {text}
      </td>
    </tr>
  );
}

function getMeetingDisplayStatus(item) {
  const result = item.Children?.find(c => c.KetQua)?.KetQua;
  if (result === 'Cần gặp lại') return 'Cần gặp lại';
  return item.TrangThai;
}

function getMeetingNote(item) {
  if (item.TrangThai === 'Chờ xác nhận') return 'Chờ xác nhận lịch gặp';
  const result = item.Children?.find(c => c.KetQua)?.KetQua;
  if (item.TrangThai === 'Đã xác nhận' && !result) {
    return 'Chờ ghi nhận kết quả';
  }
  if (result === 'Cần gặp lại') return 'Cần sắp xếp gặp lại';
  if (result === 'Phù hợp') return 'Đã đánh giá phù hợp';
  if (result === 'Không phù hợp') return 'Không tiếp tục hồ sơ';
  return 'Theo dõi lịch gặp';
}

function getProfileNote(status) {
  if (status === 'Đang lập') return 'Đang hoàn thiện hồ sơ';
  if (status === 'Chờ duyệt') return 'Chờ trưởng phòng duyệt';
  if (status === 'Đã duyệt') return 'Đã được duyệt';
  if (status === 'Đã hoàn tất') return 'Hồ sơ đã lưu trữ';
  if (status === 'Từ chối') return 'Hồ sơ bị từ chối';
  return 'Theo dõi hồ sơ';
}

function normalizeMeeting(m) {
  const children = m.Children || m.children || [];
  return {
    MaLichGap: m.MaLichGap || m.maLichGap || '',
    MaYeuCauNhan: m.MaYeuCauNhan || m.maYeuCauNhan || '',
    TenNguoiNhan: m.TenNguoiNhan || m.tenNguoiNhan || '',
    SDTNguoiNhan: m.SDTNguoiNhan || m.sdtNguoiNhan || m.SdtNguoiNhan || '',
    ThoiGian: m.ThoiGian || m.thoiGian || '',
    DiaDiem: m.DiaDiem || m.diaDiem || '',
    TrangThai: m.TrangThai || m.trangThai || '',
    Children: children.map(c => ({
      KetQua: c.KetQua || c.ketQua || ''
    }))
  };
}

function normalizeProfile(p) {
  return {
    MaHSNhanNuoi: p.MaHSNhanNuoi || p.maHSNhanNuoi || p.maHsNhanNuoi || '',
    MaYeuCauNhan: p.MaYeuCauNhan || p.maYeuCauNhan || '',
    MaTre: p.MaTre || p.maTre || '',
    TenTre: p.TenTre || p.tenTre || '',
    MaCanBo: p.MaCanBo || p.maCanBo || '',
    TenCanBo: p.TenCanBo || p.tenCanBo || '',
    NgayLap: p.NgayLap || p.ngayLap || '',
    TrangThai: p.TrangThai || p.trangThai || ''
  };
}

function MainTabButton({ active, title, note, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl px-5 py-3 text-left transition ${active
        ? 'bg-white text-blue-800 shadow-sm border border-slate-200'
        : 'text-slate-500 hover:bg-white/60 border border-transparent'
        }`}
    >
      <p className="text-sm font-extrabold">{title}</p>
      <p className="mt-1 text-xs font-medium opacity-80">{note}</p>
    </button>
  );
}

function StatusCombobox({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const selected = options.find((item) => item.key === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-bold transition ${open
          ? 'border-blue-600 ring-2 ring-blue-600/20'
          : 'border-slate-200 hover:border-slate-300'
          }`}
      >
        <span className="flex items-center gap-2 text-slate-800">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          {selected.label}
        </span>
        <svg className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          {options.map((item) => {
            const active = item.key === value;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onChange(item.key);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  {item.label}
                </span>
                {active && <span className="text-xs font-extrabold text-blue-600">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdoptionProfileList() {
  const [activeTab, setActiveTab] = useState('meetings');
  const [keyword, setKeyword] = useState('');
  const [meetingStatus, setMeetingStatus] = useState('all');
  const [profileStatus, setProfileStatus] = useState('all');
  
  const [meetings, setMeetings] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [meetingsRes, profilesRes] = await Promise.all([
          adoptionApi.getMeetings({ limit: 100 }),
          adoptionApi.getAdoptionProfiles({ limit: 100 })
        ]);

        if (!active) return;

        const ms = meetingsRes.data?.items || meetingsRes.data?.data?.items || meetingsRes.data || [];
        const ps = profilesRes.data?.items || profilesRes.data?.data?.items || profilesRes.data || [];

        setMeetings(Array.isArray(ms) ? ms.map(normalizeMeeting) : []);
        setProfiles(Array.isArray(ps) ? ps.map(normalizeProfile) : []);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu danh sách:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();
    return () => { active = false; };
  }, []);

  const filteredMeetings = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return meetings.filter((item) => {
      const displayStatus = getMeetingDisplayStatus(item);
      const result = item.Children?.find(c => c.KetQua)?.KetQua;
      
      const matchStatus =
        meetingStatus === 'all' ||
        item.TrangThai === meetingStatus ||
        result === meetingStatus ||
        displayStatus === meetingStatus;

      const searchable = [
        item.MaLichGap,
        item.MaYeuCauNhan,
        item.TenNguoiNhan,
        item.SDTNguoiNhan,
      ].join(' ').toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);
      return matchStatus && matchKeyword;
    });
  }, [meetings, keyword, meetingStatus]);

  const filteredProfiles = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return profiles.filter((item) => {
      const matchStatus = profileStatus === 'all' || item.TrangThai === profileStatus;
      const searchable = [
        item.MaHSNhanNuoi,
        item.MaYeuCauNhan,
        item.MaTre,
        item.TenTre,
        item.MaCanBo,
        item.TenCanBo,
      ].join(' ').toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);
      return matchStatus && matchKeyword;
    });
  }, [profiles, keyword, profileStatus]);

  const currentStatusTabs = activeTab === 'meetings' ? meetingStatusTabs : profileStatusTabs;
  const currentStatus = activeTab === 'meetings' ? meetingStatus : profileStatus;
  const setCurrentStatus = activeTab === 'meetings' ? setMeetingStatus : setProfileStatus;

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quản lý công tác ghép trẻ
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-800 md:text-4xl">
              Lịch gặp mặt & Hồ sơ nhận nuôi
            </h1>
          </div>
          <Link
            to="/can-bo-nhan-nuoi/danh-sach"
            className="w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Về yêu cầu nhận nuôi
          </Link>
        </header>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 lg:px-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="w-full rounded-2xl bg-slate-100 p-1.5 xl:w-[520px]">
                <div className="flex gap-1.5">
                  <MainTabButton
                    active={activeTab === 'meetings'}
                    title="Lịch hẹn gặp"
                    note={`${meetings.length} lịch`}
                    onClick={() => {
                      setActiveTab('meetings');
                      setKeyword('');
                    }}
                  />
                  <MainTabButton
                    active={activeTab === 'profiles'}
                    title="Hồ sơ nhận nuôi"
                    note={`${profiles.length} hồ sơ`}
                    onClick={() => {
                      setActiveTab('profiles');
                      setKeyword('');
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
                <div className="w-full md:w-[260px]">
                  <StatusCombobox value={currentStatus} options={currentStatusTabs} onChange={setCurrentStatus} />
                </div>
                <div className="w-full md:w-[420px]">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={activeTab === 'meetings' ? 'Tìm lịch, yêu cầu, người nhận...' : 'Tìm hồ sơ, mã trẻ...'}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-slate-500">Đang tải dữ liệu...</div>
          ) : (
            <>
              {activeTab === 'meetings' && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Danh sách Lịch gặp mặt</h2>
                      <p className="mt-1 text-sm text-slate-500">Hiển thị {filteredMeetings.length} / {meetings.length} lịch gặp.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1220px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Mã lịch & Yêu cầu</th>
                          <th className="px-6 py-4 font-semibold">Người nhận nuôi</th>
                          <th className="px-6 py-4 font-semibold">Thời gian & Địa điểm</th>
                          <th className="px-6 py-4 font-semibold">Trạng thái</th>
                          <th className="px-6 py-4 font-semibold">Kết quả</th>
                          <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMeetings.map((item) => {
                           const result = item.Children?.find(c => c.KetQua)?.KetQua;
                           return (
                            <tr key={item.MaLichGap} className="transition hover:bg-slate-50/50">
                              <td className="px-6 py-5">
                                <p className="font-bold text-blue-800">{item.MaLichGap}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-600">YC: {item.MaYeuCauNhan}</p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-semibold text-slate-800">{item.TenNguoiNhan}</p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-semibold text-slate-800">{formatDate(item.ThoiGian?.split('T')[0])} {item.ThoiGian?.split('T')[1]?.substring(0,5)}</p>
                                <p className="mt-1 text-xs text-slate-500">{item.DiaDiem}</p>
                              </td>
                              <td className="px-6 py-5">
                                <Badge status={item.TrangThai} size="md" />
                                <p className="mt-1.5 text-xs text-slate-500">{getMeetingNote(item)}</p>
                              </td>
                              <td className="px-6 py-5">
                                {result ? <Badge status={result} size="md" /> : <span className="text-sm font-semibold text-slate-400">Chưa có</span>}
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex justify-end gap-2">
                                  <Link to={`/can-bo-nhan-nuoi/tao-ho-so/${item.MaYeuCauNhan}`} className={primaryButton}>
                                    Vào xử lý
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredMeetings.length === 0 && <EmptyRow colSpan="6" text="Không tìm thấy lịch gặp mặt phù hợp." />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'profiles' && (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Hồ sơ nhận nuôi</h2>
                      <p className="mt-1 text-sm text-slate-500">Hiển thị {filteredProfiles.length} / {profiles.length} hồ sơ. Chỉ xem theo dõi vì Trưởng phòng là người có quyền duyệt.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Mã HS & YC</th>
                          <th className="px-6 py-4 font-semibold">Trẻ được gán</th>
                          <th className="px-6 py-4 font-semibold">Cán bộ phụ trách</th>
                          <th className="px-6 py-4 font-semibold">Ngày lập</th>
                          <th className="px-6 py-4 font-semibold">Trạng thái</th>
                          <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProfiles.map((item) => (
                          <tr key={item.MaHSNhanNuoi} className="transition hover:bg-slate-50/50">
                            <td className="px-6 py-5">
                              <p className="font-bold text-blue-800">{item.MaHSNhanNuoi}</p>
                              <p className="mt-1 text-xs font-semibold text-slate-600">YC: {item.MaYeuCauNhan}</p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-800">{item.MaTre}</p>
                              <p className="mt-1 text-xs text-slate-500">{item.TenTre}</p>
                            </td>
                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-800">{item.TenCanBo}</p>
                            </td>
                            <td className="px-6 py-5 font-medium text-slate-600">
                              {formatDate(item.NgayLap)}
                            </td>
                            <td className="px-6 py-5">
                              <Badge status={item.TrangThai} size="md" />
                              <p className="mt-1.5 text-xs text-slate-500">{getProfileNote(item.TrangThai)}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link to={`/can-bo-nhan-nuoi/ho-so/${item.MaHSNhanNuoi}`} className={secondaryButton}>
                                Xem chi tiết
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {filteredProfiles.length === 0 && <EmptyRow colSpan="6" text="Không tìm thấy hồ sơ nhận nuôi phù hợp." />}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}