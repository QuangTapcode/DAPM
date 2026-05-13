import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import { formatDate } from '../../utils/formatDate';

const STORAGE_HEALTH_KEY = 'mock_health_records';
const STORAGE_CHILD_KEY = 'mock_children';

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
    TinhTrangChiTiet: 'Nhiệt độ hơi cao, cần theo dõi thêm trong ngày.',
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

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
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
    CanNang: toNumberOrNull(item.CanNang || item.canNang || item.weight),
    ChieuCao: toNumberOrNull(item.ChieuCao || item.chieuCao || item.height),
    NhipTim: toNumberOrNull(item.NhipTim || item.nhipTim || item.heartRate),
    NhomMau: item.NhomMau || item.nhomMau || item.bloodType || '',
    NhietDo: toNumberOrNull(item.NhietDo || item.nhietDo || item.temperature),
    KetLuan: item.KetLuan || item.ketLuan || item.conclusion || '',
    TinhTrangChiTiet:
      item.TinhTrangChiTiet ||
      item.tinhTrangChiTiet ||
      item.detail ||
      item.note ||
      '',
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

function getChildName(children, childId) {
  return children.find((child) => child.MaTre === childId)?.HoTen || 'Chưa cập nhật';
}

function getVitalWarning(record) {
  const warnings = [];

  if (record.NhietDo !== null && (record.NhietDo < 36 || record.NhietDo >= 37.5)) {
    warnings.push('Nhiệt độ');
  }

  if (record.NhipTim !== null && (record.NhipTim < 60 || record.NhipTim > 120)) {
    warnings.push('Nhịp tim');
  }

  const conclusion = String(record.KetLuan || '').toLowerCase();

  if (
    conclusion.includes('theo dõi') ||
    conclusion.includes('bất thường') ||
    conclusion.includes('cần khám') ||
    conclusion.includes('sốt')
  ) {
    warnings.push('Kết luận');
  }

  return warnings;
}

function isWarningRecord(record) {
  return getVitalWarning(record).length > 0;
}

function StatusPill({ record }) {
  const warning = isWarningRecord(record);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold ${warning
          ? 'border-amber-200 bg-amber-50 text-amber-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
    >
      {warning ? 'Cần theo dõi' : 'Ổn định'}
    </span>
  );
}

