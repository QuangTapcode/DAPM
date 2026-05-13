import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import { formatDate } from '../../utils/formatDate';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const shellClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const softCardClass =
  'rounded-[22px] border border-[#E6EDF5] bg-[#FAFCFF]';

const inputClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-white px-4 py-3 text-[15px] text-[#334155] outline-none transition placeholder:text-[#9AA9BE] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const textareaClass =
  'w-full resize-none rounded-2xl border border-[#D9E6F7] bg-white px-4 py-3 text-[15px] text-[#334155] outline-none transition placeholder:text-[#9AA9BE] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const buttonBase =
  'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition';

const REQUEST_STATUS = {
  CHO_XU_LY: 'Chờ xử lý',
  DANG_XEM_XET: 'Đang xem xét',
  DA_TIEP_NHAN: 'Đã tiếp nhận',
  TU_CHOI: 'Từ chối',
  DA_HUY: 'Đã hủy',
};

const DOCUMENT_STATUS = {
  CHO_XAC_MINH: 'Chờ xác minh',
  HOP_LE: 'Hợp lệ',
  KHONG_HOP_LE: 'Không hợp lệ',
  CAN_BO_SUNG: 'Cần bổ sung',
  HET_HAN: 'Hết hạn',
};
const MANAGER_APPROVER = {
  MaNguoiDung: 'ND000004',
  HoTen: 'Trưởng phòng Nguyễn Văn A',
};
const DEMO_REQUEST_DETAIL = {
  MaYeuCauGuiTre: 'YCGT0002',
  MaNguoiGui: 'ND000012',
  MaLoaiNguoiGui: 'CME',
  QuanHeVoiTre: 'Cha ruột',
  LyDoGui: 'Cha/mẹ bệnh nặng, chưa thể chăm sóc trẻ.',
  TrangThaiYC: 'Đã tiếp nhận',
  NgayTao: '2026-04-10T08:30:00',
  NgayCapNhat: '2026-04-10T09:00:00',
  GhiChu: 'Yêu cầu đã được tiếp nhận sau khi xác minh giấy tờ hợp lệ.',

  nguoiGui: {
    MaNguoiDung: 'ND000012',
    HoTen: 'Nguyễn Văn Minh',
    CCCD: '048201012345',
    SoDienThoai: '0905123456',
    Email: 'minh@example.com',
    TenTinhTP: 'Đà Nẵng',
    TenXaPhuong: 'Hải Châu',
    DiaChiCuThe: '12 Nguyễn Văn Linh',
  },

  thongTinTreTam: {
    MaTreTam: 'TTT00002',
    HoTen: 'Nguyễn Minh Khang',
    NgaySinh: '2020-06-12',
    GioiTinh: 'Nam',
    DanToc: 'Kinh',
    TenTinhTP: 'Đà Nẵng',
    TenXaPhuong: 'Hải Châu',
    DiaChiCuThe: '12 Nguyễn Văn Linh',
    TinhTrangSucKhoe: 'Sức khỏe ổn định, cần theo dõi dinh dưỡng.',
  },

  giayTo: [
    {
      MaGiayTo: 'GT000101',
      TenGiayTo: 'Giấy khai sinh của trẻ',
      LoaiGiayTo: 'Giấy khai sinh',
      TrangThai: 'Hợp lệ',
      NgayCapNhat: '2026-04-10T09:00:00',
      GhiChu: '',
    },
    {
      MaGiayTo: 'GT000102',
      TenGiayTo: 'CCCD người gửi trẻ',
      LoaiGiayTo: 'Tùy thân',
      TrangThai: 'Hợp lệ',
      NgayCapNhat: '2026-04-10T09:00:00',
      GhiChu: '',
    },
    {
      MaGiayTo: 'GT000103',
      TenGiayTo: 'Sổ hộ khẩu / giấy tờ cư trú',
      LoaiGiayTo: 'Cư trú',
      TrangThai: 'Hợp lệ',
      NgayCapNhat: '2026-04-10T09:00:00',
      GhiChu: '',
    },
  ],
};

function normalizeRequestStatus(value) {
  const status = String(value || '').trim();

  if (status === 'pending') return REQUEST_STATUS.CHO_XU_LY;
  if (status === 'reviewing') return REQUEST_STATUS.DANG_XEM_XET;
  if (status === 'accepted' || status === 'approved') return REQUEST_STATUS.DA_TIEP_NHAN;
  if (status === 'rejected') return REQUEST_STATUS.TU_CHOI;
  if (status === 'cancelled') return REQUEST_STATUS.DA_HUY;

  return status || REQUEST_STATUS.CHO_XU_LY;
}

function normalizeDocumentStatus(value) {
  const status = String(value || '').trim();

  if (status === 'pending') return DOCUMENT_STATUS.CHO_XAC_MINH;
  if (status === 'valid') return DOCUMENT_STATUS.HOP_LE;
  if (status === 'invalid') return DOCUMENT_STATUS.KHONG_HOP_LE;
  if (status === 'need_supplement') return DOCUMENT_STATUS.CAN_BO_SUNG;

  return status || DOCUMENT_STATUS.CHO_XAC_MINH;
}

function getGenderText(value) {
  if (!value) return 'Chưa cập nhật';

  const gender = String(value).toLowerCase();

  if (gender === 'male' || gender === 'nam') return 'Nam';
  if (gender === 'female' || gender === 'nữ' || gender === 'nu') return 'Nữ';

  return value;
}

function calculateAge(dateString) {
  if (!dateString) return '—';

  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return '—';

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age} tuổi` : '—';
}

function joinAddress(detail, ward, province) {
  return [detail, ward, province].filter(Boolean).join(', ') || 'Chưa cập nhật';
}

function getSenderTypeLabel(code) {
  const map = {
    CME: 'Cha hoặc mẹ ruột',
    NTH: 'Người thân',
    CQDP: 'Cơ quan địa phương',
  };

  return map[code] || code || 'Chưa cập nhật';
}

function mapDocument(doc, index) {
  if (typeof doc === 'string') {
    return {
      MaGiayTo: `DOC-${index}`,
      TenGiayTo: doc,
      LoaiGiayTo: 'Giấy tờ',
      TrangThai: DOCUMENT_STATUS.CHO_XAC_MINH,
      NgayCapNhat: '',
      GhiChu: '',
    };
  }

  return {
    MaGiayTo: doc.MaGiayTo || doc.id || `DOC-${index}`,
    TenGiayTo:
      doc.TenGiayTo ||
      doc.name ||
      doc.fileName ||
      doc.tenFile ||
      `Giấy tờ ${index + 1}`,
    LoaiGiayTo: doc.LoaiGiayTo || doc.type || doc.documentType || 'Giấy tờ',
    TrangThai: normalizeDocumentStatus(doc.TrangThai || doc.status),
    NgayCapNhat: doc.NgayCapNhat || doc.updatedAt || '',
    GhiChu: doc.GhiChu || doc.note || '',
  };
}

function mapRequestDetail(item) {
  if (!item) return null;

  const sender = item.nguoiGui || item.NguoiGui || {};
  const child = item.thongTinTreTam || item.ThongTinTreTam || item.treTam || {};
  const rawDocs = item.giayTo || item.GiayTo || item.documents || [];

  return {
    id: item.MaYeuCauGuiTre || item.id,
    MaYeuCauGuiTre: item.MaYeuCauGuiTre || item.id || '',
    MaLoaiNguoiGui: item.MaLoaiNguoiGui || item.senderTypeCode || '',
    QuanHeVoiTre: item.QuanHeVoiTre || item.relationship || '',
    LyDoGui: item.LyDoGui || item.reason || '',
    TrangThaiYC: normalizeRequestStatus(item.TrangThaiYC || item.status),
    NgayTao: item.NgayTao || item.createdAt || '',
    NgayCapNhat: item.NgayCapNhat || item.updatedAt || '',
    GhiChuYeuCau: item.GhiChu || item.note || '',

    nguoiGui: {
      MaNguoiGui:
        item.MaNguoiGui ||
        sender.MaNguoiDung ||
        sender.id ||
        sender.MaNguoiGui ||
        '',
      HoTen:
        sender.HoTen ||
        sender.hoTen ||
        item.TenNguoiGui ||
        item.senderName ||
        '',
      CCCD:
        sender.CCCD ||
        sender.SoCCCD ||
        item.senderIdentityNumber ||
        item.senderCccd ||
        '',
      SoDienThoai:
        sender.SoDienThoai ||
        sender.phone ||
        item.senderPhone ||
        '',
      Email: sender.Email || sender.email || item.senderEmail || '',
      TenTinhTP: sender.TenTinhTP || item.senderProvinceName || '',
      TenXaPhuong: sender.TenXaPhuong || item.senderWardName || '',
      DiaChiCuThe: sender.DiaChiCuThe || item.senderAddressDetail || '',
    },

    tre: {
      MaTreTam: child.MaTreTam || child.id || '',
      HoTen:
        child.HoTen ||
        child.hoTen ||
        item.TenTreTam ||
        item.childName ||
        '',
      NgaySinh:
        child.NgaySinh ||
        child.ngaySinh ||
        item.childBirthDate ||
        '',
      GioiTinh:
        child.GioiTinh ||
        child.gioiTinh ||
        item.childGender ||
        '',
      DanToc:
        child.DanToc ||
        child.danToc ||
        item.childEthnicity ||
        '',
      TenTinhTP: child.TenTinhTP || item.childProvinceName || '',
      TenXaPhuong: child.TenXaPhuong || item.childWardName || '',
      DiaChiCuThe: child.DiaChiCuThe || item.childAddressDetail || '',
      TinhTrangSucKhoe:
        child.TinhTrangSucKhoe ||
        child.tinhTrangSucKhoe ||
        item.childHealthStatus ||
        '',
    },

    documents: Array.isArray(rawDocs) ? rawDocs.map(mapDocument) : [],
  };
}

function SectionBlock({ number, title, subtitle, children }) {
  return (
    <section className="border-b border-[#E4EAF2] px-6 py-7 last:border-b-0 lg:px-8">
      <div className="mb-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[20px] font-black text-[#0D47A1]">
            {number}.
          </span>

          <h2 className="text-[20px] font-bold text-[#0D47A1]">
            {title}
          </h2>
        </div>

        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-[#7D90AA]">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function DisplayField({ label, value, wide = false }) {
  return (
    <div className={`${softCardClass} px-5 py-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
        {label}
      </p>

      <p className="break-words text-sm font-semibold leading-7 text-[#26364A]">
        {value || 'Chưa cập nhật'}
      </p>
    </div>
  );
}

