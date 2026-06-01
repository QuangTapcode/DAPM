import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import childApi from '../../api/childApi';
import meetingApi from '../../api/meetingApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const softCardClass =
  'rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF]';

const labelClass =
  'mb-2 block text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]';

const inputClass =
  'w-full rounded-2xl border border-[#D7E5F7] bg-white px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const primaryButton =
  'rounded-2xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#083778] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none';

const secondaryButton =
  'rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';

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

function getProfileStatus(finalSelectedChild, meeting) {
  if (!meeting) return 'Chưa tạo lịch gặp';
  if (meeting.trangThai === 'Chờ xác nhận') return 'Chờ xác nhận lịch';
  if (meeting.trangThai === 'Đã xác nhận') return 'Chờ gặp mặt';
  if (meeting.trangThai === 'Đã gặp mặt') {
     if (!finalSelectedChild) return 'Chưa chốt trẻ phù hợp';
     return 'Đủ điều kiện gửi duyệt';
  }
  return meeting.trangThai;
}

function profileStatusClass(status) {
  const map = {
    'Chưa tạo lịch gặp': 'border-amber-200 bg-amber-50 text-amber-700',
    'Chờ xác nhận lịch': 'border-amber-200 bg-amber-50 text-amber-700',
    'Chờ gặp mặt': 'border-sky-200 bg-sky-50 text-sky-700',
    'Chưa chốt trẻ phù hợp': 'border-sky-200 bg-sky-50 text-sky-700',
    'Đủ điều kiện gửi duyệt': 'border-green-200 bg-green-50 text-green-700',
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
        className={`text-sm leading-7 ${strong ? 'font-bold text-[#0D47A1]' : 'font-semibold text-[#26364A]'
          }`}
      >
        {value === null || value === undefined || value === '' ? 'Chưa có' : value}
      </p>
    </div>
  );
}

function SectionTitle({ number, title, description }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {number && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#0D47A1]">
            {number}
          </span>
        )}

        <h2 className="text-[18px] font-bold text-[#0D47A1]">{title}</h2>
      </div>

      {description && (
        <p className="mt-2 text-sm leading-7 text-[#7D90AA]">{description}</p>
      )}
    </div>
  );
}

