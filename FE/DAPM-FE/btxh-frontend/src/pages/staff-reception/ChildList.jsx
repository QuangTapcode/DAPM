import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, HeartPulse, Pencil, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import childApi from '../../api/childApi';


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
  if (dob > now) return '—';

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (now.getDate() < dob.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years >= 1) return `${years} tuổi`;
  if (months >= 1) return `${months} tháng`;

  const diffDays = Math.floor((now - dob) / 86400000);
  if (diffDays >= 7) return `${Math.floor(diffDays / 7)} tuần`;
  return `${Math.max(diffDays, 0)} ngày`;
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
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-bold ${meta.cls}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
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
      className={`inline-flex whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-bold ${meta.cls}`}
    >
      {status || 'Chưa cập nhật'}
    </span>
  );
}

function normalizeChild(item) {
  return {
    MaTre: normalizeChildCode(item.maTre || item.MaTre || item.id || item.childId),
    HoTen: item.hoTen || item.HoTen || item.tenTre || item.TenTre || item.childName || 'Chưa cập nhật',
    GioiTinh: item.gioiTinh || item.GioiTinh || item.gender || '',
    NgaySinh: item.ngaySinh || item.NgaySinh || item.birthDate || '',
    DanToc: item.danToc || item.DanToc || item.ethnicity || '',
    DiaChiCuThe: item.diaChiCuThe || item.DiaChiCuThe || item.addressDetail || '',
    TenXaPhuong: item.tenXaPhuong || item.TenXaPhuong || item.wardName || '',
    TenTinhTP: item.tenTinhTP || item.TenTinhTP || item.provinceName || '',
    TinhTrangSucKhoe: item.tinhTrangSucKhoe || item.TinhTrangSucKhoe || item.healthStatus || '',
    SucKhoeGanNhat: item.sucKhoeGanNhat || item.SucKhoeGanNhat || item.latestHealthStatus || HEALTH_STATUS.CAN_THEO_DOI,
    TrangThai: item.trangThai || item.TrangThai || item.status || CHILD_STATUS.DANG_CHAM_SOC,
    NgayTiepNhan: item.ngayTiepNhan || item.NgayTiepNhan || item.createdAt || '',
    GhiChu: item.ghiChu || item.GhiChu || item.note || '',
  };
}


export default function ChildList() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [rawChildren, setRawChildren] = useState([]);

  useEffect(() => {
    childApi.getAll({ limit: 500 })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res?.items || []);
        setRawChildren(items);
      })
      .catch(() => setRawChildren([]));
  }, []);

  const children = useMemo(() => {
    const uniqueMap = new Map();
    rawChildren.forEach((item) => {
      const child = normalizeChild(item);
      if (child.MaTre && !uniqueMap.has(child.MaTre)) {
        uniqueMap.set(child.MaTre, child);
      }
    });
    return Array.from(uniqueMap.values());
  }, [rawChildren]);

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
          <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-7 py-6 lg:px-7">
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
                <thead className="bg-[#F7FAFF] text-[12px] uppercase tracking-[0.12em] text-[#8093AB]">
                  <tr>
                    <th className="px-7 py-5 font-bold">Trẻ</th>
                    <th className="px-7 py-5 font-bold">Mã trẻ</th>
                    <th className="px-7 py-5 font-bold">Ngày sinh</th>
                    <th className="px-7 py-5 font-bold">Dân tộc</th>
                    <th className="px-7 py-5 font-bold">Địa chỉ</th>
                    <th className="px-7 py-5 font-bold">Sức khỏe</th>
                    <th className="px-7 py-5 font-bold">Trạng thái</th>
                    <th className="px-7 py-5 font-bold">Ngày tiếp nhận</th>
                    <th className="w-[260px] px-7 py-5 text-right font-bold">
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
                      <td className="px-7 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#EAF3FF] to-[#DCEBFC] text-base font-black text-[#0D47A1] ring-1 ring-[#0D47A1]/5">
                            {getInitials(child.HoTen)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[16px] font-bold leading-tight text-[#1A2B4B]">
                              {child.HoTen}
                            </p>
                            <p className="mt-1.5 flex items-center gap-2 text-[13px] font-semibold text-[#7D90AA]">
                              <span>{getGenderText(child.GioiTinh)}</span>
                              <span className="h-1 w-1 rounded-full bg-[#C4D2E4]" />
                              <span>{getAge(child.NgaySinh)}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-7 py-6">
                        <span className="rounded-xl bg-[#EAF3FF] px-3 py-1.5 text-[13px] font-extrabold tracking-wide text-[#0D47A1]">
                          {child.MaTre}
                        </span>
                      </td>

                      <td className="px-7 py-6 text-sm font-semibold text-[#5F738F]">
                        {child.NgaySinh ? formatDate(child.NgaySinh) : '—'}
                      </td>

                      <td className="px-7 py-6 text-sm font-semibold text-[#5F738F]">
                        {child.DanToc || 'Chưa cập nhật'}
                      </td>

                      <td className="max-w-[300px] px-7 py-6 text-sm leading-6 text-[#5F738F]">
                        {joinAddress(
                          child.DiaChiCuThe,
                          child.TenXaPhuong,
                          child.TenTinhTP
                        )}
                      </td>

                      <td className="px-7 py-6">
                        <HealthPill status={child.SucKhoeGanNhat} />
                        <p className="mt-2 max-w-[220px] text-xs leading-5 text-[#8FA0B8]">
                          {child.TinhTrangSucKhoe || 'Chưa có ghi nhận'}
                        </p>
                      </td>

                      <td className="px-7 py-6">
                        <StatusPill status={child.TrangThai} />
                      </td>

                      <td className="px-7 py-6 text-sm text-[#5F738F]">
                        {child.NgayTiepNhan
                          ? formatDate(child.NgayTiepNhan)
                          : '—'}
                      </td>

                      <td className="px-7 py-6">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(child.MaTre);
                            }}
                            className="inline-flex h-11 w-[92px] items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-3 text-[13px] font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] active:scale-[0.97]"
                          >
                            <Pencil size={15} />
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHealth(child.MaTre);
                            }}
                            className="inline-flex h-11 w-[120px] items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-3 text-[13px] font-bold text-white transition hover:bg-[#083778] active:scale-[0.97]"
                          >
                            <HeartPulse size={15} />
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