function TextBlock({ label, value }) {
  return (
    <div className={`${softCardClass} px-5 py-4 md:col-span-2`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
        {label}
      </p>

      <p className="min-h-[92px] whitespace-pre-line text-sm font-semibold leading-7 text-[#26364A]">
        {value || 'Chưa cập nhật'}
      </p>
    </div>
  );
}

function MiniStatus({ value, tone = 'blue' }) {
  const toneMap = {
    blue: 'bg-[#EAF3FF] text-[#0D47A1]',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    gray: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneMap[tone]}`}>
      {value}
    </span>
  );
}

function DocumentItem({ item }) {
  const tone =
    item.TrangThai === DOCUMENT_STATUS.HOP_LE
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : item.TrangThai === DOCUMENT_STATUS.KHONG_HOP_LE
        ? 'bg-red-50 text-red-700 border-red-200'
        : item.TrangThai === DOCUMENT_STATUS.CAN_BO_SUNG
          ? 'bg-orange-50 text-orange-700 border-orange-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="rounded-[20px] border border-[#E6EDF5] bg-[#FAFCFF] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-bold text-[#26364A]">{item.TenGiayTo}</p>

          <p className="mt-1 text-sm text-[#7D90AA]">
            {item.MaGiayTo} · {item.LoaiGiayTo}
          </p>

          {item.GhiChu && (
            <p className="mt-2 text-sm leading-6 text-[#5F738F]">
              {item.GhiChu}
            </p>
          )}
        </div>

        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${tone}`}>
          {item.TrangThai}
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#EEF3F9] py-3 last:border-b-0">
      <span className="text-sm text-[#7D90AA]">{label}</span>
      <span className="text-right text-sm font-bold text-[#26364A]">
        {value || '—'}
      </span>
    </div>
  );
}

