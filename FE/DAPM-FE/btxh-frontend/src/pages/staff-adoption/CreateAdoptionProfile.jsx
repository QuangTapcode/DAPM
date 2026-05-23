import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-3xl border border-slate-200 bg-white shadow-sm';

const softCardClass =
  'rounded-2xl bg-slate-50 border border-slate-100';

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';

const primaryButton =
  'rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none';

const secondaryButton =
  'rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

function unwrapApiResponse(res) {
  if (res?.success !== undefined) return res.data;
  if (res?.data?.success !== undefined) return res.data.data;
  return res?.data ?? res;
}

function getResponseItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function safeDate(value) {
  if (!value) return 'Chưa có';
  return formatDate(value);
}

function getAge(dateString) {
  if (!dateString) return null;

  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

function getAgeGap(adopterBirthDate, childBirthDate) {
  const adopterAge = getAge(adopterBirthDate);
  const childAge = getAge(childBirthDate);

  if (adopterAge === null || childAge === null) return null;

  return adopterAge - childAge;
}

function normalizeRequest(req = {}, requestId) {
  const maxAge = req.mongMuonTuoiToiDa ?? req.MongMuonTuoiToiDa;
  const gender = req.mongMuonGioiTinh || req.MongMuonGioiTinh;

  const expectedChild = [
    maxAge ? `Tuổi tối đa: ${maxAge}` : null,
    gender ? `Giới tính: ${gender}` : 'Không yêu cầu giới tính',
  ]
    .filter(Boolean)
    .join(' • ');

  const giayTos = req.giayTos || req.GiayTos || req.giayTo || req.GiayTo || [];

  return {
    MaYeuCauNhan:
      req.maYeuCauNhan || req.MaYeuCauNhan || req.id || requestId || '',
    MaHoSoNhanNuoi: req.maHoSoNhanNuoi || req.MaHoSoNhanNuoi || '',

    MaNguoiNhan: req.maNguoiNhan || req.MaNguoiNhan || req.adopterId || '',
    TenNguoiNhan:
      req.tenNguoiNhan || req.TenNguoiNhan || req.adopterName || '',
    SDTNguoiNhan:
      req.sdtNguoiNhan || req.SDTNguoiNhan || req.phone || '',

    NgaySinhNguoiNhan:
      req.ngaySinhNguoiNhan ||
      req.NgaySinhNguoiNhan ||
      req.ngaySinh ||
      req.NgaySinh ||
      '',

    ThuNhapHangThang:
      req.thuNhapHangThang ?? req.ThuNhapHangThang ?? req.monthlyIncome ?? '',

    SoConDangNuoi: req.soConDangNuoi ?? req.SoConDangNuoi ?? '',
    TinhTrangHonNhan:
      req.tinhTrangHonNhan || req.TinhTrangHonNhan || '',
    LoaiNoiO: req.loaiNoiO || req.LoaiNoiO || '',
    SucKhoeDatYeuCau:
      req.sucKhoeDatYeuCau ?? req.SucKhoeDatYeuCau ?? null,
    QuanHeVoiTre: req.quanHeVoiTre || req.QuanHeVoiTre || '',

    LyDoNhanNuoi:
      req.lyDoNhanNuoi || req.LyDoNhanNuoi || req.motivation || '',

    MongMuonVeTre:
      req.mongMuonVeTre || req.MongMuonVeTre || req.expectedChild || expectedChild,

    MongMuonTuoiToiDa: maxAge ?? '',
    MongMuonGioiTinh: gender || '',

    TrangThai:
      req.trangThai || req.TrangThai || req.status || '',

    SoGiayTo: req.soGiayTo ?? req.SoGiayTo ?? giayTos.length ?? 0,
    SoGiayToHopLe:
      req.soGiayToHopLe ?? req.SoGiayToHopLe ?? giayTos.length ?? 0,

    GiayTos: Array.isArray(giayTos) ? giayTos : [],
    GhiChu: req.ghiChu || req.GhiChu || '',
  };
}

function normalizeChild(child = {}) {
  return {
    MaTre: child.maTre || child.MaTre || child.id || '',
    HoTen: child.hoTen || child.HoTen || child.name || '',
    NgaySinh: child.ngaySinh || child.NgaySinh || null,
    GioiTinh: child.gioiTinh || child.GioiTinh || '',
    MaPhuongXa: child.maPhuongXa || child.MaPhuongXa || '',
    TenPhuongXa: child.tenPhuongXa || child.TenPhuongXa || '',
    DiaChiCuThe: child.diaChiCuThe || child.DiaChiCuThe || '',
    DanToc: child.danToc || child.DanToc || '',
    TinhCach: child.tinhCach || child.TinhCach || '',
    SoThich: child.soThich || child.SoThich || '',
    DacDiemNhanDang:
      child.dacDiemNhanDang || child.DacDiemNhanDang || '',
    TrangThai: child.trangThai || child.TrangThai || '',
    NgayTiepNhan: child.ngayTiepNhan || child.NgayTiepNhan || null,
    GhiChu: child.ghiChu || child.GhiChu || '',
    HinhAnh: child.hinhAnh || child.HinhAnh || '',
  };
}

function normalizeMeeting(meeting = {}) {
  const children = meeting.Children ?? meeting.children ?? [];

  return {
    MaLichGap: meeting.MaLichGap || meeting.maLichGap || '',
    MaYeuCauNhan: meeting.MaYeuCauNhan || meeting.maYeuCauNhan || '',
    TenNguoiNhan: meeting.TenNguoiNhan || meeting.tenNguoiNhan || '',
    MaCanBo: meeting.MaCanBo || meeting.maCanBo || '',
    TenCanBo: meeting.TenCanBo || meeting.tenCanBo || '',
    NgayGapMat: meeting.NgayGapMat || meeting.ngayGapMat || null,
    ThoiGian: meeting.ThoiGian || meeting.thoiGian || null,
    DiaDiem: meeting.DiaDiem || meeting.diaDiem || '',
    TrangThai: meeting.TrangThai || meeting.trangThai || '',
    PhanHoiNguoiNhan:
      meeting.PhanHoiNguoiNhan || meeting.phanHoiNguoiNhan || '',
    ThoiGianDeXuatMoi:
      meeting.ThoiGianDeXuatMoi || meeting.thoiGianDeXuatMoi || null,
    NgayTao: meeting.NgayTao || meeting.ngayTao || null,
    NgayCapNhat: meeting.NgayCapNhat || meeting.ngayCapNhat || null,
    Children: Array.isArray(children)
      ? children.map((child) => ({
        MaTre: child.MaTre || child.maTre || '',
        TenTre: child.TenTre || child.tenTre || '',
        KetQua: child.KetQua || child.ketQua || '',
        GhiChuCanBo: child.GhiChuCanBo || child.ghiChuCanBo || '',
      }))
      : [],
  };
}

function profileStatusClass(status) {
  const map = {
    'Chưa gán trẻ': 'border-slate-200 bg-slate-50 text-slate-600',
    'Chưa tạo lịch gặp': 'border-amber-200 bg-amber-50 text-amber-700',
    'Chờ xác nhận lịch': 'border-amber-200 bg-amber-50 text-amber-700',
    'Chưa ghi nhận kết quả': 'border-sky-200 bg-sky-50 text-sky-700',
    'Đủ điều kiện gửi duyệt': 'border-green-200 bg-green-50 text-green-700',
    'Cần gặp lại': 'border-orange-200 bg-orange-50 text-orange-700',
    'Không đủ điều kiện': 'border-red-200 bg-red-50 text-red-700',
  };

  return map[status] || 'border-slate-200 bg-slate-50 text-slate-600';
}

function ProfileStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${profileStatusClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function ReadOnlyField({ label, value, strong = false, wide = false }) {
  return (
    <div
      className={`${softCardClass} px-5 py-4 ${wide ? 'md:col-span-2' : ''}`}
    >
      <p className={labelClass}>{label}</p>
      <p
        className={`text-sm leading-relaxed ${strong ? 'font-bold text-blue-800' : 'font-medium text-slate-800'
          }`}
      >
        {value === null || value === undefined || value === '' ? 'Chưa có' : value}
      </p>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {number && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {number}
          </span>
        )}

        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>

      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function ChildCard({ child, request, selectedForMeeting, selectedForProfile, onToggleMeetingSelection }) {
  const childAge = getAge(child.NgaySinh);
  const ageGap = getAgeGap(request.NgaySinhNguoiNhan, child.NgaySinh);

  const childDescription =
    child.GhiChu ||
    child.DacDiemNhanDang ||
    child.TinhCach ||
    child.SoThich ||
    'Chưa có ghi chú';

  return (
    <article
      className={`rounded-[24px] border p-5 transition ${selectedForMeeting
        ? 'border-[#0D47A1] bg-[#F8FBFF] shadow-[0_12px_30px_rgba(13,71,161,0.12)]'
        : 'border-[#E1ECF8] bg-white hover:border-[#CFE0F5] hover:bg-[#FAFCFF]'
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#8FA0B8]">
            {child.MaTre}
          </p>
          <h3 className="mt-2 text-lg font-bold text-[#1F2A3D]">
            {child.HoTen}
          </h3>
        </div>

        {selectedForProfile && (
          <span className="rounded-full bg-[#0D47A1] px-3 py-1 text-xs font-bold text-white">
            Đã gán
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-[#F6F8FC] px-3 py-2">
          <p className="text-xs text-[#8FA0B8]">Tuổi</p>
          <p className="font-bold text-[#26364A]">
            {childAge !== null ? `${childAge}` : '—'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F6F8FC] px-3 py-2">
          <p className="text-xs text-[#8FA0B8]">Giới tính</p>
          <p className="font-bold text-[#26364A]">
            {child.GioiTinh || 'Chưa cập nhật'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F6F8FC] px-3 py-2">
          <p className="text-xs text-[#8FA0B8]">Dân tộc</p>
          <p className="font-bold text-[#26364A]">
            {child.DanToc || 'Chưa cập nhật'}
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 px-3 py-2">
          <p className="text-xs text-green-700">Chênh tuổi</p>
          <p className="font-bold text-green-700">
            {ageGap !== null ? `${ageGap} tuổi` : '—'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#7D90AA]">
        {childDescription}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onToggleMeetingSelection(child)}
          className={`${selectedForMeeting ? 'bg-white border border-[#CFE0F5] text-[#0D47A1] hover:bg-[#F4F8FF]' : primaryButton} w-full`}
        >
          {selectedForMeeting ? 'Bỏ chọn khỏi lịch gặp' : 'Chọn cho lịch gặp'}
        </button>

        {selectedForProfile && (
          <span className="inline-flex items-center justify-center rounded-full bg-[#0D47A1] px-3 py-1 text-xs font-bold text-white">
            Đã chọn hồ sơ
          </span>
        )}
      </div>
    </article>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#C8D6E8] bg-[#FAFCFF] p-6 text-center text-sm leading-7 text-[#7D90AA]">
      {children}
    </div>
  );
}

export default function CreateAdoptionProfile() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(() =>
    normalizeRequest({}, requestId)
  );
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedMeetingChildren, setSelectedMeetingChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meeting, setMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    meetingDate: '',
    meetingTime: '',
    location: 'Phòng tư vấn nhận nuôi - Trung tâm',
    officer: 'Cán bộ nhận nuôi',
    note: '',
  });

  const [meetingChildrenResults, setMeetingChildrenResults] = useState([]);
  const [saveResultsLoading, setSaveResultsLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [submitProfileLoading, setSubmitProfileLoading] = useState(false);

  const [staffNote, setStaffNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectAttempted, setRejectAttempted] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [requestRes, childrenRes, meetingsRes] = await Promise.all([
          adoptionApi.getById(requestId),
          adoptionApi.getMatchingChildren(requestId),
          adoptionApi.getMeetings({ maYeuCauNhan: requestId, limit: 1 }),
        ]);

        if (!active) return;

        const requestPayload = unwrapApiResponse(requestRes);
        const childrenPayload = unwrapApiResponse(childrenRes);
        const meetingsPayload = unwrapApiResponse(meetingsRes);

        setRequest(normalizeRequest(requestPayload, requestId));

        const normalizedChildren = getResponseItems(childrenPayload).map(
          normalizeChild
        );

        setChildren(normalizedChildren);

        const meetingsList = getResponseItems(meetingsPayload);
        if (meetingsList && meetingsList.length > 0) {
          const meetingPayload = normalizeMeeting(meetingsList[0]);
          setMeeting({
            ...meetingPayload,
            meetingDate: meetingPayload.ThoiGian ? meetingPayload.ThoiGian.split('T')[0] : '',
            meetingTime: meetingPayload.ThoiGian ? meetingPayload.ThoiGian.split('T')[1]?.substring(0, 5) : '',
            location: meetingPayload.DiaDiem,
          });
          setSelectedMeetingChildren(meetingPayload.Children.map((c) => c.MaTre));
          const meetingChildrenRes = meetingPayload.Children.map((c) => ({
            MaTre: c.MaTre,
            TenTre: c.TenTre,
            KetQua: c.KetQua || '',
            GhiChuCanBo: c.GhiChuCanBo || '',
          }));
          setMeetingChildrenResults(meetingChildrenRes);

          // Tự động chọn trẻ nếu đã có kết quả "Phù hợp"
          if (meetingPayload.TrangThai === 'Đã gặp mặt') {
            const suitable = meetingChildrenRes.find(c => c.KetQua === 'Phù hợp');
            if (suitable) {
              const childObj = normalizedChildren.find(c => c.MaTre === suitable.MaTre) || { MaTre: suitable.MaTre, HoTen: suitable.TenTre };
              setSelectedChild(childObj);
            }
          }
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu tạo hồ sơ nhận nuôi:', error);

        if (!active) return;

        setRequest((prev) => ({
          ...prev,
          MaYeuCauNhan: requestId,
        }));

        setChildren([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [requestId]);

  const eligibleChildren = useMemo(() => {
    return children;
  }, [children]);

  const profileStatus = useMemo(() => {
    if (meeting) {
      if (meeting.TrangThai === 'Chờ xác nhận') return 'Chờ xác nhận lịch';
      if (meeting.TrangThai === 'Yêu cầu đổi lịch') return 'Yêu cầu đổi lịch';
      if (meeting.TrangThai === 'Đã xác nhận') return 'Chờ ghi nhận kết quả';
      if (meeting.TrangThai === 'Đã gặp mặt') {
        const hasSuitable = meetingChildrenResults.some(r => r.KetQua === 'Phù hợp');
        if (hasSuitable) {
          return selectedChild ? 'Đủ điều kiện gửi duyệt' : 'Chưa chọn trẻ phù hợp';
        }
        return 'Không có trẻ phù hợp';
      }
    }
    return 'Chưa tạo lịch gặp';
  }, [meeting, meetingChildrenResults, selectedChild]);

  const canRecordResult = meeting && (meeting.TrangThai === 'Đã xác nhận' || meeting.TrangThai === 'Đã gặp mặt');

  const canSubmitProfile =
    selectedChild &&
    meeting &&
    meeting.TrangThai === 'Đã gặp mặt' &&
    meetingChildrenResults.find(r => r.MaTre === selectedChild.MaTre)?.KetQua === 'Phù hợp';

  const officerName =
    user?.HoTen ||
    user?.hoTen ||
    user?.fullName ||
    user?.TenNguoiDung ||
    user?.name ||
    'Cán bộ nhận nuôi';

  function handleSelectChild(child) {
    setSelectedMeetingChildren((prev) => {
      if (prev.includes(child.MaTre)) {
        return prev.filter((maTre) => maTre !== child.MaTre);
      }

      return [...prev, child.MaTre];
    });
    setMeeting(null);
    setMeetingChildrenResults([]);
  }
  async function handleCreateMeeting(e) {
    e.preventDefault();

    if (selectedMeetingChildren.length === 0) return;

    const meetingTime = new Date(
      `${meetingForm.meetingDate}T${meetingForm.meetingTime}`
    );

    try {
      const res = await adoptionApi.createMeeting({
        maYeuCauNhan: request.MaYeuCauNhan,
        thoiGian: meetingTime,
        diaDiem: meetingForm.location,
        maTres: selectedMeetingChildren,
      });

      const meetingPayload = normalizeMeeting(unwrapApiResponse(res));
      setMeeting({
        ...meetingPayload,
        meetingDate: meetingForm.meetingDate,
        meetingTime: meetingForm.meetingTime,
        location: meetingForm.location,
      });
      setSelectedMeetingChildren(meetingPayload.Children.map((c) => c.MaTre));
      setMeetingChildrenResults(
        meetingPayload.Children.map((c) => ({
          MaTre: c.MaTre,
          TenTre: c.TenTre,
          KetQua: '',
          GhiChuCanBo: '',
        }))
      );
      setSelectedChild(null);
    } catch (error) {
      console.error('Lỗi tạo lịch gặp mặt:', error);
      alert('Không thể tạo lịch gặp mặt. Vui lòng thử lại.');
    }
  }

  async function handleUpdateMeeting(e) {
    e.preventDefault();
    setRescheduleLoading(true);
    const meetingTime = new Date(
      `${meetingForm.meetingDate}T${meetingForm.meetingTime}`
    );

    try {
      const res = await adoptionApi.updateMeeting(meeting.MaLichGap, {
        ThoiGian: meetingTime,
        DiaDiem: meetingForm.location,
        TrangThai: 'Chờ xác nhận',
      });

      if (res.success) {
        alert('Cập nhật lịch gặp mặt thành công.');
        const updated = normalizeMeeting(res.data);
        setMeeting({
          ...updated,
          meetingDate: updated.ThoiGian ? updated.ThoiGian.split('T')[0] : '',
          meetingTime: updated.ThoiGian ? updated.ThoiGian.split('T')[1]?.substring(0, 5) : '',
          location: updated.DiaDiem,
        });
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (error) {
      console.error('Lỗi cập nhật lịch gặp:', error);
      alert('Cập nhật lịch gặp mặt thất bại.');
    } finally {
      setRescheduleLoading(false);
    }
  }

  async function handleSaveMeetingResults() {
    if (meetingChildrenResults.some((r) => !r.KetQua)) {
      alert('Vui lòng chọn kết quả gặp mặt cho tất cả các trẻ.');
      return;
    }

    setSaveResultsLoading(true);
    try {
      const res = await adoptionApi.updateMeeting(meeting.MaLichGap, {
        TrangThai: 'Đã gặp mặt',
        Children: meetingChildrenResults.map((r) => ({
          MaTre: r.MaTre,
          KetQua: r.KetQua,
          GhiChuCanBo: r.GhiChuCanBo,
        })),
      });

      if (res.success) {
        alert('Ghi nhận kết quả gặp mặt thành công.');
        const updated = normalizeMeeting(res.data);
        setMeeting({
          ...updated,
          meetingDate: updated.ThoiGian ? updated.ThoiGian.split('T')[0] : '',
          meetingTime: updated.ThoiGian ? updated.ThoiGian.split('T')[1]?.substring(0, 5) : '',
          location: updated.DiaDiem,
        });

        // Tự động gán trẻ nếu có kết quả phù hợp
        const suitable = meetingChildrenResults.find(r => r.KetQua === 'Phù hợp');
        if (suitable) {
          const childObj = children.find(c => c.MaTre === suitable.MaTre) || { MaTre: suitable.MaTre, HoTen: suitable.TenTre };
          setSelectedChild(childObj);
        }
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (error) {
      console.error('Lỗi lưu kết quả gặp:', error);
      alert('Lưu kết quả gặp mặt thất bại.');
    } finally {
      setSaveResultsLoading(false);
    }
  }

  function handleResetMeeting() {
    if (window.confirm('Bạn có chắc muốn hủy lịch gặp hiện tại và tạo lịch gặp mới?')) {
      setMeeting(null);
      setSelectedMeetingChildren([]);
      setSelectedChild(null);
      setMeetingChildrenResults([]);
    }
  }

  async function handleSubmitProfile() {
    setSubmitAttempted(true);

    if (!canSubmitProfile) return;

    setSubmitProfileLoading(true);
    const payload = {
      maYeuCauNhan: request.MaYeuCauNhan,
      maTre: selectedChild.MaTre,
      maCanBo:
        user?.MaNguoiDung ||
        user?.maNguoiDung ||
        user?.id ||
        user?.maNguoiNhan ||
        '',
      ghiChu: staffNote,
    };

    try {
      const res = await adoptionApi.createProfile(payload);
      if (res.success) {
        alert('Lập hồ sơ thành công. Chuyển sang chế độ xem hồ sơ.');
        // Tải lại thông tin yêu cầu để cập nhật trạng thái và mã hồ sơ
        try {
          const requestRes = await adoptionApi.getById(requestId);
          setRequest(normalizeRequest(unwrapApiResponse(requestRes), requestId));
        } catch (e) {
          console.error('Lỗi tải lại request:', e);
        }
      } else {
        alert('Lập hồ sơ thất bại: ' + (res.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Lỗi lập hồ sơ:', error);
      alert(error?.response?.data?.message || error?.message || 'Lập hồ sơ thất bại.');
    } finally {
      setSubmitProfileLoading(false);
    }
  }

  async function handleRejectRequest() {
    setRejectAttempted(true);
    setRejectLoading(true);

    if (!rejectReason.trim()) {
      setRejectLoading(false);
      return;
    }

    try {
      const res = await adoptionApi.reject(request.MaYeuCauNhan, {
        reason: rejectReason.trim(),
      });

      if (!res.success) {
        throw new Error(res.message || 'Từ chối yêu cầu thất bại');
      }

      setRequest((prev) => ({
        ...prev,
        TrangThai: 'Từ chối sơ bộ',
      }));
      alert('Đã từ chối yêu cầu nhận nuôi thành công.');
      navigate('/can-bo-nhan-nuoi/danh-sach');
    } catch (error) {
      console.error('Lỗi từ chối yêu cầu:', error);
      alert(error?.message || 'Từ chối yêu cầu thất bại');
    } finally {
      setRejectLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Lập hồ sơ nhận nuôi
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                Hồ sơ nhận nuôi
              </h1>

              <ProfileStatusPill status={profileStatus} />
            </div>
          </div>

          <Link to="/can-bo-nhan-nuoi/danh-sach" className={secondaryButton}>
            Quay lại danh sách
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <main className={`space-y-8 ${request.TrangThai === 'Ghép trẻ' || request.MaHoSoNhanNuoi ? 'xl:col-span-12' : 'xl:col-span-8'}`}>
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 text-center lg:px-8">
                <h2 className="mt-3 text-[28px] font-bold uppercase tracking-wide text-[#0D47A1]">
                  Hồ sơ nhận nuôi
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#7D90AA]">
                  Mã hồ sơ:{' '}
                  <span className="font-bold text-[#26364A]">
                    {request.MaHoSoNhanNuoi || 'Chưa tạo'}
                  </span>
                </p>
              </div>

              <div className="space-y-10 p-6 lg:p-8">
                <section>
                  <SectionTitle number="I" title="Thông tin yêu cầu nhận nuôi" />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <ReadOnlyField
                      label="Mã yêu cầu"
                      value={request.MaYeuCauNhan}
                      strong
                    />

                    <ReadOnlyField
                      label="Trạng thái yêu cầu"
                      value={request.TrangThai}
                    />

                    <ReadOnlyField
                      label="Lý do nhận nuôi"
                      value={request.LyDoNhanNuoi}
                      wide
                    />

                    <ReadOnlyField
                      label="Mong muốn về trẻ"
                      value={request.MongMuonVeTre}
                      wide
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number="II" title="Thông tin người nhận nuôi" />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <ReadOnlyField
                      label="Mã người nhận"
                      value={request.MaNguoiNhan}
                    />

                    <ReadOnlyField
                      label="Người nhận nuôi"
                      value={request.TenNguoiNhan}
                      strong
                    />

                    <ReadOnlyField
                      label="Số điện thoại"
                      value={request.SDTNguoiNhan}
                    />

                    <ReadOnlyField
                      label="Ngày sinh"
                      value={safeDate(request.NgaySinhNguoiNhan)}
                    />

                    <ReadOnlyField
                      label="Thu nhập hàng tháng"
                      value={formatCurrency(request.ThuNhapHangThang)}
                    />

                    <ReadOnlyField
                      label="Số con đang nuôi"
                      value={request.SoConDangNuoi}
                    />

                    <ReadOnlyField
                      label="Tình trạng hôn nhân"
                      value={request.TinhTrangHonNhan}
                    />

                    <ReadOnlyField
                      label="Loại nơi ở"
                      value={request.LoaiNoiO}
                    />

                    <ReadOnlyField
                      label="Sức khỏe"
                      value={
                        request.SucKhoeDatYeuCau === null
                          ? ''
                          : request.SucKhoeDatYeuCau
                            ? 'Đạt yêu cầu'
                            : 'Không đạt'
                      }
                    />

                    <ReadOnlyField
                      label="Quan hệ với trẻ"
                      value={request.QuanHeVoiTre}
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle
                    number="III"
                    title="Giấy tờ pháp lý đã xác minh"
                  />

                  <div className="mt-5 divide-y divide-[#E6EDF5] overflow-hidden rounded-2xl border border-[#E6EDF5]">
                    {request.GiayTos.length === 0 && (
                      <div className="bg-[#FAFCFF] px-5 py-6 text-sm font-semibold text-[#7D90AA]">
                        API hiện chỉ trả số lượng giấy tờ, chưa có danh sách mã giấy tờ.
                      </div>
                    )}

                    {request.GiayTos.map((docId) => (
                      <div
                        key={docId}
                        className="flex flex-col justify-between gap-4 bg-[#FAFCFF] px-5 py-4 transition hover:bg-white md:flex-row md:items-center"
                      >
                        <div>
                          <p className="font-bold text-[#26364A]">Giấy tờ</p>
                          <p className="mt-1 text-sm text-[#7D90AA]">
                            Mã giấy tờ: {docId}
                          </p>
                        </div>

                        <Badge status="Hợp lệ" size="sm" />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle number="IV" title="Thông tin trẻ được gán" />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <ReadOnlyField
                      label="Mã trẻ"
                      value={selectedChild?.MaTre || 'Chưa gán trẻ'}
                      strong={Boolean(selectedChild)}
                    />

                    <ReadOnlyField
                      label="Họ tên trẻ"
                      value={selectedChild?.HoTen || ''}
                    />

                    <ReadOnlyField
                      label="Ngày sinh trẻ"
                      value={
                        selectedChild ? safeDate(selectedChild.NgaySinh) : ''
                      }
                    />

                    <ReadOnlyField
                      label="Giới tính"
                      value={selectedChild?.GioiTinh || ''}
                    />

                    <ReadOnlyField
                      label="Dân tộc"
                      value={selectedChild?.DanToc || ''}
                    />

                    <ReadOnlyField
                      label="Chênh lệch tuổi"
                      value={
                        selectedChild
                          ? `${getAgeGap(
                            request.NgaySinhNguoiNhan,
                            selectedChild.NgaySinh
                          )} tuổi`
                          : ''
                      }
                    />

                    <ReadOnlyField
                      label="Đặc điểm"
                      value={
                        selectedChild?.DacDiemNhanDang ||
                        selectedChild?.TinhCach ||
                        selectedChild?.SoThich ||
                        selectedChild?.GhiChu ||
                        ''
                      }
                      wide
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number="V" title="Thông tin lập hồ sơ" />

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <ReadOnlyField
                      label="Mã hồ sơ"
                      value={request.MaHoSoNhanNuoi || 'Chưa tạo'}
                      strong
                    />

                    <ReadOnlyField
                      label="Ngày lập hồ sơ"
                      value={new Date().toLocaleDateString('vi-VN')}
                    />

                    <ReadOnlyField label="Cán bộ lập" value={officerName} />

                    <ReadOnlyField
                      label="Trạng thái hồ sơ"
                      value={
                        canSubmitProfile ? 'Chờ duyệt' : 'Chưa đủ điều kiện lập'
                      }
                    />

                    <ReadOnlyField
                      label="Ghi chú cán bộ"
                      value={staffNote || 'Chưa có'}
                      wide
                    />
                  </div>
                </section>
              </div>
            </section>
          </main>

          {request.TrangThai !== 'Ghép trẻ' && !request.MaHoSoNhanNuoi && (
            <aside className="space-y-6 xl:col-span-4">
              {/* Section I: Child Selection */}
              <section className={`${cardClass} p-6 lg:p-7`}>
                <SectionTitle
                  title={meeting ? "Trẻ tham gia cuộc gặp" : "Khu vực chọn trẻ"}
                  description={meeting ? "Danh sách trẻ trong lịch gặp hiện tại" : "Chọn trẻ phù hợp để đưa vào lịch gặp mặt"}
                />

                <div className="mt-5 max-h-[680px] space-y-4 overflow-y-auto pr-1">
                  {!meeting && eligibleChildren.map((child) => (
                    <ChildCard
                      key={child.MaTre}
                      child={child}
                      request={request}
                      selectedForMeeting={selectedMeetingChildren.includes(child.MaTre)}
                      selectedForProfile={selectedChild?.MaTre === child.MaTre}
                      onToggleMeetingSelection={handleSelectChild}
                    />
                  ))}

                  {meeting && (
                    <div className="space-y-3">
                      {meeting.Children.map((c) => {
                        const child = children.find((ch) => ch.MaTre === c.MaTre) || { MaTre: c.MaTre, HoTen: c.TenTre };
                        return (
                          <div key={child.MaTre} className="rounded-2xl border border-[#E6EDF5] bg-[#FCFDFF] p-4 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-bold text-[#8FA0B8] uppercase">{child.MaTre}</p>
                              <h4 className="font-bold text-[#26364A] text-sm mt-0.5">{child.HoTen}</h4>
                              {child.GioiTinh && (
                                <p className="text-xs text-[#7D90AA] mt-1">
                                  {child.GioiTinh} · {getAge(child.NgaySinh)} tuổi
                                </p>
                              )}
                            </div>
                            {c.KetQua && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${c.KetQua === 'Phù hợp' ? 'bg-green-50 border-green-200 text-green-700' :
                                  c.KetQua === 'Không phù hợp' ? 'bg-red-50 border-red-200 text-red-700' :
                                    'bg-orange-50 border-orange-200 text-orange-700'
                                }`}>
                                {c.KetQua}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!meeting && eligibleChildren.length === 0 && (
                    <>
                      <EmptyState>
                        Không có trẻ phù hợp với điều kiện hiện tại.
                      </EmptyState>

                      <div className="rounded-2xl border border-[#E1ECF8] bg-[#FAFCFF] p-5">
                        <label className={labelClass}>
                          Lý do từ chối yêu cầu
                        </label>
                        <textarea
                          rows={4}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className={inputClass}
                          placeholder="Nhập lý do từ chối yêu cầu..."
                        />
                        {rejectAttempted && !rejectReason.trim() && (
                          <p className="mt-2 text-sm text-red-600">
                            Vui lòng nhập lý do từ chối trước khi gửi.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleRejectRequest}
                          disabled={rejectLoading}
                          className={`${primaryButton} mt-4 w-full ${rejectLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {rejectLoading ? 'Đang từ chối...' : 'Từ chối yêu cầu nhận nuôi'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Section II: Meeting Scheduler or Status Control */}
              <section className={`${cardClass} p-6 lg:p-7`}>
                <SectionTitle
                  title="Lịch hẹn gặp mặt"
                  description={meeting ? "Trạng thái và chi tiết lịch hẹn" : "Lập lịch gặp mặt để đánh giá độ hòa hợp."}
                />

                {/* Case A: No Meeting Scheduled yet */}
                {!meeting && selectedMeetingChildren.length === 0 && (
                  <div className="mt-5">
                    <EmptyState>Chọn ít nhất 1 trẻ phù hợp ở bên trái để lập lịch gặp.</EmptyState>
                  </div>
                )}

                {!meeting && selectedMeetingChildren.length > 0 && (
                  <form onSubmit={handleCreateMeeting} className="mt-5 grid gap-5">
                    <div className="rounded-2xl border border-blue-100 bg-[#F4F8FF] p-4">
                      <p className="text-xs font-semibold text-[#0D47A1]">
                        Đã chọn {selectedMeetingChildren.length} trẻ cho buổi gặp.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                      <div>
                        <label className={labelClass}>Ngày gặp</label>
                        <input
                          type="date"
                          required
                          value={meetingForm.meetingDate}
                          onChange={(e) =>
                            setMeetingForm((prev) => ({
                              ...prev,
                              meetingDate: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Giờ gặp</label>
                        <input
                          type="time"
                          required
                          value={meetingForm.meetingTime}
                          onChange={(e) =>
                            setMeetingForm((prev) => ({
                              ...prev,
                              meetingTime: e.target.value,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Địa điểm</label>
                      <input
                        required
                        value={meetingForm.location}
                        onChange={(e) =>
                          setMeetingForm((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Cán bộ phụ trách</label>
                      <input
                        required
                        value={meetingForm.officer}
                        onChange={(e) =>
                          setMeetingForm((prev) => ({
                            ...prev,
                            officer: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Ghi chú lịch gặp</label>
                      <textarea
                        rows={3}
                        value={meetingForm.note}
                        onChange={(e) =>
                          setMeetingForm((prev) => ({
                            ...prev,
                            note: e.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Ghi chú thêm về lịch gặp..."
                      />
                    </div>

                    <button type="submit" className={`${primaryButton} w-full`}>
                      Tạo lịch gặp mặt
                    </button>
                  </form>
                )}

                {/* Case B: Meeting exists */}
                {meeting && (
                  <div className="mt-5 space-y-5">
                    <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                      <div className="flex items-center justify-between gap-3 border-b border-[#E6EDF5] pb-3">
                        <p className="text-xs font-bold text-[#1F2A3D]">
                          Mã lịch: {meeting.MaLichGap}
                        </p>
                        <Badge status={meeting.TrangThai} size="sm" />
                      </div>

                      <div className="mt-4 space-y-2 text-sm leading-6 text-[#5F738F]">
                        <p>
                          <span className="font-bold text-[#26364A]">Thời gian:</span> {meeting.meetingDate} · {meeting.meetingTime}
                        </p>
                        <p>
                          <span className="font-bold text-[#26364A]">Địa điểm:</span> {meeting.location}
                        </p>
                      </div>

                      {meeting.TrangThai === 'Chờ xác nhận' && (
                        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-800 text-center">
                          Đang chờ người nhận nuôi xác nhận lịch hẹn.
                        </div>
                      )}

                      {meeting.TrangThai === 'Yêu cầu đổi lịch' && (
                        <div className="mt-4 space-y-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
                          <p className="font-bold uppercase tracking-wider">Người nhận nuôi yêu cầu đổi lịch:</p>
                          <p className="italic">"{meeting.PhanHoiNguoiNhan || 'Không có phản hồi chi tiết'}"</p>
                          {meeting.ThoiGianDeXuatMoi && (
                            <p className="font-bold text-red-900 mt-1">
                              Thời gian đề xuất: {formatDate(meeting.ThoiGianDeXuatMoi)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Subcase B1: Reschedule Form (Only shown if 'Yêu cầu đổi lịch') */}
                    {meeting.TrangThai === 'Yêu cầu đổi lịch' && (
                      <form onSubmit={handleUpdateMeeting} className="grid gap-4 rounded-2xl border border-red-100 bg-[#FFFDFD] p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-red-700">Cập nhật lại lịch hẹn</p>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                          <div>
                            <label className={labelClass}>Ngày mới</label>
                            <input
                              type="date"
                              required
                              value={meetingForm.meetingDate}
                              onChange={(e) =>
                                setMeetingForm((prev) => ({
                                  ...prev,
                                  meetingDate: e.target.value,
                                }))
                              }
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Giờ mới</label>
                            <input
                              type="time"
                              required
                              value={meetingForm.meetingTime}
                              onChange={(e) =>
                                setMeetingForm((prev) => ({
                                  ...prev,
                                  meetingTime: e.target.value,
                                }))
                              }
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Địa điểm</label>
                          <input
                            required
                            value={meetingForm.location}
                            onChange={(e) =>
                              setMeetingForm((prev) => ({
                                ...prev,
                                location: e.target.value,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={rescheduleLoading}
                          className={`${primaryButton} w-full`}
                        >
                          {rescheduleLoading ? 'Đang cập nhật...' : 'Cập nhật và Gửi lại lịch'}
                        </button>
                      </form>
                    )}

                    {/* Subcase B2: Record Results (Only if status is 'Đã xác nhận' or 'Đã gặp mặt') */}
                    {canRecordResult && (
                      <div className="rounded-2xl border border-[#E6EDF5] bg-white p-5 space-y-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#0D47A1]">Ghi nhận đánh giá gặp mặt</p>

                        <div className="space-y-4 divide-y divide-[#F0F4F8]">
                          {meetingChildrenResults.map((r, index) => (
                            <div key={r.MaTre} className={`${index > 0 ? 'pt-4' : ''} space-y-2`}>
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-[#26364A]">{r.TenTre}</p>
                                <span className="text-xs font-semibold text-[#7D90AA]">{r.MaTre}</span>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#8FA0B8] uppercase">Kết quả</label>
                                <select
                                  value={r.KetQua}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMeetingChildrenResults(prev => prev.map(item => item.MaTre === r.MaTre ? { ...item, KetQua: val } : item));
                                  }}
                                  className="w-full mt-1 rounded-xl border border-[#D7E5F7] bg-white px-3 py-2 text-xs font-semibold text-[#26364A] outline-none"
                                >
                                  <option value="">Chọn kết quả</option>
                                  <option value="Phù hợp">Phù hợp</option>
                                  <option value="Không phù hợp">Không phù hợp</option>
                                  <option value="Cần gặp lại">Cần gặp lại</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#8FA0B8] uppercase">Ghi chú cán bộ</label>
                                <input
                                  type="text"
                                  value={r.GhiChuCanBo}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMeetingChildrenResults(prev => prev.map(item => item.MaTre === r.MaTre ? { ...item, GhiChuCanBo: val } : item));
                                  }}
                                  className="w-full mt-1 rounded-xl border border-[#D7E5F7] bg-white px-3 py-2 text-xs text-[#26364A] outline-none"
                                  placeholder="Ghi chú tình hình gặp mặt..."
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveMeetingResults}
                          disabled={saveResultsLoading}
                          className={`${primaryButton} w-full text-xs py-2.5`}
                        >
                          {saveResultsLoading ? 'Đang lưu...' : 'Lưu kết quả & Đánh dấu đã gặp mặt'}
                        </button>
                      </div>
                    )}

                    {/* General Reset Action */}
                    <button
                      type="button"
                      onClick={handleResetMeeting}
                      className={`${secondaryButton} w-full text-xs py-2`}
                    >
                      Tạo lịch gặp mới / Hủy lịch gặp
                    </button>
                  </div>
                )}
              </section>

              {/* Section III: Submit Profile or End Request */}
              <section className={`${cardClass} p-6 lg:p-7`}>
                <SectionTitle
                  title="Gửi hồ sơ duyệt / Kết thúc"
                  description="Hoàn tất quy trình ghép trẻ sau cuộc gặp mặt."
                />

                {meeting && meeting.TrangThai === 'Đã gặp mặt' ? (
                  (() => {
                    const suitableChildren = meetingChildrenResults.filter((r) => r.KetQua === 'Phù hợp');

                    if (suitableChildren.length > 0) {
                      return (
                        <div className="mt-5 space-y-4">
                          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                            <p className="text-xs font-semibold text-green-800 leading-5">
                              Trẻ <span className="font-bold">{selectedChild?.HoTen}</span> ({selectedChild?.MaTre}) đã được đánh giá phù hợp và tự động gán vào hồ sơ này.
                            </p>
                          </div>

                          <div>
                            <label className={labelClass}>Ghi chú lập hồ sơ</label>
                            <textarea
                              rows={3}
                              value={staffNote}
                              onChange={(e) => setStaffNote(e.target.value)}
                              className={inputClass}
                              placeholder="Nhập ghi chú lập hồ sơ gửi trưởng phòng duyệt..."
                            />
                          </div>

                          {submitAttempted && !selectedChild && (
                            <p className="text-xs text-red-600 font-semibold">Vui lòng chọn 1 trẻ để gán vào hồ sơ.</p>
                          )}

                          <button
                            type="button"
                            onClick={handleSubmitProfile}
                            disabled={submitProfileLoading}
                            className={`${primaryButton} w-full`}
                          >
                            {submitProfileLoading ? 'Đang lập hồ sơ...' : 'Lập hồ sơ và gửi trưởng phòng duyệt'}
                          </button>
                        </div>
                      );
                    } else {
                      // No suitable children
                      const hasNeedMoreMeetings = meetingChildrenResults.some((r) => r.KetQua === 'Cần gặp lại');

                      return (
                        <div className="mt-5 space-y-4">
                          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="text-xs font-semibold text-red-800 leading-5">
                              Không có trẻ nào được đánh giá là Phù hợp trong buổi gặp này.
                            </p>
                          </div>

                          {hasNeedMoreMeetings ? (
                            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                              <p className="text-xs font-medium text-orange-800 leading-5">
                                Một số trẻ được đánh giá là "Cần gặp lại". Bạn có thể bấm nút "Tạo lịch gặp mới" ở phần trên để hẹn gặp lại.
                              </p>
                            </div>
                          ) : null}

                          <div className="rounded-2xl border border-[#E6EDF5] bg-[#FFFDFD] p-5 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-700">Kết thúc hồ sơ (Từ chối yêu cầu)</p>

                            <div>
                              <label className={labelClass}>Lý do từ chối / kết thúc</label>
                              <textarea
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className={inputClass}
                                placeholder="Nhập lý do kết thúc hồ sơ nhận nuôi..."
                              />
                            </div>

                            {rejectAttempted && !rejectReason.trim() && (
                              <p className="text-xs text-red-600 font-semibold">Vui lòng nhập lý do từ chối.</p>
                            )}

                            <button
                              type="button"
                              onClick={handleRejectRequest}
                              disabled={rejectLoading}
                              className={`${primaryButton} bg-red-600 hover:bg-red-700 w-full`}
                            >
                              {rejectLoading ? 'Đang xử lý...' : 'Kết thúc hồ sơ và Từ chối yêu cầu'}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="mt-5">
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
                      <p className="text-xs font-semibold text-amber-800 leading-5">
                        Chỉ có thể lập hồ sơ hoặc kết thúc hồ sơ sau khi cuộc gặp mặt diễn ra và kết quả đã được ghi nhận ở trạng thái "Đã gặp mặt".
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}