import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Circle,
    Eye,
    FileText,
    XCircle,
} from 'lucide-react';

import { useFetch } from '../../hooks/useFetch';
import receptionProfileApi from '../../api/receptionProfileApi';
import { formatDate } from '../../utils/formatDate';

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
        value: STATUS_PROFILE.DA_DUYET,
        label: 'Đã duyệt',
        description: 'Hồ sơ đã duyệt, trẻ được tiếp nhận chính thức.',
    },
];

const STATUS_META = {
    [STATUS_PROFILE.DANG_XU_LY]: { label: 'Đang xử lý', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
    [STATUS_PROFILE.CHO_DUYET]: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    [STATUS_PROFILE.DA_DUYET]: { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    [STATUS_PROFILE.TU_CHOI]: { label: 'Từ chối', cls: 'bg-red-50 text-red-700 border-red-200' },
    [STATUS_PROFILE.DA_HUY]: { label: 'Đã hủy', cls: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const DOCUMENT_STATUS_META = {
    'Hợp lệ': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Không hợp lệ': 'bg-red-50 text-red-700 border-red-200',
    'Cần bổ sung': 'bg-orange-50 text-orange-700 border-orange-200',
    'Chờ xác minh': 'bg-amber-50 text-amber-700 border-amber-200',
};

function normalizeProfile(item) {
    if (!item) return null;
    return {
        MaHSTiepNhan: item.maHSTiepNhan || item.MaHSTiepNhan || '',
        MaYeuCauGuiTre: item.maYeuCauGuiTre || item.MaYeuCauGuiTre || '',
        MaTre: item.maTre || item.MaTre || '',
        TenTre: item.tenTre || item.TenTre || '',
        TenNguoiGui: item.tenNguoiGui || item.TenNguoiGui || '',
        MaCanBoTiepNhan: item.maCanBoTiepNhan || item.MaCanBoTiepNhan || '',
        TenCanBo: item.tenCanBo || item.TenCanBo || '',
        QuanHeVoiTre: item.quanHeVoiTre || item.QuanHeVoiTre || '',
        LyDoGui: item.lyDoGui || item.LyDoGui || '',
        NgayTiepNhan: item.ngayTiepNhan || item.NgayTiepNhan || '',
        TrangThai: item.trangThai || item.TrangThai || '',
        NgayDuyet: item.ngayDuyet || item.NgayDuyet || '',
        GhiChu: item.ghiChu || item.GhiChu || '',
        NgaySinhTre: item.ngaySinhTre || item.NgaySinhTre || '',
        GioiTinhTre: item.gioiTinhTre || item.GioiTinhTre || '',
    };
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || { label: status || 'Không xác định', cls: 'bg-slate-50 text-slate-700 border-slate-200' };
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${meta.cls}`}>
            {meta.label}
        </span>
    );
}

function FieldView({ label, value, wide = false }) {
    return (
        <div className={`rounded-[20px] border border-[#E6EDF5] bg-[#FAFCFF] px-5 py-4 ${wide ? 'md:col-span-2' : ''}`}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">{label}</p>
            <p className="break-words text-sm font-semibold leading-7 text-[#26364A]">{value || 'Chưa cập nhật'}</p>
        </div>
    );
}

function SectionBlock({ number, title, children }) {
    return (
        <section className="border-b border-[#E4EAF2] px-6 py-7 last:border-b-0 lg:px-8">
            <div className="mb-5 flex items-baseline gap-2">
                <span className="text-[20px] font-black text-[#0D47A1]">{number}.</span>
                <h2 className="text-[20px] font-bold text-[#0D47A1]">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function ProgressStep({ step, index, currentStatus }) {
    const currentIndex = STATUS_FLOW.findIndex((s) => s.value === currentStatus);
    const stepIndex = STATUS_FLOW.findIndex((s) => s.value === step.value);
    const isEnded = currentStatus === STATUS_PROFILE.TU_CHOI || currentStatus === STATUS_PROFILE.DA_HUY;
    const active = !isEnded && currentIndex >= stepIndex;
    const current = currentStatus === step.value;

    return (
        <div className="relative flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${active ? 'border-[#0D47A1] bg-[#0D47A1] text-white' : 'border-[#D7E1EE] bg-white text-[#8FA0B8]'}`}>
                    {active ? <CheckCircle2 size={18} /> : <Circle size={15} />}
                </div>
                {index < STATUS_FLOW.length - 1 && (
                    <div className={`mt-2 h-11 w-0.5 ${active && !current ? 'bg-[#0D47A1]' : 'bg-[#D7E1EE]'}`} />
                )}
            </div>
            <div className="pb-6">
                <p className={`text-sm font-bold ${active ? 'text-[#0D47A1]' : 'text-[#64748B]'}`}>{step.label}</p>
                <p className="mt-1 text-sm leading-6 text-[#7D90AA]">{step.description}</p>
                {current && (
                    <span className="mt-3 inline-flex rounded-full bg-[#EAF3FF] px-3 py-1 text-xs font-bold text-[#0D47A1]">Hiện tại</span>
                )}
            </div>
        </div>
    );
}

export default function ReceptionProfileDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: raw, loading, error } = useFetch(() => receptionProfileApi.getById(id), [id]);
    const profile = raw ? normalizeProfile(raw) : null;

    if (loading) {
        return <div className="py-16 text-center text-sm text-[#64748B]">Đang tải hồ sơ tiếp nhận...</div>;
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] px-6 py-16 text-center">
                <p className="text-sm font-semibold text-red-600">Không tìm thấy hồ sơ tiếp nhận.</p>
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

    const isRejectedOrCancelled = profile.TrangThai === STATUS_PROFILE.TU_CHOI || profile.TrangThai === STATUS_PROFILE.DA_HUY;

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
                            Hồ sơ được lập từ yêu cầu gửi trẻ. Trưởng phòng sẽ duyệt hồ sơ tại trang quản lý.
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
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">Mã hồ sơ</p>
                                        <p className="mt-2 text-sm font-extrabold text-[#0D47A1]">{profile.MaHSTiepNhan}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">Mã yêu cầu</p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">{profile.MaYeuCauGuiTre}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">Mã trẻ</p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">{profile.MaTre || 'Chưa có'}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[#F7FAFF] px-4 py-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">Ngày lập</p>
                                        <p className="mt-2 text-sm font-bold text-[#26364A]">
                                            {profile.NgayTiepNhan ? formatDate(profile.NgayTiepNhan) : 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <SectionBlock number="I" title="Thông tin hồ sơ">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Mã hồ sơ tiếp nhận" value={profile.MaHSTiepNhan} />
                                    <FieldView label="Mã yêu cầu gửi trẻ" value={profile.MaYeuCauGuiTre} />
                                    <FieldView label="Mã trẻ (sau khi duyệt)" value={profile.MaTre || 'Chưa có'} />
                                    <FieldView label="Cán bộ tiếp nhận" value={profile.TenCanBo} />
                                    <FieldView label="Ngày duyệt" value={profile.NgayDuyet ? formatDate(profile.NgayDuyet) : 'Chưa duyệt'} />
                                    <FieldView label="Ghi chú" value={profile.GhiChu || 'Không có'} wide />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="II" title="Thông tin người gửi">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Họ và tên người gửi" value={profile.TenNguoiGui} />
                                    <FieldView label="Quan hệ với trẻ" value={profile.QuanHeVoiTre} />
                                    <FieldView label="Lý do gửi trẻ" value={profile.LyDoGui} wide />
                                </div>
                            </SectionBlock>

                            <SectionBlock number="III" title="Thông tin trẻ">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FieldView label="Tên trẻ" value={profile.TenTre} />
                                    <FieldView label="Ngày sinh" value={profile.NgaySinhTre ? formatDate(profile.NgaySinhTre) : ''} />
                                    <FieldView label="Giới tính" value={profile.GioiTinhTre} />
                                </div>
                            </SectionBlock>
                        </section>
                    </main>

                    <aside className="xl:col-span-4">
                        <div className="space-y-6 xl:sticky xl:top-24">
                            <section className="rounded-[30px] border border-[#E1E8F2] bg-white p-6 shadow-[0_18px_46px_rgba(31,42,61,0.07)]">
                                <h3 className="text-[20px] font-bold text-[#0D47A1]">Chức năng</h3>
                                <p className="mt-2 text-sm leading-7 text-[#7D90AA]">
                                    Cán bộ tiếp nhận xem hồ sơ. Trưởng phòng duyệt tại trang quản lý.
                                </p>

                                <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8B9BB0]">Trạng thái hồ sơ</p>
                                    <div className="mt-3"><StatusBadge status={profile.TrangThai} /></div>
                                </div>

                                <div className="mt-5 rounded-[24px] border border-[#E6EDF5] bg-white p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Clock3 size={17} className="text-[#0D47A1]" />
                                        <h4 className="font-bold text-[#0D47A1]">Tiến trình</h4>
                                    </div>
                                    {isRejectedOrCancelled ? (
                                        <div className="rounded-[24px] border border-red-100 bg-red-50 p-5">
                                            <div className="flex gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                                                    <XCircle size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-red-700">{profile.TrangThai}</p>
                                                    <p className="mt-1 text-sm leading-6 text-red-700/80">Hồ sơ đã kết thúc ở trạng thái này.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        STATUS_FLOW.map((step, index) => (
                                            <ProgressStep key={step.value} step={step} index={index} currentStatus={profile.TrangThai} />
                                        ))
                                    )}
                                </div>

                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/can-bo-tiep-nhan/yeu-cau/${profile.MaYeuCauGuiTre}`)}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                                    >
                                        <FileText size={17} />
                                        Xem yêu cầu gốc
                                    </button>

                                    {profile.MaTre && (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/can-bo-tiep-nhan/tre/${profile.MaTre}`)}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778]"
                                        >
                                            <Eye size={17} />
                                            Xem hồ sơ trẻ
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => navigate('/can-bo-tiep-nhan/ho-so-tiep-nhan')}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
                                    >
                                        <ArrowLeft size={17} />
                                        Quay lại danh sách
                                    </button>
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
