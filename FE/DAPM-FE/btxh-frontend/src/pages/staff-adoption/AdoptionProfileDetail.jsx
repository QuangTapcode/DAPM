import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';

const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
    'rounded-[30px] border border-[#E1E8F2] bg-white shadow-[0_18px_46px_rgba(31,42,61,0.07)]';

const softCardClass =
    'rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF]';

const primaryButton =
    'inline-flex items-center justify-center rounded-2xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#083778]';

const secondaryButton =
    'inline-flex items-center justify-center rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]';

const fallbackProfile = {
    MaHSNhanNuoi: 'HSNN0002',
    MaYeuCauNhan: 'YCNN0002',
    MaTre: 'TRE00011',

    // HOSONHANNUOI
    MaCanBo: 'ND000001', // trưởng phòng/người duyệt
    NgayLap: '2026-03-16',
    NgayDuyet: '2026-03-18',
    TrangThai: 'Đã duyệt',
    GhiChu: 'Hồ sơ đã được trưởng phòng duyệt, chờ hoàn tất quy trình theo quy định.',

    // Lấy từ YEUCAUNHANNUOI thông qua MaYeuCauNhan
    CanBoLapTuYeuCau: {
        MaNguoiDung: 'ND000005',
        HoTen: 'Hoàng Văn Nuôi',
    },

    // Lấy từ HOSONHANNUOI.MaCanBo join NGUOIDUNG
    NguoiDuyetHoSo: {
        MaNguoiDung: 'ND000001',
        HoTen: 'Trần Minh Quang',
        ChucVu: 'Trưởng phòng',
    },

    NguoiNhanNuoi: {
        HoTen: 'Võ Thị Hạnh',
        SoDienThoai: '0977777777',
        NgaySinh: '1989-07-12',
        NgheNghiep: 'Nhân viên kế toán',
        ThuNhapHangThang: 25000000,
        DiaChi: 'Hải Châu, Đà Nẵng',
        LyDoNhanNuoi:
            'Mong muốn xây dựng gia đình và chăm sóc trẻ lâu dài trong môi trường ổn định.',
        MongMuonVeTre:
            'Ưu tiên trẻ có độ tuổi nhỏ, phù hợp với điều kiện chăm sóc hiện tại.',
    },

    TreNhanNuoi: {
        MaTre: 'TRE00011',
        HoTen: 'Bé Nam',
        NgaySinh: '2020-06-10',
        GioiTinh: 'Nam',
        SucKhoe: 'Ổn định',
        TrangThai: 'Đang xử lý nhận nuôi',
        GhiChu: 'Trẻ hòa đồng, sức khỏe ổn định.',
    },

    GiayTo: [
        {
            MaGiayTo: 'GT000021',
            TenGiayTo: 'Ảnh CCCD người nhận nuôi',
            LoaiGiayTo: 'Tùy thân',
            TrangThai: 'Hợp lệ',
            DuongDanFile: '/uploads/giayto/hsnn0002/cccd.jpg',
            NgayCapNhat: '2026-03-10',
        },
        {
            MaGiayTo: 'GT000022',
            TenGiayTo: 'Giấy khám sức khỏe',
            LoaiGiayTo: 'Sức khỏe',
            TrangThai: 'Hợp lệ',
            DuongDanFile: '/uploads/giayto/hsnn0002/suckhoe.pdf',
            NgayCapNhat: '2026-03-10',
        },
        {
            MaGiayTo: 'GT000023',
            TenGiayTo: 'Giấy xác nhận tình trạng hôn nhân',
            LoaiGiayTo: 'Hôn nhân',
            TrangThai: 'Hợp lệ',
            DuongDanFile: '/uploads/giayto/hsnn0002/honnhan.pdf',
            NgayCapNhat: '2026-03-11',
        },
        {
            MaGiayTo: 'GT000024',
            TenGiayTo: 'Minh chứng thu nhập',
            LoaiGiayTo: 'Tài chính',
            TrangThai: 'Hợp lệ',
            DuongDanFile: '/uploads/giayto/hsnn0002/thunhap.pdf',
            NgayCapNhat: '2026-03-11',
        },
    ],
};

const PROFILE_STEPS = ['Đang lập', 'Chờ duyệt', 'Đã duyệt', 'Đã hoàn tất'];

