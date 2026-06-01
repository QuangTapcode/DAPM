import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import meetingApi from '../../api/meetingApi';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const inputClass =
  'h-12 w-full rounded-2xl border border-[#D7E5F7] bg-white px-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const primaryButton =
  'inline-flex h-11 items-center justify-center rounded-2xl bg-[#0D47A1] px-4 text-[13px] font-bold text-white transition hover:bg-[#083778] active:scale-[0.97]';

const secondaryButton =
  'inline-flex h-11 items-center justify-center rounded-2xl border border-[#CFE0F5] bg-white px-4 text-[13px] font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] active:scale-[0.97]';


function normalizeMeeting(item) {
  // BE trả children: [{maTre, tenTre, ketQua, ghiChuCanBo}]
  const children = item.children || item.Children || [];
  const firstChild = children[0] || {};

  return {
    MaLichGap: item.maLichGap || item.MaLichGap || item.id || '',
    MaYeuCauNhan: item.maYeuCauNhan || item.MaYeuCauNhan || '',
    MaTre: firstChild.maTre || firstChild.MaTre || item.maTre || item.MaTre || '',
    TenTre: firstChild.tenTre || firstChild.TenTre || item.tenTre || item.TenTre || '',
    TenNguoiNhan: item.tenNguoiNhan || item.TenNguoiNhan || '',
    SDTNguoiNhan: item.sdtNguoiNhan || item.sDTNguoiNhan || item.SDTNguoiNhan || '',
    ThoiGian: item.thoiGian || item.ThoiGian || item.ngayGapMat || item.NgayGapMat || '',
    DiaDiem: item.diaDiem || item.DiaDiem || '',
    TrangThai: item.trangThai || item.TrangThai || '',
    KetQuaGapMat: firstChild.ketQua || firstChild.KetQua || item.ketQuaGapMat || item.KetQuaGapMat || '',
    GhiChu: firstChild.ghiChuCanBo || firstChild.GhiChuCanBo || item.ghiChu || item.GhiChu || '',
  };
}

