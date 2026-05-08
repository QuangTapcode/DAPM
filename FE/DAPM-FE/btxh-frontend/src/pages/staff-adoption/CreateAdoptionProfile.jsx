import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
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

const fallbackRequest = {
  MaYeuCauNhan: 'YCNN0004',
  MaHoSoNhanNuoi: '',
  TenNguoiNhan: 'Lê Thanh Mai',
  SDTNguoiNhan: '0987654321',
  NgaySinhNguoiNhan: '1988-03-10',
  NgheNghiep: 'Giáo viên',
  ThuNhapHangThang: 22000000,
  LyDoNhanNuoi:
    'Người nhận nuôi có mong muốn xây dựng gia đình và chăm sóc trẻ lâu dài.',
  MongMuonVeTre:
    'Không yêu cầu cụ thể, ưu tiên trẻ phù hợp sau khi trung tâm tư vấn.',
  TrangThai: 'Chờ ghép trẻ',
  SoGiayTo: 4,
  SoGiayToHopLe: 4,
  GiayTo: [
    {
      MaGiayTo: 'GT000009',
      TenGiayTo: 'Ảnh CCCD người nhận nuôi',
      LoaiGiayTo: 'Tùy thân',
      TrangThai: 'Hợp lệ',
      DuongDanFile: '/uploads/giayto/ycnn0004/cccd.jpg',
    },
    {
      MaGiayTo: 'GT000010',
      TenGiayTo: 'Giấy khám sức khỏe',
      LoaiGiayTo: 'Sức khỏe',
      TrangThai: 'Hợp lệ',
      DuongDanFile: '/uploads/giayto/ycnn0004/suc-khoe.pdf',
    },
    {
      MaGiayTo: 'GT000011',
      TenGiayTo: 'Giấy xác nhận tình trạng hôn nhân',
      LoaiGiayTo: 'Hôn nhân',
      TrangThai: 'Hợp lệ',
      DuongDanFile: '/uploads/giayto/ycnn0004/hon-nhan.pdf',
    },
    {
      MaGiayTo: 'GT000012',
      TenGiayTo: 'Minh chứng thu nhập',
      LoaiGiayTo: 'Tài chính',
      TrangThai: 'Hợp lệ',
      DuongDanFile: '/uploads/giayto/ycnn0004/thu-nhap.pdf',
    },
  ],
};

const fallbackChildren = [
  {
    MaTre: 'TRE00012',
    HoTen: 'Bé An',
    NgaySinh: '2020-04-12',
    GioiTinh: 'Nam',
    SucKhoe: 'Ổn định',
    TrangThai: 'Chờ nhận nuôi',
    GhiChu: 'Phù hợp với điều kiện chăm sóc hiện tại.',
  },
  {
    MaTre: 'TRE00015',
    HoTen: 'Bé Minh',
    NgaySinh: '2019-08-20',
    GioiTinh: 'Nam',
    SucKhoe: 'Ổn định',
    TrangThai: 'Chờ nhận nuôi',
    GhiChu: 'Phù hợp về độ tuổi và sức khỏe.',
  },
  {
    MaTre: 'TRE00018',
    HoTen: 'Bé Lan',
    NgaySinh: '2018-11-02',
    GioiTinh: 'Nữ',
    SucKhoe: 'Ổn định',
    TrangThai: 'Chờ nhận nuôi',
    GhiChu: 'Cần trao đổi thêm trong buổi gặp mặt.',
  },
];

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

function isAtLeast20YearsOlder(adopterBirthDate, childBirthDate) {
  if (!adopterBirthDate || !childBirthDate) return false;

  const adopterDate = new Date(adopterBirthDate);
  const childDate = new Date(childBirthDate);

  const minChildBirthDate = new Date(adopterDate);
  minChildBirthDate.setFullYear(minChildBirthDate.getFullYear() + 20);

  return childDate >= minChildBirthDate;
}