function formatCurrency(value) {
    if (value === null || value === undefined || value === '') {
        return 'Chưa cập nhật';
    }

    return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function safeDate(value) {
    if (!value) return 'Chưa có';
    return formatDate(value);
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

function getStatusTone(status) {
    switch (status) {
        case 'Đang lập':
            return 'border-slate-200 bg-slate-50 text-slate-700';
        case 'Chờ duyệt':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'Đã duyệt':
            return 'border-green-200 bg-green-50 text-green-700';
        case 'Đã hoàn tất':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'Từ chối':
            return 'border-red-200 bg-red-50 text-red-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-700';
    }
}

function getProgressIndex(status) {
    const index = PROFILE_STEPS.indexOf(status);
    if (status === 'Từ chối') return 1;
    return index === -1 ? 0 : index;
}

function normalizeProfile(raw, profileId) {
    if (!raw) {
        return {
            ...fallbackProfile,
            MaHSNhanNuoi: profileId || fallbackProfile.MaHSNhanNuoi,
        };
    }

    const yeuCau = raw.YeuCauNhanNuoi || raw.yeuCauNhanNuoi || {};
    const canBoLap =
        raw.CanBoLapTuYeuCau ||
        raw.canBoLapTuYeuCau ||
        yeuCau.CanBoXuLy ||
        yeuCau.canBoXuLy ||
        yeuCau.CanBoLap ||
        yeuCau.canBoLap ||
        fallbackProfile.CanBoLapTuYeuCau;

    const nguoiDuyet =
        raw.NguoiDuyetHoSo ||
        raw.nguoiDuyetHoSo ||
        raw.TruongPhongDuyet ||
        raw.truongPhongDuyet ||
        fallbackProfile.NguoiDuyetHoSo;

    return {
        MaHSNhanNuoi:
            raw.MaHSNhanNuoi ||
            raw.MaHoSoNhanNuoi ||
            raw.maHSNhanNuoi ||
            raw.id ||
            profileId ||
            fallbackProfile.MaHSNhanNuoi,
        MaYeuCauNhan:
            raw.MaYeuCauNhan ||
            raw.maYeuCauNhan ||
            yeuCau.MaYeuCauNhan ||
            fallbackProfile.MaYeuCauNhan,
        MaTre: raw.MaTre || raw.maTre || fallbackProfile.MaTre,

        MaCanBo:
            raw.MaCanBo ||
            raw.maCanBo ||
            nguoiDuyet?.MaNguoiDung ||
            fallbackProfile.MaCanBo,
        NgayLap: raw.NgayLap || raw.ngayLap || fallbackProfile.NgayLap,
        NgayDuyet: raw.NgayDuyet || raw.ngayDuyet || fallbackProfile.NgayDuyet,
        TrangThai: raw.TrangThai || raw.trangThai || fallbackProfile.TrangThai,
        GhiChu: raw.GhiChu || raw.ghiChu || fallbackProfile.GhiChu,

        CanBoLapTuYeuCau: canBoLap,
        NguoiDuyetHoSo: nguoiDuyet,

        NguoiNhanNuoi:
            raw.NguoiNhanNuoi ||
            raw.nguoiNhanNuoi ||
            yeuCau.NguoiNhanNuoi ||
            yeuCau.nguoiNhanNuoi ||
            fallbackProfile.NguoiNhanNuoi,

        TreNhanNuoi:
            raw.TreNhanNuoi ||
            raw.treNhanNuoi ||
            raw.Tre ||
            raw.tre ||
            fallbackProfile.TreNhanNuoi,

        GiayTo:
            raw.GiayTo ||
            raw.giayTo ||
            raw.documents ||
            yeuCau.GiayTo ||
            yeuCau.documents ||
            fallbackProfile.GiayTo,
    };
}

function SectionTitle({ number, title, description }) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#0D47A1]">
                    {number}
                </span>
                <h2 className="text-[18px] font-bold text-[#0D47A1]">{title}</h2>
            </div>

            {description && (
                <p className="mt-2 text-sm leading-7 text-[#7D90AA]">{description}</p>
            )}
        </div>
    );
}

