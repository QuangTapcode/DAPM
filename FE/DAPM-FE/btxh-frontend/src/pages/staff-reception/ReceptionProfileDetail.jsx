import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Clock3,
    Eye,
    FileText,
    XCircle,
} from 'lucide-react';

import { formatDate } from '../../utils/formatDate';

const STORAGE_KEY = 'mock_reception_profiles';

const STATUS_PROFILE = {
    DANG_XU_LY: 'Đang xử lý',
    CHO_DUYET: 'Chờ duyệt',
    DA_DUYET: 'Đã duyệt',
    TU_CHOI: 'Từ chối',
    DA_HUY: 'Đã hủy',
};

const STATUS_FLOW = [
    {
        value: STATUS_PROFILE.DANG_XU_LY,
        label: 'Đang xử lý',
        description: 'Hồ sơ đang được lập hoặc kiểm tra nội bộ.',
    },
    {
        value: STATUS_PROFILE.CHO_DUYET,
        label: 'Chờ duyệt',
        description: 'Hồ sơ đã lập, đang chờ trưởng phòng duyệt.',
    },
    {
        value: STATUS_PROFILE.DA_DUYET,
        label: 'Đã duyệt',
        description: 'Hồ sơ đã duyệt, trẻ được tiếp nhận chính thức.',
    },
];

