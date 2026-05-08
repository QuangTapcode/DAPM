import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const inputClass =
  'w-full rounded-2xl border border-[#D7E5F7] bg-white px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const primaryButton =
  'rounded-xl bg-[#0D47A1] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#083778]';

const secondaryButton =
  'rounded-xl border border-[#CFE0F5] bg-white px-4 py-2 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]';

const fallbackMeetings = [
  {
    MaLichGap: 'LHGM0001',
    MaYeuCauNhan: 'YCNN0004',
    MaTre: 'TRE00015',
    TenTre: 'Bé Minh',
    TenNguoiNhan: 'Lê Thanh Mai',
    SDTNguoiNhan: '0987654321',
    NgayGap: '2026-03-25',
    GioGap: '09:00',
    DiaDiem: 'Phòng tư vấn nhận nuôi - Trung tâm',
    TrangThai: 'Chờ xác nhận',
    KetQuaGapMat: '',
    GhiChu: 'Đã chọn trẻ, chờ xác nhận lịch gặp.',
  },
  {
    MaLichGap: 'LHGM0002',
    MaYeuCauNhan: 'YCNN0005',
    MaTre: 'TRE00012',
    TenTre: 'Bé An',
    TenNguoiNhan: 'Trần Quốc Huy',
    SDTNguoiNhan: '0912345678',
    NgayGap: '2026-03-22',
    GioGap: '14:00',
    DiaDiem: 'Phòng tư vấn nhận nuôi - Trung tâm',
    TrangThai: 'Đã xác nhận',
    KetQuaGapMat: '',
    GhiChu: 'Chờ ghi nhận kết quả gặp mặt.',
  },
  {
    MaLichGap: 'LHGM0003',
    MaYeuCauNhan: 'YCNN0006',
    MaTre: 'TRE00018',
    TenTre: 'Bé Lan',
    TenNguoiNhan: 'Nguyễn Minh Anh',
    SDTNguoiNhan: '0901234567',
    NgayGap: '2026-03-20',
    GioGap: '08:30',
    DiaDiem: 'Phòng tư vấn nhận nuôi - Trung tâm',
    TrangThai: 'Đã gặp mặt',
    KetQuaGapMat: 'Cần gặp lại',
    GhiChu: 'Cần sắp xếp buổi gặp tiếp theo.',
  },
];

const fallbackProfiles = [
  {
    MaHoSoNhanNuoi: 'HSNN0001',
    MaYeuCauNhan: 'YCNN0003',
    MaTre: 'TRE00009',
    TenTre: 'Bé Khôi',
    TenNguoiNhan: 'Nguyễn Quốc Bảo',
    SDTNguoiNhan: '0909090909',
    NgayLap: '2026-03-18',
    MaCanBoLap: 'ND000005',
    TenCanBoLap: 'Cán bộ nhận nuôi',
    TrangThai: 'Chờ duyệt',
    GhiChu: 'Hồ sơ đã lập và gửi trưởng phòng duyệt.',
  },
  {
    MaHoSoNhanNuoi: 'HSNN0002',
    MaYeuCauNhan: 'YCNN0002',
    MaTre: 'TRE00011',
    TenTre: 'Bé Nam',
    TenNguoiNhan: 'Võ Thị Hạnh',
    SDTNguoiNhan: '0977777777',
    NgayLap: '2026-03-16',
    MaCanBoLap: 'ND000005',
    TenCanBoLap: 'Cán bộ nhận nuôi',
    TrangThai: 'Đã duyệt',
    GhiChu: 'Trưởng phòng đã duyệt hồ sơ.',
  },
  {
    MaHoSoNhanNuoi: 'HSNN0003',
    MaYeuCauNhan: 'YCNN0001',
    MaTre: 'TRE00008',
    TenTre: 'Bé Mai',
    TenNguoiNhan: 'Phạm Hoàng Nam',
    SDTNguoiNhan: '0934567890',
    NgayLap: '2026-03-10',
    MaCanBoLap: 'ND000005',
    TenCanBoLap: 'Cán bộ nhận nuôi',
    TrangThai: 'Đã hoàn tất',
    GhiChu: 'Đã hoàn tất thủ tục nhận nuôi.',
  },
];

const meetingStatusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { key: 'Đã xác nhận', label: 'Đã xác nhận' },
  { key: 'Đã gặp mặt', label: 'Đã gặp mặt' },
  { key: 'Cần gặp lại', label: 'Cần gặp lại' },
];

const profileStatusTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ duyệt', label: 'Chờ duyệt' },
  { key: 'Đã duyệt', label: 'Đã duyệt' },
  { key: 'Đã hoàn tất', label: 'Đã hoàn tất' },
  { key: 'Từ chối', label: 'Từ chối' },
];
function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center text-sm text-[#8FA0B8]">
        {text}
      </td>
    </tr>
  );
}

function getMeetingDisplayStatus(item) {
  if (item.KetQuaGapMat === 'Cần gặp lại') return 'Cần gặp lại';
  return item.TrangThai;
}

function getMeetingNote(item) {
  if (item.TrangThai === 'Chờ xác nhận') return 'Chờ xác nhận lịch gặp';
  if (item.TrangThai === 'Đã xác nhận' && !item.KetQuaGapMat) {
    return 'Chờ ghi nhận kết quả';
  }
  if (item.KetQuaGapMat === 'Cần gặp lại') return 'Cần sắp xếp gặp lại';
  if (item.KetQuaGapMat === 'Phù hợp') return 'Có thể lập hồ sơ';
  if (item.KetQuaGapMat === 'Không phù hợp') return 'Không tiếp tục hồ sơ';
  return 'Theo dõi lịch gặp';
}