function DetailField({ label, value, wide = false, strong = false }) {
    return (
        <div className={`${softCardClass} px-5 py-4 ${wide ? 'md:col-span-2' : ''}`}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">
                {label}
            </p>
            <p
                className={`text-sm leading-7 ${strong ? 'font-bold text-[#0D47A1]' : 'font-semibold text-[#26364A]'
                    }`}
            >
                {value || 'Chưa có'}
            </p>
        </div>
    );
}

function ProfileProgressBar({ status }) {
    const isRejected = status === 'Từ chối';
    const currentIndex = getProgressIndex(status);

    return (
        <section className={`${cardClass} p-6`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-[20px] font-bold text-[#0D47A1]">
                        Tiến trình hồ sơ
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#7D90AA]">
                        Trạng thái hồ sơ do trưởng phòng quyết định.
                    </p>
                </div>

                <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusTone(
                        status
                    )}`}
                >
                    {status}
                </span>
            </div>

            <div className="mt-7">
                <div className="flex items-start">
                    {PROFILE_STEPS.map((step, index) => {
                        const active = !isRejected && index <= currentIndex;
                        const current = !isRejected && index === currentIndex;
                        const lineDone = !isRejected && index < currentIndex;

                        return (
                            <div
                                key={step}
                                className={`flex items-start ${index === PROFILE_STEPS.length - 1 ? 'w-auto' : 'flex-1'
                                    }`}
                            >
                                <div className="flex w-[78px] flex-col items-center text-center">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-extrabold transition ${active
                                            ? 'border-[#0D47A1] bg-[#0D47A1] text-white shadow-[0_8px_18px_rgba(13,71,161,0.22)]'
                                            : 'border-[#D7E5F7] bg-white text-[#9AACBF]'
                                            }`}
                                    >
                                        {index < currentIndex && !isRejected ? '✓' : index + 1}
                                    </div>

                                    <p
                                        className={`mt-3 text-xs font-bold leading-5 ${current
                                            ? 'text-[#0D47A1]'
                                            : active
                                                ? 'text-[#26364A]'
                                                : 'text-[#8FA0B8]'
                                            }`}
                                    >
                                        {step}
                                    </p>
                                </div>

                                {index !== PROFILE_STEPS.length - 1 && (
                                    <div
                                        className={`mt-5 h-1 flex-1 rounded-full ${lineDone ? 'bg-[#0D47A1]' : 'bg-[#E6EDF5]'
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {isRejected && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                        Hồ sơ đã bị từ chối. Quy trình dừng tại bước phê duyệt hồ sơ.
                    </div>
                )}
            </div>
        </section>
    );
}

function ProfileActionPanel({ status, onBack }) {
    return (
        <section className={`${cardClass} p-6`}>
            <h3 className="text-[18px] font-bold text-[#0D47A1]">
                Thao tác hồ sơ
            </h3>

            {status === 'Đang lập' && (
                <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                    Hồ sơ đang ở trạng thái đang lập. Cán bộ chỉ theo dõi thông tin đã lưu.
                </p>
            )}

            {status === 'Chờ duyệt' && (
                <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-700">
                    Hồ sơ đang chờ trưởng phòng duyệt.
                </p>
            )}

            {status === 'Đã duyệt' && (
                <p className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold leading-6 text-green-700">
                    Hồ sơ đã được trưởng phòng duyệt.
                </p>
            )}

            {status === 'Từ chối' && (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
                    Hồ sơ đã bị từ chối. Không có thao tác xử lý tiếp.
                </p>
            )}

            {status === 'Đã hoàn tất' && (
                <p className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-700">
                    Hồ sơ đã hoàn tất và được lưu trữ.
                </p>
            )}

            <div className="mt-5 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className={`${secondaryButton} w-full`}
                >
                    Quay lại
                </button>

                <Link
                    to="/can-bo-nhan-nuoi/ho-so"
                    className={`${primaryButton} w-full`}
                >
                    Xem danh sách hồ sơ
                </Link>
            </div>
        </section>
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
                                className="mt-5 inline-flex rounded-xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#083778]"
                            >
                                Mở file
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdoptionProfileDetail() {
    const { profileId } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(
        normalizeProfile(fallbackProfile, profileId)
    );
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
        if (!profileId) return;

        adoptionApi
            .getById(profileId)
            .then((res) => {
                setProfile(normalizeProfile(res, profileId));
            })
            .catch(() => {
                setProfile(normalizeProfile(fallbackProfile, profileId));
            });
    }, [profileId]);

    const approvalBlockClass = getStatusTone(profile.TrangThai);

    return (
        <div className={pageClass}>
            <div className="mx-auto max-w-[1720px] space-y-7 px-5 py-8 sm:px-8 lg:px-10">
                <header className="flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
                            Theo dõi nhận nuôi
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                                Hồ sơ nhận nuôi
                            </h1>

                            <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${approvalBlockClass}`}
                            >
                                {profile.TrangThai}
                            </span>
                        </div>

                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6F83A3]">
                            Xem hồ sơ đã lập, cán bộ lập hồ sơ từ yêu cầu nhận nuôi và thông
                            tin phê duyệt từ bảng hồ sơ nhận nuôi.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link to="/can-bo-nhan-nuoi/ho-so" className={secondaryButton}>
                            Về danh sách hồ sơ
                        </Link>
                        <Link to="/can-bo-nhan-nuoi/danh-sach" className={secondaryButton}>
                            Về yêu cầu nhận nuôi
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                    <main className="xl:col-span-8">
                        <section className={`${cardClass} overflow-hidden`}>
                            <div className="border-b border-[#E4EAF2] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-7 text-center lg:px-8">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8FA0B8]">
                                    Trung tâm bảo trợ xã hội
                                </p>

                                <h2 className="mt-3 text-[28px] font-bold uppercase tracking-wide text-[#0D47A1]">
                                    Hồ sơ nhận nuôi
                                </h2>

                                <p className="mt-3 text-sm leading-7 text-[#7D90AA]">
                                    Mã hồ sơ:{' '}
                                    <span className="font-bold text-[#26364A]">
                                        {profile.MaHSNhanNuoi}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-10 p-6 lg:p-8">
                                <section>
                                    <SectionTitle
                                        number="I"
                                        title="Thông tin hồ sơ nhận nuôi"
                                        description="Thông tin chính của hồ sơ và cán bộ lập được truy xuất từ yêu cầu nhận nuôi."
                                    />

                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <DetailField label="Mã hồ sơ" value={profile.MaHSNhanNuoi} strong />
                                        <DetailField label="Mã yêu cầu nhận nuôi" value={profile.MaYeuCauNhan} />
                                        <DetailField label="Mã trẻ" value={profile.MaTre} />
                                        <DetailField label="Ngày lập hồ sơ" value={safeDate(profile.NgayLap)} />

                                        <DetailField
                                            label="Cán bộ lập hồ sơ"
                                            value={profile.CanBoLapTuYeuCau?.HoTen}
                                        />
                                        <DetailField
                                            label="Mã cán bộ lập"
                                            value={profile.CanBoLapTuYeuCau?.MaNguoiDung}
                                        />
                                    </div>
                                </section>

                                <section>
                                    <SectionTitle
                                        number="II"
                                        title="Thông tin người nhận nuôi"
                                        description="Dữ liệu lấy từ yêu cầu nhận nuôi đã được xác minh."
                                    />

                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <DetailField label="Họ tên người nhận nuôi" value={profile.NguoiNhanNuoi?.HoTen} strong />
                                        <DetailField label="Số điện thoại" value={profile.NguoiNhanNuoi?.SoDienThoai} />
                                        <DetailField label="Ngày sinh" value={safeDate(profile.NguoiNhanNuoi?.NgaySinh)} />
                                        <DetailField label="Nghề nghiệp" value={profile.NguoiNhanNuoi?.NgheNghiep} />
                                        <DetailField label="Thu nhập hàng tháng" value={formatCurrency(profile.NguoiNhanNuoi?.ThuNhapHangThang)} />
                                        <DetailField label="Địa chỉ" value={profile.NguoiNhanNuoi?.DiaChi} />
                                        <DetailField label="Lý do nhận nuôi" value={profile.NguoiNhanNuoi?.LyDoNhanNuoi} wide />
                                        <DetailField label="Mong muốn về trẻ" value={profile.NguoiNhanNuoi?.MongMuonVeTre} wide />
                                    </div>
                                </section>

                                <section>
                                    <SectionTitle
                                        number="III"
                                        title="Thông tin trẻ được nhận nuôi"
                                        description="Thông tin trẻ đã được gán vào hồ sơ nhận nuôi."
                                    />

                                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                                        <DetailField label="Mã trẻ" value={profile.TreNhanNuoi?.MaTre} strong />
                                        <DetailField label="Họ tên trẻ" value={profile.TreNhanNuoi?.HoTen} />
                                        <DetailField label="Ngày sinh" value={safeDate(profile.TreNhanNuoi?.NgaySinh)} />
                                        <DetailField label="Giới tính" value={profile.TreNhanNuoi?.GioiTinh} />
                                        <DetailField label="Tình trạng sức khỏe" value={profile.TreNhanNuoi?.SucKhoe} />
                                        <DetailField label="Trạng thái trẻ" value={profile.TreNhanNuoi?.TrangThai} />
                                        <DetailField label="Ghi chú về trẻ" value={profile.TreNhanNuoi?.GhiChu} wide />
                                    </div>
                                </section>

                                <section>
                                    <SectionTitle
                                        number="IV"
                                        title="Giấy tờ pháp lý đã xác minh"
                                        description="Danh sách giấy tờ người nhận nuôi đã nộp và được kiểm tra hợp lệ."
                                    />

                                    <div className="mt-5 divide-y divide-[#E6EDF5] overflow-hidden rounded-2xl border border-[#E6EDF5]">
                                        {(profile.GiayTo || []).map((doc) => (
                                            <div
                                                key={doc.MaGiayTo}
                                                className="flex flex-col justify-between gap-4 bg-[#FAFCFF] px-5 py-4 transition hover:bg-white md:flex-row md:items-center"
                                            >
                                                <div>
                                                    <p className="font-bold text-[#26364A]">
                                                        {doc.TenGiayTo}
                                                    </p>
                                                    <p className="mt-1 text-sm text-[#7D90AA]">
                                                        {doc.MaGiayTo} · {doc.LoaiGiayTo}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#9AACBF]">
                                                        Cập nhật: {safeDate(doc.NgayCapNhat)}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Badge status={doc.TrangThai} size="sm" />

                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="rounded-xl border border-[#CFE0F5] bg-white px-3 py-2 text-xs font-bold text-[#0D47A1] hover:bg-[#F4F8FF]"
                                                    >
                                                        Xem file
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <SectionTitle
                                        number="V"
                                        title="Phê duyệt hồ sơ"
                                        description="Dữ liệu phê duyệt lấy từ bảng HOSONHANNUOI, trong đó MaCanBo là mã trưởng phòng/người duyệt."
                                    />

                                    <div className={`mt-5 rounded-[24px] border p-5 ${approvalBlockClass}`}>
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-80">
                                                    Mã người duyệt
                                                </p>
                                                <p className="mt-2 text-sm font-bold">
                                                    {profile.MaCanBo || 'Chưa có'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-80">
                                                    Trưởng phòng duyệt
                                                </p>
                                                <p className="mt-2 text-sm font-bold">
                                                    {profile.NguoiDuyetHoSo?.HoTen || 'Chưa duyệt'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-80">
                                                    Ngày duyệt
                                                </p>
                                                <p className="mt-2 text-sm font-bold">
                                                    {safeDate(profile.NgayDuyet)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-80">
                                                    Trạng thái hồ sơ
                                                </p>
                                                <p className="mt-2 text-sm font-bold">
                                                    {profile.TrangThai}
                                                </p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.13em] opacity-80">
                                                    Ghi chú / ý kiến xử lý
                                                </p>
                                                <p className="mt-2 text-sm font-bold leading-7">
                                                    {profile.GhiChu || 'Chưa có'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </section>
                    </main>

                    <aside className="xl:col-span-4">
                        <div className="space-y-6 xl:sticky xl:top-6 xl:max-h-[calc(100vh-48px)] xl:overflow-y-auto xl:pr-1">
                            <ProfileProgressBar status={profile.TrangThai} />

                            <ProfileActionPanel
                                status={profile.TrangThai}
                                onBack={() => navigate(-1)}
                            />
                        </div>
                    </aside>
                </div>
            </div>

            <DocumentPreviewModal
                document={previewDoc}
                onClose={() => setPreviewDoc(null)}
            />
        </div>
    );
}