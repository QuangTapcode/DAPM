import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, HeartPulse, Pencil, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const STORAGE_PROFILE_KEY = 'mock_reception_profiles';

const CHILD_STATUS = {
  DANG_CHAM_SOC: 'Đang chăm sóc',
  CHO_NHAN_NUOI: 'Chờ nhận nuôi',
  DA_NHAN_NUOI: 'Đã nhận nuôi',
  TAM_DUNG: 'Tạm dừng quản lý',
};

const HEALTH_STATUS = {
  TOT: 'Tốt',
  KHOE_MANH: 'Khỏe mạnh',
  CAN_THEO_DOI: 'Cần theo dõi',
  CAN_KHAM: 'Cần khám',
};

const TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang chăm sóc', value: CHILD_STATUS.DANG_CHAM_SOC },
  { label: 'Chờ nhận nuôi', value: CHILD_STATUS.CHO_NHAN_NUOI },
  { label: 'Đã nhận nuôi', value: CHILD_STATUS.DA_NHAN_NUOI },
];

const STATUS_META = {
  [CHILD_STATUS.DANG_CHAM_SOC]: {
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
  [CHILD_STATUS.CHO_NHAN_NUOI]: {
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  [CHILD_STATUS.DA_NHAN_NUOI]: {
    cls: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  [CHILD_STATUS.TAM_DUNG]: {
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
};

const HEALTH_META = {
  [HEALTH_STATUS.TOT]: {
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [HEALTH_STATUS.KHOE_MANH]: {
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [HEALTH_STATUS.CAN_THEO_DOI]: {
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [HEALTH_STATUS.CAN_KHAM]: {
    cls: 'bg-red-50 text-red-700 border-red-200',
  },
};

const DEMO_CHILDREN = [
  {
    MaTre: 'TRE00015',
    HoTen: 'Nguyễn An',
    GioiTinh: 'Nữ',
    NgaySinh: '2019-02-14',
    DanToc: 'Kinh',
    DiaChiCuThe: '20 Lê Duẩn',
    TenXaPhuong: 'Thanh Khê',
    TenTinhTP: 'Đà Nẵng',
    TinhTrangSucKhoe: 'Sức khỏe ổn định.',
    SucKhoeGanNhat: 'Khỏe mạnh',
    TrangThai: 'Đang chăm sóc',
    NgayTiepNhan: '2026-03-02',
    GhiChu: 'Đã tiếp nhận chính thức vào trung tâm.',
  },
  {
    MaTre: 'TRE00016',
    HoTen: 'Trần Văn Đức',
    GioiTinh: 'Nam',
    NgaySinh: '2019-08-20',
    DanToc: 'Kinh',
    DiaChiCuThe: 'Chưa cập nhật',
    TenXaPhuong: '',
    TenTinhTP: 'Đà Nẵng',
    TinhTrangSucKhoe: 'Khỏe mạnh.',
    SucKhoeGanNhat: 'Tốt',
    TrangThai: 'Đang chăm sóc',
    NgayTiepNhan: '2026-04-05',
    GhiChu: '',
  },
  {
    MaTre: 'TRE00017',
    HoTen: 'Lê Thị Mai',
    GioiTinh: 'Nữ',
    NgaySinh: '2021-12-10',
    DanToc: 'Kinh',
    DiaChiCuThe: 'Chưa cập nhật',
    TenXaPhuong: '',
    TenTinhTP: 'Đà Nẵng',
    TinhTrangSucKhoe: 'Cần theo dõi dinh dưỡng.',
    SucKhoeGanNhat: 'Cần theo dõi',
    TrangThai: 'Chờ nhận nuôi',
    NgayTiepNhan: '2026-04-17',
    GhiChu: 'Đang theo dõi thêm sức khỏe.',
  },
];

function safeReadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
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

function getInitials(name) {
  if (!name) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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

function getGenderText(value) {
  if (!value) return 'Chưa cập nhật';

  const gender = String(value).toLowerCase();

  if (gender === 'male' || gender === 'nam') return 'Nam';
  if (gender === 'female' || gender === 'nữ' || gender === 'nu') return 'Nữ';

  return value;
}

function joinAddress(detail, ward, province) {
  return [detail, ward, province].filter(Boolean).join(', ') || 'Chưa cập nhật';
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || {
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold ${meta.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {status || 'Chưa cập nhật'}
    </span>
  );
}

function HealthPill({ status }) {
  const meta = HEALTH_META[status] || {
    cls: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold ${meta.cls}`}
    >
      {status || 'Chưa cập nhật'}
    </span>
  );
}

function normalizeChild(item) {
  return {
    MaTre: normalizeChildCode(item.MaTre || item.id || item.childId),
    HoTen: item.HoTen || item.hoTen || item.TenTre || item.childName || 'Chưa cập nhật',
    GioiTinh: item.GioiTinh || item.gioiTinh || item.gender || '',
    NgaySinh: item.NgaySinh || item.ngaySinh || item.birthDate || item.childBirthDate || '',
    DanToc: item.DanToc || item.danToc || item.ethnicity || '',
    DiaChiCuThe: item.DiaChiCuThe || item.addressDetail || item.childAddressDetail || '',
    TenXaPhuong: item.TenXaPhuong || item.wardName || item.childWardName || '',
    TenTinhTP: item.TenTinhTP || item.provinceName || item.childProvinceName || '',
    TinhTrangSucKhoe:
      item.TinhTrangSucKhoe ||
      item.tinhTrangSucKhoe ||
      item.healthStatus ||
      item.childHealthStatus ||
      '',
    SucKhoeGanNhat:
      item.SucKhoeGanNhat ||
      item.latestHealthStatus ||
      item.healthSummary ||
      HEALTH_STATUS.CAN_THEO_DOI,
    TrangThai: item.TrangThai || item.status || CHILD_STATUS.DANG_CHAM_SOC,
    NgayTiepNhan: item.NgayTiepNhan || item.createdAt || item.receivedAt || '',
    GhiChu: item.GhiChu || item.note || '',
  };
}

function getChildrenFromApprovedProfiles() {
  const profiles = safeReadProfiles();

  return profiles
    .filter((profile) => profile.TrangThai === 'Đã duyệt' && profile.MaTre)
    .map((profile) => {
      const childSource = profile.tre || profile.thongTinTreTam || {};

      return normalizeChild({
        MaTre: profile.MaTre,
        HoTen:
          profile.TenTre ||
          profile.TenTreTam ||
          childSource.HoTen ||
          childSource.hoTen ||
          profile.childName,
        GioiTinh: childSource.GioiTinh || childSource.gioiTinh,
        NgaySinh: childSource.NgaySinh || childSource.ngaySinh,
        DanToc: childSource.DanToc || childSource.danToc,
        DiaChiCuThe: childSource.DiaChiCuThe,
        TenXaPhuong: childSource.TenXaPhuong,
        TenTinhTP: childSource.TenTinhTP,
        TinhTrangSucKhoe:
          childSource.TinhTrangSucKhoe || childSource.tinhTrangSucKhoe,
        SucKhoeGanNhat: childSource.SucKhoeGanNhat || HEALTH_STATUS.CAN_THEO_DOI,
        TrangThai: childSource.TrangThai || CHILD_STATUS.DANG_CHAM_SOC,
        NgayTiepNhan: profile.NgayDuyet || profile.NgayTiepNhan,
        GhiChu: 'Được tạo từ hồ sơ tiếp nhận đã duyệt.',
      });
    });
}

export default function ChildList() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState('');
  const [healthFilter, setHealthFilter] = useState('');

  const children = useMemo(() => {
    const approvedChildren = getChildrenFromApprovedProfiles();
    const merged = [...approvedChildren, ...DEMO_CHILDREN];

    const uniqueMap = new Map();

    merged.forEach((item) => {
      const child = normalizeChild(item);

      if (child.MaTre && !uniqueMap.has(child.MaTre)) {
        uniqueMap.set(child.MaTre, child);
      }
    });

    return Array.from(uniqueMap.values());
  }, []);

  const filteredChildren = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return children.filter((child) => {
      const matchStatus = !tab || child.TrangThai === tab;
      const matchHealth = !healthFilter || child.SucKhoeGanNhat === healthFilter;

      const searchable = [
        child.MaTre,
        child.HoTen,
        child.GioiTinh,
        child.DanToc,
        child.DiaChiCuThe,
        child.TenXaPhuong,
        child.TenTinhTP,
        child.TinhTrangSucKhoe,
        child.SucKhoeGanNhat,
        child.TrangThai,
      ]
        .join(' ')
        .toLowerCase();

      const matchKeyword = !kw || searchable.includes(kw);

      return matchStatus && matchHealth && matchKeyword;
    });
  }, [children, keyword, tab, healthFilter]);

  const openDetail = (id) => {
    navigate(`/can-bo-tiep-nhan/tre/${id}`);
  };

  const openEdit = (id) => {
    navigate(`/can-bo-tiep-nhan/tre/${id}`);
  };

  const openHealth = (id) => {
    navigate(`/can-bo-tiep-nhan/suc-khoe/tre/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
              Trẻ trong trung tâm
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6F83A3]">
              Quản lý danh sách trẻ đã được tiếp nhận chính thức vào trung tâm.
              Trẻ chỉ xuất hiện tại đây sau khi hồ sơ tiếp nhận được duyệt.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5 lg:px-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div className="rounded-[24px] border border-[#DCE8F6] bg-[#EEF4FB] p-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {TABS.map((item) => {
                      const active = tab === item.value;

                      return (
                        <button
                          key={item.value || 'all'}
                          type="button"
                          onClick={() => setTab(item.value)}
                          className={`inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-bold transition ${active
                            ? 'bg-white text-[#0D47A1] shadow-[0_8px_24px_rgba(31,42,61,0.08)]'
                            : 'text-[#6F83A3] hover:bg-white/70 hover:text-[#0D47A1]'
                            }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row">
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="h-12 rounded-2xl border border-[#D7E5F7] bg-white px-4 text-sm font-bold text-[#26364A] outline-none transition focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                  >
                    <option value="">Tất cả sức khỏe</option>
                    <option value={HEALTH_STATUS.TOT}>Tốt</option>
                    <option value={HEALTH_STATUS.KHOE_MANH}>Khỏe mạnh</option>
                    <option value={HEALTH_STATUS.CAN_THEO_DOI}>Cần theo dõi</option>
                    <option value={HEALTH_STATUS.CAN_KHAM}>Cần khám</option>
                  </select>

                  <div className="relative w-full xl:w-[430px]">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                    />

                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Tìm mã trẻ, tên trẻ, dân tộc, địa chỉ..."
                      className="h-12 w-full rounded-2xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0D47A1]">
                Danh sách trẻ
              </h2>

              <p className="mt-1 text-sm text-[#8FA0B8]">
                Hiển thị {filteredChildren.length} / {children.length} trẻ.
              </p>
            </div>
          </div>

          {filteredChildren.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[#8FA0B8]">
                Không có trẻ phù hợp với điều kiện lọc.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Trẻ</th>
                    <th className="px-6 py-4 font-bold">Mã trẻ</th>
                    <th className="px-6 py-4 font-bold">Ngày sinh</th>
                    <th className="px-6 py-4 font-bold">Dân tộc</th>
                    <th className="px-6 py-4 font-bold">Địa chỉ</th>
                    <th className="px-6 py-4 font-bold">Sức khỏe</th>
                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                    <th className="px-6 py-4 font-bold">Ngày tiếp nhận</th>
                    <th className="w-[260px] px-6 py-4 text-right font-bold">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EDF3FB]">
                  {filteredChildren.map((child) => (
                    <tr
                      key={child.MaTre}
                      onClick={() => openDetail(child.MaTre)}
                      className="cursor-pointer transition hover:bg-[#F8FBFF]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-sm font-black text-[#0D47A1]">
                            {getInitials(child.HoTen)}
                          </div>

                          <div>
                            <p className="font-bold text-[#26364A]">
                              {child.HoTen}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-[#7D90AA]">
                              {getGenderText(child.GioiTinh)} · {getAge(child.NgaySinh)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                          {child.MaTre}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                        {child.NgaySinh ? formatDate(child.NgaySinh) : '—'}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                        {child.DanToc || 'Chưa cập nhật'}
                      </td>

                      <td className="max-w-[300px] px-6 py-5 text-sm leading-6 text-[#5F738F]">
                        {joinAddress(
                          child.DiaChiCuThe,
                          child.TenXaPhuong,
                          child.TenTinhTP
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <HealthPill status={child.SucKhoeGanNhat} />
                        <p className="mt-2 max-w-[220px] text-xs leading-5 text-[#8FA0B8]">
                          {child.TinhTrangSucKhoe || 'Chưa có ghi nhận'}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusPill status={child.TrangThai} />
                      </td>

                      <td className="px-6 py-5 text-sm text-[#5F738F]">
                        {child.NgayTiepNhan
                          ? formatDate(child.NgayTiepNhan)
                          : '—'}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(child.MaTre);
                            }}
                            className="inline-flex h-10 w-[88px] items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-3 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                          >
                            <Pencil size={14} />
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHealth(child.MaTre);
                            }}
                            className="inline-flex h-10 w-[116px] items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-3 text-xs font-bold text-white transition hover:bg-[#083778]"
                          >
                            <HeartPulse size={14} />
                            Sức khỏe
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#E4EAF2] px-7 py-4">
            <p className="text-xs font-semibold text-[#7D90AA]">
              Dữ liệu theo bảng TRE · Chỉ hiển thị trẻ đã được tiếp nhận chính thức
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}