export default function CreateReceptionProfile() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const stateRequest = location.state?.request || null;

  const { data: raw, loading } = useFetch(
    () => (requestId && !stateRequest ? receptionApi.getById(requestId) : Promise.resolve(null)),
    [requestId, stateRequest]
  );

  const sourceRequest =
    stateRequest || raw || (!loading ? DEMO_REQUEST_DETAIL : null);

  const request = useMemo(() => mapRequestDetail(sourceRequest), [sourceRequest]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      NgayTiepNhan: new Date().toISOString().slice(0, 10),
      GhiChu: '',
    },
  });

  useEffect(() => {
    reset({
      NgayTiepNhan: new Date().toISOString().slice(0, 10),
      GhiChu: '',
    });
  }, [reset, requestId]);

  const allDocumentsValid =
    request?.documents?.length > 0 &&
    request.documents.every((doc) => doc.TrangThai === DOCUMENT_STATUS.HOP_LE);

  const canSubmit =
    !!request &&
    request.TrangThaiYC === REQUEST_STATUS.DA_TIEP_NHAN &&
    allDocumentsValid;

  const createMockReceptionProfile = (formData) => {
    const newProfile = {
      MaHSTiepNhan: `HSTN${String(Date.now()).slice(-4)}`,
      MaYeuCauGuiTre: request.MaYeuCauGuiTre,
      MaTre: null,

      MaCanBoTiepNhan: MANAGER_APPROVER.MaNguoiDung,
      TenCanBoTiepNhan: MANAGER_APPROVER.HoTen,

      NgayTiepNhan: formData.NgayTiepNhan,
      NgayDuyet: null,
      TrangThai: 'Chờ duyệt',
      GhiChu: formData.GhiChu || '',

      TenTreTam: request.tre.HoTen,
      TenNguoiGui: request.nguoiGui.HoTen,

      yeuCauGuiTre: {
        MaYeuCauGuiTre: request.MaYeuCauGuiTre,
        MaNguoiGui: request.nguoiGui.MaNguoiGui,
        MaLoaiNguoiGui: request.MaLoaiNguoiGui,
        QuanHeVoiTre: request.QuanHeVoiTre,
        LyDoGui: request.LyDoGui,
        TrangThaiYC: REQUEST_STATUS.DA_TIEP_NHAN,
        NgayTao: request.NgayTao,
        NgayCapNhat: request.NgayCapNhat,
      },

      nguoiGui: request.nguoiGui,
      thongTinTreTam: request.tre,
      tre: null,
      giayTo: request.documents,
    };

    const savedProfiles = JSON.parse(
      localStorage.getItem('mock_reception_profiles') || '[]'
    );

    localStorage.setItem(
      'mock_reception_profiles',
      JSON.stringify([newProfile, ...savedProfiles])
    );

    return newProfile;
  };

  const onSubmit = async (formData) => {
    if (!canSubmit) return;

    if (typeof receptionApi.createReceptionProfile === 'function') {
      const res = await receptionApi.createReceptionProfile({
        MaYeuCauGuiTre: request.MaYeuCauGuiTre,
        MaCanBoTiepNhan: MANAGER_APPROVER.MaNguoiDung,
        NgayTiepNhan: formData.NgayTiepNhan,
        GhiChu: formData.GhiChu || null,
      });

      navigate('/can-bo-tiep-nhan/ho-so-tiep-nhan', {
        replace: true,
        state: {
          message: 'Tạo hồ sơ tiếp nhận thành công. Hồ sơ đang chờ duyệt.',
          createdProfileId: res?.MaHSTiepNhan,
        },
      });

      return;
    }

    const newProfile = createMockReceptionProfile(formData);

    navigate('/can-bo-tiep-nhan/ho-so-tiep-nhan', {
      replace: true,
      state: {
        message: 'Tạo hồ sơ tiếp nhận thành công. Hồ sơ đang chờ duyệt.',
        createdProfileId: newProfile.MaHSTiepNhan,
      },
    });
  };

  if (loading && !stateRequest) {
    return (
      <div className="py-16 text-center text-sm text-[#64748B]">
        Đang tải thông tin lập hồ sơ tiếp nhận...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-16 text-center text-sm text-red-500">
        Không tìm thấy yêu cầu gửi trẻ.
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Cán bộ tiếp nhận trẻ
            </p>

            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Lập hồ sơ tiếp nhận trẻ
            </h1>
          </div>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-8 xl:grid-cols-12"
        >
          <main className="xl:col-span-8">
            <section className={`${shellClass} overflow-hidden`}>
              <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 lg:px-8">
                <div className="text-center">
                  <h2 className="mt-3 text-[28px] font-bold uppercase tracking-wide text-[#0D47A1]">
                    Hồ sơ tiếp nhận trẻ
                  </h2>
                </div>

                <div className="mt-6 grid gap-3 border-t border-[#E4EAF2] pt-5 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Mã hồ sơ
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-[#0D47A1]">
                      Sẽ cấp sau khi tạo
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Mã yêu cầu
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#26364A]">
                      {request.MaYeuCauGuiTre}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Trạng thái sau khi gửi
                    </p>
                    <div className="mt-2">
                      <MiniStatus value="Chờ duyệt" tone="amber" />
                    </div>
                  </div>
                </div>
              </div>

              <SectionBlock
                number="I"
                title="Thông tin hồ sơ tiếp nhận"
                subtitle="Thông tin hành chính được ghi nhận khi tạo hồ sơ."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DisplayField label="Mã yêu cầu gửi trẻ" value={request.MaYeuCauGuiTre} />
                  <DisplayField label="Trạng thái yêu cầu" value={request.TrangThaiYC} />

                  <div className={`${softCardClass} px-5 py-4`}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Ngày tiếp nhận
                    </p>
                    <input
                      type="date"
                      {...register('NgayTiepNhan', { required: true })}
                      className={inputClass}
                    />
                  </div>

                  <DisplayField
                    label="Người duyệt hồ sơ"
                    value={MANAGER_APPROVER.HoTen}
                  />
                </div>
              </SectionBlock>

              <SectionBlock
                number="II"
                title="Thông tin người gửi trẻ"
                subtitle="Thông tin lấy từ yêu cầu gửi trẻ, không nhập lại ở bước lập hồ sơ."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DisplayField label="Mã người gửi" value={request.nguoiGui.MaNguoiGui} />
                  <DisplayField label="Họ và tên" value={request.nguoiGui.HoTen} />
                  <DisplayField
                    label="Loại người gửi"
                    value={getSenderTypeLabel(request.MaLoaiNguoiGui)}
                  />
                  <DisplayField label="Quan hệ với trẻ" value={request.QuanHeVoiTre} />
                  <DisplayField label="Số CCCD" value={request.nguoiGui.CCCD} />
                  <DisplayField label="Số điện thoại" value={request.nguoiGui.SoDienThoai} />
                  <DisplayField label="Email" value={request.nguoiGui.Email} />
                  <DisplayField
                    label="Địa chỉ"
                    value={joinAddress(
                      request.nguoiGui.DiaChiCuThe,
                      request.nguoiGui.TenXaPhuong,
                      request.nguoiGui.TenTinhTP
                    )}
                    wide
                  />
                </div>
              </SectionBlock>

              <SectionBlock
                number="III"
                title="Thông tin trẻ"
                subtitle="Thông tin trẻ được lấy từ yêu cầu gửi trẻ đã tiếp nhận."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <DisplayField label="Tên trẻ" value={request.tre.HoTen} />
                  <DisplayField
                    label="Ngày sinh"
                    value={request.tre.NgaySinh ? formatDate(request.tre.NgaySinh) : ''}
                  />
                  <DisplayField label="Tuổi" value={calculateAge(request.tre.NgaySinh)} />
                  <DisplayField label="Giới tính" value={getGenderText(request.tre.GioiTinh)} />
                  <DisplayField label="Dân tộc" value={request.tre.DanToc} />
                  <DisplayField
                    label="Nơi ở hiện tại"
                    value={joinAddress(
                      request.tre.DiaChiCuThe,
                      request.tre.TenXaPhuong,
                      request.tre.TenTinhTP
                    )}
                    wide
                  />
                  <TextBlock
                    label="Tình trạng sức khỏe ban đầu"
                    value={request.tre.TinhTrangSucKhoe}
                  />
                </div>
              </SectionBlock>

              <SectionBlock
                number="IV"
                title="Căn cứ lập hồ sơ"
                subtitle="Lý do gửi trẻ và giấy tờ pháp lý đã được kiểm tra từ yêu cầu."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TextBlock label="Lý do gửi trẻ" value={request.LyDoGui} />
                  <TextBlock label="Ghi chú yêu cầu" value={request.GhiChuYeuCau} />
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#0D47A1]" />
                    <h3 className="text-[16px] font-bold text-[#0D47A1]">
                      Danh mục giấy tờ pháp lý
                    </h3>
                  </div>

                  {request.documents.length > 0 ? (
                    <div className="space-y-3">
                      {request.documents.map((item) => (
                        <DocumentItem key={item.MaGiayTo} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#D7E1EE] bg-[#FAFCFF] px-6 py-10 text-center text-sm font-semibold text-[#8FA0B8]">
                      Chưa có giấy tờ pháp lý đính kèm.
                    </div>
                  )}
                </div>
              </SectionBlock>

              <SectionBlock
                number="V"
                title="Ghi nhận của cán bộ tiếp nhận"
                subtitle="Chỉ nhập nội dung thuộc hồ sơ tiếp nhận, không chỉnh sửa dữ liệu nguồn của yêu cầu."
              >
                <div className={`${softCardClass} px-5 py-4`}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                    Ghi chú hồ sơ
                  </p>

                  <textarea
                    rows={5}
                    {...register('GhiChu')}
                    className={textareaClass}
                    placeholder="Nhập ghi chú tiếp nhận, tình trạng thực tế hoặc nội dung cần lưu ý..."
                  />
                </div>
              </SectionBlock>
            </section>
          </main>

          <aside className="xl:col-span-4">
            <div className="space-y-6 xl:sticky xl:top-24">
              <section className={`${shellClass} p-6`}>
                <h3 className="text-[20px] font-bold text-[#0D47A1]">
                  Tóm tắt trước khi gửi
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#7D90AA]">
                  Kiểm tra nhanh thông tin hồ sơ trước khi gửi.
                </p>

                <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                  <SummaryRow label="Mã yêu cầu" value={request.MaYeuCauGuiTre} />
                  <SummaryRow label="Người gửi" value={request.nguoiGui.HoTen} />
                  <SummaryRow label="Tên trẻ" value={request.tre.HoTen} />
                  <SummaryRow
                    label="Ngày tạo yêu cầu"
                    value={request.NgayTao ? formatDate(request.NgayTao) : ''}
                  />
                  <SummaryRow
                    label="Giấy tờ hợp lệ"
                    value={allDocumentsValid ? 'Đạt' : 'Chưa đạt'}
                  />
                  <SummaryRow label="Trạng thái sau khi gửi" value="Chờ duyệt" />
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`${buttonBase} bg-[#0D47A1] text-white hover:bg-[#083778] disabled:cursor-not-allowed disabled:bg-slate-300`}
                  >
                    <CheckCircle2 size={17} />
                    {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ chờ duyệt'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className={`${buttonBase} border border-[#CFE0F5] bg-white text-[#0D47A1] hover:bg-[#F4F8FF]`}
                  >
                    <ArrowLeft size={17} />
                    Quay lại
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}