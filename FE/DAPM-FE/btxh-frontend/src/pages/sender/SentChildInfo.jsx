import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  HeartPulse,
  ShieldCheck,
  FileText,
  ArrowLeft,
} from 'lucide-react';

import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import receptionApi from '../../api/receptionApi';

const STATUS_MAP = {
  active: {
    label: 'Đang nuôi dưỡng',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  adopted: {
    label: 'Đã nhận nuôi',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  returned: {
    label: 'Đã trả về',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  pending: {
    label: 'Chờ tiếp nhận',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

function fmtDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getGenderText(value) {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  return value || '—';
}

function SectionCard({ title, icon, children, className = '' }) {
  return (
    <section
      className={`rounded-3xl border border-[#E8EEF7] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#2563EB]">
          {icon}
        </div>
        <h2 className="text-[18px] font-bold text-[#1E3A5F]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F8FBFF] px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] leading-none text-[#8FA0B8]">
        {label}
      </p>
      <div className="pt-3">
        <p className="break-words text-[15px] font-semibold leading-6 text-[#334155]">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function DocumentItem({ name, url }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FBFF] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#334155]">
          {name}
        </p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 text-sm font-semibold text-[#2563EB] hover:underline"
      >
        Xem
      </a>
    </div>
  );
}

function NoticeState({ title, message, onBack }) {
  return (
    <div className="mx-auto max-w-2xl py-20 text-center">
      <h2 className="text-[28px] font-bold text-[#27406B]">{title}</h2>
      <p className="mt-3 text-[15px] leading-7 text-[#73839B]">{message}</p>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2F80ED] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(47,128,237,0.18)] transition hover:brightness-105"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>
    </div>
  );
}

export default function SentChildInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: recData, loading } = useFetch(() => {
    if (!user?.id) return Promise.resolve(null);
    return receptionApi.getAll({ status: 'Đã tiếp nhận', senderId: user.id });
  });

  // Lấy hồ sơ đầu tiên đã được tiếp nhận, đọc thongTinTre
  const firstRec = recData?.items?.[0] || null;
  const child = firstRec ? {
    fullName: firstRec.thongTinTre?.tenTre,
    dob: firstRec.thongTinTre?.ngaySinh,
    gender: firstRec.thongTinTre?.gioiTinh,
    ethnicity: firstRec.thongTinTre?.danToc,
    addressDetail: firstRec.thongTinTre?.diaChiCuThe,
    healthStatus: firstRec.thongTinTre?.tinhTrangSucKhoe,
    status: 'active',
    admissionDate: firstRec.ngayCapNhat || firstRec.updatedAt,
    documents: [],
  } : null;

  const statusMeta = useMemo(() => {
    return STATUS_MAP[child?.status] || STATUS_MAP.pending;
  }, [child]);

  const initials = useMemo(() => {
    if (!child?.fullName) return 'TE';
    return child.fullName
      .trim()
      .split(' ')
      .map((word) => word[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  }, [child]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1d4ed8]/20 border-t-[#1d4ed8]" />
        <p className="text-sm text-slate-400">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <NoticeState
        title="Chưa có thông tin trẻ"
        message="Hiện chưa có trẻ nào đã được tiếp nhận thành công từ hồ sơ của bạn."
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:p-8">
          <div className="flex flex-col gap-5 border-b border-[#EDF2F7] pb-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#EEF4FF] text-[28px] font-black text-[#2563EB]">
                {initials}
              </div>

              <div>
                <h1 className="text-[34px] font-bold leading-tight text-[#1E2F4D]">
                  {child.fullName || 'Chưa cập nhật'}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMeta.badge}`}
                  >
                    {statusMeta.label}
                  </span>

                  <span className="rounded-full bg-[#F3F6FB] px-3 py-1 text-[12px] font-medium text-[#60738B]">
                    {getGenderText(child.gender)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl border border-[#DCE7F5] bg-white px-5 text-sm font-semibold text-[#5C7396] transition hover:bg-[#F8FBFF]"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>

          <div className="mt-8 space-y-6">
            {/* KHỐI 1: THÔNG TIN TRẺ */}
            <SectionCard title="Thông tin trẻ em" icon={<UserRound size={18} />}>
              <div className="space-y-3">
                <InfoItem label="Họ và tên trẻ" value={child.fullName} />
                <InfoItem label="Ngày sinh" value={fmtDate(child.dob)} />
                <InfoItem label="Giới tính" value={getGenderText(child.gender)} />
                <InfoItem label="Dân tộc" value={child.ethnicity || 'Chưa cập nhật'} />
                <InfoItem label="Địa chỉ cụ thể của trẻ" value={child.addressDetail || 'Chưa cập nhật'} />
              </div>
            </SectionCard>

            {/* KHỐI 2: SỨC KHỎE + TIẾP NHẬN */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard title="Tình trạng sức khỏe" icon={<HeartPulse size={18} />}>
                <div className="space-y-3">
                  <InfoItem
                    label="Tình trạng sức khỏe hiện tại"
                    value={child.healthStatus || 'Chưa có ghi chú sức khỏe'}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Thông tin tiếp nhận" icon={<ShieldCheck size={18} />}>
                <div className="space-y-3">
                  <InfoItem label="Ngày tiếp nhận" value={fmtDate(child.admissionDate)} />
                  <InfoItem label="Trạng thái hiện tại" value={statusMeta.label} />
                </div>
              </SectionCard>
            </div>

            {/* KHỐI 3: GIẤY TỜ */}
            <SectionCard title="Giấy tờ" icon={<FileText size={18} />}>
              {child.documents?.length ? (
                <div className="space-y-3">
                  {child.documents.map((doc) => (
                    <DocumentItem key={doc.id} name={doc.name} url={doc.url} />
                  ))}
                </div>
              ) : (
                <InfoItem label="Giấy tờ" value="Chưa có giấy tờ đính kèm" />
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}