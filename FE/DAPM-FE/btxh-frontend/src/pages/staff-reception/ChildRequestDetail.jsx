import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import { formatDate } from '../../utils/formatDate';
import { useBasePath } from '../../hooks/useBasePath';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const softCardClass =
  'rounded-[22px] border border-[#E6EDF5] bg-[#FAFCFF]';

const buttonBase =
  'inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition';

const STATUS_DB = {
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

const STATUS_META = {
  [STATUS_DB.CHO_XU_LY]: {
    label: 'Chờ xử lý',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [STATUS_DB.DANG_XEM_XET]: {
    label: 'Đang xem xét',
    cls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [STATUS_DB.DA_TIEP_NHAN]: {
    label: 'Đã tiếp nhận',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [STATUS_DB.TU_CHOI]: {
    label: 'Từ chối',
    cls: 'bg-red-50 text-red-700 border-red-200',
  },
  [STATUS_DB.DA_HUY]: {
    label: 'Đã hủy',
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const DOCUMENT_STATUS_META = {
  [DOCUMENT_STATUS.CHO_XAC_MINH]: {
    label: 'Chờ xác minh',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [DOCUMENT_STATUS.HOP_LE]: {
    label: 'Hợp lệ',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [DOCUMENT_STATUS.KHONG_HOP_LE]: {
    label: 'Không hợp lệ',
    cls: 'bg-red-50 text-red-700 border-red-200',
  },
  [DOCUMENT_STATUS.CAN_BO_SUNG]: {
    label: 'Cần bổ sung',
    cls: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  [DOCUMENT_STATUS.HET_HAN]: {
    label: 'Hết hạn',
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const SENDER_TYPE_LABEL = {
  CME: 'Cha hoặc mẹ ruột',
  NTH: 'Người thân',
  CQDP: 'Cơ quan địa phương',
};

const DEMO_REQUEST_DETAIL = {
  MaYeuCauGuiTre: 'YCGT0002',
  MaNguoiGui: 'ND000012',
  TenNguoiGui: 'Nguyễn Văn Minh',
  MaLoaiNguoiGui: 'CME',
  QuanHeVoiTre: 'Cha ruột',
  LyDoGui: 'Cha/mẹ bệnh nặng, chưa thể chăm sóc trẻ.',
  NgayTao: '2026-04-10T08:30:00',
  NgayCapNhat: '2026-04-10T09:00:00',
  TrangThaiYC: 'Đang xem xét',
  GhiChu: 'Đang kiểm tra thông tin trẻ tạm và giấy tờ pháp lý.',

  nguoiGui: {
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
      DuongDanFile: '/uploads/giayto/ycgt0002/giay-khai-sinh.pdf',
      TrangThai: 'Hợp lệ',
      NgayCapNhat: '2026-04-10T09:00:00',
      GhiChu: '',
    },
    {
      MaGiayTo: 'GT000102',
      TenGiayTo: 'CCCD người gửi trẻ',
      LoaiGiayTo: 'Tùy thân',
      DuongDanFile: '/uploads/giayto/ycgt0002/cccd.jpg',
      TrangThai: 'Chờ xác minh',
      NgayCapNhat: null,
      GhiChu: '',
    },
    {
      MaGiayTo: 'GT000103',
      TenGiayTo: 'Sổ hộ khẩu / giấy tờ cư trú',
      LoaiGiayTo: 'Cư trú',
      DuongDanFile: '',
      TrangThai: 'Chờ xác minh',
      NgayCapNhat: null,
      GhiChu: 'Chờ cán bộ xác minh.',
    },
  ],
};

function normalizeStatus(value) {
  const status = String(value || '').trim();

  if (status === 'pending') return STATUS_DB.CHO_XU_LY;
  if (status === 'reviewing') return STATUS_DB.DANG_XEM_XET;
  if (status === 'approved' || status === 'accepted') return STATUS_DB.DA_TIEP_NHAN;
  if (status === 'rejected') return STATUS_DB.TU_CHOI;
  if (status === 'cancelled') return STATUS_DB.DA_HUY;

  return status || STATUS_DB.CHO_XU_LY;
}

function normalizeDocumentStatus(value) {
  const status = String(value || '').trim();

  if (status === 'pending') return DOCUMENT_STATUS.CHO_XAC_MINH;
  if (status === 'valid') return DOCUMENT_STATUS.HOP_LE;
  if (status === 'invalid') return DOCUMENT_STATUS.KHONG_HOP_LE;
  if (status === 'need_supplement') return DOCUMENT_STATUS.CAN_BO_SUNG;

  return status || DOCUMENT_STATUS.CHO_XAC_MINH;
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

function getGenderText(value) {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  return value || 'Chưa cập nhật';
}

function joinAddress(detail, ward, province) {
  return [detail, ward, province].filter(Boolean).join(', ') || 'Chưa cập nhật';
}

function mapDocument(doc, index) {
  if (typeof doc === 'string') {
    return {
      MaGiayTo: `DOC-${index}`,
      TenGiayTo: doc,
      LoaiGiayTo: 'Giấy tờ',
      DuongDanFile: '',
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
    DuongDanFile: doc.DuongDanFile || doc.url || doc.fileUrl || '',
    TrangThai: normalizeDocumentStatus(doc.TrangThai || doc.status),
    NgayCapNhat: doc.NgayCapNhat || doc.updatedAt || '',
    GhiChu: doc.GhiChu || doc.note || '',
  };
}

function mapRequestDetail(item) {
  if (!item) return null;

  const nguoiGui = item.nguoiGui || item.NguoiGui || {};
  const treTam = item.thongTinTreTam || item.ThongTinTreTam || item.treTam || {};
  const rawDocs = item.giayTo || item.GiayTo || item.documents || [];

  const id = item.MaYeuCauGuiTre || item.id;

  return {
    id,
    code: item.MaYeuCauGuiTre || item.code || id,
    MaNguoiGui: item.MaNguoiGui || nguoiGui.MaNguoiDung || '',
    MaLoaiNguoiGui: item.MaLoaiNguoiGui || item.senderTypeCode || '',
    QuanHeVoiTre: item.QuanHeVoiTre || item.relationship || '',
    LyDoGui: item.LyDoGui || item.reason || '',
    TrangThaiYC: normalizeStatus(item.TrangThaiYC || item.status),
    GhiChu: item.GhiChu || item.note || '',
    NgayTao: item.NgayTao || item.createdAt || '',
    NgayCapNhat: item.NgayCapNhat || item.updatedAt || '',
    MaHSTiepNhan:
      item.MaHSTiepNhan ||
      item.hoSoTiepNhan?.MaHSTiepNhan ||
      item.hoSoTiepNhan?.id ||
      '',

    nguoiGui: {
      HoTen:
        nguoiGui.HoTen ||
        nguoiGui.hoTen ||
        item.TenNguoiGui ||
        item.senderName ||
        '',
      CCCD:
        nguoiGui.CCCD ||
        nguoiGui.SoCCCD ||
        item.senderIdentityNumber ||
        item.senderCccd ||
        '',
      SoDienThoai:
        nguoiGui.SoDienThoai ||
        nguoiGui.phone ||
        item.senderPhone ||
        '',
      Email: nguoiGui.Email || nguoiGui.email || item.senderEmail || '',
      TenTinhTP: nguoiGui.TenTinhTP || item.senderProvinceName || '',
      TenXaPhuong: nguoiGui.TenXaPhuong || item.senderWardName || '',
      DiaChiCuThe: nguoiGui.DiaChiCuThe || item.senderAddressDetail || '',
    },

    treTam: {
      MaTreTam: treTam.MaTreTam || treTam.id || '',
      HoTen: treTam.HoTen || treTam.hoTen || item.childName || '',
      NgaySinh: treTam.NgaySinh || treTam.ngaySinh || item.childBirthDate || '',
      GioiTinh: treTam.GioiTinh || treTam.gioiTinh || item.childGender || '',
      DanToc: treTam.DanToc || treTam.danToc || item.childEthnicity || '',
      TenTinhTP: treTam.TenTinhTP || item.childProvinceName || '',
      TenXaPhuong: treTam.TenXaPhuong || item.childWardName || '',
      DiaChiCuThe: treTam.DiaChiCuThe || item.childAddressDetail || '',
      TinhTrangSucKhoe:
        treTam.TinhTrangSucKhoe ||
        treTam.tinhTrangSucKhoe ||
        item.childHealthStatus ||
        '',
    },

    documents: Array.isArray(rawDocs) ? rawDocs.map(mapDocument) : [],
  };
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status || 'Không xác định',
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

function DocumentStatusBadge({ status }) {
  const meta = DOCUMENT_STATUS_META[status] || {
    label: status || DOCUMENT_STATUS.CHO_XAC_MINH,
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

function RequestMetaStrip({ request }) {
  return (
    <div className="mt-6 grid gap-3 border-t border-[#E4EAF2] pt-5 md:grid-cols-3">
      <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
          Mã yêu cầu
        </p>
        <p className="mt-2 text-sm font-extrabold text-[#0D47A1]">
          {request.code}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
          Ngày tạo
        </p>
        <p className="mt-2 text-sm font-bold text-[#26364A]">
          {request.NgayTao ? formatDate(request.NgayTao) : 'Chưa cập nhật'}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
          Cập nhật gần nhất
        </p>
        <p className="mt-2 text-sm font-bold text-[#26364A]">
          {request.NgayCapNhat
            ? formatDate(request.NgayCapNhat)
            : 'Chưa cập nhật'}
        </p>
      </div>
    </div>
  );
}
function SectionBlock({ number, title, description, children }) {
  return (
    <section className="border-b border-[#E4EAF2] px-6 py-7 last:border-b-0 lg:px-8">
      <div className="mb-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[20px] font-black uppercase tracking-wide text-[#0D47A1]">
            {number}.
          </span>

          <h2 className="text-[20px] font-bold text-[#0D47A1]">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mt-2 text-sm leading-6 text-[#7D90AA]">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}
function FieldView({ label, value, wide = false }) {
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

function TextAreaView({ label, value }) {
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

function DocumentCard({
  document,
  canVerify,
  onView,
  onMarkValid,
  onMarkInvalid,
  onMarkSupplement,
}) {
  return (
    <div className="rounded-[22px] border border-[#E6EDF5] bg-[#FAFCFF] p-5">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-[#26364A]">{document.TenGiayTo}</p>
            <DocumentStatusBadge status={document.TrangThai} />
          </div>

          <p className="mt-2 text-sm text-[#7D90AA]">
            {document.MaGiayTo} · {document.LoaiGiayTo}
          </p>

          <p className="mt-1 text-xs text-[#9AACBF]">
            Cập nhật:{' '}
            {document.NgayCapNhat
              ? formatDate(document.NgayCapNhat)
              : 'Chưa cập nhật'}
          </p>

          {document.GhiChu && (
            <p className="mt-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-semibold leading-6 text-orange-700">
              {document.GhiChu}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <button
            type="button"
            onClick={() => onView(document)}
            className="inline-flex h-10 w-[104px] items-center justify-center rounded-2xl border border-[#CFE0F5] bg-white px-3 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
          >
            Xem file
          </button>

          {canVerify && (
            <>
              <button
                type="button"
                onClick={() => onMarkValid(document)}
                className="inline-flex h-10 w-[104px] items-center justify-center rounded-2xl bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                Hợp lệ
              </button>

              <button
                type="button"
                onClick={() => onMarkSupplement(document)}
                className="inline-flex h-10 w-[104px] items-center justify-center rounded-2xl border border-orange-200 bg-white px-3 text-xs font-bold text-orange-700 transition hover:bg-orange-50"
              >
                Bổ sung
              </button>

              <button
                type="button"
                onClick={() => onMarkInvalid(document)}
                className="inline-flex h-10 w-[104px] items-center justify-center rounded-2xl border border-red-200 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-50"
              >
                Không hợp lệ
              </button>
            </>
          )}
        </div>
      </div>
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
                Định dạng này chưa hỗ trợ xem trực tiếp.
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#083778]"
              >
                <ExternalLink size={16} />
                Mở file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionPanel({
  request,
  allDocumentsValid,
  onBack,
  onStartReview,
  onReject,
  onCreateProfile,
  onViewReceptionProfile,
}) {
  const status = request.TrangThaiYC;
  const canCreateProfile =
    status === STATUS_DB.DANG_XEM_XET && allDocumentsValid;

  return (
    <aside className="xl:col-span-4">
      <div className="xl:sticky xl:top-24">
        <section className={`${cardClass} p-6`}>
          <h3 className="text-[20px] font-bold text-[#0D47A1]">
            Chức năng xử lý
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#7D90AA]">
            Thao tác được hiển thị theo trạng thái hiện tại của yêu cầu gửi trẻ.
          </p>

          <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
              Trạng thái yêu cầu
            </p>

            <div className="mt-3">
              <StatusBadge status={status} />
            </div>
          </div>

          {status === STATUS_DB.DANG_XEM_XET && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 ${allDocumentsValid
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.13em]">
                Điều kiện giấy tờ
              </p>
              <p className="mt-2 text-sm font-bold leading-6">
                {allDocumentsValid
                  ? 'Tất cả giấy tờ đã hợp lệ.'
                  : 'Cần xác minh đầy đủ giấy tờ trước khi tạo hồ sơ.'}
              </p>
            </div>
          )}

          {status === STATUS_DB.DA_TIEP_NHAN && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-700">
              Yêu cầu đã được tiếp nhận và đã có hồ sơ tiếp nhận. Không còn thao tác xét duyệt yêu cầu tại màn hình này.
            </div>
          )}

          {(status === STATUS_DB.TU_CHOI || status === STATUS_DB.DA_HUY) && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
              Yêu cầu đã kết thúc. Cán bộ chỉ có thể xem lại thông tin.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {status === STATUS_DB.CHO_XU_LY && (
              <button
                type="button"
                onClick={onStartReview}
                className={`${buttonBase} bg-[#0D47A1] text-white hover:bg-[#083778]`}
              >
                <ShieldCheck size={17} />
                Bắt đầu xem xét
              </button>
            )}

            {status === STATUS_DB.DANG_XEM_XET && (
              <>
                <button
                  type="button"
                  onClick={onCreateProfile}
                  disabled={!canCreateProfile}
                  className={`${buttonBase} ${canCreateProfile
                    ? 'bg-[#0D47A1] text-white hover:bg-[#083778]'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                    }`}
                >
                  <CheckCircle2 size={17} />
                  Tạo hồ sơ tiếp nhận
                </button>

                <button
                  type="button"
                  onClick={onReject}
                  className={`${buttonBase} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
                >
                  <XCircle size={17} />
                  Từ chối yêu cầu
                </button>
              </>
            )}

            {status === STATUS_DB.DA_TIEP_NHAN && (
              <button
                type="button"
                onClick={onViewReceptionProfile}
                className={`${buttonBase} bg-[#0D47A1] text-white hover:bg-[#083778]`}
              >
                <CheckCircle2 size={17} />
                Xem hồ sơ tiếp nhận
              </button>
            )}

            <button
              type="button"
              onClick={onBack}
              className={`${buttonBase} border border-[#CFE0F5] bg-white text-[#0D47A1] hover:bg-[#F4F8FF]`}
            >
              <ArrowLeft size={17} />
              Quay lại danh sách
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}

export default function ChildRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const [previewDoc, setPreviewDoc] = useState(null);
  const [localRequest, setLocalRequest] = useState(null);

  const { data, loading, error } = useFetch(
    () => receptionApi.getById(id),
    [id]
  );

  const sourceRequest = localRequest || data || (!loading ? DEMO_REQUEST_DETAIL : null);

  const request = useMemo(() => {
    return mapRequestDetail(sourceRequest);
  }, [sourceRequest]);

  const allDocumentsValid = useMemo(() => {
    return (
      request?.documents?.length > 0 &&
      request.documents.every((doc) => doc.TrangThai === DOCUMENT_STATUS.HOP_LE)
    );
  }, [request]);

  async function handleStartReview() {
    setLocalRequest((prev) => ({
      ...(prev || data || DEMO_REQUEST_DETAIL),
      TrangThaiYC: STATUS_DB.DANG_XEM_XET,
      NgayCapNhat: new Date().toISOString(),
    }));
  }

  async function handleReject() {
    setLocalRequest((prev) => ({
      ...(prev || data || DEMO_REQUEST_DETAIL),
      TrangThaiYC: STATUS_DB.TU_CHOI,
      NgayCapNhat: new Date().toISOString(),
      GhiChu: 'Yêu cầu bị từ chối do thông tin hoặc giấy tờ chưa hợp lệ.',
    }));
  }

  async function handleMarkDocument(document, status) {
    const source = localRequest || data || DEMO_REQUEST_DETAIL;
    const docs = source.giayTo || source.GiayTo || source.documents || [];

    const nextDocs = docs.map((doc, index) => {
      const mapped = mapDocument(doc, index);

      if (mapped.MaGiayTo !== document.MaGiayTo) return doc;

      return {
        ...doc,
        MaGiayTo: mapped.MaGiayTo,
        TenGiayTo: mapped.TenGiayTo,
        LoaiGiayTo: mapped.LoaiGiayTo,
        DuongDanFile: mapped.DuongDanFile,
        TrangThai: status,
        NgayCapNhat: new Date().toISOString(),
        GhiChu:
          status === DOCUMENT_STATUS.HOP_LE
            ? ''
            : status === DOCUMENT_STATUS.CAN_BO_SUNG
              ? 'Cần bổ sung hoặc thay thế giấy tờ.'
              : 'Giấy tờ chưa đạt yêu cầu.',
      };
    });

    setLocalRequest({
      ...source,
      giayTo: nextDocs,
    });
  }

  async function handleCreateProfile() {
    if (!allDocumentsValid || request.TrangThaiYC !== STATUS_DB.DANG_XEM_XET) {
      return;
    }

    const acceptedRequest = {
      ...request,
      TrangThaiYC: STATUS_DB.DA_TIEP_NHAN,
      NgayCapNhat: new Date().toISOString(),
      GhiChu:
        'Yêu cầu đã được tiếp nhận. Cán bộ chuyển sang lập hồ sơ tiếp nhận trẻ.',
    };

    // Sau này thay bằng API thật:
    // await receptionApi.updateStatus(request.id, {
    //   TrangThaiYC: STATUS_DB.DA_TIEP_NHAN,
    //   GhiChu: acceptedRequest.GhiChu,
    // });

    setLocalRequest((prev) => ({
      ...(prev || data || DEMO_REQUEST_DETAIL),
      TrangThaiYC: STATUS_DB.DA_TIEP_NHAN,
      NgayCapNhat: acceptedRequest.NgayCapNhat,
      GhiChu: acceptedRequest.GhiChu,
    }));

    navigate(`${basePath}/tao-ho-so/${request.id}`, {
      state: {
        request: acceptedRequest,
      },
    });
  }

  function handleViewReceptionProfile() {
    if (request.MaHSTiepNhan) {
      navigate(`${basePath}/ho-so-tiep-nhan/${request.MaHSTiepNhan}`);
      return;
    }

    navigate(`${basePath}/ho-so-tiep-nhan?maYeuCau=${request.id}`);
  }

  if (loading && !request) {
    return (
      <div className="py-12 text-center text-sm text-[#64748B]">
        Đang tải chi tiết yêu cầu...
      </div>
    );
  }

  if ((error && !request) || !request) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Không tải được thông tin yêu cầu.
      </div>
    );
  }

  const canVerifyDocuments = request.TrangThaiYC === STATUS_DB.DANG_XEM_XET;

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Cán bộ tiếp nhận trẻ
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                Chi tiết yêu cầu gửi trẻ
              </h1>

              <StatusBadge status={request.TrangThaiYC} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <main className="xl:col-span-8">
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 lg:px-8">
                <div className="text-center">
                  <h2 className="mt-3 text-[28px] font-bold uppercase tracking-wide text-[#0D47A1]">
                    Phiếu yêu cầu gửi trẻ vào trung tâm
                  </h2>
                </div>

                <RequestMetaStrip request={request} />
              </div>
              <SectionBlock
                number="I"
                title="Thông tin người gửi trẻ"
                description="Dữ liệu lấy từ YEUCAUGUITRE và thông tin người dùng gửi yêu cầu."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldView label="Mã người gửi" value={request.MaNguoiGui} />
                  <FieldView label="Họ và tên người gửi" value={request.nguoiGui.HoTen} />
                  <FieldView
                    label="Loại người gửi"
                    value={
                      SENDER_TYPE_LABEL[request.MaLoaiNguoiGui] ||
                      request.MaLoaiNguoiGui
                    }
                  />
                  <FieldView label="Quan hệ với trẻ" value={request.QuanHeVoiTre} />
                  <FieldView label="Số CCCD" value={request.nguoiGui.CCCD} />
                  <FieldView label="Số điện thoại" value={request.nguoiGui.SoDienThoai} />
                  <FieldView label="Email" value={request.nguoiGui.Email} />
                  <FieldView
                    label="Địa chỉ người gửi"
                    value={joinAddress(
                      request.nguoiGui.DiaChiCuThe,
                      request.nguoiGui.TenXaPhuong,
                      request.nguoiGui.TenTinhTP
                    )}
                  />
                </div>
              </SectionBlock>
              <SectionBlock
                number="II"
                title="Thông tin trẻ tạm"
                description="Trẻ hiện chỉ được lưu ở THONGTINTRETAM, chưa sinh mã trẻ chính thức trong bảng TRE."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldView label="Mã trẻ tạm" value={request.treTam.MaTreTam} />
                  <FieldView label="Họ và tên trẻ" value={request.treTam.HoTen} />
                  <FieldView
                    label="Ngày sinh"
                    value={
                      request.treTam.NgaySinh
                        ? formatDate(request.treTam.NgaySinh)
                        : ''
                    }
                  />
                  <FieldView
                    label="Giới tính"
                    value={getGenderText(request.treTam.GioiTinh)}
                  />
                  <FieldView label="Dân tộc" value={request.treTam.DanToc} />
                  <FieldView
                    label="Địa chỉ của trẻ"
                    value={joinAddress(
                      request.treTam.DiaChiCuThe,
                      request.treTam.TenXaPhuong,
                      request.treTam.TenTinhTP
                    )}
                  />
                  <TextAreaView
                    label="Tình trạng sức khỏe hiện tại"
                    value={request.treTam.TinhTrangSucKhoe}
                  />
                </div>
              </SectionBlock>

              <SectionBlock
                number="III"
                title="Lý do gửi trẻ"
                description="Lý do và ghi chú xử lý được quản lý trong YEUCAUGUITRE."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TextAreaView label="Lý do gửi trẻ" value={request.LyDoGui} />
                  <TextAreaView label="Ghi chú xử lý" value={request.GhiChu} />
                </div>
              </SectionBlock>
              <SectionBlock
                number="IV"
                title="Giấy tờ pháp lý"
                description="Giấy tờ được load từ GIAYTOPHAPLY theo MaYeuCauGuiTre. Cán bộ xác minh giấy tờ tại đây."
              >
                {request.documents.length > 0 ? (
                  <div className="space-y-4">
                    {request.documents.map((doc) => (
                      <DocumentCard
                        key={doc.MaGiayTo}
                        document={doc}
                        canVerify={canVerifyDocuments}
                        onView={setPreviewDoc}
                        onMarkValid={(document) =>
                          handleMarkDocument(document, DOCUMENT_STATUS.HOP_LE)
                        }
                        onMarkSupplement={(document) =>
                          handleMarkDocument(document, DOCUMENT_STATUS.CAN_BO_SUNG)
                        }
                        onMarkInvalid={(document) =>
                          handleMarkDocument(document, DOCUMENT_STATUS.KHONG_HOP_LE)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D7E1EE] bg-[#FAFCFF] px-6 py-10 text-center text-sm font-semibold text-[#8FA0B8]">
                    Chưa có giấy tờ pháp lý đính kèm.
                  </div>
                )}
              </SectionBlock>
            </section>
          </main>

          <ActionPanel
            request={request}
            allDocumentsValid={allDocumentsValid}
            onBack={() => navigate(`${basePath}/yeu-cau`)}
            onStartReview={handleStartReview}
            onReject={handleReject}
            onCreateProfile={handleCreateProfile}
            onViewReceptionProfile={handleViewReceptionProfile}
          />
        </div>
      </div>

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}