function ChildCard({ child, request, selected, onSelect, disabled }) {
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
      className={`rounded-[24px] border p-5 transition ${selected
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

        {selected && (
          <span className="rounded-full bg-[#0D47A1] px-3 py-1 text-xs font-bold text-white">
            Đã chọn
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

      <button
        type="button"
        onClick={() => onSelect(child)}
        disabled={disabled}
        className={`${selected ? secondaryButton : primaryButton} mt-5 w-full`}
      >
        {selected ? 'Bỏ chọn' : 'Chọn ghép vào lịch hẹn'}
      </button>
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
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [meeting, setMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    thoiGian: '',
    diaDiem: 'Phòng tư vấn nhận nuôi - Trung tâm',
  });
  const [meetingCreating, setMeetingCreating] = useState(false);

  const [childStatuses, setChildStatuses] = useState({});

  const [staffNote, setStaffNote] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [requestRes, childrenRes, meetingRes] = await Promise.all([
          adoptionApi.getById(requestId),
          childApi.getAll({ status: 'Chờ nhận nuôi', limit: 100 }),
          meetingApi.getAll({ maYeuCauNhan: requestId, limit: 1 }).catch(() => null),
        ]);

        if (!active) return;

        const requestPayload = unwrapApiResponse(requestRes);
        const childrenPayload = unwrapApiResponse(childrenRes);

        setRequest(normalizeRequest(requestPayload, requestId));

        const normalizedChildren = getResponseItems(childrenPayload).map(
          normalizeChild
        );

        setChildren(normalizedChildren);

        // Fetch meeting if it exists
        const meetingsData = meetingRes ? getResponseItems(meetingRes) : [];
        const existingMeeting = meetingsData.length > 0 ? meetingsData[0] : null;

        if (existingMeeting) {
          setMeeting(existingMeeting);

          const childIds = [];
          const meetingChildren = existingMeeting.children || existingMeeting.Children || existingMeeting.maTres || existingMeeting.chiTietLichGap || existingMeeting.chiTietGapMat || existingMeeting.danhSachTre;
          
          if (Array.isArray(meetingChildren)) {
            childIds.push(...meetingChildren.map(ct => typeof ct === 'string' ? ct : (ct.maTre || ct.MaTre || ct.id)));
          }

          if (childIds.length > 0) {
            const selected = normalizedChildren.filter(c => childIds.includes(c.MaTre));
            if (selected.length > 0) {
              setSelectedChildren(selected);
              
              const restoredStatuses = {};
              meetingChildren.forEach(ct => {
                const id = typeof ct === 'string' ? ct : (ct.maTre || ct.MaTre || ct.id);
                if (id && ct.ketQua) restoredStatuses[id] = ct.ketQua;
                else if (id && ct.KetQua) restoredStatuses[id] = ct.KetQua;
              });
              setChildStatuses(restoredStatuses);
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

  const finalSelectedChild = useMemo(() => {
    const maTrePhuHop = Object.keys(childStatuses).find(key => childStatuses[key] === 'Phù hợp');
    if (!maTrePhuHop) return null;
    return selectedChildren.find(c => c.MaTre === maTrePhuHop) || null;
  }, [childStatuses, selectedChildren]);

  const profileStatus = getProfileStatus(
    finalSelectedChild,
    meeting
  );

  const canRecordResult = meeting && meeting.trangThai === 'Đã gặp mặt';

  const canSubmitProfile = finalSelectedChild !== null;

  const officerName =
    user?.HoTen ||
    user?.hoTen ||
    user?.fullName ||
    user?.TenNguoiDung ||
    user?.name ||
    'Cán bộ nhận nuôi';

  function handleToggleChild(child) {
    if (meeting) return;
    setSelectedChildren((prev) => {
      const isSelected = prev.some((c) => c.MaTre === child.MaTre);
      if (isSelected) {
        return prev.filter((c) => c.MaTre !== child.MaTre);
      }
      return [...prev, child];
    });
  }

  function handleChildStatusChange(maTre, newStatus) {
    setChildStatuses((prev) => {
      const next = { ...prev };
      if (newStatus === 'Phù hợp') {
        Object.keys(next).forEach(key => {
          if (next[key] === 'Phù hợp') next[key] = ''; 
        });
      }
      next[maTre] = newStatus;
      return next;
    });
  }

  async function handleCreateMeeting(e) {
    e.preventDefault();
    if (selectedChildren.length === 0 || meetingCreating) return;
    setMeetingCreating(true);
    try {
      const created = await meetingApi.create({
        maYeuCauNhan: request.MaYeuCauNhan,
        thoiGian: meetingForm.thoiGian,
        diaDiem: meetingForm.diaDiem,
        maTres: selectedChildren.map((c) => c.MaTre),
      });
      setMeeting(created);
    } catch (err) {
      alert('Lỗi tạo lịch gặp: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setMeetingCreating(false);
    }
  }

  async function handleMarkMet() {
    if (!meeting?.maLichGap || meetingCreating) return;
    setMeetingCreating(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, { trangThai: 'Đã gặp mặt' });
      setMeeting(updated);
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setMeetingCreating(false);
    }
  }

  async function handleSubmitProfile() {
    setSubmitAttempted(true);
    if (!canSubmitProfile || submitting) return;

    setSubmitting(true);
    try {
      await adoptionProfileApi.create({
        maYeuCauNhan: request.MaYeuCauNhan,
        maTre: finalSelectedChild.MaTre,
        maCanBo: user?.MaNguoiDung || user?.maNguoiDung || user?.id || '',
        ghiChu: staffNote,
      });
      navigate('/can-bo-nhan-nuoi/ho-so');
    } catch (err) {
      alert('Lỗi tạo hồ sơ: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setSubmitting(false);
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
          <main className="space-y-8 xl:col-span-8">
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
                  <SectionTitle number="I" title="Thông initial yêu cầu nhận nuôi" />

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
                      value={finalSelectedChild?.MaTre || 'Chưa gán trẻ'}
                      strong={Boolean(finalSelectedChild)}
                    />

                    <ReadOnlyField
                      label="Họ tên trẻ"
                      value={finalSelectedChild?.HoTen || ''}
                    />

                    <ReadOnlyField
                      label="Ngày sinh trẻ"
                      value={
                        finalSelectedChild ? safeDate(finalSelectedChild.NgaySinh) : ''
                      }
                    />

                    <ReadOnlyField
                      label="Giới tính"
                      value={finalSelectedChild?.GioiTinh || ''}
                    />

                    <ReadOnlyField
                      label="Dân tộc"
                      value={finalSelectedChild?.DanToc || ''}
                    />

                    <ReadOnlyField
                      label="Chênh lệch tuổi"
                      value={
                        finalSelectedChild
                          ? `${getAgeGap(
                            request.NgaySinhNguoiNhan,
                            finalSelectedChild.NgaySinh
                          )} tuổi`
                          : ''
                      }
                    />

                    <ReadOnlyField
                      label="Đặc điểm"
                      value={
                        finalSelectedChild?.DacDiemNhanDang ||
                        finalSelectedChild?.TinhCach ||
                        finalSelectedChild?.SoThich ||
                        finalSelectedChild?.GhiChu ||
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

          <aside className="space-y-6 xl:col-span-4">
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Khu vực chọn trẻ"
                description="Danh sách trẻ tiềm năng. Có thể chọn nhiều trẻ để đưa vào một lịch gặp."
              />

              <div className="mt-5 max-h-[680px] space-y-4 overflow-y-auto pr-1">
                {eligibleChildren.map((child) => (
                  <ChildCard
                    key={child.MaTre}
                    child={child}
                    request={request}
                    selected={selectedChildren.some(c => c.MaTre === child.MaTre)}
                    onSelect={handleToggleChild}
                    disabled={meeting !== null}
                  />
                ))}

                {eligibleChildren.length === 0 && (
                  <EmptyState>
                    Không có trẻ phù hợp với điều kiện hiện tại.
                  </EmptyState>
                )}
              </div>
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Tạo lịch gặp mặt"
                description="Lịch gặp dùng để người nhận nuôi tiếp xúc với các trẻ trước khi quyết định gán hồ sơ."
              />

              {selectedChildren.length === 0 && (
                <div className="mt-5">
                  <EmptyState>Cần chọn ít nhất 1 trẻ để tạo lịch gặp.</EmptyState>
                </div>
              )}

              {selectedChildren.length > 0 && !meeting && (
                <form onSubmit={handleCreateMeeting} className="mt-5 grid gap-5">
                  <div>
                    <label className={labelClass}>Các trẻ tham gia ({selectedChildren.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedChildren.map((child) => (
                        <span key={child.MaTre} className="rounded-xl bg-[#EAF3FF] px-3 py-1.5 text-xs font-bold text-[#0D47A1]">
                          {child.HoTen} ({child.MaTre})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Thời gian gặp</label>
                    <input
                      type="datetime-local"
                      required
                      value={meetingForm.thoiGian}
                      onChange={(e) =>
                        setMeetingForm((prev) => ({ ...prev, thoiGian: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Địa điểm</label>
                    <input
                      required
                      value={meetingForm.diaDiem}
                      onChange={(e) =>
                        setMeetingForm((prev) => ({ ...prev, diaDiem: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <button type="submit" disabled={meetingCreating} className={`${primaryButton} w-full`}>
                    {meetingCreating ? 'Đang tạo...' : 'Tạo lịch gặp mặt'}
                  </button>
                </form>
              )}

              {meeting && (
                <div className="mt-5 rounded-2xl border border-[#E1ECF8] bg-[#FAFCFF] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#1F2A3D]">
                      {meeting.maLichGap}
                    </p>
                    <Badge status={meeting.trangThai} size="sm" />
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#5F738F]">
                    {meeting.thoiGian
                      ? new Date(meeting.thoiGian).toLocaleString('vi-VN')
                      : 'Chưa có'}
                  </p>

                  <p className="text-sm leading-7 text-[#5F738F]">
                    {meeting.diaDiem}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMeeting(null);
                        setChildStatuses({});
                      }}
                      className={secondaryButton}
                    >
                      Cập nhật thông tin lịch
                    </button>

                    {meeting.trangThai === 'Đã xác nhận' && (
                      <button
                        type="button"
                        onClick={handleMarkMet}
                        disabled={meetingCreating}
                        className={primaryButton}
                      >
                        {meetingCreating ? 'Đang cập nhật...' : 'Đã gặp mặt'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Đánh giá sau gặp mặt"
                description="Chọn trạng thái cho từng trẻ. Trẻ 'Phù hợp' sẽ được chọn lập hồ sơ."
              />

              {!meeting && (
                <div className="mt-5">
                  <EmptyState>Cần tạo lịch gặp trước khi đánh giá.</EmptyState>
                </div>
              )}

              {meeting && meeting.trangThai !== 'Đã gặp mặt' && (
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Cần xác nhận lịch và thực hiện đánh dấu "Đã gặp mặt" trước khi ghi nhận kết quả đánh giá.
                </p>
              )}

              {canRecordResult && (
                <div className="mt-5 grid gap-5">
                  <div>
                    <label className={labelClass}>Đánh giá từng trẻ</label>
                    <div className="space-y-4">
                      {selectedChildren.map((child) => (
                        <div key={child.MaTre} className="flex flex-col gap-3 rounded-xl border border-[#D7E5F7] p-4 bg-[#FAFCFF]">
                          <p className="text-sm font-bold text-[#26364A]">{child.HoTen} ({child.MaTre})</p>
                          <select
                            value={childStatuses[child.MaTre] || ''}
                            onChange={(e) => handleChildStatusChange(child.MaTre, e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Chọn kết quả đánh giá</option>
                            <option value="Phù hợp">Phù hợp (Gán vào hồ sơ)</option>
                            <option value="Không phù hợp">Không phù hợp</option>
                            <option value="Cần gặp lại">Cần gặp lại</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Ghi chú buổi gặp (cho hồ sơ)</label>
                    <textarea
                      rows={3}
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      className={inputClass}
                      placeholder="Nhập ghi chú chung nếu cần..."
                    />
                  </div>
                </div>
              )}
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Gửi hồ sơ duyệt"
                description="Sau khi đủ điều kiện, hồ sơ sẽ được lập với trẻ đã chọn."
              />

              {submitAttempted && !canSubmitProfile && (
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-700">
                  Cần phải đánh giá ít nhất 1 trẻ là "Phù hợp" trước khi gửi hồ sơ duyệt.
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitProfile}
                disabled={submitting || !canSubmitProfile}
                className={`${primaryButton} mt-5 w-full`}
              >
                {submitting ? 'Đang tạo hồ sơ...' : 'Lập hồ sơ và gửi trưởng phòng duyệt'}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}