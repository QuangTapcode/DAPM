import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  HeartPulse,
  Plus,
  Save,
  Syringe,
  X,
} from 'lucide-react';

import { formatDate } from '../../utils/formatDate';

const STORAGE_CHILD_KEY = 'mock_children';
const STORAGE_HEALTH_KEY = 'mock_health_records';
const STORAGE_VACCINE_HISTORY_KEY = 'mock_vaccination_records';
const STORAGE_VACCINE_KEY = 'mock_vaccines';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const DEMO_CHILDREN = [
  {
    MaTre: 'TRE00015',
    HoTen: 'Nguyễn An',
    GioiTinh: 'Nữ',
    NgaySinh: '2019-02-14',
    TrangThai: 'Đang chăm sóc',
  },
  {
    MaTre: 'TRE00016',
    HoTen: 'Trần Văn Đức',
    GioiTinh: 'Nam',
    NgaySinh: '2019-08-20',
    TrangThai: 'Đang chăm sóc',
  },
  {
    MaTre: 'TRE00017',
    HoTen: 'Lê Thị Mai',
    GioiTinh: 'Nữ',
    NgaySinh: '2021-12-10',
    TrangThai: 'Chờ nhận nuôi',
  },
];

const DEMO_VACCINES = [
  { MaVacxin: 'VX001', TenVacxin: 'BCG' },
  { MaVacxin: 'VX002', TenVacxin: 'Viêm gan B' },
  { MaVacxin: 'VX003', TenVacxin: 'DPT' },
  { MaVacxin: 'VX004', TenVacxin: 'OPV' },
  { MaVacxin: 'VX005', TenVacxin: 'Sởi' },
];

const DEMO_HEALTH_RECORDS = [
  {
    MaTheoDoi: 'TDSK0001',
    MaTre: 'TRE00015',
    MaNguoiCapNhat: 'ND000005',
    NgayCapNhat: '2026-05-01T09:00:00',
    CanNang: 18.5,
    ChieuCao: 108,
    NhipTim: 92,
    NhomMau: 'O+',
    NhietDo: 36.7,
    KetLuan: 'Sức khỏe ổn định',
    TinhTrangChiTiet: 'Ăn ngủ bình thường, chưa phát hiện dấu hiệu bất thường.',
  },
  {
    MaTheoDoi: 'TDSK0002',
    MaTre: 'TRE00016',
    MaNguoiCapNhat: 'ND000005',
    NgayCapNhat: '2026-05-04T14:20:00',
    CanNang: 20.2,
    ChieuCao: 112,
    NhipTim: 88,
    NhomMau: 'A+',
    NhietDo: 36.5,
    KetLuan: 'Tốt',
    TinhTrangChiTiet: 'Thể trạng tốt, vận động bình thường.',
  },
  {
    MaTheoDoi: 'TDSK0003',
    MaTre: 'TRE00017',
    MaNguoiCapNhat: 'ND000006',
    NgayCapNhat: '2026-05-06T08:10:00',
    CanNang: 12.4,
    ChieuCao: 88,
    NhipTim: 118,
    NhomMau: 'B+',
    NhietDo: 37.8,
    KetLuan: 'Cần theo dõi',
    TinhTrangChiTiet: 'Nhiệt độ hơi cao, cần theo dõi thêm.',
  },
];

const DEMO_VACCINE_HISTORY = [
  {
    MaLSTiemChung: 'LSTC0001',
    MaTre: 'TRE00015',
    MaVacxin: 'VX001',
    MuiSo: 1,
    NgayTiem: '2025-01-10',
    GhiChu: 'Tiêm đủ liều.',
  },
  {
    MaLSTiemChung: 'LSTC0002',
    MaTre: 'TRE00015',
    MaVacxin: 'VX002',
    MuiSo: 1,
    NgayTiem: '2025-02-12',
    GhiChu: '',
  },
  {
    MaLSTiemChung: 'LSTC0003',
    MaTre: 'TRE00017',
    MaVacxin: 'VX005',
    MuiSo: 1,
    NgayTiem: '2026-04-20',
    GhiChu: 'Cần theo dõi phản ứng sau tiêm.',
  },
];

const emptyHealth = {
  MaTheoDoi: '',
  MaTre: '',
  MaNguoiCapNhat: 'ND000005',
  NgayCapNhat: '',
  CanNang: '',
  ChieuCao: '',
  NhipTim: '',
  NhomMau: '',
  NhietDo: '',
  KetLuan: '',
  TinhTrangChiTiet: '',
};