function normalizeProfile(item) {
  return {
    MaHoSoNhanNuoi: item.MaHoSoNhanNuoi || item.maHoSoNhanNuoi || item.MaHSNhanNuoi || item.maHSNhanNuoi || '',
    MaYeuCauNhan: item.MaYeuCauNhan || item.maYeuCauNhan || '',
    MaTre: item.MaTre || item.maTre || '',
    TenTre: item.TenTre || item.tenTre || '',
    TenNguoiNhan: item.TenNguoiNhan || item.tenNguoiNhan || '',
    SDTNguoiNhan: item.SDTNguoiNhan || item.sDTNguoiNhan || item.sdtNguoiNhan || '',
    NgayLap: item.NgayLap || item.ngayLap || '',
    MaCanBoLap: item.MaCanBoLap || item.maCanBoLap || item.MaCanBo || item.maCanBo || '',
    TenCanBoLap: item.TenCanBoLap || item.tenCanBoLap || item.TenCanBo || item.tenCanBo || '',
    TrangThai: item.TrangThai || item.trangThai || '',
    GhiChu: item.GhiChu || item.ghiChu || item.GhiChuCanBo || item.ghiChuCanBo || '',
  };
}

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
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <p className="text-[15px] font-bold text-[#1A2B4B]">{text}</p>
        <p className="mt-1.5 text-sm text-[#8FA0B8]">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
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

                {active && <Check size={15} className="text-[#0D47A1]" strokeWidth={2.5} />}
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

  useEffect(() => {
    meetingApi.getAll({ page: 1, limit: 200 })
      .then((res) => {
        const items = res?.items ?? res ?? [];
        setMeetings(Array.isArray(items) ? items.map(normalizeMeeting) : []);
      })
      .catch(() => setMeetings([]));
    adoptionProfileApi.getAll({ page: 1, limit: 100 })
      .then((res) => {
        const items = res?.items ?? res ?? [];
        setProfiles(Array.isArray(items) ? items.map(normalizeProfile) : []);
      })
      .catch(() => setProfiles([]));
  }, []);

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
  async function confirmMeeting(meetingId) {
    try {
      await meetingApi.update(meetingId, { trangThai: 'Đã xác nhận' });
    } catch {
      // ignore — cập nhật UI dưới dù API lỗi
    }
    setMeetings((prev) =>
      prev.map((item) =>
        item.MaLichGap === meetingId
          ? { ...item, TrangThai: 'Đã xác nhận' }
          : item
      )
    );
  }

  async function completeProfile(profileId) {
    try {
      await adoptionProfileApi.update(profileId, { trangThai: 'Đã hoàn tất' });
      setProfiles((prev) =>
        prev.map((item) =>
          (item.MaHoSoNhanNuoi || item.MaHSNhanNuoi) === profileId
            ? { ...item, TrangThai: 'Đã hoàn tất' }
            : item
        )
      );
    } catch {
      // ignore — status remains unchanged on error
    }
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
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-7 py-6 lg:px-7">
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
                  <thead className="bg-[#F7FAFF] text-[12px] uppercase tracking-[0.12em] text-[#8093AB]">
                    <tr>
                      <th className="px-7 py-5 font-bold">Mã lịch</th>
                      <th className="px-7 py-5 font-bold">Yêu cầu</th>
                      <th className="px-7 py-5 font-bold">Người nhận nuôi</th>
                      <th className="px-7 py-5 font-bold">Trẻ được chọn</th>
                      <th className="px-7 py-5 font-bold">Thời gian</th>
                      <th className="px-7 py-5 font-bold">Trạng thái</th>
                      <th className="px-7 py-5 font-bold">Kết quả</th>
                      <th className="px-7 py-5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3FB]">
                    {filteredMeetings.map((item) => (
                      <tr key={item.MaLichGap} className="transition hover:bg-[#F7FAFF]">
                        <td className="px-7 py-6">
                          <p className="text-[15px] font-extrabold text-[#0D47A1]">
                            {item.MaLichGap}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#8FA0B8]">
                            {getMeetingNote(item)}
                          </p>
                        </td>

                        <td className="px-7 py-6 text-[15px] font-bold text-[#1A2B4B]">
                          {item.MaYeuCauNhan}
                        </td>

                        <td className="px-7 py-6">
                          <p className="text-[15px] font-bold text-[#1A2B4B]">
                            {item.TenNguoiNhan}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.SDTNguoiNhan}
                          </p>
                        </td>

                        <td className="px-7 py-6">
                          <p className="text-[15px] font-bold text-[#1A2B4B]">{item.MaTre}</p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.TenTre}
                          </p>
                        </td>

                        <td className="px-7 py-6">
                          <p className="font-semibold text-[#26364A]">
                            {item.ThoiGian
                              ? new Date(item.ThoiGian).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
                              : '-'}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.DiaDiem}
                          </p>
                        </td>

                        <td className="px-7 py-6">
                          <Badge status={item.TrangThai} size="md" />
                        </td>

                        <td className="px-7 py-6">
                          {item.KetQuaGapMat ? (
                            <Badge status={item.KetQuaGapMat} size="md" />
                          ) : (
                            <span className="text-sm font-semibold text-[#8FA0B8]">
                              Chưa ghi nhận
                            </span>
                          )}
                        </td>

                        <td className="px-7 py-6">
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
                  <thead className="bg-[#F7FAFF] text-[12px] uppercase tracking-[0.12em] text-[#8093AB]">
                    <tr>
                      <th className="px-7 py-5 font-bold">Mã hồ sơ</th>
                      <th className="px-7 py-5 font-bold">Yêu cầu</th>
                      <th className="px-7 py-5 font-bold">Người nhận nuôi</th>
                      <th className="px-7 py-5 font-bold">Trẻ được gán</th>
                      <th className="px-7 py-5 font-bold">Ngày lập</th>
                      <th className="px-7 py-5 font-bold">Cán bộ lập</th>
                      <th className="px-7 py-5 font-bold">Trạng thái</th>
                      <th className="px-7 py-5 text-right font-bold">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EDF3FB]">
                    {filteredProfiles.map((item) => (
                      <tr key={item.MaHoSoNhanNuoi} className="transition hover:bg-[#F7FAFF]">
                        <td className="px-7 py-6">
                          <p className="text-[15px] font-extrabold text-[#0D47A1]">
                            {item.MaHoSoNhanNuoi}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#8FA0B8]">
                            {getProfileNote(item.TrangThai)}
                          </p>
                        </td>

                        <td className="px-7 py-6 text-[15px] font-bold text-[#1A2B4B]">
                          {item.MaYeuCauNhan}
                        </td>

                        <td className="px-7 py-6">
                          <p className="text-[15px] font-bold text-[#1A2B4B]">
                            {item.TenNguoiNhan}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.SDTNguoiNhan}
                          </p>
                        </td>

                        <td className="px-7 py-6">
                          <p className="text-[15px] font-bold text-[#1A2B4B]">{item.MaTre}</p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.TenTre}
                          </p>
                        </td>

                        <td className="px-7 py-6 font-semibold text-[#5F738F]">
                          {formatDate(item.NgayLap)}
                        </td>

                        <td className="px-7 py-6">
                          <p className="font-semibold text-[#26364A]">
                            {item.TenCanBoLap}
                          </p>
                          <p className="mt-1 text-xs text-[#8FA0B8]">
                            {item.MaCanBoLap}
                          </p>
                        </td>

                        <td className="px-7 py-6">
                          <Badge status={item.TrangThai} size="md" />
                        </td>

                        <td className="px-7 py-6">
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
                                className="inline-flex h-11 items-center justify-center rounded-2xl border border-green-200 bg-green-50 px-4 text-[13px] font-bold text-green-700 transition hover:bg-green-100 active:scale-[0.97]"
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