function ValueText({ value, suffix }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-[#9AACBF]">—</span>;
  }

  return (
    <span className="font-bold text-[#26364A]">
      {value}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
}

export default function ChildHealthList() {
  const navigate = useNavigate();

  const children = useMemo(() => getChildren(), []);
  const records = useMemo(() => getHealthRecords(), []);

  const [keyword, setKeyword] = useState('');
  const [childFilter, setChildFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  const selectedChildId = childFilter;

  const filteredRecords = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return records.filter((record) => {
      const childName = getChildName(children, record.MaTre);
      const warning = isWarningRecord(record);

      const matchChild = !selectedChildId || record.MaTre === selectedChildId;

      const matchCondition =
        !conditionFilter ||
        (conditionFilter === 'normal' && !warning) ||
        (conditionFilter === 'warning' && warning);

      const searchable = [
        record.MaTheoDoi,
        record.MaTre,
        childName,
        record.MaNguoiCapNhat,
        record.NhomMau,
        record.KetLuan,
        record.TinhTrangChiTiet,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchChild && matchCondition && matchKeyword;
    });
  }, [records, children, selectedChildId, conditionFilter, keyword]);

  const resetFilters = () => {
    setKeyword('');
    setChildFilter('');
    setConditionFilter('');
  };

  const openCreateHealth = () => {
    if (!selectedChildId) return;

    navigate(`/can-bo-tiep-nhan/suc-khoe/tre/${selectedChildId}/tao`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Theo dõi sức khỏe trẻ
            </h1>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-[#6F83A3]">
              Quản lý các bản ghi theo dõi sức khỏe. Bộ lọc chỉ thay đổi dữ liệu
              trong bảng, không chuyển sang trang chi tiết.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={!selectedChildId}
              onClick={openCreateHealth}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={17} />
              Thêm theo dõi
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5 lg:px-7">
            <div className="grid gap-4 xl:grid-cols-[1fr_620px]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                />

                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm mã theo dõi, mã trẻ, tên trẻ, kết luận..."
                  className="h-12 w-full rounded-xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={childFilter}
                  onChange={(e) => setChildFilter(e.target.value)}
                  className="h-12 rounded-xl border border-[#D7E5F7] bg-white px-4 text-sm font-bold text-[#26364A] outline-none transition focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                >
                  <option value="">Tất cả trẻ</option>
                  {children.map((child) => (
                    <option key={child.MaTre} value={child.MaTre}>
                      {child.MaTre} - {child.HoTen}
                    </option>
                  ))}
                </select>

                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="h-12 rounded-xl border border-[#D7E5F7] bg-white px-4 text-sm font-bold text-[#26364A] outline-none transition focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                >
                  <option value="">Tất cả tình trạng</option>
                  <option value="normal">Ổn định</option>
                  <option value="warning">Cần theo dõi</option>
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#CFE0F5] bg-white px-4 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                >
                  <SlidersHorizontal size={16} />
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0D47A1]">
                Danh sách theo dõi sức khỏe
              </h2>

              <p className="mt-1 text-sm text-[#8FA0B8]">
                Hiển thị {filteredRecords.length} / {records.length} bản ghi.
              </p>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[#8FA0B8]">
                Không có bản ghi sức khỏe phù hợp.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Mã theo dõi</th>
                    <th className="px-6 py-4 font-bold">Trẻ</th>
                    <th className="px-6 py-4 font-bold">Ngày cập nhật</th>
                    <th className="px-6 py-4 font-bold">Cân nặng</th>
                    <th className="px-6 py-4 font-bold">Chiều cao</th>
                    <th className="px-6 py-4 font-bold">Nhiệt độ</th>
                    <th className="px-6 py-4 font-bold">Nhịp tim</th>
                    <th className="px-6 py-4 font-bold">Nhóm máu</th>
                    <th className="px-6 py-4 font-bold">Kết luận</th>
                    <th className="px-6 py-4 font-bold">Tình trạng</th>
                    <th className="px-6 py-4 font-bold">Người cập nhật</th>
                    <th className="w-[120px] px-6 py-4 text-right font-bold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {filteredRecords.map((record) => {
                    const childName = getChildName(children, record.MaTre);
                    const warnings = getVitalWarning(record);

                    return (
                      <tr
                        key={record.MaTheoDoi}
                        className="transition hover:bg-[#F8FBFF] [&>td]:align-middle"
                      >
                        <td className="px-6 py-5">
                          <span className="rounded-lg bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                            {record.MaTheoDoi}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#26364A]">
                            {childName}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#8FA0B8]">
                            {record.MaTre}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                          {record.NgayCapNhat
                            ? formatDate(record.NgayCapNhat)
                            : '—'}
                        </td>

                        <td className="px-6 py-5">
                          <ValueText value={record.CanNang} suffix="kg" />
                        </td>

                        <td className="px-6 py-5">
                          <ValueText value={record.ChieuCao} suffix="cm" />
                        </td>

                        <td className="px-6 py-5">
                          <ValueText value={record.NhietDo} suffix="°C" />
                        </td>

                        <td className="px-6 py-5">
                          <ValueText value={record.NhipTim} suffix="lần/phút" />
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-[#26364A]">
                          {record.NhomMau || '—'}
                        </td>

                        <td className="max-w-[220px] px-6 py-5 text-sm font-semibold leading-6 text-[#26364A]">
                          {record.KetLuan || 'Chưa kết luận'}
                        </td>

                        <td className="px-6 py-5">
                          <StatusPill record={record} />
                          {warnings.length > 0 && (
                            <p className="mt-2 text-xs font-semibold text-amber-700">
                              Cần chú ý: {warnings.join(', ')}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-[#5F738F]">
                          {record.MaNguoiCapNhat || '—'}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/can-bo-tiep-nhan/suc-khoe/tre/${record.MaTre}`)
                            }
                            className="inline-flex h-10 w-[96px] items-center justify-center gap-2 rounded-xl border border-[#CFE0F5] bg-white px-4 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                          >
                            <Eye size={14} />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}