const emptyVaccine = {
  MaLSTiemChung: '',
  MaTre: '',
  MaVacxin: '',
  MuiSo: 0,
  NgayTiem: '',
  GhiChu: '',
};

const pageClass = 'min-h-screen bg-[#F5F7FB]';
const containerClass = 'mx-auto max-w-[1720px] space-y-6 px-5 py-8 sm:px-8 lg:px-10';

const cardClass =
  'overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-[0_12px_32px_rgba(31,42,61,0.06)]';

const inputClass =
  'h-10 w-full rounded-lg border border-[#D9E6F7] bg-white px-3 text-sm font-semibold text-[#334155] outline-none transition focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/10';

const textareaClass =
  'w-full resize-none rounded-lg border border-[#D9E6F7] bg-white px-3 py-2 text-sm font-semibold text-[#334155] outline-none transition focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/10';

const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0D47A1] px-4 text-sm font-bold text-white transition hover:bg-[#083778] disabled:cursor-not-allowed disabled:bg-slate-300';

const btnGhost =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#CFE0F5] bg-white px-4 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]';

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

function normalizeHealthCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^TDSK(\d+)$/);

  if (match) return `TDSK${match[1].padStart(4, '0')}`;
  if (/^\d+$/.test(text)) return `TDSK${text.padStart(4, '0')}`;

  return text;
}

function normalizeVaccineHistoryCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^LSTC(\d+)$/);

  if (match) return `LSTC${match[1].padStart(4, '0')}`;
  if (/^\d+$/.test(text)) return `LSTC${text.padStart(4, '0')}`;

  return text;
}

function normalizeVaccineCode(value) {
  if (!value) return '';

  const text = String(value).trim().toUpperCase();
  const match = text.match(/^VX(\d+)$/);

  if (match) return `VX${match[1].padStart(3, '0')}`;
  if (/^\d+$/.test(text)) return `VX${text.padStart(3, '0')}`;

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

function toDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return '';
  return String(value).slice(0, 16);
}

function toNumberOrEmpty(value) {
  if (value === undefined || value === null || value === '') return '';
  const number = Number(value);
  return Number.isNaN(number) ? '' : number;
}

function normalizeChild(item) {
  return {
    MaTre: normalizeChildCode(item.MaTre || item.maTre || item.id || item.childId),
    HoTen:
      item.HoTen ||
      item.hoTen ||
      item.TenTre ||
      item.childName ||
      'Chưa cập nhật',
    GioiTinh: item.GioiTinh || item.gioiTinh || item.gender || '',
    NgaySinh: toDateInput(item.NgaySinh || item.ngaySinh || item.birthDate),
    TrangThai: item.TrangThai || item.trangThai || item.status || '',
  };
}

function normalizeVaccine(item) {
  return {
    MaVacxin: normalizeVaccineCode(item.MaVacxin || item.maVacxin || item.id),
    TenVacxin:
      item.TenVacxin ||
      item.tenVacxin ||
      item.name ||
      item.TenVaccine ||
      'Chưa cập nhật',
  };
}

function normalizeHealthRecord(item) {
  return {
    MaTheoDoi: normalizeHealthCode(
      item.MaTheoDoi || item.maTheoDoi || item.id || item.healthId
    ),
    MaTre: normalizeChildCode(item.MaTre || item.maTre || item.childId),
    MaNguoiCapNhat: normalizeUserCode(
      item.MaNguoiCapNhat || item.maNguoiCapNhat || item.updatedBy
    ),
    NgayCapNhat:
      item.NgayCapNhat ||
      item.ngayCapNhat ||
      item.updatedAt ||
      new Date().toISOString(),
    CanNang: toNumberOrEmpty(item.CanNang || item.canNang || item.weight),
    ChieuCao: toNumberOrEmpty(item.ChieuCao || item.chieuCao || item.height),
    NhipTim: toNumberOrEmpty(item.NhipTim || item.nhipTim || item.heartRate),
    NhomMau: item.NhomMau || item.nhomMau || item.bloodType || '',
    NhietDo: toNumberOrEmpty(item.NhietDo || item.nhietDo || item.temperature),
    KetLuan: item.KetLuan || item.ketLuan || item.conclusion || '',
    TinhTrangChiTiet:
      item.TinhTrangChiTiet ||
      item.tinhTrangChiTiet ||
      item.detail ||
      item.note ||
      '',
  };
}

