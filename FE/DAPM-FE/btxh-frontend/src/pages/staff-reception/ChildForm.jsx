import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  HeartPulse,
  Pencil,
  Save,
  X,
} from 'lucide-react';

import childApi from '../../api/childApi';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';

const STORAGE_CHILD_KEY = 'mock_children';
const STORAGE_PROFILE_KEY = 'mock_reception_profiles';

const CHILD_STATUS = {
  CHO_TIEP_NHAN: 'Chờ tiếp nhận',
  DANG_CHAM_SOC: 'Đang chăm sóc',
  CHO_NHAN_NUOI: 'Chờ nhận nuôi',
  DA_NHAN_NUOI: 'Đã nhận nuôi',
  DA_TRA_VE_GIA_DINH: 'Đã trả về gia đình',
};

const EMPTY_FORM = {
  MaTre: '',
  HoTen: '',
  NgaySinh: '',
  GioiTinh: 'Nữ',
  MaPhuongXa: '',
  DiaChiCuThe: '',
  DanToc: '',
  TinhCach: '',
  SoThich: '',
  DacDiemNhanDang: '',
  TrangThai: CHILD_STATUS.DANG_CHAM_SOC,
  NgayTiepNhan: '',
  NgayCapNhat: '',
  NgayNhanNuoi: '',
  GhiChu: '',
  MaNguoiCapNhat: '',
  HinhAnh: '',
};

const inputClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-white px-4 py-3 text-[15px] font-medium text-[#334155] outline-none transition placeholder:text-[#9AA9BE] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const readonlyClass =
  'w-full cursor-default rounded-2xl border border-[#E3ECF8] bg-[#F7FAFC] px-4 py-3 text-[15px] font-semibold text-[#64748B] outline-none';

const textareaClass =
  'w-full resize-none rounded-2xl border border-[#D9E6F7] bg-white px-4 py-3 text-[15px] font-medium text-[#334155] outline-none transition placeholder:text-[#9AA9BE] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const selectClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-white px-4 py-3 text-[15px] font-bold text-[#334155] outline-none transition focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10';

const cardClass =
  'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const softCardClass =
  'rounded-[22px] border border-[#E6EDF5] bg-[#FAFCFF]';

const STATUS_META = {
  [CHILD_STATUS.CHO_TIEP_NHAN]: {
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [CHILD_STATUS.DANG_CHAM_SOC]: {
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [CHILD_STATUS.CHO_NHAN_NUOI]: {
    cls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [CHILD_STATUS.DA_NHAN_NUOI]: {
    cls: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  [CHILD_STATUS.DA_TRA_VE_GIA_DINH]: {
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

const DEMO_CHILDREN = [
  {
    MaTre: 'TRE00015',
    HoTen: 'Nguyễn An',
    NgaySinh: '2019-02-14',
    GioiTinh: 'Nữ',
    MaPhuongXa: 'PX0001',
    DiaChiCuThe: '20 Lê Duẩn',
    DanToc: 'Kinh',
    TinhCach: 'Hòa đồng, ngoan ngoãn',
    SoThich: 'Vẽ tranh, nghe nhạc',
    DacDiemNhanDang: '',
    TrangThai: 'Đang chăm sóc',
    NgayTiepNhan: '2026-03-02',
    NgayCapNhat: '',
    NgayNhanNuoi: '',
    GhiChu: 'Đã tiếp nhận chính thức vào trung tâm.',
    MaNguoiCapNhat: '',
    HinhAnh: '',
  },
  {
    MaTre: 'TRE00016',
    HoTen: 'Trần Văn Đức',
    NgaySinh: '2019-08-20',
    GioiTinh: 'Nam',
    MaPhuongXa: 'PX0002',
    DiaChiCuThe: 'Chưa cập nhật',
    DanToc: 'Kinh',
    TinhCach: '',
    SoThich: '',
    DacDiemNhanDang: '',
    TrangThai: 'Đang chăm sóc',
    NgayTiepNhan: '2026-04-05',
    NgayCapNhat: '',
    NgayNhanNuoi: '',
    GhiChu: '',
    MaNguoiCapNhat: '',
    HinhAnh: '',
  },
];

const DEMO_RECEPTION_PROFILES = [
  {
    MaHSTiepNhan: 'HSTN0002',
    MaYeuCauGuiTre: 'YCGT0001',
    MaTre: 'TRE00015',
    TrangThai: 'Đã duyệt',
    NgayDuyet: '2026-03-02',
  },
];

function safeReadStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeChildCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^TRE(\d+)$/);

  if (match) return `TRE${match[1].padStart(5, '0')}`;
  if (/^\d+$/.test(text)) return `TRE${text.padStart(5, '0')}`;

  return text;
}

function normalizeUserCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^ND(\d+)$/);

  if (match) return `ND${match[1].padStart(6, '0')}`;
  if (/^\d+$/.test(text)) return `ND${text.padStart(6, '0')}`;

  return text;
}

function normalizeProfileCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^HSTN(\d+)$/);

  if (match) return `HSTN${match[1].padStart(4, '0')}`;
  if (/^\d+$/.test(text)) return `HSTN${text.padStart(4, '0')}`;

  return text;
}

function normalizeRequestCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^YCGT(\d+)$/);

  if (match) return `YCGT${match[1].padStart(4, '0')}`;
  if (/^\d+$/.test(text)) return `YCGT${text.padStart(4, '0')}`;

  return text;
}

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function getInitials(name) {
  if (!name) return 'TE';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getAge(dateString) {
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

function normalizeChild(item) {
  return {
    MaTre: normalizeChildCode(item.MaTre || item.maTre || item.id || item.childId),
    HoTen:
      item.HoTen ||
      item.hoTen ||
      item.TenTre ||
      item.TenTreTam ||
      item.childName ||
      'Chưa cập nhật',
    NgaySinh: toDateInput(
      item.NgaySinh ||
      item.ngaySinh ||
      item.birthDate ||
      item.childBirthDate
    ),
    GioiTinh: item.GioiTinh || item.gioiTinh || item.gender || 'Nữ',
    MaPhuongXa:
      item.MaPhuongXa ||
      item.maPhuongXa ||
      item.wardCode ||
      item.MaXaPhuong ||
      '',
    DiaChiCuThe:
      item.DiaChiCuThe ||
      item.diaChiCuThe ||
      item.addressDetail ||
      item.childAddressDetail ||
      '',
    DanToc: item.DanToc || item.danToc || item.ethnicity || '',
    TinhCach: item.TinhCach || item.tinhCach || item.personality || '',
    SoThich: item.SoThich || item.soThich || item.hobby || '',
    DacDiemNhanDang:
      item.DacDiemNhanDang ||
      item.dacDiemNhanDang ||
      item.identificationFeature ||
      '',
    TrangThai: item.TrangThai || item.trangThai || item.status || CHILD_STATUS.DANG_CHAM_SOC,
    NgayTiepNhan: toDateInput(
      item.NgayTiepNhan || item.ngayTiepNhan || item.receivedAt
    ),
    NgayCapNhat: toDateInput(
      item.NgayCapNhat || item.ngayCapNhat || item.updatedAt
    ),
    NgayNhanNuoi: toDateInput(
      item.NgayNhanNuoi || item.ngayNhanNuoi || item.adoptedAt
    ),
    GhiChu: item.GhiChu || item.ghiChu || item.note || '',
    MaNguoiCapNhat: normalizeUserCode(
      item.MaNguoiCapNhat || item.maNguoiCapNhat || item.updatedBy
    ),
    HinhAnh: item.HinhAnh || item.hinhAnh || item.avatar || item.imageUrl || '',
  };
}

function getChildrenFromApprovedProfiles() {
  const profiles = safeReadStorage(STORAGE_PROFILE_KEY);

  return profiles
    .filter((profile) => profile.TrangThai === 'Đã duyệt' && profile.MaTre)
    .map((profile) => {
      const source = profile.tre || profile.thongTinTreTam || {};

      return normalizeChild({
        MaTre: profile.MaTre,
        HoTen:
          profile.TenTre ||
          profile.TenTreTam ||
          source.HoTen ||
          source.hoTen ||
          profile.childName,
        NgaySinh: source.NgaySinh || source.ngaySinh,
        GioiTinh: source.GioiTinh || source.gioiTinh,
        DanToc: source.DanToc || source.danToc,
        MaPhuongXa: source.MaPhuongXa || source.maPhuongXa,
        DiaChiCuThe: source.DiaChiCuThe || source.diaChiCuThe,
        TrangThai: CHILD_STATUS.DANG_CHAM_SOC,
        NgayTiepNhan: profile.NgayDuyet || profile.NgayTiepNhan,
        GhiChu: 'Được tạo từ hồ sơ tiếp nhận đã duyệt.',
        HinhAnh: source.HinhAnh || source.hinhAnh || '',
      });
    });
}

function getMockChildren() {
  const storedChildren = safeReadStorage(STORAGE_CHILD_KEY);
  const approvedChildren = getChildrenFromApprovedProfiles();
  const merged = [...storedChildren, ...approvedChildren, ...DEMO_CHILDREN];

  const uniqueMap = new Map();

  merged.forEach((item) => {
    const child = normalizeChild(item);
    if (child.MaTre && !uniqueMap.has(child.MaTre)) {
      uniqueMap.set(child.MaTre, child);
    }
  });

  return Array.from(uniqueMap.values());
}

function updateMockChild(id, payload) {
  const normalizedId = normalizeChildCode(id);
  const currentChildren = getMockChildren();

  const exists = currentChildren.some((child) => child.MaTre === normalizedId);

  const nextChildren = exists
    ? currentChildren.map((child) =>
      child.MaTre === normalizedId ? { ...child, ...payload, MaTre: normalizedId } : child
    )
    : [{ ...payload, MaTre: normalizedId }, ...currentChildren];

  safeWriteStorage(STORAGE_CHILD_KEY, nextChildren);

  return nextChildren.find((child) => child.MaTre === normalizedId);
}

function getRelatedReceptionProfile(childId) {
  const profiles = [...safeReadStorage(STORAGE_PROFILE_KEY), ...DEMO_RECEPTION_PROFILES];
  const normalizedChildId = normalizeChildCode(childId);

  const found = profiles.find(
    (item) => normalizeChildCode(item.MaTre || item.childId) === normalizedChildId
  );

  if (!found) return null;

  return {
    MaHSTiepNhan: normalizeProfileCode(found.MaHSTiepNhan || found.id),
    MaYeuCauGuiTre: normalizeRequestCode(
      found.MaYeuCauGuiTre || found.requestId || found.yeuCauGuiTre?.MaYeuCauGuiTre
    ),
    TrangThai: found.TrangThai || found.status || '',
    NgayDuyet: toDateInput(found.NgayDuyet || found.approvedAt),
  };
}

function FormField({ label, children, error, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.13em] text-[#8B9BB0]">
        {label}
      </label>

      {children}

      {error ? (
        <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function SectionCard({ number, title, description, children }) {
  return (
    <section className="border-b border-[#E4EAF2] px-6 py-7 last:border-b-0 lg:px-8">
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-black text-[#0D47A1]">
            {number}.
          </span>

          <h2 className="text-[20px] font-bold text-[#0D47A1]">
            {title}
          </h2>
        </div>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-[#7D90AA]">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${meta.cls}`}
    >
      {status || 'Chưa cập nhật'}
    </span>
  );
}

function getInputClass(editing) {
  return editing ? inputClass : readonlyClass;
}

function getTextareaClass(editing) {
  return editing ? textareaClass : readonlyClass;
}

function getSelectClass(editing) {
  return editing ? selectClass : readonlyClass;
}

export default function ChildForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const normalizedId = normalizeChildCode(id);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [relatedProfile, setRelatedProfile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const formValues = watch();

  const avatarText = useMemo(() => {
    return getInitials(formValues.HoTen);
  }, [formValues.HoTen]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!id) {
        setLoadError('Màn hình này chỉ dùng để xem và cập nhật trẻ đã có trong trung tâm.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        let data = null;

        if (childApi?.getFormById) {
          try {
            data = await childApi.getFormById(normalizedId);
          } catch {
            data = null;
          }
        }

        if (!data) {
          data = getMockChildren().find((child) => child.MaTre === normalizedId);
        }

        if (!active) return;

        if (!data) {
          setLoadError('Không tìm thấy thông tin trẻ.');
          reset(EMPTY_FORM);
          return;
        }

        const normalized = normalizeChild(data);

        const formData = {
          ...EMPTY_FORM,
          ...normalized,
          MaNguoiCapNhat:
            normalizeUserCode(user?.id || user?.MaNguoiDung) ||
            normalized.MaNguoiCapNhat ||
            '',
        };

        reset(formData);
        setInitialData(formData);
        setRelatedProfile(getRelatedReceptionProfile(normalizedId));
        setEditing(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id, normalizedId, reset, user]);

  const handleCancelEdit = () => {
    reset(initialData || EMPTY_FORM);
    setEditing(false);
    setSuccessMessage('');
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      MaTre: normalizedId,
      NgayCapNhat: new Date().toISOString(),
      MaNguoiCapNhat:
        normalizeUserCode(user?.id || user?.MaNguoiDung) ||
        values.MaNguoiCapNhat ||
        '',
    };

    try {
      if (childApi?.update) {
        await childApi.update(normalizedId, payload);
      }

      updateMockChild(normalizedId, payload);

      const normalizedPayload = normalizeChild(payload);

      reset(normalizedPayload);
      setInitialData(normalizedPayload);
      setEditing(false);
      setSuccessMessage('Cập nhật thông tin trẻ thành công.');
    } catch (error) {
      console.error('Lỗi cập nhật thông tin trẻ:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] py-16 text-center text-sm text-[#64748B]">
        Đang tải dữ liệu trẻ...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-center">
        <p className="text-sm font-semibold text-red-600">{loadError}</p>

        <button
          type="button"
          onClick={() => navigate('/can-bo-tiep-nhan/tre')}
          className="mt-5 rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
        >
          Quay lại danh sách trẻ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Hồ sơ trẻ
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6F83A3]">
              Xem thông tin trẻ đã tiếp nhận. Bấm Chỉnh sửa để mở khóa các trường
              cần cập nhật theo bảng TRE.
            </p>
          </div>
        </header>

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7"
        >
          <div className="flex flex-wrap items-center justify-end gap-3">
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setSuccessMessage('');
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778]"
              >
                <Pencil size={17} />
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={17} />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                >
                  <X size={17} />
                  Hủy chỉnh sửa
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(`/can-bo-tiep-nhan/suc-khoe/tre/${normalizedId}`)
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
            >
              <HeartPulse size={17} />
              Quản lý sức khỏe
            </button>

            <button
              type="button"
              onClick={() => navigate('/can-bo-tiep-nhan/tre')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
            >
              <ArrowLeft size={17} />
              Quay lại danh sách
            </button>
          </div>
          <main className="xl:col-span-8">
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 lg:px-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    {formValues.HinhAnh ? (
                      <img
                        src={formValues.HinhAnh}
                        alt={formValues.HoTen}
                        className="h-16 w-16 shrink-0 rounded-2xl border border-[#D7E5F7] object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[24px] font-black text-[#0D47A1]">
                        {avatarText}
                      </div>
                    )}

                    <div>
                      <h2 className="mt-1 text-[28px] font-bold text-[#0D47A1]">
                        {formValues.HoTen || 'Thông tin trẻ'}
                      </h2>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                          {formValues.MaTre}
                        </span>

                        <StatusBadge status={formValues.TrangThai} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 border-t border-[#E4EAF2] pt-5 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Mã trẻ
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-[#0D47A1]">
                      {formValues.MaTre}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Ngày tiếp nhận
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#26364A]">
                      {formValues.NgayTiepNhan
                        ? formatDate(formValues.NgayTiepNhan)
                        : 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                      Cập nhật gần nhất
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#26364A]">
                      {formValues.NgayCapNhat
                        ? formatDate(formValues.NgayCapNhat)
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>

              <SectionCard
                number="I"
                title="Thông tin cơ bản"
                description="Các thông tin định danh của trẻ trong bảng TRE."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="Mã trẻ">
                    <input value={formValues.MaTre || ''} readOnly className={readonlyClass} />
                  </FormField>

                  <FormField label="Họ và tên trẻ" error={errors.HoTen?.message}>
                    <input
                      {...register('HoTen', {
                        required: 'Vui lòng nhập họ tên trẻ',
                      })}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Nhập họ và tên trẻ"
                    />
                  </FormField>

                  <FormField label="Ngày sinh">
                    <input
                      type="date"
                      {...register('NgaySinh')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                    />
                  </FormField>

                  <FormField label="Giới tính">
                    <select
                      {...register('GioiTinh')}
                      disabled={!editing}
                      className={getSelectClass(editing)}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </FormField>

                  <FormField label="Dân tộc">
                    <input
                      {...register('DanToc')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Ví dụ: Kinh"
                    />
                  </FormField>

                  <FormField label="Tuổi">
                    <input
                      value={getAge(formValues.NgaySinh)}
                      readOnly
                      className={readonlyClass}
                    />
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard
                number="II"
                title="Địa chỉ và đặc điểm"
                description="Thông tin phục vụ quản lý, nhận diện và chăm sóc trẻ."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="Mã phường/xã">
                    <input
                      {...register('MaPhuongXa')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Ví dụ: PX0001"
                    />
                  </FormField>

                  <FormField label="Địa chỉ cụ thể">
                    <input
                      {...register('DiaChiCuThe')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Số nhà, đường, thôn/xóm..."
                    />
                  </FormField>

                  <FormField label="Tính cách">
                    <input
                      {...register('TinhCach')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Ví dụ: Hòa đồng, vui vẻ"
                    />
                  </FormField>

                  <FormField label="Sở thích">
                    <input
                      {...register('SoThich')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Ví dụ: Vẽ, hát, đá bóng"
                    />
                  </FormField>

                  <FormField label="Đặc điểm nhận dạng" className="md:col-span-2">
                    <input
                      {...register('DacDiemNhanDang')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="Ví dụ: Có nốt ruồi ở má trái..."
                    />
                  </FormField>

                  <FormField label="Hình ảnh" className="md:col-span-2">
                    <input
                      {...register('HinhAnh')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                      placeholder="/uploads/tre/tre00015.jpg hoặc URL ảnh"
                    />
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard
                number="III"
                title="Thông tin quản lý"
                description="Trạng thái, ngày quản lý và ghi chú trong bảng TRE."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="Trạng thái">
                    <select
                      {...register('TrangThai')}
                      disabled={!editing}
                      className={getSelectClass(editing)}
                    >
                      <option value={CHILD_STATUS.CHO_TIEP_NHAN}>Chờ tiếp nhận</option>
                      <option value={CHILD_STATUS.DANG_CHAM_SOC}>Đang chăm sóc</option>
                      <option value={CHILD_STATUS.CHO_NHAN_NUOI}>Chờ nhận nuôi</option>
                      <option value={CHILD_STATUS.DA_NHAN_NUOI}>Đã nhận nuôi</option>
                      <option value={CHILD_STATUS.DA_TRA_VE_GIA_DINH}>
                        Đã trả về gia đình
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Ngày tiếp nhận">
                    <input
                      type="date"
                      {...register('NgayTiepNhan')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                    />
                  </FormField>

                  <FormField label="Ngày nhận nuôi">
                    <input
                      type="date"
                      {...register('NgayNhanNuoi')}
                      readOnly={!editing}
                      className={getInputClass(editing)}
                    />
                  </FormField>

                  <FormField label="Ngày cập nhật">
                    <input
                      value={
                        formValues.NgayCapNhat
                          ? formatDate(formValues.NgayCapNhat)
                          : 'Chưa cập nhật'
                      }
                      readOnly
                      className={readonlyClass}
                    />
                  </FormField>

                  <FormField label="Mã người cập nhật">
                    <input
                      value={
                        normalizeUserCode(user?.id || user?.MaNguoiDung) ||
                        formValues.MaNguoiCapNhat ||
                        ''
                      }
                      readOnly
                      className={readonlyClass}
                    />
                  </FormField>

                  <FormField label="Ghi chú" className="md:col-span-2">
                    <textarea
                      {...register('GhiChu')}
                      readOnly={!editing}
                      rows={5}
                      className={getTextareaClass(editing)}
                      placeholder="Nhập ghi chú quản lý, tình trạng chăm sóc hoặc nội dung cần lưu ý..."
                    />
                  </FormField>
                </div>
              </SectionCard>
            </section>
          </main>
        </form>
      </div>
    </div>
  );
}