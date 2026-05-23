import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';

/* ── Design tokens ─────────────────────────────────── */
const pageClass = 'min-h-screen bg-[#F5F7FB]';

const cardClass =
  'rounded-3xl border border-slate-200 bg-white shadow-sm';

const softCard =
  'rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4';

const secondaryButton =
  'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50';

/* ── Status config ─────────────────────────────────── */
const PROFILE_STEPS = ['Đang lập', 'Chờ duyệt', 'Đã duyệt', 'Đã hoàn tất'];

function getStepIndex(status) {
  const idx = PROFILE_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function getStatusStyle(status) {
  const map = {
    'Đang lập': 'bg-slate-100 text-slate-600',
    'Chờ duyệt': 'bg-amber-100 text-amber-700',
    'Đã duyệt': 'bg-green-100 text-green-700',
    'Đã hoàn tất': 'bg-blue-100 text-blue-700',
    'Từ chối': 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

/* ── Helpers ───────────────────────────────────────── */
function safeDate(v) {
  if (!v) return '—';
  return formatDate(v);
}

function formatCurrency(v) {
  if (v === null || v === undefined || v === '') return '—';
  return new Intl.NumberFormat('vi-VN').format(Number(v)) + ' ₫';
}

function getAge(dateStr) {
  if (!dateStr) return null;
  const birth = new Date(dateStr);
  if (isNaN(birth)) return null;
  const diff = new Date() - birth;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function unwrap(res) {
  if (res?.data?.success !== undefined) return res.data.data;
  if (res?.success !== undefined) return res.data;
  return res?.data ?? res;
}

function normalizeProfile(raw) {
  if (!raw) return null;
  return {
    MaHSNhanNuoi: raw.maHSNhanNuoi || raw.MaHSNhanNuoi || '',
    MaYeuCauNhan: raw.maYeuCauNhan || raw.MaYeuCauNhan || '',
    MaTre:        raw.maTre        || raw.MaTre        || '',
    TenTre:       raw.tenTre       || raw.TenTre       || '',
    MaCanBo:      raw.maCanBo      || raw.MaCanBo      || '',
    TenCanBo:     raw.tenCanBo     || raw.TenCanBo     || '',
    NgayLap:      raw.ngayLap      || raw.NgayLap      || null,
    NgayDuyet:    raw.ngayDuyet    || raw.NgayDuyet    || null,
    TrangThai:    raw.trangThai    || raw.TrangThai    || '',
    GhiChu:       raw.ghiChu       || raw.GhiChu       || '',
  };
}

function normalizeRequest(raw) {
  if (!raw) return null;
  return {
    MaYeuCauNhan:    raw.maYeuCauNhan    || raw.MaYeuCauNhan    || '',
    TenNguoiNhan:    raw.tenNguoiNhan    || raw.TenNguoiNhan    || '',
    SDTNguoiNhan:    raw.sdtNguoiNhan    || raw.SDTNguoiNhan    || '',
    NgaySinhNguoiNhan: raw.ngaySinhNguoiNhan || raw.NgaySinhNguoiNhan || null,
    ThuNhapHangThang: raw.thuNhapHangThang ?? raw.ThuNhapHangThang ?? null,
    TinhTrangHonNhan: raw.tinhTrangHonNhan || raw.TinhTrangHonNhan || '',
    LoaiNoiO:        raw.loaiNoiO        || raw.LoaiNoiO        || '',
    LyDoNhanNuoi:    raw.lyDoNhanNuoi    || raw.LyDoNhanNuoi    || '',
    MongMuonVeTre:   raw.mongMuonVeTre   || raw.MongMuonVeTre   || '',
    TrangThai:       raw.trangThai       || raw.TrangThai       || '',
    GhiChu:          raw.ghiChu          || raw.GhiChu          || '',
  };
}

function normalizeChild(raw) {
  if (!raw) return null;
  return {
    MaTre:     raw.maTre     || raw.MaTre     || '',
    HoTen:     raw.hoTen     || raw.HoTen     || '',
    NgaySinh:  raw.ngaySinh  || raw.NgaySinh  || null,
    GioiTinh:  raw.gioiTinh  || raw.GioiTinh  || '',
    DanToc:    raw.danToc    || raw.DanToc    || '',
    TrangThai: raw.trangThai || raw.TrangThai || '',
    GhiChu:    raw.ghiChu    || raw.GhiChu    || '',
    HinhAnh:   raw.hinhAnh   || raw.HinhAnh   || '',
  };
}

function normalizeDoc(raw) {
  return {
    MaGiayTo:    raw.maGiayTo    || raw.MaGiayTo    || '',
    MaLoaiGiayTo: raw.maLoaiGiayTo || raw.MaLoaiGiayTo || '',
    DuongDanFile: raw.duongDanFile || raw.DuongDanFile || '',
    TrangThai:   raw.trangThai   || raw.TrangThai   || '',
    NgayCapNhat: raw.ngayCapNhat || raw.NgayCapNhat || null,
  };
}

/* ── Sub-components ─────────────────────────────────── */
function Field({ label, value, wide = false, highlight = false }) {
  return (
    <div className={`${softCard} ${wide ? 'md:col-span-2' : ''}`}>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className={`text-sm leading-relaxed ${highlight ? 'font-bold text-blue-700' : 'font-medium text-slate-800'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base">
        {icon}
      </span>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
}

function ProgressTracker({ status }) {
  const isRejected = status === 'Từ chối';
  const currentIdx = getStepIndex(status);

  return (
    <div className={`${cardClass} p-6`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tiến trình hồ sơ
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Trưởng phòng có quyền duyệt hồ sơ
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {isRejected ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          ✕ Hồ sơ đã bị từ chối. Vui lòng liên hệ trưởng phòng để biết thêm chi tiết.
        </div>
      ) : (
        <div className="flex items-start gap-0">
          {PROFILE_STEPS.map((step, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            const future = idx > currentIdx;
            return (
              <div key={step} className={`flex items-start ${idx < PROFILE_STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all
                      ${done ? 'border-blue-600 bg-blue-600 text-white'
                        : active ? 'border-blue-600 bg-white text-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]'
                        : 'border-slate-200 bg-white text-slate-400'}`}
                  >
                    {done ? '✓' : idx + 1}
                  </div>
                  <p className={`mt-2.5 max-w-[72px] text-center text-[11px] font-bold leading-4
                    ${done ? 'text-blue-600' : active ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step}
                  </p>
                </div>
                {idx < PROFILE_STEPS.length - 1 && (
                  <div className={`mt-5 h-0.5 flex-1 rounded-full transition-all ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocumentRow({ doc }) {
  const statusColor = {
    'Hợp lệ': 'bg-green-100 text-green-700',
    'Chờ xác minh': 'bg-amber-100 text-amber-700',
    'Không hợp lệ': 'bg-red-100 text-red-600',
    'Hết hạn': 'bg-orange-100 text-orange-700',
    'Cần bổ sung': 'bg-purple-100 text-purple-700',
  }[doc.TrangThai] || 'bg-slate-100 text-slate-600';

  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fileUrl = doc.DuongDanFile
    ? (doc.DuongDanFile.startsWith('http') ? doc.DuongDanFile : `${baseUrl}${doc.DuongDanFile}`)
    : '';

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{doc.MaLoaiGiayTo}</p>
        <p className="mt-0.5 text-xs text-slate-400">{doc.MaGiayTo} · Cập nhật {safeDate(doc.NgayCapNhat)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColor}`}>
          {doc.TrangThai}
        </span>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
          >
            Xem file
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export default function AdoptionProfileDetail() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [request, setRequest] = useState(null);
  const [child, setChild] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profileId) return;
    let active = true;

    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await adoptionApi.getProfileById(profileId);
        const profileData = normalizeProfile(unwrap(profileRes));
        if (!profileData || !active) return;
        setProfile(profileData);

        // Load related data in parallel
        const [requestRes, childRes, docsRes] = await Promise.allSettled([
          profileData.MaYeuCauNhan ? adoptionApi.getById(profileData.MaYeuCauNhan) : Promise.resolve(null),
          profileData.MaTre ? adoptionApi.getChildById(profileData.MaTre) : Promise.resolve(null),
          profileData.MaYeuCauNhan
            ? adoptionApi.getDocuments({ maYeuCauNhan: profileData.MaYeuCauNhan })
            : Promise.resolve(null),
        ]);

        if (!active) return;

        if (requestRes.status === 'fulfilled' && requestRes.value) {
          setRequest(normalizeRequest(unwrap(requestRes.value)));
        }
        if (childRes.status === 'fulfilled' && childRes.value) {
          setChild(normalizeChild(unwrap(childRes.value)));
        }
        if (docsRes.status === 'fulfilled' && docsRes.value) {
          const raw = unwrap(docsRes.value);
          const arr = Array.isArray(raw) ? raw : (raw?.items ?? raw?.data ?? []);
          setDocuments(Array.isArray(arr) ? arr.map(normalizeDoc) : []);
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết hồ sơ:', err);
        if (active) setError('Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAll();
    return () => { active = false; };
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-800">Không tìm thấy hồ sơ</p>
          <p className="mt-2 text-sm text-slate-500">{error || 'Mã hồ sơ không tồn tại.'}</p>
          <button
            onClick={() => navigate('/can-bo-nhan-nuoi/ho-so')}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Về danh sách hồ sơ
          </button>
        </div>
      </div>
    );
  }

  const childAge = getAge(child?.NgaySinh);
  const docCount = documents.length;
  const validDocCount = documents.filter(d => d.TrangThai === 'Hợp lệ').length;

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">

        {/* ── Header ── */}
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Theo dõi nhận nuôi
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-800 md:text-4xl">
                Hồ sơ nhận nuôi
              </h1>
              <StatusBadge status={profile.TrangThai} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Mã hồ sơ: <span className="font-bold text-blue-700">{profile.MaHSNhanNuoi}</span>
              {' · '}
              Yêu cầu: <span className="font-semibold text-slate-700">{profile.MaYeuCauNhan}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/can-bo-nhan-nuoi/ho-so" className={secondaryButton}>
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Danh sách hồ sơ
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-7 xl:grid-cols-12">
          {/* ── Left: main content ── */}
          <div className="space-y-7 xl:col-span-8">

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Ngày lập', value: safeDate(profile.NgayLap) },
                { label: 'Ngày duyệt', value: safeDate(profile.NgayDuyet) },
                { label: 'Giấy tờ hợp lệ', value: docCount > 0 ? `${validDocCount}/${docCount}` : '—' },
                { label: 'Cán bộ lập', value: profile.TenCanBo || profile.MaCanBo || '—' },
              ].map(stat => (
                <div key={stat.label} className={`${cardClass} px-5 py-4`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-1.5 text-base font-bold text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Người nhận nuôi */}
            <section className={cardClass}>
              <div className="border-b border-slate-100 px-6 py-5">
                <SectionHeader icon="👤" title="Thông tin người nhận nuôi" />
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <Field label="Họ tên" value={request?.TenNguoiNhan} highlight />
                <Field label="Số điện thoại" value={request?.SDTNguoiNhan} />
                <Field label="Ngày sinh" value={safeDate(request?.NgaySinhNguoiNhan)} />
                <Field label="Thu nhập hàng tháng" value={formatCurrency(request?.ThuNhapHangThang)} />
                <Field label="Tình trạng hôn nhân" value={request?.TinhTrangHonNhan} />
                <Field label="Loại nơi ở" value={request?.LoaiNoiO} />
                <Field label="Lý do nhận nuôi" value={request?.LyDoNhanNuoi} wide />
                <Field label="Mong muốn về trẻ" value={request?.MongMuonVeTre} wide />
              </div>
            </section>

            {/* Trẻ được nhận nuôi */}
            <section className={cardClass}>
              <div className="border-b border-slate-100 px-6 py-5">
                <SectionHeader icon="🧒" title="Trẻ được nhận nuôi" />
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                <Field label="Mã trẻ" value={profile.MaTre} highlight />
                <Field label="Họ tên trẻ" value={child?.HoTen || profile.TenTre} />
                <Field label="Ngày sinh" value={safeDate(child?.NgaySinh)} />
                <Field label="Tuổi" value={childAge !== null ? `${childAge} tuổi` : '—'} />
                <Field label="Giới tính" value={child?.GioiTinh} />
                <Field label="Dân tộc" value={child?.DanToc} />
                <Field label="Trạng thái trẻ" value={child?.TrangThai} />
                <Field label="Ghi chú" value={child?.GhiChu} />
              </div>
            </section>

            {/* Giấy tờ */}
            <section className={cardClass}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <SectionHeader icon="📄" title="Giấy tờ pháp lý" />
                {docCount > 0 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    {validDocCount}/{docCount} hợp lệ
                  </span>
                )}
              </div>
              {documents.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  Chưa có giấy tờ nào được ghi nhận.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <DocumentRow key={doc.MaGiayTo} doc={doc} />
                  ))}
                </div>
              )}
            </section>

            {/* Ghi chú hồ sơ */}
            {profile.GhiChu && (
              <section className={cardClass}>
                <div className="border-b border-slate-100 px-6 py-5">
                  <SectionHeader icon="📝" title="Ghi chú / Ý kiến xử lý" />
                </div>
                <div className="p-6">
                  <p className={`rounded-2xl border px-4 py-3 text-sm font-medium leading-7
                    ${profile.TrangThai === 'Từ chối'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : profile.TrangThai === 'Đã duyệt' || profile.TrangThai === 'Đã hoàn tất'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {profile.GhiChu}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="xl:col-span-4">
            <div className="space-y-6 xl:sticky xl:top-6">
              {/* Progress tracker */}
              <ProgressTracker status={profile.TrangThai} />

              {/* Profile meta */}
              <section className={cardClass}>
                <div className="border-b border-slate-100 px-6 py-5">
                  <p className="text-sm font-bold text-slate-800">Thông tin hồ sơ</p>
                </div>
                <div className="space-y-4 p-6">
                  {[
                    { label: 'Mã hồ sơ', value: profile.MaHSNhanNuoi, bold: true },
                    { label: 'Yêu cầu liên kết', value: profile.MaYeuCauNhan },
                    { label: 'Trạng thái', value: profile.TrangThai },
                    { label: 'Cán bộ lập hồ sơ', value: profile.TenCanBo || profile.MaCanBo || '—' },
                    { label: 'Ngày lập', value: safeDate(profile.NgayLap) },
                    { label: 'Ngày duyệt', value: safeDate(profile.NgayDuyet) },
                  ].map(({ label, value, bold }) => (
                    <div key={label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-slate-400 shrink-0">{label}</span>
                      <span className={`text-right font-semibold ${bold ? 'text-blue-700' : 'text-slate-800'}`}>
                        {value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <section className={cardClass}>
                <div className="border-b border-slate-100 px-6 py-5">
                  <p className="text-sm font-bold text-slate-800">Thao tác</p>
                </div>
                <div className="space-y-3 p-6">
                  <p className={`rounded-2xl border px-4 py-3 text-sm font-medium leading-6
                    ${profile.TrangThai === 'Đang lập' ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : profile.TrangThai === 'Chờ duyệt' ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : profile.TrangThai === 'Đã duyệt' ? 'border-green-200 bg-green-50 text-green-700'
                      : profile.TrangThai === 'Đã hoàn tất' ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-red-200 bg-red-50 text-red-600'}`}>
                    {profile.TrangThai === 'Đang lập' && 'Hồ sơ đang ở bước hoàn thiện, chờ gửi duyệt.'}
                    {profile.TrangThai === 'Chờ duyệt' && 'Hồ sơ đang chờ trưởng phòng phê duyệt.'}
                    {profile.TrangThai === 'Đã duyệt' && 'Hồ sơ đã được trưởng phòng phê duyệt thành công.'}
                    {profile.TrangThai === 'Đã hoàn tất' && 'Hồ sơ đã hoàn tất và được lưu trữ chính thức.'}
                    {profile.TrangThai === 'Từ chối' && 'Hồ sơ đã bị từ chối. Không có thao tác tiếp theo.'}
                  </p>
                  <Link
                    to="/can-bo-nhan-nuoi/ho-so"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Về danh sách hồ sơ
                  </Link>
                  <Link
                    to="/can-bo-nhan-nuoi/danh-sach"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Về yêu cầu nhận nuôi
                  </Link>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}