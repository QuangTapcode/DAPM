import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import documentApi from '../../api/documentApi';
import meetingApi from '../../api/meetingApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const pageClass = 'min-h-screen bg-[#F6F8FC]';

const cardClass =
  'rounded-[28px] border border-[#E4EAF2] bg-white shadow-[0_12px_34px_rgba(31,42,61,0.06)]';

const labelClass =
  'text-[11px] font-bold uppercase tracking-[0.13em] text-[#8FA0B8]';

const valueClass = 'mt-2 text-[15px] font-semibold leading-6 text-[#26364A]';

const REQUEST_STATUS = {
  VERIFYING: 'Đang xác minh',
  NEED_SUPPLEMENT: 'Yêu cầu bổ sung',
  APPROVED: 'Đã duyệt',
  MATCHING_CHILD: 'Ghép trẻ',
  PRE_REJECTED: 'Từ chối sơ bộ',
};

const DOCUMENT_STATUS = {
  WAITING: 'Chờ xác minh',
  VALID: 'Hợp lệ',
  INVALID: 'Không hợp lệ',
  EXPIRED: 'Hết hạn',
  NEED_SUPPLEMENT: 'Cần bổ sung',
};

function unwrapApiResponse(res) {
  if (res?.success !== undefined) return res.data;
  return res?.data ?? res;
}

function getResponseItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
}

function getApiOrigin() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return base.replace(/\/api\/?$/, '');
}

function resolveFileUrl(path) {
  if (!path) return '';
  if (String(path).startsWith('http')) return path;
  return `${getApiOrigin()}${path}`;
}

function normalizeRequest(item = {}) {
  return {
    maYeuCauNhan: item.maYeuCauNhan || item.MaYeuCauNhan || item.id || '',
    maNguoiNhan: item.maNguoiNhan || item.MaNguoiNhan || item.adopterId || '',
    tenNguoiNhan:
      item.tenNguoiNhan || item.TenNguoiNhan || item.adopterName || 'Chưa rõ',
    sdtNguoiNhan:
      item.sdtNguoiNhan || item.SDTNguoiNhan || item.phone || 'Chưa cập nhật',

    thuNhapHangThang:
      item.thuNhapHangThang ?? item.ThuNhapHangThang ?? item.monthlyIncome ?? 0,
    soConDangNuoi: item.soConDangNuoi ?? item.SoConDangNuoi ?? 0,
    tinhTrangHonNhan:
      item.tinhTrangHonNhan || item.TinhTrangHonNhan || 'Chưa cập nhật',
    loaiNoiO: item.loaiNoiO || item.LoaiNoiO || 'Chưa cập nhật',
    sucKhoeDatYeuCau:
      item.sucKhoeDatYeuCau ?? item.SucKhoeDatYeuCau ?? false,
    quanHeVoiTre: item.quanHeVoiTre || item.QuanHeVoiTre || 'Không',

    lyDoNhanNuoi:
      item.lyDoNhanNuoi || item.LyDoNhanNuoi || 'Chưa cập nhật',
    mongMuonTuoiToiDa:
      item.mongMuonTuoiToiDa ?? item.MongMuonTuoiToiDa ?? null,
    mongMuonGioiTinh:
      item.mongMuonGioiTinh || item.MongMuonGioiTinh || 'Không yêu cầu',

    hopLeSoBo: item.hopLeSoBo ?? item.HopLeSoBo ?? false,
    diemUuTien: item.diemUuTien ?? item.DiemUuTien ?? 0,
    lyDoTuChoiSoBo:
      item.lyDoTuChoiSoBo || item.LyDoTuChoiSoBo || '',

    trangThai:
      item.trangThai || item.TrangThai || item.status || REQUEST_STATUS.VERIFYING,
    ngayTao: item.ngayTao || item.NgayTao || item.createdAt || null,
    ghiChu: item.ghiChu || item.GhiChu || '',

    giayTos: item.giayTos || item.GiayTos || [],
    soGiayTo: item.soGiayTo ?? item.SoGiayTo ?? 0,
    soGiayToHopLe:
      item.soGiayToHopLe ?? item.SoGiayToHopLe ?? item.validDocuments ?? 0,
  };
}