const STATUS_META = {
    [STATUS_PROFILE.DANG_XU_LY]: {
        label: 'Đang xử lý',
        cls: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    [STATUS_PROFILE.CHO_DUYET]: {
        label: 'Chờ duyệt',
        cls: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    [STATUS_PROFILE.DA_DUYET]: {
        label: 'Đã duyệt',
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    [STATUS_PROFILE.TU_CHOI]: {
        label: 'Từ chối',
        cls: 'bg-red-50 text-red-700 border-red-200',
    },
    [STATUS_PROFILE.DA_HUY]: {
        label: 'Đã hủy',
        cls: 'bg-slate-50 text-slate-700 border-slate-200',
    },
};

const DOCUMENT_STATUS_META = {
    'Hợp lệ': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Không hợp lệ': 'bg-red-50 text-red-700 border-red-200',
    'Cần bổ sung': 'bg-orange-50 text-orange-700 border-orange-200',
    'Chờ xác minh': 'bg-amber-50 text-amber-700 border-amber-200',
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
        yeuCauGuiTre: {
            MaYeuCauGuiTre: 'YCGT0002',
            MaNguoiGui: 'ND000012',
            MaLoaiNguoiGui: 'CME',
            QuanHeVoiTre: 'Cha ruột',
            LyDoGui: 'Cha/mẹ bệnh nặng, chưa thể chăm sóc trẻ.',
            TrangThaiYC: 'Đã tiếp nhận',
            NgayTao: '2026-04-10T08:30:00',
            NgayCapNhat: '2026-04-10T09:00:00',
        },
        nguoiGui: {
            HoTen: 'Nguyễn Văn Minh',
            CCCD: '048201012345',
            SoDienThoai: '0905123456',
            Email: 'minh@example.com',
            DiaChiCuThe: '12 Nguyễn Văn Linh',
            TenXaPhuong: 'Hải Châu',
            TenTinhTP: 'Đà Nẵng',
        },
        thongTinTreTam: {
            HoTen: 'Nguyễn Minh Khang',
            NgaySinh: '2020-06-12',
            GioiTinh: 'Nam',
            DanToc: 'Kinh',
            DiaChiCuThe: '12 Nguyễn Văn Linh',
            TenXaPhuong: 'Hải Châu',
            TenTinhTP: 'Đà Nẵng',
            TinhTrangSucKhoe: 'Sức khỏe ổn định, cần theo dõi dinh dưỡng.',
        },
        giayTo: [
            {
                MaGiayTo: 'GT000101',
                TenGiayTo: 'Giấy khai sinh của trẻ',
                LoaiGiayTo: 'Giấy khai sinh',
                TrangThai: 'Hợp lệ',
                NgayCapNhat: '2026-04-10T09:00:00',
            },
            {
                MaGiayTo: 'GT000102',
                TenGiayTo: 'CCCD người gửi trẻ',
                LoaiGiayTo: 'Tùy thân',
                TrangThai: 'Hợp lệ',
                NgayCapNhat: '2026-04-10T09:00:00',
            },
        ],
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
        yeuCauGuiTre: {
            MaYeuCauGuiTre: 'YCGT0001',
            MaNguoiGui: 'ND000011',
            MaLoaiNguoiGui: 'NTH',
            QuanHeVoiTre: 'Người thân',
            LyDoGui: 'Gia đình không đủ điều kiện chăm sóc.',
            TrangThaiYC: 'Đã tiếp nhận',
            NgayTao: '2026-03-01T08:00:00',
        },
        nguoiGui: {
            HoTen: 'Trần Thị Gửi',
            CCCD: '048201099999',
            SoDienThoai: '0912345678',
            Email: 'gui@example.com',
            DiaChiCuThe: '20 Lê Duẩn',
            TenXaPhuong: 'Thanh Khê',
            TenTinhTP: 'Đà Nẵng',
        },
        thongTinTreTam: {
            HoTen: 'Nguyễn An',
            NgaySinh: '2019-02-14',
            GioiTinh: 'Nữ',
            DanToc: 'Kinh',
            DiaChiCuThe: '20 Lê Duẩn',
            TenXaPhuong: 'Thanh Khê',
            TenTinhTP: 'Đà Nẵng',
            TinhTrangSucKhoe: 'Sức khỏe ổn định.',
        },
        giayTo: [],
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
        yeuCauGuiTre: {
            MaYeuCauGuiTre: 'YCGT0004',
            MaNguoiGui: 'ND000014',
            MaLoaiNguoiGui: 'CME',
            QuanHeVoiTre: 'Mẹ ruột',
            LyDoGui: 'Không đủ điều kiện chăm sóc.',
            TrangThaiYC: 'Đã tiếp nhận',
            NgayTao: '2026-04-16T08:00:00',
        },
        nguoiGui: {
            HoTen: 'Lê Thị Hạnh',
            CCCD: '048201088888',
            SoDienThoai: '0988777666',
            Email: 'hanh@example.com',
            DiaChiCuThe: '15 Hải Phòng',
            TenXaPhuong: 'Hải Châu',
            TenTinhTP: 'Đà Nẵng',
        },
        thongTinTreTam: {
            HoTen: 'Lê Bảo',
            NgaySinh: '2021-09-20',
            GioiTinh: 'Nam',
            DanToc: 'Kinh',
            DiaChiCuThe: '15 Hải Phòng',
            TenXaPhuong: 'Hải Châu',
            TenTinhTP: 'Đà Nẵng',
            TinhTrangSucKhoe: 'Cần kiểm tra thêm.',
        },
        giayTo: [],
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

function normalizeRequestCode(value) {
    if (!value) return '';

    const text = String(value).trim().toUpperCase();
    const match = text.match(/^YCGT(\d+)$/);

    if (match) return `YCGT${match[1].padStart(4, '0')}`;
    if (/^\d+$/.test(text)) return `YCGT${text.padStart(4, '0')}`;

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

function normalizeChildCode(value) {
    if (!value) return null;

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

function normalizeStatus(value) {
    const status = String(value || '').trim();

    if (status === 'processing') return STATUS_PROFILE.DANG_XU_LY;
    if (status === 'pending') return STATUS_PROFILE.CHO_DUYET;
    if (status === 'approved') return STATUS_PROFILE.DA_DUYET;
    if (status === 'rejected') return STATUS_PROFILE.TU_CHOI;
    if (status === 'cancelled') return STATUS_PROFILE.DA_HUY;

    if (Object.values(STATUS_PROFILE).includes(status)) return status;

    return STATUS_PROFILE.CHO_DUYET;
}

function getSenderTypeLabel(code) {
    const map = {
        CME: 'Cha hoặc mẹ ruột',
        NTH: 'Người thân',
        CQDP: 'Cơ quan địa phương',
    };

    return map[code] || code || 'Chưa cập nhật';
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

function normalizeDocument(doc, index) {
    return {
        MaGiayTo: doc.MaGiayTo || doc.id || `GT-${index + 1}`,
        TenGiayTo: doc.TenGiayTo || doc.name || `Giấy tờ ${index + 1}`,
        LoaiGiayTo: doc.LoaiGiayTo || doc.type || 'Giấy tờ',
        TrangThai: doc.TrangThai || doc.status || 'Chờ xác minh',
        NgayCapNhat: doc.NgayCapNhat || doc.updatedAt || '',
        GhiChu: doc.GhiChu || doc.note || '',
        DuongDanFile: doc.DuongDanFile || doc.url || doc.fileUrl || '',
    };
}

function normalizeProfile(item) {
    const request = item.yeuCauGuiTre || item.YeuCauGuiTre || {};
    const sender = item.nguoiGui || item.NguoiGui || {};
    const child = item.thongTinTreTam || item.ThongTinTreTam || item.treTam || {};
    const officialChild = item.tre || item.Tre || {};
    const docs = item.giayTo || item.GiayTo || item.documents || [];

    const maHSTiepNhan = normalizeProfileCode(item.MaHSTiepNhan || item.id);
    const maYeuCauGuiTre = normalizeRequestCode(
        item.MaYeuCauGuiTre || request.MaYeuCauGuiTre || item.requestId
    );

    const tenTre =
        item.TenTre ||
        item.TenTreTam ||
        item.childName ||
        child.HoTen ||
        child.hoTen ||
        officialChild.HoTen ||
        officialChild.hoTen ||
        'Chưa cập nhật';

    return {
        MaHSTiepNhan: maHSTiepNhan,
        MaYeuCauGuiTre: maYeuCauGuiTre,
        MaTre: normalizeChildCode(item.MaTre || officialChild.MaTre || item.childId),
        MaCanBoTiepNhan: normalizeUserCode(
            item.MaCanBoTiepNhan || item.approverId || 'ND000004'
        ),
        TenNguoiDuyet:
            item.TenNguoiDuyet ||
            item.TenCanBoTiepNhan ||
            item.approverName ||
            'Trưởng phòng tiếp nhận',
        NgayTiepNhan: item.NgayTiepNhan || item.createdAt || '',
        TrangThai: normalizeStatus(item.TrangThai || item.status),
        NgayDuyet: item.NgayDuyet || item.approvedAt || '',
        GhiChu: item.GhiChu || item.note || '',

        yeuCau: {
            MaYeuCauGuiTre: maYeuCauGuiTre,
            MaNguoiGui: normalizeUserCode(
                request.MaNguoiGui || item.MaNguoiGui || sender.MaNguoiDung
            ),
            MaLoaiNguoiGui:
                request.MaLoaiNguoiGui || item.MaLoaiNguoiGui || item.senderTypeCode || '',
            QuanHeVoiTre: request.QuanHeVoiTre || item.QuanHeVoiTre || '',
            LyDoGui: request.LyDoGui || item.LyDoGui || item.reason || '',
            TrangThaiYC: request.TrangThaiYC || item.TrangThaiYC || 'Đã tiếp nhận',
            NgayTao: request.NgayTao || item.NgayTao || '',
        },

        nguoiGui: {
            HoTen:
                sender.HoTen ||
                sender.hoTen ||
                item.TenNguoiGui ||
                item.senderName ||
                'Chưa cập nhật',
            CCCD: sender.CCCD || sender.SoCCCD || item.senderCccd || '',
            SoDienThoai: sender.SoDienThoai || sender.phone || item.senderPhone || '',
            Email: sender.Email || sender.email || item.senderEmail || '',
            DiaChiCuThe: sender.DiaChiCuThe || item.senderAddressDetail || '',
            TenXaPhuong: sender.TenXaPhuong || item.senderWardName || '',
            TenTinhTP: sender.TenTinhTP || item.senderProvinceName || '',
        },

        tre: {
            HoTen: tenTre,
            NgaySinh:
                child.NgaySinh ||
                child.ngaySinh ||
                officialChild.NgaySinh ||
                officialChild.ngaySinh ||
                item.childBirthDate ||
                '',
            GioiTinh:
                child.GioiTinh ||
                child.gioiTinh ||
                officialChild.GioiTinh ||
                officialChild.gioiTinh ||
                item.childGender ||
                '',
            DanToc:
                child.DanToc ||
                child.danToc ||
                officialChild.DanToc ||
                officialChild.danToc ||
                item.childEthnicity ||
                '',
            DiaChiCuThe:
                child.DiaChiCuThe ||
                officialChild.DiaChiCuThe ||
                item.childAddressDetail ||
                '',
            TenXaPhuong:
                child.TenXaPhuong ||
                officialChild.TenXaPhuong ||
                item.childWardName ||
                '',
            TenTinhTP:
                child.TenTinhTP ||
                officialChild.TenTinhTP ||
                item.childProvinceName ||
                '',
            TinhTrangSucKhoe:
                child.TinhTrangSucKhoe ||
                child.tinhTrangSucKhoe ||
                officialChild.TinhTrangSucKhoe ||
                officialChild.tinhTrangSucKhoe ||
                item.childHealthStatus ||
                '',
        },

        documents: Array.isArray(docs) ? docs.map(normalizeDocument) : [],
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

function FieldView({ label, value, wide = false }) {
    return (
        <div
            className={`rounded-[20px] border border-[#E6EDF5] bg-[#FAFCFF] px-5 py-4 ${wide ? 'md:col-span-2' : ''
                }`}
        >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                {label}
            </p>

            <p className="break-words text-sm font-semibold leading-7 text-[#26364A]">
                {value || 'Chưa cập nhật'}
            </p>
        </div>
    );
}

function TextView({ label, value }) {
    return (
        <div className="rounded-[20px] border border-[#E6EDF5] bg-[#FAFCFF] px-5 py-4 md:col-span-2">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                {label}
            </p>

            <p className="min-h-[76px] whitespace-pre-line text-sm font-semibold leading-7 text-[#26364A]">
                {value || 'Chưa cập nhật'}
            </p>
        </div>
    );
}

function SectionBlock({ number, title, children }) {
    return (
        <section className="border-b border-[#E4EAF2] px-6 py-7 last:border-b-0 lg:px-8">
            <div className="mb-5 flex items-baseline gap-2">
                <span className="text-[20px] font-black text-[#0D47A1]">
                    {number}.
                </span>
                <h2 className="text-[20px] font-bold text-[#0D47A1]">{title}</h2>
            </div>

            {children}
        </section>
    );
}

function DocumentCard({ item }) {
    const statusClass =
        DOCUMENT_STATUS_META[item.TrangThai] ||
        'bg-slate-50 text-slate-700 border-slate-200';

    return (
        <div className="rounded-[20px] border border-[#E6EDF5] bg-[#FAFCFF] p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                    <p className="font-bold text-[#26364A]">{item.TenGiayTo}</p>
                    <p className="mt-1 text-sm text-[#7D90AA]">
                        {item.MaGiayTo} · {item.LoaiGiayTo}
                    </p>
                    {item.NgayCapNhat && (
                        <p className="mt-1 text-xs font-semibold text-[#9AACBF]">
                            Cập nhật: {formatDate(item.NgayCapNhat)}
                        </p>
                    )}
                </div>

                <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${statusClass}`}
                >
                    {item.TrangThai}
                </span>
            </div>
        </div>
    );
}

function ProgressStep({ step, index, currentStatus }) {
    const currentIndex = STATUS_FLOW.findIndex((item) => item.value === currentStatus);
    const stepIndex = STATUS_FLOW.findIndex((item) => item.value === step.value);

    const isEnded =
        currentStatus === STATUS_PROFILE.TU_CHOI ||
        currentStatus === STATUS_PROFILE.DA_HUY;

    const active = !isEnded && currentIndex >= stepIndex;
    const current = currentStatus === step.value;

    return (
        <div className="relative flex gap-4">
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${active
                        ? 'border-[#0D47A1] bg-[#0D47A1] text-white'
                        : 'border-[#D7E1EE] bg-white text-[#8FA0B8]'
                        }`}
                >
                    {active ? <CheckCircle2 size={18} /> : <Circle size={15} />}
                </div>

                {index < STATUS_FLOW.length - 1 && (
                    <div
                        className={`mt-2 h-11 w-0.5 ${active && !current ? 'bg-[#0D47A1]' : 'bg-[#D7E1EE]'
                            }`}
                    />
                )}
            </div>

            <div className="pb-6">
                <p className={`text-sm font-bold ${active ? 'text-[#0D47A1]' : 'text-[#64748B]'}`}>
                    {step.label}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#7D90AA]">
                    {step.description}
                </p>

                {current && (
                    <span className="mt-3 inline-flex rounded-full bg-[#EAF3FF] px-3 py-1 text-xs font-bold text-[#0D47A1]">
                        Hiện tại
                    </span>
                )}
            </div>
        </div>
    );
}

function StatusProgress({ status }) {
    const isRejected = status === STATUS_PROFILE.TU_CHOI;
    const isCancelled = status === STATUS_PROFILE.DA_HUY;

    if (isRejected || isCancelled) {
        return (
            <div className="rounded-[24px] border border-red-100 bg-red-50 p-5">
                <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                        <XCircle size={18} />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-red-700">{status}</p>
                        <p className="mt-1 text-sm leading-6 text-red-700/80">
                            Hồ sơ đã kết thúc ở trạng thái này.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {STATUS_FLOW.map((step, index) => (
                <ProgressStep
                    key={step.value}
                    step={step}
                    index={index}
                    currentStatus={status}
                />
            ))}
        </div>
    );
}

function ActionPanel({ profile, onBack, onOpenRequest, onOpenChild }) {
    return (
        <aside className="xl:col-span-4">
            <div className="space-y-6 xl:sticky xl:top-24">
                <section className="rounded-[30px] border border-[#E1E8F2] bg-white p-6 shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
                    <h3 className="text-[20px] font-bold text-[#0D47A1]">
                        Chức năng
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-[#7D90AA]">
                        Cán bộ tiếp nhận chỉ theo dõi hồ sơ, không chỉnh sửa hoặc duyệt tại màn hình này.
                    </p>

                    <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                            Trạng thái hồ sơ
                        </p>

                        <div className="mt-3">
                            <StatusBadge status={profile.TrangThai} />
                        </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Clock3 size={17} className="text-[#0D47A1]" />
                            <h4 className="font-bold text-[#0D47A1]">Tiến trình</h4>
                        </div>

                        <StatusProgress status={profile.TrangThai} />
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={onOpenRequest}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                        >
                            <FileText size={17} />
                            Xem yêu cầu gốc
                        </button>

                        {profile.MaTre && (
                            <button
                                type="button"
                                onClick={onOpenChild}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778]"
                            >
                                <Eye size={17} />
                                Xem hồ sơ trẻ
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
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

export default function ReceptionProfileDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const profile = useMemo(() => {
        const normalizedId = normalizeProfileCode(id);
        const savedProfiles = safeReadStorageProfiles();
        const profiles = [...savedProfiles, ...DEMO_PROFILES].map(normalizeProfile);

        return profiles.find((item) => item.MaHSTiepNhan === normalizedId);
    }, [id]);

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-center">
                <p className="text-sm font-semibold text-red-600">
                    Không tìm thấy hồ sơ tiếp nhận.
                </p>

                <button
                    type="button"
                    onClick={() => navigate('/can-bo-tiep-nhan/ho-so-tiep-nhan')}
                    className="mt-5 rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const openRequest = () => {
        navigate(`/can-bo-tiep-nhan/yeu-cau/${profile.MaYeuCauGuiTre}`);
    };

    const openChild = () => {
        if (profile.MaTre) {
            navigate(`/can-bo-tiep-nhan/tre/${profile.MaTre}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FB]">
            <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
                <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
                    <div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                                Chi tiết hồ sơ tiếp nhận
                            </h1>

                            <StatusBadge status={profile.TrangThai} />
                        </div>

                        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#6F83A3]">
                            Hồ sơ được lập từ yêu cầu gửi trẻ đã tiếp nhận. Màn hình này chỉ
                            dùng để xem thông tin và theo dõi trạng thái hồ sơ.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                    <main className="xl:col-span-8">
                        <section className="overflow-hidden rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
                            <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 lg:px-8">
                                <div className="text-center">
                                    <h2 className="mt-3 text-[28px] font-bold uppercase tracking-wide text-[#0D47A1]">
                                        Hồ sơ tiếp nhận trẻ
                                    </h2>
                                </div>

                                <div className="mt-6 grid gap-3 border-t border-[#E4EAF2] pt-5 md:grid-cols-4">
                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                                            Mã hồ sơ
                                        </p>
                                        <p className="mt-2 text-sm font-extrabold text-[#0D47A1]">
                                            {profile.MaHSTiepNhan}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                                            Mã yêu cầu
                                        </p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">
                                            {profile.MaYeuCauGuiTre}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                                            Mã trẻ
                                        </p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">
                                            {profile.MaTre || 'Chưa có'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                                            Ngày lập
                                        </p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">
                                            {profile.NgayTiepNhan
                                                ? formatDate(profile.NgayTiepNhan)
                                                : 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <SectionBlock number="I" title="Thông tin hồ sơ">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Mã hồ sơ tiếp nhận" value={profile.MaHSTiepNhan} />
                                    <FieldView label="Mã yêu cầu gửi trẻ" value={profile.MaYeuCauGuiTre} />
                                    <FieldView label="Mã trẻ" value={profile.MaTre || 'Chưa có'} />
                                    <FieldView label="Người duyệt" value={profile.TenNguoiDuyet} />
                                    <FieldView label="Mã người duyệt" value={profile.MaCanBoTiepNhan} />
                                    <FieldView
                                        label="Ngày duyệt"
                                        value={profile.NgayDuyet ? formatDate(profile.NgayDuyet) : 'Chưa duyệt'}
                                    />
                                    <TextView label="Ghi chú hồ sơ" value={profile.GhiChu || 'Không có'} />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="II" title="Thông tin từ yêu cầu gửi trẻ">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Mã người gửi" value={profile.yeuCau.MaNguoiGui} />
                                    <FieldView
                                        label="Loại người gửi"
                                        value={getSenderTypeLabel(profile.yeuCau.MaLoaiNguoiGui)}
                                    />
                                    <FieldView label="Quan hệ với trẻ" value={profile.yeuCau.QuanHeVoiTre} />
                                    <FieldView label="Trạng thái yêu cầu" value={profile.yeuCau.TrangThaiYC} />
                                    <FieldView
                                        label="Ngày tạo yêu cầu"
                                        value={profile.yeuCau.NgayTao ? formatDate(profile.yeuCau.NgayTao) : ''}
                                    />
                                    <TextView label="Lý do gửi trẻ" value={profile.yeuCau.LyDoGui} />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="III" title="Thông tin người gửi">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Họ và tên" value={profile.nguoiGui.HoTen} />
                                    <FieldView label="Số CCCD" value={profile.nguoiGui.CCCD} />
                                    <FieldView label="Số điện thoại" value={profile.nguoiGui.SoDienThoai} />
                                    <FieldView label="Email" value={profile.nguoiGui.Email} />
                                    <FieldView
                                        label="Địa chỉ"
                                        value={joinAddress(
                                            profile.nguoiGui.DiaChiCuThe,
                                            profile.nguoiGui.TenXaPhuong,
                                            profile.nguoiGui.TenTinhTP
                                        )}
                                        wide
                                    />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="IV" title="Thông tin trẻ">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Tên trẻ" value={profile.tre.HoTen} />
                                    <FieldView
                                        label="Ngày sinh"
                                        value={profile.tre.NgaySinh ? formatDate(profile.tre.NgaySinh) : ''}
                                    />
                                    <FieldView label="Giới tính" value={getGenderText(profile.tre.GioiTinh)} />
                                    <FieldView label="Dân tộc" value={profile.tre.DanToc} />
                                    <FieldView
                                        label="Nơi ở hiện tại"
                                        value={joinAddress(
                                            profile.tre.DiaChiCuThe,
                                            profile.tre.TenXaPhuong,
                                            profile.tre.TenTinhTP
                                        )}
                                        wide
                                    />
                                    <TextView
                                        label="Tình trạng sức khỏe ban đầu"
                                        value={profile.tre.TinhTrangSucKhoe}
                                    />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="V" title="Giấy tờ pháp lý">
                                {profile.documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {profile.documents.map((item) => (
                                            <DocumentCard key={item.MaGiayTo} item={item} />
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
                        profile={profile}
                        onBack={() => navigate('/can-bo-tiep-nhan/ho-so-tiep-nhan')}
                        onOpenRequest={openRequest}
                        onOpenChild={openChild}
                    />
                </div>
            </div>
        </div>
    );
}