function normalizeVaccineHistory(item) {
  return {
    MaLSTiemChung: normalizeVaccineHistoryCode(
      item.MaLSTiemChung || item.maLSTiemChung || item.id
    ),
    MaTre: normalizeChildCode(item.MaTre || item.maTre || item.childId),
    MaVacxin: normalizeVaccineCode(item.MaVacxin || item.maVacxin || item.vaccineId),
    MuiSo: Number(item.MuiSo ?? item.muiSo ?? item.dose ?? 0),
    NgayTiem: toDateInput(item.NgayTiem || item.ngayTiem || item.injectedAt),
    GhiChu: item.GhiChu || item.ghiChu || item.note || '',
  };
}

function getChildren() {
  const stored = safeReadStorage(STORAGE_CHILD_KEY);
  const merged = [...stored, ...DEMO_CHILDREN];

  const map = new Map();

  merged.forEach((item) => {
    const child = normalizeChild(item);
    if (child.MaTre && !map.has(child.MaTre)) {
      map.set(child.MaTre, child);
    }
  });

  return Array.from(map.values());
}

function getVaccines() {
  const stored = safeReadStorage(STORAGE_VACCINE_KEY);
  const merged = [...stored, ...DEMO_VACCINES];

  const map = new Map();

  merged.forEach((item) => {
    const vaccine = normalizeVaccine(item);
    if (vaccine.MaVacxin && !map.has(vaccine.MaVacxin)) {
      map.set(vaccine.MaVacxin, vaccine);
    }
  });

  return Array.from(map.values());
}