function getProfileNote(status) {
  if (status === 'Chờ duyệt') return 'Chờ trưởng phòng duyệt';
  if (status === 'Đã duyệt') return 'Có thể hoàn tất thủ tục';
  if (status === 'Đã hoàn tất') return 'Hồ sơ đã lưu trữ';
  if (status === 'Từ chối') return 'Hồ sơ không tiếp tục xử lý';
  return 'Theo dõi hồ sơ';
}
function MainTabButton({ active, title, note, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-2xl px-5 py-3 text-left transition ${active
        ? 'bg-white text-[#0D47A1] shadow-[0_8px_24px_rgba(31,42,61,0.08)]'
        : 'text-[#6F83A3] hover:bg-white/60'
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

  const selected =
    options.find((item) => item.key === value) || options[0];

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
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-bold transition ${open
          ? 'border-[#0D47A1] ring-4 ring-[#0D47A1]/10'
          : 'border-[#D7E5F7] hover:border-[#9DBBE3]'
          }`}
      >
        <span className="flex items-center gap-2 text-[#26364A]">
          <span className="h-2 w-2 rounded-full bg-[#0D47A1]" />
          {selected.label}
        </span>

        <svg
          className={`h-4 w-4 text-[#6F83A3] transition ${open ? 'rotate-180' : ''
            }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#DCE8F6] bg-white p-1.5 shadow-[0_18px_45px_rgba(31,42,61,0.16)]">
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
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${active
                  ? 'bg-[#EAF3FF] text-[#0D47A1]'
                  : 'text-[#42526B] hover:bg-[#F6F8FC]'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${active ? 'bg-[#0D47A1]' : 'bg-[#C8D6E8]'
                      }`}
                  />
                  {item.label}
                </span>

                {active && (
                  <span className="text-xs font-extrabold text-[#0D47A1]">
                    ✓
                  </span>
                )}
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
  const [meetings, setMeetings] = useState(fallbackMeetings);
  const [profiles, setProfiles] = useState(fallbackProfiles);

  const filteredMeetings = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return meetings.filter((item) => {
      const displayStatus = getMeetingDisplayStatus(item);

      const matchStatus =
        meetingStatus === 'all' ||
        item.TrangThai === meetingStatus ||
        item.KetQuaGapMat === meetingStatus ||
        displayStatus === meetingStatus;

      const searchable = [
        item.MaLichGap,
        item.MaYeuCauNhan,
        item.MaTre,
        item.TenTre,
        item.TenNguoiNhan,
        item.SDTNguoiNhan,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchStatus && matchKeyword;
    });
  }, [meetings, keyword, meetingStatus]);

  const filteredProfiles = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return profiles.filter((item) => {
      const matchStatus =
        profileStatus === 'all' || item.TrangThai === profileStatus;

      const searchable = [
        item.MaHoSoNhanNuoi,
        item.MaYeuCauNhan,
        item.MaTre,
        item.TenTre,
        item.TenNguoiNhan,
        item.SDTNguoiNhan,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchStatus && matchKeyword;
    });
  }, [profiles, keyword, profileStatus]);
  function confirmMeeting(meetingId) {
    setMeetings((prev) =>
      prev.map((item) =>
        item.MaLichGap === meetingId
          ? { ...item, TrangThai: 'Đã xác nhận' }
          : item
      )
    );
  }

  function completeProfile(profileId) {
    setProfiles((prev) =>
      prev.map((item) =>
        item.MaHoSoNhanNuoi === profileId
          ? {
            ...item,
            TrangThai: 'Đã hoàn tất',
            GhiChu: 'Đã hoàn tất thủ tục nhận nuôi.',
          }
          : item
      )
    );
  }

  const currentStatusTabs =
    activeTab === 'meetings' ? meetingStatusTabs : profileStatusTabs;

  const currentStatus =
    activeTab === 'meetings' ? meetingStatus : profileStatus;

  const setCurrentStatus =
    activeTab === 'meetings' ? setMeetingStatus : setProfileStatus;

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Theo dõi nhận nuôi
            </p>

            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Lịch gặp mặt và hồ sơ nhận nuôi
            </h1>
          </div>
          <Link
            to="/can-bo-nhan-nuoi/danh-sach"
            className="w-fit rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
          >
            Về yêu cầu nhận nuôi
          </Link>
        </header>
        {/* Main Card */}
        <section className={`${cardClass} overflow-hidden`}>
          {/* Toolbar */}
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5 lg:px-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              {/* Main tabs */}
              <div className="w-full rounded-[24px] border border-[#DCE8F6] bg-[#EEF4FB] p-1.5 xl:w-[520px]">
                <div className="flex gap-1.5">
                  <MainTabButton
                    active={activeTab === 'meetings'}
                    title="Lịch gặp mặt"
                    note={`${meetings.length} lịch đang theo dõi`}
                    onClick={() => {
                      setActiveTab('meetings');
                      setKeyword('');
                    }}
                  />

                  <MainTabButton
                    active={activeTab === 'profiles'}
                    title="Hồ sơ nhận nuôi"
                    note={`${profiles.length} hồ sơ đã lập`}
                    onClick={() => {
                      setActiveTab('profiles');
                      setKeyword('');
                    }}
                  />
                </div>
              </div>

              {/* Search + status select */}
              <div className="flex w-full flex-col gap-3 md:flex-row xl:w-auto">
                <div className="w-full md:w-[260px]">
                  <StatusCombobox
                    value={currentStatus}
                    options={currentStatusTabs}
                    onChange={setCurrentStatus}
                  />
                </div>

                <div className="w-full md:w-[420px]">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={
                      activeTab === 'meetings'
                        ? 'Tìm lịch, yêu cầu, người nhận, trẻ...'
                        : 'Tìm hồ sơ, yêu cầu, người nhận, trẻ...'
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Meetings table */}
          {activeTab === 'meetings' && (
            <div>
              <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0D47A1]">
                    Lịch gặp mặt
                  </h2>
                  <p className="mt-1 text-sm text-[#8FA0B8]">
                    Hiển thị {filteredMeetings.length} / {meetings.length} lịch gặp.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1220px] border-collapse text-left text-sm">
                  <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Mã lịch</th>
                      <th className="px-6 py-4 font-bold">Yêu cầu</th>
                      <th className="px-6 py-4 font-bold">Người nhận nuôi</th>
                      <th className="px-6 py-4 font-bold">Trẻ được chọn</th>
                      <th className="px-6 py-4 font-bold">Thời gian</th>
                      <th className="px-6 py-4 font-bold">Trạng thái</th>
                      <th className="px-6 py-4 font-bold">Kết quả</th>
                      <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3FB]">
                    {filteredMeetings.map((item) => (
                      <tr key={item.MaLichGap} className="transition hover:bg-[#F7FAFF]">
                        <td className="px-6 py-5">
                          <p className="font-extrabold text-[#0D47A1]">
                            {item.MaLichGap}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#8FA0B8]">
                            {getMeetingNote(item)}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-bold text-[#26364A]">
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

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#26364A]">{item.MaTre}</p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.TenTre}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#26364A]">
                            {formatDate(item.NgayGap)}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.GioGap} · {item.DiaDiem}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <Badge status={item.TrangThai} size="md" />
                        </td>

                        <td className="px-6 py-5">
                          {item.KetQuaGapMat ? (
                            <Badge status={item.KetQuaGapMat} size="md" />
                          ) : (
                            <span className="text-sm font-semibold text-[#8FA0B8]">
                              Chưa ghi nhận
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/can-bo-nhan-nuoi/tao-ho-so/${item.MaYeuCauNhan}`}
                              className={primaryButton}
                            >
                              Tiếp tục xử lý
                            </Link>

                            {item.TrangThai === 'Chờ xác nhận' && (
                              <button
                                type="button"
                                onClick={() => confirmMeeting(item.MaLichGap)}
                                className={secondaryButton}
                              >
                                Xác nhận
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredMeetings.length === 0 && (
                      <EmptyRow
                        colSpan="8"
                        text="Không tìm thấy lịch gặp mặt phù hợp."
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Profiles table */}
          {activeTab === 'profiles' && (
            <div>
              <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0D47A1]">
                    Hồ sơ nhận nuôi
                  </h2>
                  <p className="mt-1 text-sm text-[#8FA0B8]">
                    Hiển thị {filteredProfiles.length} / {profiles.length} hồ sơ.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                  <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Mã hồ sơ</th>
                      <th className="px-6 py-4 font-bold">Yêu cầu</th>
                      <th className="px-6 py-4 font-bold">Người nhận nuôi</th>
                      <th className="px-6 py-4 font-bold">Trẻ được gán</th>
                      <th className="px-6 py-4 font-bold">Ngày lập</th>
                      <th className="px-6 py-4 font-bold">Cán bộ lập</th>
                      <th className="px-6 py-4 font-bold">Trạng thái</th>
                      <th className="px-6 py-4 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3FB]">
                    {filteredProfiles.map((item) => (
                      <tr key={item.MaHoSoNhanNuoi} className="transition hover:bg-[#F7FAFF]">
                        <td className="px-6 py-5">
                          <p className="font-extrabold text-[#0D47A1]">
                            {item.MaHoSoNhanNuoi}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#8FA0B8]">
                            {getProfileNote(item.TrangThai)}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-bold text-[#26364A]">
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

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#26364A]">{item.MaTre}</p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.TenTre}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-semibold text-[#5F738F]">
                          {formatDate(item.NgayLap)}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#26364A]">
                            {item.TenCanBoLap}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.MaCanBoLap}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <Badge status={item.TrangThai} size="md" />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/can-bo-nhan-nuoi/ho-so/${item.MaHoSoNhanNuoi}`}
                              className={primaryButton}
                            >
                              Xem chi tiết
                            </Link>

                            {item.TrangThai === 'Đã duyệt' && (
                              <button
                                type="button"
                                onClick={() => completeProfile(item.MaHoSoNhanNuoi)}
                                className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                              >
                                Hoàn tất
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredProfiles.length === 0 && (
                      <EmptyRow
                        colSpan="8"
                        text="Không tìm thấy hồ sơ nhận nuôi phù hợp."
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}