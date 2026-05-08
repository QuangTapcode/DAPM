import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const STORAGE_KEY = 'mock_reception_profiles';

const STATUS_PROFILE = {
    DANG_XU_LY: 'Đang xử lý',
    CHO_DUYET: 'Chờ duyệt',
    DA_DUYET: 'Đã duyệt',
    TU_CHOI: 'Từ chối',
    DA_HUY: 'Đã hủy',
};

const TABS = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang xử lý', value: STATUS_PROFILE.DANG_XU_LY },
    { label: 'Chờ duyệt', value: STATUS_PROFILE.CHO_DUYET },
    { label: 'Đã duyệt', value: STATUS_PROFILE.DA_DUYET },
    { label: 'Từ chối', value: STATUS_PROFILE.TU_CHOI },
    { label: 'Đã hủy', value: STATUS_PROFILE.DA_HUY },
];

const STATUS_META = {
    [STATUS_PROFILE.DANG_XU_LY]: {
        label: 'Đang xử lý',
        cls: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-400',
    },
    [STATUS_PROFILE.CHO_DUYET]: {
        label: 'Chờ duyệt',
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-400',
    },
    [STATUS_PROFILE.DA_DUYET]: {
        label: 'Đã duyệt',
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-400',
    },
    [STATUS_PROFILE.TU_CHOI]: {
        label: 'Từ chối',
        cls: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-400',
    },
    [STATUS_PROFILE.DA_HUY]: {
        label: 'Đã hủy',
        cls: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
    },
};

const DEMO_PROFILES = [
    {
        MaHSTiepNhan: 'HSTN0001',
        MaYeuCauGuiTre: 'YCGT0002',
        MaTre: null,
        MaCanBoTiepNhan: 'ND000004',
        TenNguoiDuyet: 'Trưởng phòng tiếp nhận',
        TenTre: 'Nguyễn Minh Khang',
        TenNguoiGui: 'Nguyễn Văn Minh',
        NgayTiepNhan: '2026-04-10',
        TrangThai: 'Chờ duyệt',
        NgayDuyet: null,
        GhiChu: 'Hồ sơ đã được lập, đang chờ trưởng phòng duyệt.',
    },
    {
        MaHSTiepNhan: 'HSTN0002',
        MaYeuCauGuiTre: 'YCGT0001',
        MaTre: 'TRE00015',
        MaCanBoTiepNhan: 'ND000004',
        TenNguoiDuyet: 'Trưởng phòng tiếp nhận',
        TenTre: 'Nguyễn An',
        TenNguoiGui: 'Trần Thị Gửi',
        NgayTiepNhan: '2026-03-01',
        TrangThai: 'Đã duyệt',
        NgayDuyet: '2026-03-02',
        GhiChu: 'Hồ sơ đã duyệt, trẻ được tiếp nhận chính thức.',
    },
    {
        MaHSTiepNhan: 'HSTN0003',
        MaYeuCauGuiTre: 'YCGT0004',
        MaTre: null,
        MaCanBoTiepNhan: 'ND000004',
        TenNguoiDuyet: 'Trưởng phòng tiếp nhận',
        TenTre: 'Lê Bảo',
        TenNguoiGui: 'Lê Thị Hạnh',
        NgayTiepNhan: '2026-04-16',
        TrangThai: 'Từ chối',
        NgayDuyet: '2026-04-17',
        GhiChu: 'Hồ sơ tiếp nhận không đạt điều kiện.',
    },
];