function getHealthRecords() {
  const stored = safeReadStorage(STORAGE_HEALTH_KEY);
  const merged = [...stored, ...DEMO_HEALTH_RECORDS];

  const map = new Map();

  merged.forEach((item) => {
    const record = normalizeHealthRecord(item);
    if (record.MaTheoDoi && !map.has(record.MaTheoDoi)) {
      map.set(record.MaTheoDoi, record);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.NgayCapNhat) - new Date(a.NgayCapNhat)
  );
}

function getVaccineHistory() {
  const stored = safeReadStorage(STORAGE_VACCINE_HISTORY_KEY);
  const merged = [...stored, ...DEMO_VACCINE_HISTORY];

  const map = new Map();

  merged.forEach((item) => {
    const record = normalizeVaccineHistory(item);
    if (record.MaLSTiemChung && !map.has(record.MaLSTiemChung)) {
      map.set(record.MaLSTiemChung, record);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.NgayTiem) - new Date(a.NgayTiem)
  );
}

function generateCode(prefix, records, field, digits) {
  const maxNumber = records.reduce((max, item) => {
    const value = String(item[field] || '');
    const match = value.match(new RegExp(`^${prefix}(\\d+)$`));
    const number = match ? Number(match[1]) : 0;
    return number > max ? number : max;
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(digits, '0')}`;
}

function getVaccineName(vaccines, vaccineId) {
  return (
    vaccines.find((item) => item.MaVacxin === vaccineId)?.TenVacxin ||
    vaccineId ||
    'Chưa cập nhật'
  );
}

function saveHealthRecordsByChild(childId, rows) {
  const stored = safeReadStorage(STORAGE_HEALTH_KEY).map(normalizeHealthRecord);
  const otherRows = stored.filter((item) => item.MaTre !== childId);
  safeWriteStorage(STORAGE_HEALTH_KEY, [...otherRows, ...rows]);
}

function saveVaccineHistoryByChild(childId, rows) {
  const stored = safeReadStorage(STORAGE_VACCINE_HISTORY_KEY).map(
    normalizeVaccineHistory
  );
  const otherRows = stored.filter((item) => item.MaTre !== childId);
  safeWriteStorage(STORAGE_VACCINE_HISTORY_KEY, [...otherRows, ...rows]);
}

function ReadonlyValue({ value, suffix }) {
  if (value === '' || value === null || value === undefined) {
    return <span className="text-[#9AACBF]">—</span>;
  }

  return (
    <span className="text-sm font-semibold text-[#26364A]">
      {value}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

function MetricCard({ label, value, suffix }) {
  return (
    <div className="rounded-lg border border-[#DCE6F2] bg-[#FAFCFF] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-[#26364A]">
        {value || '—'}
        {value ? ` ${suffix || ''}` : ''}
      </p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#EDF3FB] px-6 py-5 lg:flex-row lg:items-center lg:px-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3FF] text-[#0D47A1]">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0D47A1]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-[#8FA0B8]">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {children}
    </div>
  );
}

export default function ChildHealthForm() {
  const { childId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fixedChildId = normalizeChildCode(childId);
  const isCreatePath = location.pathname.endsWith('/tao');

  const children = useMemo(() => getChildren(), []);
  const vaccines = useMemo(() => getVaccines(), []);

  const child = children.find((item) => item.MaTre === fixedChildId);

  const [healthRows, setHealthRows] = useState([]);
  const [vaccineRows, setVaccineRows] = useState([]);

  const [initialHealthRows, setInitialHealthRows] = useState([]);
  const [initialVaccineRows, setInitialVaccineRows] = useState([]);

  const [healthEditing, setHealthEditing] = useState(false);
  const [vaccineEditing, setVaccineEditing] = useState(false);

  const [addingHealth, setAddingHealth] = useState(isCreatePath);
  const [addingVaccine, setAddingVaccine] = useState(false);

  const [newHealth, setNewHealth] = useState({
    ...emptyHealth,
    MaTre: fixedChildId,
    NgayCapNhat: new Date().toISOString().slice(0, 16),
  });

  const [newVaccine, setNewVaccine] = useState({
    ...emptyVaccine,
    MaTre: fixedChildId,
    NgayTiem: new Date().toISOString().slice(0, 10),
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    const allHealth = getHealthRecords();
    const allVaccines = getVaccineHistory();

    const childHealth = allHealth.filter((item) => item.MaTre === fixedChildId);
    const childVaccines = allVaccines.filter((item) => item.MaTre === fixedChildId);

    setHealthRows(childHealth);
    setVaccineRows(childVaccines);

    setInitialHealthRows(childHealth);
    setInitialVaccineRows(childVaccines);

    setAddingHealth(isCreatePath);
    setAddingVaccine(false);
  }, [fixedChildId, isCreatePath]);

  const latestHealth = healthRows[0];

  const updateHealthRow = (index, field, value) => {
    setHealthRows((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateVaccineRow = (index, field, value) => {
    setVaccineRows((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const saveHealthRows = () => {
    const normalizedRows = healthRows.map((item) =>
      normalizeHealthRecord({
        ...item,
        MaTre: fixedChildId,
        NgayCapNhat: item.NgayCapNhat || new Date().toISOString(),
      })
    );

    saveHealthRecordsByChild(fixedChildId, normalizedRows);

    setHealthRows(normalizedRows);
    setInitialHealthRows(normalizedRows);
    setHealthEditing(false);
    setMessage('Cập nhật dữ liệu theo dõi sức khỏe thành công.');
  };

  const saveVaccineRows = () => {
    const duplicatedKey = new Set();

    for (const item of vaccineRows) {
      const key = `${fixedChildId}_${item.MaVacxin}_${Number(item.MuiSo)}`;

      if (duplicatedKey.has(key)) {
        setMessage('Không thể lưu vì trùng MaTre + MaVacxin + MuiSo.');
        return;
      }

      duplicatedKey.add(key);
    }

    const normalizedRows = vaccineRows.map((item) =>
      normalizeVaccineHistory({
        ...item,
        MaTre: fixedChildId,
      })
    );

    saveVaccineHistoryByChild(fixedChildId, normalizedRows);

    setVaccineRows(normalizedRows);
    setInitialVaccineRows(normalizedRows);
    setVaccineEditing(false);
    setMessage('Cập nhật dữ liệu tiêm chủng thành công.');
  };

  const cancelHealthEdit = () => {
    setHealthRows(initialHealthRows);
    setHealthEditing(false);
  };

  const cancelVaccineEdit = () => {
    setVaccineRows(initialVaccineRows);
    setVaccineEditing(false);
  };

  const addHealthRecord = () => {
    const allHealth = getHealthRecords();

    const record = normalizeHealthRecord({
      ...newHealth,
      MaTheoDoi: generateCode('TDSK', allHealth, 'MaTheoDoi', 4),
      MaTre: fixedChildId,
      NgayCapNhat: newHealth.NgayCapNhat || new Date().toISOString(),
    });

    const nextRows = [record, ...healthRows];

    setHealthRows(nextRows);
    saveHealthRecordsByChild(fixedChildId, nextRows);

    setInitialHealthRows(nextRows);
    setAddingHealth(false);
    setMessage('Thêm bản ghi theo dõi sức khỏe thành công.');

    setNewHealth({
      ...emptyHealth,
      MaTre: fixedChildId,
      NgayCapNhat: new Date().toISOString().slice(0, 16),
    });
  };

  const addVaccineRecord = () => {
    if (!newVaccine.MaVacxin) {
      setMessage('Vui lòng chọn vaccine trước khi thêm.');
      return;
    }

    const duplicated = vaccineRows.some(
      (item) =>
        item.MaTre === fixedChildId &&
        item.MaVacxin === newVaccine.MaVacxin &&
        Number(item.MuiSo) === Number(newVaccine.MuiSo)
    );

    if (duplicated) {
      setMessage('Mũi tiêm này đã tồn tại cho trẻ theo ràng buộc MaTre + MaVacxin + MuiSo.');
      return;
    }

    const allHistory = getVaccineHistory();

    const record = normalizeVaccineHistory({
      ...newVaccine,
      MaLSTiemChung: generateCode('LSTC', allHistory, 'MaLSTiemChung', 4),
      MaTre: fixedChildId,
      NgayTiem: newVaccine.NgayTiem || new Date().toISOString().slice(0, 10),
    });

    const nextRows = [record, ...vaccineRows];

    setVaccineRows(nextRows);
    saveVaccineHistoryByChild(fixedChildId, nextRows);

    setInitialVaccineRows(nextRows);
    setAddingVaccine(false);
    setMessage('Thêm lịch sử tiêm chủng thành công.');

    setNewVaccine({
      ...emptyVaccine,
      MaTre: fixedChildId,
      NgayTiem: new Date().toISOString().slice(0, 10),
    });
  };

  if (!child) {
    return (
      <div className={pageClass}>
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-600">
            Không tìm thấy trẻ cần xem sức khỏe.
          </p>

          <button
            type="button"
            onClick={() => navigate('/can-bo-tiep-nhan/suc-khoe')}
            className={`${btnGhost} mt-5`}
          >
            Quay lại danh sách sức khỏe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className={containerClass}>
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Sức khỏe trẻ
            </p>

            <h1 className="mt-2 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[40px]">
              Chi tiết sức khỏe trẻ
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/can-bo-tiep-nhan/tre/${fixedChildId}`)}
              className={btnGhost}
            >
              Hồ sơ trẻ
            </button>

            <button
              type="button"
              onClick={() => navigate('/can-bo-tiep-nhan/suc-khoe')}
              className={btnGhost}
            >
              <ArrowLeft size={17} />
              Danh sách sức khỏe
            </button>
          </div>
        </header>

        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {message}
          </div>
        )}
        <section className="overflow-hidden rounded-xl border border-[#DCE6F2] bg-white shadow-[0_12px_28px_rgba(31,42,61,0.06)]">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Bên trái: hồ sơ trẻ */}
            <div className="border-b border-[#E8EEF6] bg-[linear-gradient(135deg,#FFFFFF_0%,#F7FAFF_100%)] p-6 xl:border-b-0 xl:border-r">
              {/* Hàng trên: avatar + tên trẻ */}
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[24px] font-black text-[#0D47A1] shadow-sm">
                  {child.HoTen?.trim()
                    ?.split(/\s+/)
                    ?.slice(-2)
                    ?.map((part) => part[0])
                    ?.join('')
                    ?.toUpperCase() || 'TE'}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="mt-2 text-[32px] font-black leading-tight text-[#0D47A1]">
                    {child.HoTen}
                  </h2>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-8 items-center rounded-lg bg-[#EAF3FF] px-3 text-xs font-black text-[#0D47A1]">
                      {child.MaTre}
                    </span>

                    <span className="inline-flex h-8 items-center rounded-lg border border-[#D9E6F7] bg-white px-3 text-xs font-bold text-[#516277]">
                      {child.GioiTinh || 'Chưa cập nhật'}
                    </span>

                    <span
                      className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-bold ${child.TrangThai === 'Đang chăm sóc'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : child.TrangThai === 'Chờ nhận nuôi'
                          ? 'border border-amber-200 bg-amber-50 text-amber-700'
                          : 'border border-[#D9E6F7] bg-white text-[#516277]'
                        }`}
                    >
                      {child.TrangThai || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hàng dưới: thông tin full ngang khối trái */}
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#E6EDF5] bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Ngày sinh
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#26364A]">
                    {child.NgaySinh ? formatDate(child.NgaySinh) : 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E6EDF5] bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Tình trạng gần nhất
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#26364A]">
                    {latestHealth?.KetLuan || 'Chưa có dữ liệu'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E6EDF5] bg-white px-4 py-3 md:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Ghi nhận tổng quan
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#5F7086]">
                    Theo dõi toàn bộ dữ liệu sức khỏe và lịch sử tiêm chủng của trẻ theo mã hồ sơ hiện tại.
                  </p>
                </div>
              </div>
            </div>

            {/* Bên phải: chỉ số gần nhất */}
            <div className="bg-[#FAFCFF] p-6">
              <div className="flex items-center justify-between border-b border-[#E8EEF6] pb-4">
                <div>
                  <h3 className="mt-1 text-lg font-black text-[#0D47A1]">
                    Chỉ số gần nhất
                  </h3>
                </div>

                <div className="rounded-lg bg-[#EAF3FF] px-3 py-2 text-xs font-bold text-[#0D47A1]">
                  {latestHealth?.NgayCapNhat
                    ? `Cập nhật ${formatDate(latestHealth.NgayCapNhat)}`
                    : 'Chưa có dữ liệu'}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Cân nặng
                  </p>
                  <p className="mt-2 text-[24px] font-black leading-none text-[#0D47A1]">
                    {latestHealth?.CanNang || '—'}
                    {latestHealth?.CanNang ? (
                      <span className="ml-1 text-xs font-bold text-[#7D90AA]">kg</span>
                    ) : null}
                  </p>
                </div>

                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Chiều cao
                  </p>
                  <p className="mt-2 text-[24px] font-black leading-none text-[#0D47A1]">
                    {latestHealth?.ChieuCao || '—'}
                    {latestHealth?.ChieuCao ? (
                      <span className="ml-1 text-xs font-bold text-[#7D90AA]">cm</span>
                    ) : null}
                  </p>
                </div>

                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Nhiệt độ
                  </p>
                  <p className="mt-2 text-[24px] font-black leading-none text-[#0D47A1]">
                    {latestHealth?.NhietDo || '—'}
                    {latestHealth?.NhietDo ? (
                      <span className="ml-1 text-xs font-bold text-[#7D90AA]">°C</span>
                    ) : null}
                  </p>
                </div>

                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Nhịp tim
                  </p>
                  <p className="mt-2 text-[24px] font-black leading-none text-[#0D47A1]">
                    {latestHealth?.NhipTim || '—'}
                    {latestHealth?.NhipTim ? (
                      <span className="ml-1 text-xs font-bold text-[#7D90AA]">l/p</span>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Nhóm máu
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#26364A]">
                    {latestHealth?.NhomMau || 'Chưa cập nhật'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#DCE6F2] bg-white px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8FA0B8]">
                    Người cập nhật
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#26364A]">
                    {latestHealth?.MaNguoiCapNhat || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <SectionHeader
            icon={HeartPulse}
            title="Theo dõi sức khỏe"
          >
            <div className="flex flex-wrap gap-3">
              {!healthEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setHealthEditing(true);
                    setMessage('');
                  }}
                  className={btnPrimary}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button type="button" onClick={saveHealthRows} className={btnPrimary}>
                    <Save size={16} />
                    Lưu
                  </button>

                  <button type="button" onClick={cancelHealthEdit} className={btnGhost}>
                    <X size={16} />
                    Hủy
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAddingHealth(true)}
                className={btnGhost}
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
          </SectionHeader>

          {addingHealth && (
            <div className="border-b border-[#EDF3FB] bg-[#FAFCFF] px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-6">
                <input
                  type="datetime-local"
                  value={newHealth.NgayCapNhat}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, NgayCapNhat: e.target.value }))
                  }
                  className={inputClass}
                />

                <input
                  value={newHealth.MaNguoiCapNhat}
                  onChange={(e) =>
                    setNewHealth((prev) => ({
                      ...prev,
                      MaNguoiCapNhat: normalizeUserCode(e.target.value),
                    }))
                  }
                  placeholder="Người cập nhật"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0.1"
                  max="299"
                  step="0.01"
                  value={newHealth.CanNang}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, CanNang: e.target.value }))
                  }
                  placeholder="Cân nặng"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0.1"
                  max="249"
                  step="0.01"
                  value={newHealth.ChieuCao}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, ChieuCao: e.target.value }))
                  }
                  placeholder="Chiều cao"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="1"
                  max="299"
                  value={newHealth.NhipTim}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, NhipTim: e.target.value }))
                  }
                  placeholder="Nhịp tim"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="30"
                  max="44.9"
                  step="0.01"
                  value={newHealth.NhietDo}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, NhietDo: e.target.value }))
                  }
                  placeholder="Nhiệt độ"
                  className={inputClass}
                />

                <select
                  value={newHealth.NhomMau}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, NhomMau: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">Nhóm máu</option>
                  {BLOOD_GROUPS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <input
                  value={newHealth.KetLuan}
                  onChange={(e) =>
                    setNewHealth((prev) => ({ ...prev, KetLuan: e.target.value }))
                  }
                  placeholder="Kết luận"
                  className={`${inputClass} md:col-span-2`}
                />

                <textarea
                  rows={2}
                  value={newHealth.TinhTrangChiTiet}
                  onChange={(e) =>
                    setNewHealth((prev) => ({
                      ...prev,
                      TinhTrangChiTiet: e.target.value,
                    }))
                  }
                  placeholder="Tình trạng chi tiết"
                  className={`${textareaClass} md:col-span-2 xl:col-span-3`}
                />

                <div className="flex gap-2">
                  <button type="button" onClick={addHealthRecord} className={btnPrimary}>
                    <Check size={16} />
                    Thêm
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddingHealth(false)}
                    className={btnGhost}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {healthRows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-semibold text-[#8FA0B8]">
              Chưa có bản ghi theo dõi sức khỏe.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1460px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.12em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-5 py-4 font-bold">Mã theo dõi</th>
                    <th className="px-5 py-4 font-bold">Ngày cập nhật</th>
                    <th className="px-5 py-4 font-bold">Người cập nhật</th>
                    <th className="px-5 py-4 font-bold">Cân nặng</th>
                    <th className="px-5 py-4 font-bold">Chiều cao</th>
                    <th className="px-5 py-4 font-bold">Nhịp tim</th>
                    <th className="px-5 py-4 font-bold">Nhóm máu</th>
                    <th className="px-5 py-4 font-bold">Nhiệt độ</th>
                    <th className="px-5 py-4 font-bold">Kết luận</th>
                    <th className="px-5 py-4 font-bold">Chi tiết</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {healthRows.map((item, index) => (
                    <tr key={item.MaTheoDoi} className="hover:bg-[#F8FBFF] [&>td]:align-middle">
                      <td className="px-5 py-4 font-bold text-[#0D47A1]">
                        {item.MaTheoDoi}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            type="datetime-local"
                            value={toDateTimeInput(item.NgayCapNhat)}
                            onChange={(e) =>
                              updateHealthRow(index, 'NgayCapNhat', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={formatDate(item.NgayCapNhat)} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            value={item.MaNguoiCapNhat || ''}
                            onChange={(e) =>
                              updateHealthRow(
                                index,
                                'MaNguoiCapNhat',
                                normalizeUserCode(e.target.value)
                              )
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.MaNguoiCapNhat || '—'} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            type="number"
                            min="0.1"
                            max="299"
                            step="0.01"
                            value={item.CanNang}
                            onChange={(e) =>
                              updateHealthRow(index, 'CanNang', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.CanNang} suffix="kg" />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            type="number"
                            min="0.1"
                            max="249"
                            step="0.01"
                            value={item.ChieuCao}
                            onChange={(e) =>
                              updateHealthRow(index, 'ChieuCao', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.ChieuCao} suffix="cm" />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="299"
                            value={item.NhipTim}
                            onChange={(e) =>
                              updateHealthRow(index, 'NhipTim', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.NhipTim} suffix="lần/phút" />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <select
                            value={item.NhomMau}
                            onChange={(e) =>
                              updateHealthRow(index, 'NhomMau', e.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="">Chọn</option>
                            {BLOOD_GROUPS.map((group) => (
                              <option key={group} value={group}>
                                {group}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <ReadonlyValue value={item.NhomMau} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            type="number"
                            min="30"
                            max="44.9"
                            step="0.01"
                            value={item.NhietDo}
                            onChange={(e) =>
                              updateHealthRow(index, 'NhietDo', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.NhietDo} suffix="°C" />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <input
                            value={item.KetLuan}
                            onChange={(e) =>
                              updateHealthRow(index, 'KetLuan', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.KetLuan} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {healthEditing ? (
                          <textarea
                            rows={2}
                            value={item.TinhTrangChiTiet}
                            onChange={(e) =>
                              updateHealthRow(index, 'TinhTrangChiTiet', e.target.value)
                            }
                            className={textareaClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.TinhTrangChiTiet} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={cardClass}>
          <SectionHeader
            icon={Syringe}
            title="Lịch sử tiêm chủng"
          >
            <div className="flex flex-wrap gap-3">
              {!vaccineEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setVaccineEditing(true);
                    setMessage('');
                  }}
                  className={btnPrimary}
                >
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button type="button" onClick={saveVaccineRows} className={btnPrimary}>
                    <Save size={16} />
                    Lưu
                  </button>

                  <button type="button" onClick={cancelVaccineEdit} className={btnGhost}>
                    <X size={16} />
                    Hủy
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAddingVaccine(true)}
                className={btnGhost}
              >
                <Plus size={16} />
                Thêm
              </button>
            </div>
          </SectionHeader>

          {addingVaccine && (
            <div className="border-b border-[#EDF3FB] bg-[#FAFCFF] px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <select
                  value={newVaccine.MaVacxin}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, MaVacxin: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">Chọn vaccine</option>
                  {vaccines.map((item) => (
                    <option key={item.MaVacxin} value={item.MaVacxin}>
                      {item.MaVacxin} - {item.TenVacxin}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  value={newVaccine.MuiSo}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, MuiSo: e.target.value }))
                  }
                  placeholder="Mũi số"
                  className={inputClass}
                />

                <input
                  type="date"
                  value={newVaccine.NgayTiem}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, NgayTiem: e.target.value }))
                  }
                  className={inputClass}
                />

                <input
                  value={newVaccine.GhiChu}
                  onChange={(e) =>
                    setNewVaccine((prev) => ({ ...prev, GhiChu: e.target.value }))
                  }
                  placeholder="Ghi chú"
                  className={inputClass}
                />

                <div className="flex gap-2">
                  <button type="button" onClick={addVaccineRecord} className={btnPrimary}>
                    <Check size={16} />
                    Thêm
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddingVaccine(false)}
                    className={btnGhost}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {vaccineRows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-semibold text-[#8FA0B8]">
              Chưa có lịch sử tiêm chủng.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.12em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-5 py-4 font-bold">Mã tiêm chủng</th>
                    <th className="px-5 py-4 font-bold">Vaccine</th>
                    <th className="px-5 py-4 font-bold">Mũi số</th>
                    <th className="px-5 py-4 font-bold">Ngày tiêm</th>
                    <th className="px-5 py-4 font-bold">Ghi chú</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {vaccineRows.map((item, index) => (
                    <tr
                      key={item.MaLSTiemChung}
                      className="hover:bg-[#F8FBFF] [&>td]:align-middle"
                    >
                      <td className="px-5 py-4 font-bold text-[#0D47A1]">
                        {item.MaLSTiemChung}
                      </td>

                      <td className="px-5 py-4">
                        {vaccineEditing ? (
                          <select
                            value={item.MaVacxin}
                            onChange={(e) =>
                              updateVaccineRow(index, 'MaVacxin', e.target.value)
                            }
                            className={inputClass}
                          >
                            {vaccines.map((vacxin) => (
                              <option key={vacxin.MaVacxin} value={vacxin.MaVacxin}>
                                {vacxin.MaVacxin} - {vacxin.TenVacxin}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <p className="font-bold text-[#26364A]">
                              {getVaccineName(vaccines, item.MaVacxin)}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#8FA0B8]">
                              {item.MaVacxin}
                            </p>
                          </>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {vaccineEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={item.MuiSo}
                            onChange={(e) =>
                              updateVaccineRow(index, 'MuiSo', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={`Mũi ${item.MuiSo}`} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {vaccineEditing ? (
                          <input
                            type="date"
                            value={item.NgayTiem}
                            onChange={(e) =>
                              updateVaccineRow(index, 'NgayTiem', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={formatDate(item.NgayTiem)} />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {vaccineEditing ? (
                          <input
                            value={item.GhiChu}
                            onChange={(e) =>
                              updateVaccineRow(index, 'GhiChu', e.target.value)
                            }
                            className={inputClass}
                          />
                        ) : (
                          <ReadonlyValue value={item.GhiChu || '—'} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}