function normalizeDocuments(data) {
  const raw = getResponseItems(data);

  return raw.map((doc) => ({
    maGiayTo: doc.maGiayTo || doc.MaGiayTo || doc.id || '',
    maLoaiGiayTo: doc.maLoaiGiayTo || doc.MaLoaiGiayTo || '',
    tenLoaiGiayTo:
      doc.tenLoaiGiayTo ||
      doc.TenLoaiGiayTo ||
      doc.tenGiayTo ||
      doc.TenGiayTo ||
      doc.name ||
      'Giấy tờ',
    duongDanFile:
      doc.duongDanFile || doc.DuongDanFile || doc.url || doc.fileUrl || '',
    trangThai:
      doc.trangThai || doc.TrangThai || doc.status || DOCUMENT_STATUS.WAITING,
    ngayCapNhat:
      doc.ngayCapNhat || doc.NgayCapNhat || doc.updatedAt || null,
  }));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function getPriorityLabel(score) {
  const value = Number(score || 0);

  if (value >= 7) return 'Ưu tiên cao';
  if (value >= 4) return 'Ưu tiên vừa';
  return 'Ưu tiên thấp';
}

function getPriorityClass(score) {
  const value = Number(score || 0);

  if (value >= 7) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (value >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';

  return 'bg-slate-50 text-slate-600 border-slate-200';
}

function InfoItem({ label, value, className = '' }) {
  const displayValue =
    value === null || value === undefined || value === ''
      ? 'Chưa cập nhật'
      : value;

  return (
    <div
      className={`rounded-2xl border border-[#E6EDF5] bg-white px-5 py-4 ${className}`}
    >
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{displayValue}</p>
    </div>
  );
}

function LargeInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
      <p className={labelClass}>{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#26364A]">
        {value || 'Chưa cập nhật'}
      </p>
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h2 className="text-[18px] font-bold text-[#0D47A1]">{title}</h2>
      {description && (
        <p className="mt-2 text-sm leading-7 text-[#7D90AA]">{description}</p>
      )}
    </div>
  );
}

function getStatusMessage(status) {
  const messages = {
    [REQUEST_STATUS.VERIFYING]:
      'Yêu cầu đang được xác minh. Cán bộ cần kiểm tra từng giấy tờ.',
    [REQUEST_STATUS.NEED_SUPPLEMENT]:
      'Có giấy tờ cần bổ sung. Người nhận nuôi cần cập nhật lại giấy tờ.',
    [REQUEST_STATUS.APPROVED]:
      'Tất cả giấy tờ đã hợp lệ. Yêu cầu đã được duyệt và có thể chuyển sang giao diện ghép trẻ.',
    [REQUEST_STATUS.MATCHING_CHILD]:
      'Yêu cầu đang ở bước ghép trẻ. Cán bộ có thể tiếp tục chọn trẻ phù hợp và tạo hồ sơ.',
    [REQUEST_STATUS.PRE_REJECTED]:
      'Yêu cầu bị từ chối sơ bộ do không đạt điều kiện tự động.',
  };

  return messages[status] || 'Theo dõi trạng thái xử lý yêu cầu.';
}

function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null;

  const fileUrl = resolveFileUrl(document.duongDanFile);
  const lowerUrl = String(fileUrl || '').toLowerCase();

  const isImage =
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.webp');

  const isPdf = lowerUrl.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-[1020px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E4EAF2] px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-[#1F2A3D]">
              {document.tenLoaiGiayTo}
            </h3>
            <p className="mt-1 text-sm text-[#7D90AA]">
              {document.maGiayTo} · {document.maLoaiGiayTo}
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
                alt={document.tenLoaiGiayTo}
                className="max-h-[72vh] max-w-full rounded-2xl border border-[#D7E1EE] bg-white object-contain"
              />
            </div>
          )}

          {fileUrl && isPdf && (
            <iframe
              src={fileUrl}
              title={document.tenLoaiGiayTo}
              className="h-[72vh] w-full rounded-2xl border border-[#D7E1EE] bg-white"
            />
          )}

          {fileUrl && !isImage && !isPdf && (
            <div className="rounded-2xl border border-[#D7E1EE] bg-white p-8 text-center">
              <p className="text-sm text-[#7D90AA]">
                Định dạng này không xem trực tiếp được trên trình duyệt.
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-[#0D47A1] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#083778]"
              >
                Mở file trong tab mới
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffMeetingPanel({ requestId, requestStatus }) {
  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createDateTime, setCreateDateTime] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    setLoadingMeeting(true);
    meetingApi.getAll({ maYeuCauNhan: requestId, page: 1, limit: 1 })
      .then((res) => setMeeting(res?.items?.[0] || null))
      .catch(() => setMeeting(null))
      .finally(() => setLoadingMeeting(false));
  }, [requestId]);

  const handleCreate = async () => {
    if (!createDateTime || !createLocation) return;
    setSaving(true);
    try {
      const created = await meetingApi.create({
        maYeuCauNhan: requestId,
        thoiGian: createDateTime,
        diaDiem: createLocation,
      });
      setMeeting(created);
      setShowCreate(false);
    } catch (err) {
      alert(err?.message || 'Không thể tạo lịch hẹn.');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptReschedule = async () => {
    if (!meeting?.thoiGianDeXuatMoi) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, {
        thoiGian: meeting.thoiGianDeXuatMoi,
        trangThai: 'Đã xác nhận',
      });
      setMeeting(updated);
    } catch (err) {
      alert(err?.message || 'Không thể chấp nhận đề xuất.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeclineReschedule = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, { trangThai: 'Chờ xác nhận' });
      setMeeting(updated);
    } catch (err) {
      alert(err?.message || 'Không thể từ chối đề xuất.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkMet = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, { trangThai: 'Đã gặp mặt' });
      setMeeting(updated);
    } catch (err) {
      alert(err?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setSaving(false);
    }
  };

  const canCreate = !meeting && (requestStatus === REQUEST_STATUS.APPROVED || requestStatus === REQUEST_STATUS.MATCHING_CHILD);
  const hasProposal = meeting?.trangThai === 'Yêu cầu đổi lịch';
  const canMarkMet = meeting?.trangThai === 'Đã xác nhận';

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="border-b border-[#E4EAF2] px-6 py-6 lg:px-7">
        <SectionTitle
          title="Lịch hẹn gặp mặt"
          description="Sắp xếp lịch gặp giữa cán bộ và người nhận nuôi. Hai bên tương tác qua trạng thái lịch hẹn."
        />
      </div>

      <div className="p-6 lg:p-7">
        {loadingMeeting && (
          <p className="text-sm text-[#8FA0B8]">Đang tải...</p>
        )}

        {!loadingMeeting && !meeting && !showCreate && (
          <div className="rounded-2xl border border-dashed border-[#D7E5F7] bg-[#FAFCFF] p-8 text-center">
            <p className="text-sm text-[#8FA0B8]">Chưa có lịch hẹn nào được tạo.</p>
            {canCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778]"
              >
                Tạo lịch hẹn
              </button>
            )}
            {!canCreate && (
              <p className="mt-2 text-xs text-[#8FA0B8]">Chỉ tạo lịch hẹn khi yêu cầu đã được duyệt.</p>
            )}
          </div>
        )}

        {!loadingMeeting && !meeting && showCreate && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Thời gian gặp mặt</label>
              <input
                type="datetime-local"
                value={createDateTime}
                onChange={(e) => setCreateDateTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E3ECF8] bg-[#F7FBFF] px-3 py-2.5 text-sm text-[#26364A] outline-none focus:border-[#93c5fd]"
              />
            </div>
            <div>
              <label className={labelClass}>Địa điểm</label>
              <input
                type="text"
                value={createLocation}
                onChange={(e) => setCreateLocation(e.target.value)}
                placeholder="Phòng họp, địa chỉ..."
                className="mt-1 w-full rounded-xl border border-[#E3ECF8] bg-[#F7FBFF] px-3 py-2.5 text-sm text-[#26364A] outline-none focus:border-[#93c5fd]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !createDateTime || !createLocation}
                className="inline-flex h-10 items-center rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Tạo lịch hẹn'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="inline-flex h-10 items-center rounded-xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#EEF6FF]"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {!loadingMeeting && meeting && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoItem label="Thời gian" value={new Date(meeting.thoiGian).toLocaleString('vi-VN')} />
              <InfoItem label="Địa điểm" value={meeting.diaDiem || 'Chưa cập nhật'} />
              <InfoItem label="Cán bộ" value={meeting.tenCanBo || 'Chưa cập nhật'} />
              <InfoItem label="Trạng thái" value={meeting.trangThai} />
            </div>

            {hasProposal && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800">Người nhận nuôi yêu cầu đổi lịch</p>
                <p className="mt-1 text-sm text-amber-700">
                  Thời gian đề xuất:{' '}
                  {new Date(meeting.thoiGianDeXuatMoi).toLocaleString('vi-VN')}
                </p>
                {meeting.phanHoiNguoiNhan && (
                  <p className="mt-1 text-sm text-amber-700">Lý do: {meeting.phanHoiNguoiNhan}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptReschedule}
                    disabled={saving}
                    className="inline-flex h-9 items-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Chấp nhận đổi lịch
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineReschedule}
                    disabled={saving}
                    className="inline-flex h-9 items-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    Giữ lịch cũ
                  </button>
                </div>
              </div>
            )}

            {canMarkMet && (
              <button
                type="button"
                onClick={handleMarkMet}
                disabled={saving}
                className="inline-flex h-10 items-center rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:opacity-60"
              >
                Xác nhận đã gặp mặt
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdoptionRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [viewedDocs, setViewedDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const loadDetail = async () => {
      try {
        setLoading(true);

        const [adoptRes, docsRes] = await Promise.all([
          adoptionApi.getById(id),
          documentApi.getDocuments({ maYeuCauNhan: id }),
        ]);

        if (!active) return;

        const requestPayload = unwrapApiResponse(adoptRes);
        const docsPayload = unwrapApiResponse(docsRes);

        const normalizedRequest = normalizeRequest(requestPayload);
        const normalizedDocs = normalizeDocuments(docsPayload);

        setRequest(normalizedRequest);
        setDocuments(normalizedDocs);
        setViewedDocs({});
        setPreviewDoc(null);
      } catch (error) {
        console.error('Lỗi tải chi tiết yêu cầu nhận nuôi:', error);
        setRequest(null);
        setDocuments([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      active = false;
    };
  }, [id]);

  const documentSummary = useMemo(() => {
    const total = documents.length;
    const valid = documents.filter(
      (doc) => doc.trangThai === DOCUMENT_STATUS.VALID
    ).length;
    const waiting = documents.filter(
      (doc) => doc.trangThai === DOCUMENT_STATUS.WAITING
    ).length;
    const needSupplement = documents.filter(
      (doc) => doc.trangThai === DOCUMENT_STATUS.NEED_SUPPLEMENT
    ).length;
    const invalid = documents.filter(
      (doc) => doc.trangThai === DOCUMENT_STATUS.INVALID
    ).length;
    const expired = documents.filter(
      (doc) => doc.trangThai === DOCUMENT_STATUS.EXPIRED
    ).length;

    return {
      total,
      valid,
      waiting,
      needSupplement,
      invalid,
      expired,
      allValid: total > 0 && valid === total,
      hasProblem: needSupplement > 0 || invalid > 0 || expired > 0,
    };
  }, [documents]);

  const status = request?.trangThai || '';

  const canReviewDocuments =
    status === REQUEST_STATUS.VERIFYING ||
    status === REQUEST_STATUS.NEED_SUPPLEMENT;

  const canOpenMatching =
    status === REQUEST_STATUS.APPROVED ||
    status === REQUEST_STATUS.MATCHING_CHILD;

  const isReadonly =
    status === REQUEST_STATUS.APPROVED ||
    status === REQUEST_STATUS.MATCHING_CHILD ||
    status === REQUEST_STATUS.PRE_REJECTED;

  const canManualApprove = canReviewDocuments && documents.length > 0 && !saving;

  async function updateRequestStatus(newStatus) {
    if (!request?.maYeuCauNhan) return;

    setSaving(true);

    try {
      if (newStatus === REQUEST_STATUS.APPROVED) {
        await adoptionApi.approve(request.maYeuCauNhan);
      } else if (newStatus === REQUEST_STATUS.PRE_REJECTED) {
        await adoptionApi.reject(request.maYeuCauNhan);
      } else {
        alert(`BE chưa có API chuyển trạng thái "${newStatus}".`);
        return;
      }

      setRequest((prev) =>
        prev
          ? {
            ...prev,
            trangThai: newStatus,
          }
          : prev
      );
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái yêu cầu:', error);
      alert('Không thể cập nhật trạng thái yêu cầu.');
    } finally {
      setSaving(false);
    }
  }

  function openDocumentPreview(doc) {
    setPreviewDoc(doc);

    if (doc.duongDanFile) {
      setViewedDocs((prev) => ({
        ...prev,
        [doc.maGiayTo]: true,
      }));
    }
  }

  async function updateDocumentStatus(maGiayTo, newStatus) {
    const currentDoc = documents.find((doc) => doc.maGiayTo === maGiayTo);

    if (!currentDoc) {
      alert('Không tìm thấy giấy tờ cần cập nhật.');
      return;
    }

    setSaving(true);

    try {
      await documentApi.update(maGiayTo, {
        maLoaiGiayTo: currentDoc.maLoaiGiayTo,
        duongDanFile: currentDoc.duongDanFile,
        trangThai: newStatus,
      });

      const nextDocs = documents.map((doc) =>
        doc.maGiayTo === maGiayTo
          ? {
            ...doc,
            trangThai: newStatus,
            ngayCapNhat: new Date().toISOString(),
          }
          : doc
      );

      setDocuments(nextDocs);

      const hasProblemStatus = [
        DOCUMENT_STATUS.NEED_SUPPLEMENT,
        DOCUMENT_STATUS.INVALID,
        DOCUMENT_STATUS.EXPIRED,
      ].includes(newStatus);

      if (hasProblemStatus) {
        return;
      }

      const allDocsValid =
        nextDocs.length > 0 &&
        nextDocs.every((doc) => doc.trangThai === DOCUMENT_STATUS.VALID);

      const canAutoApprove =
        request?.trangThai === REQUEST_STATUS.VERIFYING ||
        request?.trangThai === REQUEST_STATUS.NEED_SUPPLEMENT;

      if (allDocsValid && canAutoApprove) {
        await updateRequestStatus(REQUEST_STATUS.APPROVED);
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái giấy tờ:', error);
      alert('Không thể cập nhật trạng thái giấy tờ.');
    } finally {
      setSaving(false);
    }
  }

  async function handleManualApprove() {
    if (!request?.maYeuCauNhan || saving) return;
    const confirmed = window.confirm(
      'Xác nhận hoàn tất xác minh hồ sơ?\n\nTất cả giấy tờ sẽ được đánh dấu hợp lệ và yêu cầu chuyển sang bước tiếp theo.'
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      for (const doc of documents) {
        if (doc.trangThai !== DOCUMENT_STATUS.VALID) {
          await documentApi.update(doc.maGiayTo, {
            maLoaiGiayTo: doc.maLoaiGiayTo,
            duongDanFile: doc.duongDanFile,
            trangThai: DOCUMENT_STATUS.VALID,
          });
        }
      }
      await adoptionApi.approve(request.maYeuCauNhan);
      setRequest((prev) => prev ? { ...prev, trangThai: REQUEST_STATUS.APPROVED } : prev);
      setDocuments((prev) => prev.map((d) => ({ ...d, trangThai: DOCUMENT_STATUS.VALID })));
    } catch (error) {
      alert('Không thể xác minh hồ sơ: ' + (error?.message || 'Lỗi không xác định'));
    } finally {
      setSaving(false);
    }
  }

  function handleOpenMatching() {
    if (
      request?.trangThai !== REQUEST_STATUS.APPROVED &&
      request?.trangThai !== REQUEST_STATUS.MATCHING_CHILD
    ) {
      alert('Chỉ yêu cầu đã duyệt mới được ghép trẻ.');
      return;
    }

    navigate(`/can-bo-nhan-nuoi/tao-ho-so/${request.maYeuCauNhan}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-5 text-center text-sm text-[#8FA0B8]">
        Không tìm thấy yêu cầu nhận nuôi.
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Xét duyệt yêu cầu nhận nuôi
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                {request.maYeuCauNhan}
              </h1>

              <Badge status={request.trangThai} size="md" />
            </div>

            <p className="mt-2 text-sm text-[#7D90AA]">
              Người nhận nuôi: {request.tenNguoiNhan} · {request.sdtNguoiNhan}
            </p>
          </div>

          <Link
            to="/can-bo-nhan-nuoi/danh-sach"
            className="w-fit rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#EEF6FF]"
          >
            Quay lại danh sách
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="space-y-8 lg:col-span-8">
            <section className={`${cardClass} p-6 lg:p-7`}>
              <div className="mb-6">
                <SectionTitle title="Tổng quan yêu cầu" />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div
                  className={`rounded-2xl border px-5 py-4 ${getPriorityClass(
                    request.diemUuTien
                  )}`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.13em]">
                    Điểm ưu tiên
                  </p>
                  <p className="mt-2 text-[30px] font-extrabold leading-none">
                    {request.diemUuTien}
                  </p>
                  <p className="mt-2 text-xs font-semibold">
                    {getPriorityLabel(request.diemUuTien)}
                  </p>
                </div>

                <InfoItem label="Ngày tạo" value={formatDate(request.ngayTao)} />

                <InfoItem
                  label="Giấy tờ đã xác minh"
                  value={`${documentSummary.valid}/${documentSummary.total}`}
                />
              </div>
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Thông tin người nhận nuôi" />

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoItem label="Mã người nhận" value={request.maNguoiNhan} />
                <InfoItem label="Họ và tên" value={request.tenNguoiNhan} />
                <InfoItem label="Số điện thoại" value={request.sdtNguoiNhan} />

                <InfoItem
                  label="Thu nhập hàng tháng"
                  value={formatCurrency(request.thuNhapHangThang)}
                />

                <InfoItem
                  label="Số con đang nuôi"
                  value={request.soConDangNuoi}
                />

                <InfoItem
                  label="Tình trạng hôn nhân"
                  value={request.tinhTrangHonNhan}
                />

                <InfoItem label="Loại nơi ở" value={request.loaiNoiO} />

                <InfoItem
                  label="Sức khỏe"
                  value={
                    request.sucKhoeDatYeuCau ? 'Đạt yêu cầu' : 'Không đạt'
                  }
                />

                <InfoItem
                  label="Quan hệ với trẻ"
                  value={request.quanHeVoiTre}
                />

                <InfoItem
                  label="Mong muốn tuổi tối đa"
                  value={
                    request.mongMuonTuoiToiDa !== null
                      ? `${request.mongMuonTuoiToiDa} tuổi`
                      : 'Không yêu cầu'
                  }
                />

                <InfoItem
                  label="Mong muốn giới tính"
                  value={request.mongMuonGioiTinh}
                />

                <InfoItem
                  label="Hợp lệ sơ bộ"
                  value={request.hopLeSoBo ? 'Đạt' : 'Không đạt'}
                />
              </div>
            </section>

            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Nội dung yêu cầu" />

              <div className="mt-6 grid gap-5">
                <LargeInfo label="Lý do nhận nuôi" value={request.lyDoNhanNuoi} />

                {request.lyDoTuChoiSoBo && (
                  <LargeInfo
                    label="Lý do từ chối sơ bộ"
                    value={request.lyDoTuChoiSoBo}
                  />
                )}

                <LargeInfo label="Ghi chú" value={request.ghiChu} />
              </div>
            </section>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-[#E4EAF2] px-6 py-6 lg:px-7 xl:flex-row xl:items-center xl:justify-between">
                <SectionTitle
                  title="Giấy tờ pháp lý"
                  description="Cán bộ cần xem file trước khi đánh dấu trạng thái từng giấy tờ."
                />

                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-green-700">
                    Hợp lệ: {documentSummary.valid}
                  </span>
                  <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">
                    Chờ xác minh: {documentSummary.waiting}
                  </span>
                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-700">
                    Cần bổ sung: {documentSummary.needSupplement}
                  </span>
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700">
                    Lỗi/hết hạn: {documentSummary.invalid + documentSummary.expired}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-6 lg:p-7">
                {documents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#D7E5F7] bg-[#FAFCFF] p-8 text-center text-sm text-[#7D90AA]">
                    Chưa có giấy tờ pháp lý được tải lên.
                  </div>
                )}

                {documents.map((doc) => {
                  const hasViewed = viewedDocs[doc.maGiayTo];
                  const canReviewThisDoc =
                    canReviewDocuments &&
                    !isReadonly &&
                    doc.duongDanFile &&
                    hasViewed;

                  return (
                    <div
                      key={doc.maGiayTo}
                      className="rounded-[22px] border border-[#E1ECF8] bg-[#FAFCFF] p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-bold leading-6 text-[#1F2A3D]">
                              {doc.tenLoaiGiayTo}
                            </p>

                            <Badge status={doc.trangThai} size="sm" />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-[#7D90AA]">
                            <span>Mã giấy tờ: {doc.maGiayTo}</span>
                            <span>Loại: {doc.maLoaiGiayTo}</span>
                            <span>
                              Cập nhật:{' '}
                              {doc.ngayCapNhat
                                ? formatDate(doc.ngayCapNhat)
                                : 'Chưa cập nhật'}
                            </span>
                          </div>

                          {!doc.duongDanFile && (
                            <p className="mt-3 text-sm font-semibold text-red-500">
                              Chưa có file đính kèm.
                            </p>
                          )}

                          {doc.duongDanFile &&
                            !hasViewed &&
                            canReviewDocuments &&
                            !isReadonly && (
                              <p className="mt-3 text-xs font-semibold text-amber-600">
                                Cần xem giấy tờ trước khi cập nhật trạng thái.
                              </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                          <button
                            type="button"
                            onClick={() => openDocumentPreview(doc)}
                            disabled={!doc.duongDanFile}
                            className="rounded-xl border border-[#CFE0F5] bg-white px-4 py-2.5 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Xem giấy tờ
                          </button>

                          {canReviewDocuments && !isReadonly && (
                            <>
                              <button
                                type="button"
                                disabled={!canReviewThisDoc || saving}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.maGiayTo,
                                    DOCUMENT_STATUS.VALID
                                  )
                                }
                                className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Hợp lệ
                              </button>

                              <button
                                type="button"
                                disabled={!canReviewThisDoc || saving}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.maGiayTo,
                                    DOCUMENT_STATUS.NEED_SUPPLEMENT
                                  )
                                }
                                className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Cần bổ sung
                              </button>

                              <button
                                type="button"
                                disabled={!canReviewThisDoc || saving}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.maGiayTo,
                                    DOCUMENT_STATUS.INVALID
                                  )
                                }
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Không hợp lệ
                              </button>

                              <button
                                type="button"
                                disabled={!canReviewThisDoc || saving}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.maGiayTo,
                                    DOCUMENT_STATUS.EXPIRED
                                  )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Hết hạn
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <StaffMeetingPanel requestId={id} requestStatus={request?.trangThai} />
          </main>

          <aside className="space-y-6 lg:col-span-4">
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Khu vực xử lý" />

              <div className="mt-6 rounded-2xl border border-[#E3ECF8] bg-[#FAFCFF] p-5">
                <p className={labelClass}>Trạng thái hiện tại</p>

                <div className="mt-3">
                  <Badge status={request.trangThai} size="md" />
                </div>

                <p className="mt-4 text-sm leading-7 text-[#6F83A3]">
                  {getStatusMessage(request.trangThai)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-[#E6EDF5] bg-white px-5 py-4">
                  <p className={labelClass}>Điều kiện chuyển bước</p>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5F738F]">
                    <li>
                      • Giấy tờ hợp lệ: {documentSummary.valid}/
                      {documentSummary.total}
                    </li>
                    <li>
                      • Có giấy tờ cần bổ sung:{' '}
                      {documentSummary.hasProblem ? 'Có' : 'Không'}
                    </li>
                    <li>
                      • Cho phép xét giấy tờ:{' '}
                      {canReviewDocuments ? 'Có' : 'Không'}
                    </li>
                  </ul>
                </div>

                {canReviewDocuments && documentSummary.hasProblem && (
                  <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm font-semibold leading-6 text-orange-700">
                    Có giấy tờ chưa hợp lệ hoặc cần bổ sung. Hồ sơ chưa thể chuyển sang Đã duyệt.
                  </div>
                )}

                {canReviewDocuments &&
                  !documentSummary.allValid &&
                  !documentSummary.hasProblem && (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500"
                    >
                      Cần xác minh đủ giấy tờ hợp lệ
                    </button>
                  )}

                {canManualApprove && (
                  <button
                    type="button"
                    onClick={handleManualApprove}
                    disabled={saving}
                    className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving ? 'Đang xử lý...' : 'Xác minh hồ sơ'}
                  </button>
                )}

                {canOpenMatching && (
                  <button
                    type="button"
                    onClick={handleOpenMatching}
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    {request.trangThai === REQUEST_STATUS.MATCHING_CHILD
                      ? 'Tiếp tục ghép trẻ'
                      : 'Ghép trẻ'}
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-[#D7E5F7] bg-[#EAF4FF] p-6">
              <h3 className="text-[15px] font-bold text-[#0D47A1]">
                Nguyên tắc xử lý
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#5F738F]">
                <li>• Cán bộ phải xem giấy tờ trước khi đánh dấu trạng thái.</li>
                <li>• Khi tất cả giấy tờ hợp lệ, yêu cầu tự chuyển sang Đã duyệt.</li>
                <li>• Hồ sơ ở trạng thái Đã duyệt có thể mở giao diện ghép trẻ bất cứ lúc nào.</li>
                <li>• Nếu giấy tờ sai, đánh dấu trạng thái giấy tờ cần bổ sung.</li>
              </ul>
            </section>
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