function safeReadStorageProfiles() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function safeWriteStorageProfiles(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeRequestCode(value) {
    if (!value) return '';

    const text = String(value).trim().toUpperCase();

    const match = text.match(/^YCGT(\d+)$/);
    if (match) {
        return `YCGT${match[1].padStart(4, '0')}`;
    }

    if (/^\d+$/.test(text)) {
        return `YCGT${text.padStart(4, '0')}`;
    }

    return text;
}

function normalizeProfileCode(value) {
    if (!value) return '';

    const text = String(value).trim().toUpperCase();

    const match = text.match(/^HSTN(\d+)$/);
    if (match) {
        return `HSTN${match[1].padStart(4, '0')}`;
    }

    if (/^\d+$/.test(text)) {
        return `HSTN${text.padStart(4, '0')}`;
    }

    return text;
}

function normalizeChildCode(value) {
    if (!value) return null;

    const text = String(value).trim().toUpperCase();

    const match = text.match(/^TRE(\d+)$/);
    if (match) {
        return `TRE${match[1].padStart(5, '0')}`;
    }

    if (/^\d+$/.test(text)) {
        return `TRE${text.padStart(5, '0')}`;
    }

    return text;
}

function normalizeUserCode(value) {
    if (!value) return '';

    const text = String(value).trim().toUpperCase();

    const match = text.match(/^ND(\d+)$/);
    if (match) {
        return `ND${match[1].padStart(6, '0')}`;
    }

    if (/^\d+$/.test(text)) {
        return `ND${text.padStart(6, '0')}`;
    }

    return text;
}

function normalizeStatus(value) {
    const status = String(value || '').trim();

    if (status === 'processing') return STATUS_PROFILE.DANG_XU_LY;
    if (status === 'pending') return STATUS_PROFILE.CHO_DUYET;
    if (status === 'approved') return STATUS_PROFILE.DA_DUYET;
    if (status === 'rejected') return STATUS_PROFILE.TU_CHOI;
    if (status === 'cancelled') return STATUS_PROFILE.DA_HUY;

    if (Object.values(STATUS_PROFILE).includes(status)) {
        return status;
    }

    return STATUS_PROFILE.CHO_DUYET;
}

function normalizeProfile(item) {
    const maHSTiepNhan = normalizeProfileCode(item.MaHSTiepNhan || item.id);
    const maYeuCauGuiTre = normalizeRequestCode(
        item.MaYeuCauGuiTre || item.requestId || item.yeuCauGuiTre?.MaYeuCauGuiTre
    );

    const maCanBoTiepNhan = normalizeUserCode(
        item.MaCanBoTiepNhan ||
        item.approverId ||
        item.yeuCauGuiTre?.MaCanBoTiepNhan ||
        'ND000004'
    );

    return {
        id: maHSTiepNhan,
        MaHSTiepNhan: maHSTiepNhan,
        MaYeuCauGuiTre: maYeuCauGuiTre,
        MaTre: normalizeChildCode(item.MaTre || item.childId),
        MaCanBoTiepNhan: maCanBoTiepNhan,

        TenNguoiDuyet:
            item.TenNguoiDuyet ||
            item.TenCanBoTiepNhan ||
            item.approverName ||
            'Trưởng phòng tiếp nhận',

        TenTre:
            item.TenTre ||
            item.TenTreTam ||
            item.childName ||
            item.thongTinTreTam?.HoTen ||
            item.thongTinTreTam?.hoTen ||
            item.tre?.HoTen ||
            item.tre?.hoTen ||
            'Chưa cập nhật',

        TenNguoiGui:
            item.TenNguoiGui ||
            item.senderName ||
            item.nguoiGui?.HoTen ||
            item.nguoiGui?.hoTen ||
            'Chưa cập nhật',

        NgayTiepNhan: item.NgayTiepNhan || item.createdAt || '',
        TrangThai: normalizeStatus(item.TrangThai || item.status),
        NgayDuyet: item.NgayDuyet || item.approvedAt || '',
        GhiChu: item.GhiChu || item.note || '',
    };
}

function cleanProfileList(items) {
    const normalized = items
        .map(normalizeProfile)
        .filter((item) => item.MaHSTiepNhan && item.MaYeuCauGuiTre);

    const uniqueByRequest = new Map();

    normalized.forEach((item) => {
        if (!uniqueByRequest.has(item.MaYeuCauGuiTre)) {
            uniqueByRequest.set(item.MaYeuCauGuiTre, item);
        }
    });

    return Array.from(uniqueByRequest.values());
}

function StatusPill({ status }) {
    const meta = STATUS_META[status] || {
        label: status || 'Không xác định',
        cls: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold ${meta.cls}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    );
}

function truncateText(value, max = 80) {
    if (!value) return '—';
    return value.length > max ? `${value.slice(0, max)}...` : value;
}

export default function ReceptionProfileList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [tab, setTab] = useState('');
    const [keyword, setKeyword] = useState('');
    const [storageVersion, setStorageVersion] = useState(0);

    const message = location.state?.message;
    const createdProfileId = normalizeProfileCode(location.state?.createdProfileId);

    useEffect(() => {
        const savedProfiles = safeReadStorageProfiles();
        const cleanedProfiles = cleanProfileList(savedProfiles);

        safeWriteStorageProfiles(cleanedProfiles);
        setStorageVersion((value) => value + 1);
    }, []);

    const profiles = useMemo(() => {
        const savedProfiles = safeReadStorageProfiles();
        return cleanProfileList([...savedProfiles, ...DEMO_PROFILES]);
    }, [storageVersion]);

    const filteredProfiles = useMemo(() => {
        const kw = keyword.trim().toLowerCase();

        return profiles.filter((item) => {
            const matchStatus = !tab || item.TrangThai === tab;

            const searchable = [
                item.MaHSTiepNhan,
                item.MaYeuCauGuiTre,
                item.MaTre,
                item.MaCanBoTiepNhan,
                item.TenTre,
                item.TenNguoiGui,
                item.TenNguoiDuyet,
                item.TrangThai,
                item.GhiChu,
            ]
                .join(' ')
                .toLowerCase();

            const matchKeyword = !kw || searchable.includes(kw);

            return matchStatus && matchKeyword;
        });
    }, [profiles, tab, keyword]);

    const openDetail = (id) => {
        navigate(`/can-bo-tiep-nhan/ho-so-tiep-nhan/${id}`);
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB]">
            <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
                <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                            Hồ sơ tiếp nhận
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6F83A3]">
                            Theo dõi danh sách hồ sơ đã được lập từ yêu cầu gửi trẻ. Màn hình
                            này chỉ dùng để xem hồ sơ, không chỉnh sửa trạng thái.
                        </p>
                    </div>
                </header>

                {message && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                        {message}
                    </div>
                )}

                <section className="overflow-hidden rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
                    <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-5 lg:px-7">
                        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
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

                            <div className="relative w-full xl:w-[460px]">
                                <Search
                                    size={17}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
                                />

                                <input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm mã hồ sơ, mã yêu cầu, tên trẻ, người gửi..."
                                    className="w-full rounded-2xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#0D47A1] focus:ring-4 focus:ring-[#0D47A1]/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#EDF3FB] px-7 py-5">
                        <div>
                            <h2 className="text-xl font-bold text-[#0D47A1]">
                                Danh sách hồ sơ
                            </h2>
                            <p className="mt-1 text-sm text-[#8FA0B8]">
                                Hiển thị {filteredProfiles.length} / {profiles.length} hồ sơ.
                            </p>
                        </div>
                    </div>

                    {filteredProfiles.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-sm font-semibold text-[#8FA0B8]">
                                Không có hồ sơ tiếp nhận phù hợp.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                                <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.14em] text-[#8FA0B8]">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Mã hồ sơ</th>
                                        <th className="px-6 py-4 font-bold">Mã yêu cầu</th>
                                        <th className="px-6 py-4 font-bold">Mã trẻ</th>
                                        <th className="px-6 py-4 font-bold">Tên trẻ</th>
                                        <th className="px-6 py-4 font-bold">Người gửi</th>
                                        <th className="px-6 py-4 font-bold">Người duyệt</th>
                                        <th className="px-6 py-4 font-bold">Ngày tiếp nhận</th>
                                        <th className="px-6 py-4 font-bold">Ngày duyệt</th>
                                        <th className="px-6 py-4 font-bold">Trạng thái</th>
                                        <th className="px-6 py-4 font-bold">Ghi chú</th>
                                        <th className="w-[120px] px-6 py-4 text-right font-bold">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#EDF3FB]">
                                    {filteredProfiles.map((profile) => {
                                        const isNew = createdProfileId === profile.MaHSTiepNhan;

                                        return (
                                            <tr
                                                key={profile.MaHSTiepNhan}
                                                onClick={() => openDetail(profile.MaHSTiepNhan)}
                                                className={`cursor-pointer transition ${isNew
                                                    ? 'bg-emerald-50 hover:bg-emerald-50'
                                                    : 'hover:bg-[#F8FBFF]'
                                                    }`}
                                            >
                                                <td className="px-6 py-5">
                                                    <span className="rounded-xl bg-[#EAF3FF] px-3 py-1 text-xs font-extrabold text-[#0D47A1]">
                                                        {profile.MaHSTiepNhan}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                                                    {profile.MaYeuCauGuiTre}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-[#5F738F]">
                                                    {profile.MaTre || 'Chưa có'}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-[#26364A]">
                                                        {profile.TenTre}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5 text-sm font-semibold text-[#26364A]">
                                                    {profile.TenNguoiGui}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#5F738F]">
                                                    <p className="font-semibold text-[#26364A]">
                                                        {profile.TenNguoiDuyet}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#8FA0B8]">
                                                        {profile.MaCanBoTiepNhan}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#5F738F]">
                                                    {profile.NgayTiepNhan
                                                        ? formatDate(profile.NgayTiepNhan)
                                                        : '—'}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#8FA0B8]">
                                                    {profile.NgayDuyet
                                                        ? formatDate(profile.NgayDuyet)
                                                        : 'Chưa duyệt'}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusPill status={profile.TrangThai} />
                                                </td>

                                                <td className="max-w-[260px] px-6 py-5 text-sm leading-6 text-[#5F738F]">
                                                    {truncateText(profile.GhiChu, 80)}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDetail(profile.MaHSTiepNhan);
                                                            }}
                                                            className="inline-flex h-10 w-[96px] items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-4 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                                                        >
                                                            <Eye size={14} />
                                                            Xem
                                                        </button>
                                                    </div>
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