function getFileUrl(path) {
  if (!path) return '';

  if (
    path.startsWith('http') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';

  return `${baseUrl}${path}`;
}

function normalizeRequest(req, requestId) {
  return {
    MaYeuCauNhan: req.MaYeuCauNhan || req.id || requestId,
    MaHoSoNhanNuoi: req.MaHoSoNhanNuoi || '',
    TenNguoiNhan: req.TenNguoiNhan || req.adopterName || '',
    SDTNguoiNhan: req.SDTNguoiNhan || req.phone || '',
    NgaySinhNguoiNhan:
      req.NgaySinhNguoiNhan || req.birthDate || req.dateOfBirth || '',
    NgheNghiep: req.NgheNghiep || req.job || '',
    ThuNhapHangThang: req.ThuNhapHangThang ?? req.monthlyIncome,
    LyDoNhanNuoi: req.LyDoNhanNuoi || req.motivation || '',
    MongMuonVeTre: req.MongMuonVeTre || req.expectedChild || '',
    TrangThai: req.TrangThai || req.status || 'Chờ ghép trẻ',
    SoGiayTo: req.SoGiayTo ?? 4,
    SoGiayToHopLe: req.SoGiayToHopLe ?? 4,
    GiayTo: req.GiayTo || req.documents || fallbackRequest.GiayTo,
  };
}

function getProfileStatus(selectedChild, meeting, meetingResult) {
  if (!selectedChild) return 'Chưa gán trẻ';
  if (!meeting) return 'Chưa tạo lịch gặp';
  if (meeting.TrangThai !== 'Đã xác nhận') return 'Chờ xác nhận lịch';
  if (!meetingResult.result) return 'Chưa ghi nhận kết quả';
  if (meetingResult.result === 'Phù hợp') return 'Đủ điều kiện gửi duyệt';
  if (meetingResult.result === 'Cần gặp lại') return 'Cần gặp lại';
  return 'Không đủ điều kiện';
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
        className={`text-sm leading-7 ${strong ? 'font-bold text-[#0D47A1]' : 'font-semibold text-[#26364A]'
          }`}
      >
        {value || 'Chưa có'}
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

function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null;

  const fileUrl = getFileUrl(document.DuongDanFile);
  const lowerUrl = String(fileUrl || '').toLowerCase();

  const isImage =
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.webp');

  const isPdf = lowerUrl.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E4EAF2] px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-[#1F2A3D]">
              {document.TenGiayTo}
            </h3>
            <p className="mt-1 text-sm text-[#7D90AA]">
              {document.MaGiayTo} · {document.LoaiGiayTo}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D7E1EE] px-4 py-2 text-sm font-bold text-[#5F738F] transition hover:bg-[#F6F8FC]"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-[#F6F8FC] p-5">
          {!fileUrl && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-[#7D90AA]">
              Chưa có file giấy tờ để xem.
            </div>
          )}

          {fileUrl && isImage && (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={document.TenGiayTo}
                className="max-h-[72vh] max-w-full rounded-2xl border border-[#D7E1EE] bg-white object-contain"
              />
            </div>
          )}

          {fileUrl && isPdf && (
            <iframe
              src={fileUrl}
              title={document.TenGiayTo}
              className="h-[72vh] w-full rounded-2xl border border-[#D7E1EE] bg-white"
            />
          )}

          {fileUrl && !isImage && !isPdf && (
            <div className="rounded-2xl border border-[#D7E1EE] bg-white p-8 text-center">
              <p className="text-sm text-[#7D90AA]">
                Định dạng này không xem trực tiếp được trên trình duyệt.
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#083778]"
              >
                Mở file trong tab mới
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, request, selected, onSelect }) {
  const childAge = getAge(child.NgaySinh);
  const ageGap = getAgeGap(request.NgaySinhNguoiNhan, child.NgaySinh);

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
          <p className="font-bold text-[#26364A]">{child.GioiTinh}</p>
        </div>

        <div className="rounded-2xl bg-[#F6F8FC] px-3 py-2">
          <p className="text-xs text-[#8FA0B8]">Sức khỏe</p>
          <p className="font-bold text-[#26364A]">{child.SucKhoe}</p>
        </div>

        <div className="rounded-2xl bg-green-50 px-3 py-2">
          <p className="text-xs text-green-700">Chênh tuổi</p>
          <p className="font-bold text-green-700">{ageGap} tuổi</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#7D90AA]">{child.GhiChu}</p>

      <button
        type="button"
        onClick={() => onSelect(child)}
        className={`${primaryButton} mt-5 w-full`}
      >
        Gán trẻ vào hồ sơ
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

  const [request, setRequest] = useState(fallbackRequest);
  const [selectedChild, setSelectedChild] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [meeting, setMeeting] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    meetingDate: '',
    meetingTime: '',
    location: 'Phòng tư vấn nhận nuôi - Trung tâm',
    officer: 'Cán bộ nhận nuôi',
    note: '',
  });

  const [meetingResult, setMeetingResult] = useState({
    result: '',
    note: '',
  });

  const [staffNote, setStaffNote] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    adoptionApi
      .getById(requestId)
      .then((req) => {
        setRequest(normalizeRequest(req, requestId));
      })
      .catch(() => {
        setRequest((prev) => ({
          ...prev,
          MaYeuCauNhan: requestId,
        }));
      });
  }, [requestId]);

  const eligibleChildren = useMemo(() => {
    return fallbackChildren.filter(
      (child) =>
        child.TrangThai === 'Chờ nhận nuôi' &&
        isAtLeast20YearsOlder(request.NgaySinhNguoiNhan, child.NgaySinh)
    );
  }, [request]);

  const profileStatus = getProfileStatus(
    selectedChild,
    meeting,
    meetingResult
  );

  const canRecordResult = meeting && meeting.TrangThai === 'Đã xác nhận';

  const canSubmitProfile =
    selectedChild &&
    meeting &&
    meeting.TrangThai === 'Đã xác nhận' &&
    meetingResult.result === 'Phù hợp';

  const officerName =
    user?.HoTen || user?.fullName || user?.TenNguoiDung || 'Cán bộ nhận nuôi';

  function handleSelectChild(child) {
    setSelectedChild(child);
    setMeeting(null);
    setMeetingResult({ result: '', note: '' });
  }

  function handleCreateMeeting(e) {
    e.preventDefault();

    if (!selectedChild) return;

    setMeeting({
      MaLichGap: `LHGM${String(Date.now()).slice(-4)}`,
      MaYeuCauNhan: request.MaYeuCauNhan,
      MaTre: selectedChild.MaTre,
      TenTre: selectedChild.HoTen,
      TrangThai: 'Chờ xác nhận',
      ...meetingForm,
    });
  }

  function handleSubmitProfile() {
    setSubmitAttempted(true);

    if (!canSubmitProfile) return;

    const payload = {
      MaYeuCauNhan: request.MaYeuCauNhan,
      MaTre: selectedChild.MaTre,
      MaCanBoLap:
        user?.MaNguoiDung || user?.maNguoiDung || user?.id || 'ND000005',
      NgayLap: new Date().toISOString().split('T')[0],
      TrangThai: 'Chờ duyệt',
      GhiChu: staffNote,
    };

    adoptionApi
      .update(request.MaYeuCauNhan, {
        type: 'profile',
        ...payload,
      })
      .catch((error) => {
        console.error('Tạm thời mock lập hồ sơ:', error);
      })
      .finally(() => {
        navigate('/can-bo-nhan-nuoi/ho-so');
      });
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
            </div>          </div>

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
                      label="Nghề nghiệp"
                      value={request.NgheNghiep}
                    />

                    <ReadOnlyField
                      label="Thu nhập hàng tháng"
                      value={formatCurrency(request.ThuNhapHangThang)}
                    />

                    <ReadOnlyField
                      label="Giấy tờ pháp lý"
                      value={`${request.SoGiayToHopLe}/${request.SoGiayTo} giấy tờ hợp lệ`}
                    />
                  </div>
                </section>

                <section>
                  <SectionTitle number="III" title="Giấy tờ pháp lý đã xác minh" />

                  <div className="mt-5 divide-y divide-[#E6EDF5] overflow-hidden rounded-2xl border border-[#E6EDF5]">
                    {(request.GiayTo || []).map((doc) => (
                      <div
                        key={doc.MaGiayTo}
                        className="flex flex-col justify-between gap-4 bg-[#FAFCFF] px-5 py-4 transition hover:bg-white md:flex-row md:items-center"
                      >
                        <div>
                          <p className="font-bold text-[#26364A]">
                            {doc.TenGiayTo}
                          </p>
                          <p className="mt-1 text-sm text-[#7D90AA]">
                            {doc.MaGiayTo} · {doc.LoaiGiayTo}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge status={doc.TrangThai} size="sm" />

                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            disabled={!doc.DuongDanFile}
                            className="rounded-xl border border-[#CFE0F5] bg-white px-3 py-2 text-xs font-bold text-[#0D47A1] hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Xem file
                          </button>
                        </div>
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
                      label="Sức khỏe"
                      value={selectedChild?.SucKhoe || ''}
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
                description="Chỉ hiển thị trẻ đang chờ nhận nuôi và người nhận nuôi hơn trẻ tối thiểu 20 tuổi."
              />

              <div className="mt-5 max-h-[680px] space-y-4 overflow-y-auto pr-1">
                {eligibleChildren.map((child) => (
                  <ChildCard
                    key={child.MaTre}
                    child={child}
                    request={request}
                    selected={selectedChild?.MaTre === child.MaTre}
                    onSelect={handleSelectChild}
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
                description="Lịch gặp dùng để xác nhận trước khi lập hồ sơ."
              />

              {!selectedChild && (
                <div className="mt-5">
                  <EmptyState>Cần gán trẻ vào hồ sơ trước khi tạo lịch gặp.</EmptyState>
                </div>
              )}

              {selectedChild && !meeting && (
                <form onSubmit={handleCreateMeeting} className="mt-5 grid gap-5">
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
                      rows={4}
                      value={meetingForm.note}
                      onChange={(e) =>
                        setMeetingForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Nhập ghi chú nếu có..."
                    />
                  </div>

                  <button type="submit" className={`${primaryButton} w-full`}>
                    Tạo lịch gặp mặt
                  </button>
                </form>
              )}

              {meeting && (
                <div className="mt-5 rounded-2xl border border-[#E1ECF8] bg-[#FAFCFF] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#1F2A3D]">
                      {meeting.MaLichGap}
                    </p>
                    <Badge status={meeting.TrangThai} size="sm" />
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#5F738F]">
                    {meeting.meetingDate} · {meeting.meetingTime}
                  </p>

                  <p className="text-sm leading-7 text-[#5F738F]">
                    {meeting.location}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMeeting(null);
                        setMeetingResult({ result: '', note: '' });
                      }}
                      className={secondaryButton}
                    >
                      Cập nhật lịch
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMeeting((prev) => ({
                          ...prev,
                          TrangThai: 'Đã xác nhận',
                        }))
                      }
                      className={primaryButton}
                    >
                      Xác nhận lịch
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Ghi nhận kết quả gặp mặt"
                description="Chỉ kết quả phù hợp mới cho phép gửi hồ sơ duyệt."
              />

              {!meeting && (
                <div className="mt-5">
                  <EmptyState>Cần tạo lịch gặp trước khi ghi nhận kết quả.</EmptyState>
                </div>
              )}

              {meeting && meeting.TrangThai !== 'Đã xác nhận' && (
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  Cần xác nhận lịch gặp trước khi ghi nhận kết quả.
                </p>
              )}

              {canRecordResult && (
                <div className="mt-5 grid gap-5">
                  <div>
                    <label className={labelClass}>Kết quả</label>
                    <select
                      value={meetingResult.result}
                      onChange={(e) =>
                        setMeetingResult((prev) => ({
                          ...prev,
                          result: e.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">Chọn kết quả</option>
                      <option value="Phù hợp">Phù hợp</option>
                      <option value="Không phù hợp">Không phù hợp</option>
                      <option value="Cần gặp lại">Cần gặp lại</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Ghi chú kết quả</label>
                    <textarea
                      rows={4}
                      value={meetingResult.note}
                      onChange={(e) =>
                        setMeetingResult((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className={inputClass}
                      placeholder="Nhập nhận xét sau buổi gặp..."
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Ghi chú cán bộ</label>
                    <textarea
                      rows={4}
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      className={inputClass}
                      placeholder="Nhập ghi chú nếu cần..."
                    />
                  </div>
                </div>
              )}
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle
                title="Gửi hồ sơ duyệt"
                description="Hồ sơ lưu theo đúng CSDL: mã yêu cầu, mã trẻ, cán bộ lập, ngày lập, trạng thái và ghi chú."
              />

              {submitAttempted && !canSubmitProfile && (
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-700">
                  Cần gán trẻ, xác nhận lịch gặp và ghi nhận kết quả phù hợp
                  trước khi gửi hồ sơ duyệt.
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmitProfile}
                className={`${primaryButton} mt-5 w-full`}
              >
                Lập hồ sơ và gửi trưởng phòng duyệt
              </button>
            </section>
          </aside>
        </div>
      </div>

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}