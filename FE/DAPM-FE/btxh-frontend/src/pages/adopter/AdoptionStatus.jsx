import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, CalendarDays, UserRound, MapPin, Phone, IdCard, Briefcase, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import adoptionApi from '../../api/adoptionApi';
import documentApi from '../../api/documentApi';
import lookupApi from '../../api/lookupApi';
import meetingApi from '../../api/meetingApi';
import { formatDate } from '../../utils/formatDate';

import { STATUS, getCurrentStep, getProgressWidth } from '../../utils/statusHelpers';
import StatusListPanel from '../../components/request-status/StatusListPanel';
import StatusProgress from '../../components/request-status/StatusProgress';
import DetailField from '../../components/request-status/DetailField';
import LargeField from '../../components/request-status/LargeField';
import DocumentCard from '../../components/request-status/DocumentCard';

const STEPS = [
  { key: 1, label: 'ĐÃ TẠO' },
  { key: 2, label: 'ĐANG XEM XÉT' },
  { key: 3, label: 'CẦN BỔ SUNG' },
  { key: 4, label: 'ĐÃ DUYỆT' },
];

function DocumentUploader({ requestId, readOnly, onUploadSuccess }) {
  const [docTypes, setDocTypes] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);

  const API_DOMAIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '');

  const loadData = () => {
    Promise.all([
      lookupApi.getGiayToBatBuocNhanNuoi(),
      documentApi.getDocuments({ maYeuCauNhan: requestId })
    ]).then(([resDocTypes, resDocs]) => {
      setDocTypes(Array.isArray(resDocTypes) ? resDocTypes : (resDocTypes?.items || []));
      setExistingDocs(Array.isArray(resDocs) ? resDocs : (resDocs?.items || []));
    });
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleUpload = async (file, maLoaiGiayTo) => {
    if (!file) return;
    setUploadingId(maLoaiGiayTo);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('maLoaiGiayTo', maLoaiGiayTo);
      formData.append('maYeuCauNhan', requestId);
      await documentApi.upload(formData);
      alert('Tải lên thành công!');
      loadData();
      if (onUploadSuccess) onUploadSuccess();
    } catch {
      alert('Lỗi tải lên!');
    } finally {
      setUploadingId(null);
    }
  };

  if (!docTypes || docTypes.length === 0) return null;

  return (
    <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-[#F8FAFC] p-5">
      <h4 className="mb-4 text-[15px] font-bold !text-[#0D47A1]">
        {readOnly ? 'Tài liệu đính kèm' : 'Cập nhật giấy tờ'}
      </h4>
      <div className="flex flex-col gap-3">
        {docTypes.map((doc) => {
          const existing = existingDocs.find(d => d.maLoaiGiayTo === doc.maLoaiGiayTo);
          if (readOnly && !existing) return null;
          const fileUrl = existing?.duongDanFile ? `${API_DOMAIN}${existing.duongDanFile}` : null;
          const isImage = fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) != null;

          return (
            <div
              key={doc.maLoaiGiayTo}
              className="flex items-center justify-between rounded-xl border border-[#E3ECF8] bg-white p-3"
            >
              <div className="flex gap-4 items-center">
                {fileUrl && isImage && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E3ECF8] bg-slate-50 flex-shrink-0">
                    <img
                      src={fileUrl}
                      alt={doc.tenLoaiGiayTo}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(fileUrl, '_blank')}
                    />
                  </div>
                )}
                {fileUrl && !isImage && (
                  <div className="w-14 h-14 flex items-center justify-center rounded-lg border border-[#E3ECF8] bg-slate-50 flex-shrink-0">
                    <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#2F80ED] hover:underline">PDF</a>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#27406B]">
                    {doc.tenLoaiGiayTo}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.moTa || 'Giấy tờ bắt buộc'}
                  </p>
                  {existing && !readOnly && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Đã tải lên
                    </span>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div>
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2F80ED] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1f66c9]">
                    {uploadingId === doc.maLoaiGiayTo ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {existing ? 'Tải lại' : 'Tải lên'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(e.target.files[0], doc.maLoaiGiayTo);
                          e.target.value = null;
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MeetingSection({ requestId }) {
  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDateTime, setNewDateTime] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    setLoadingMeeting(true);
    meetingApi.getAll({ maYeuCauNhan: requestId, page: 1, limit: 1 })
      .then((res) => setMeeting(res?.items?.[0] || null))
      .catch(() => setMeeting(null))
      .finally(() => setLoadingMeeting(false));
  }, [requestId]);

  const handleConfirm = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, { trangThai: 'Đã xác nhận' });
      setMeeting(updated);
    } catch (err) {
      alert(err?.message || 'Không thể xác nhận lịch hẹn.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProposal = async () => {
    if (!meeting) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, {
        trangThai: 'Chờ xác nhận',
        thoiGianDeXuatMoi: null,
        phanHoiNguoiNhan: null,
      });
      setMeeting(updated);
    } catch (err) {
      alert(err?.message || 'Không thể hủy đề xuất.');
    } finally {
      setSaving(false);
    }
  };

  const handleReschedule = async () => {
    if (!meeting || !newDateTime) return;
    setSaving(true);
    try {
      const updated = await meetingApi.update(meeting.maLichGap, {
        thoiGianDeXuatMoi: newDateTime,
        phanHoiNguoiNhan: note || 'Đề xuất đổi lịch hẹn',
        trangThai: 'Yêu cầu đổi lịch',
      });
      setMeeting(updated);
      setShowForm(false);
      setNewDateTime('');
      setNote('');
    } catch (err) {
      alert(err?.message || 'Không thể gửi đề xuất đổi lịch.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingMeeting || !meeting) return null;

  const status = meeting.trangThai;
  const isPending = status === 'Chờ xác nhận';
  const isProposed = status === 'Yêu cầu đổi lịch';

  return (
    <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-[#F8FAFC] p-5">
      <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold !text-[#0D47A1]">
        <CalendarDays size={16} />
        Lịch hẹn gặp mặt
      </h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E3ECF8] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8EA0B8]">Thời gian</p>
          <p className="mt-1 text-sm font-semibold text-[#27406B]">
            {meeting.thoiGian ? new Date(meeting.thoiGian).toLocaleString('vi-VN') : 'Chưa xác định'}
          </p>
        </div>
        <div className="rounded-xl border border-[#E3ECF8] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8EA0B8]">Địa điểm</p>
          <p className="mt-1 text-sm font-semibold text-[#27406B]">{meeting.diaDiem || 'Chưa cập nhật'}</p>
        </div>
        <div className="rounded-xl border border-[#E3ECF8] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8EA0B8]">Cán bộ phụ trách</p>
          <p className="mt-1 text-sm font-semibold text-[#27406B]">{meeting.tenCanBo || 'Chưa cập nhật'}</p>
        </div>
        <div className="rounded-xl border border-[#E3ECF8] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8EA0B8]">Trạng thái</p>
          <p className="mt-1 text-sm font-semibold text-[#27406B]">{status}</p>
        </div>
      </div>

      {isProposed && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <p>Yêu cầu đổi lịch của bạn đang chờ cán bộ xem xét.</p>
          {meeting.thoiGianDeXuatMoi && (
            <p className="mt-1 font-semibold">
              Thời gian đề xuất: {new Date(meeting.thoiGianDeXuatMoi).toLocaleString('vi-VN')}
            </p>
          )}
          <button
            type="button"
            onClick={handleCancelProposal}
            disabled={saving}
            className="mt-3 inline-flex h-9 items-center rounded-xl border border-amber-300 bg-white px-4 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
          >
            Hủy đề xuất
          </button>
        </div>
      )}
      {status === 'Đã xác nhận' && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Lịch hẹn đã được xác nhận. Vui lòng đến đúng giờ.
        </div>
      )}
      {status === 'Đã gặp mặt' && (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">
          Buổi gặp mặt đã diễn ra. Cán bộ đang xử lý kết quả.
        </div>
      )}

      {isPending && !showForm && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0D47A1] px-5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:opacity-60"
          >
            Xác nhận lịch hẹn
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#CFE0F5] bg-white px-5 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
          >
            Đổi lịch hẹn
          </button>
        </div>
      )}

      {isPending && showForm && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#E3ECF8] bg-white p-4">
          <p className="text-sm font-semibold text-[#27406B]">Đề xuất thời gian mới</p>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#8EA0B8]">Thời gian mới</label>
            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
              className="w-full rounded-xl border border-[#E3ECF8] bg-[#F7FBFF] px-3 py-2.5 text-sm text-[#27406B] outline-none focus:border-[#93c5fd]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-[#8EA0B8]">Lý do (tùy chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do muốn đổi lịch..."
              className="w-full rounded-xl border border-[#E3ECF8] bg-[#F7FBFF] px-3 py-2.5 text-sm text-[#27406B] outline-none focus:border-[#93c5fd]"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReschedule}
              disabled={saving || !newDateTime}
              className="inline-flex h-9 items-center rounded-xl bg-[#0D47A1] px-4 text-sm font-bold text-white transition hover:bg-[#083778] disabled:opacity-60"
            >
              Gửi đề xuất
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setNewDateTime(''); setNote(''); }}
              className="inline-flex h-9 items-center rounded-xl border border-[#CFE0F5] bg-white px-4 text-sm font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF]"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function mapApiItemToDisplay(item) {
  if (!item) return null;

  const id = item.maYeuCauNhan || item.id;
  const status = item.trangThai || item.status;

  return {
    id,
    code: id || 'Chưa có mã',
    title: 'Đơn nhận nuôi',
    createdAt: item.ngayTao || item.createdAt,
    status,
    approverName: 'Chưa có',
    desiredChild: [
      item.mongMuonTuoiToiDa
        ? `Tuổi tối đa: ${item.mongMuonTuoiToiDa}`
        : null,
      item.mongMuonGioiTinh
        ? `Giới tính: ${item.mongMuonGioiTinh}`
        : 'Không yêu cầu giới tính',
    ]
      .filter(Boolean)
      .join(' • '),
    formData: {
      fullName: item.tenNguoiNhan || item.fullName || '',
      phone: item.phone || '',
      nationalId: item.cccd || item.nationalId || '',
      address: item.address || '',
      occupation: '',
      income:
        item.thuNhapHangThang !== undefined && item.thuNhapHangThang !== null
          ? `${Number(item.thuNhapHangThang).toLocaleString('vi-VN')} VNĐ/tháng`
          : '',
      reason: item.lyDoNhanNuoi || '',
      birthDate: '',
      gender: '',
      documents: item.giayTos || [],
      tinhTrangHonNhan: item.tinhTrangHonNhan || '',
      loaiNoiO: item.loaiNoiO || '',
      sucKhoeDatYeuCau: item.sucKhoeDatYeuCau ? 'Đạt yêu cầu' : 'Không đạt',
      quanHeVoiTre: item.quanHeVoiTre || '',
      ghiChu: item.ghiChu || '',
      lyDoTuChoiSoBo: item.lyDoTuChoiSoBo || '',
      diemUuTien: item.diemUuTien ?? '',
    },
  };
}

export default function AdoptionStatus() {
  const { user } = useAuth();

  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    const loadAdoptions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await adoptionApi.getAll({
          adopterId: user.id,
          page: 1,
          limit: 20,
        });

        setApiItems(res?.items || []);
      } catch (error) {
        console.error('Lỗi tải danh sách đơn nhận nuôi:', error);
        setApiItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdoptions();
  }, [user?.id, refetchKey]);
  const mergedItems = useMemo(() => {
    return apiItems.map(mapApiItemToDisplay);
  }, [apiItems]);

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (mergedItems.length > 0 && !selectedId) {
      setSelectedId(mergedItems[0].id);
    }
  }, [mergedItems, selectedId]);

  const selectedRequest =
    mergedItems.find((item) => String(item.id) === String(selectedId)) ||
    mergedItems[0] ||
    null;
  const canUpdate =
    selectedRequest?.status === STATUS.MISSING_INFO ||
    selectedRequest?.status === 'missing_info' ||
    selectedRequest?.status === 'MISSING_INFO' ||
    selectedRequest?.status === 'Yêu cầu bổ sung' ||
    selectedRequest?.status === 'Cần bổ sung' ||
    selectedRequest?.status === 'Thiếu thông tin';
  if (loading && mergedItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-3 !text-[36px] font-bold !text-[#0D47A1]">
          Trạng thái đơn nhận nuôi
        </h1>
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    );
  }

  if (mergedItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-3 !text-[36px] font-bold !text-[#0D47A1]">
          Trạng thái đơn nhận nuôi
        </h1>
        <div className="rounded-[28px] border border-[#E3ECF8] bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(38,68,120,0.06)]">
          <p className="text-slate-400">Bạn chưa có đơn nhận nuôi nào.</p>
          <Link
            to="/nhan-nuoi/tao-don"
            className="mt-3 inline-block text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Tạo đơn nhận nuôi mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="!text-[36px] font-bold !text-[#0D47A1]">
            Trạng thái đơn nhận nuôi
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#73839B]">
            Theo dõi tiến trình hồ sơ của bạn. Chúng tôi đang đồng hành cùng bạn
            trên hành trình tìm kiếm mái ấm cho các em.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <StatusListPanel
              items={mergedItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {selectedRequest && (
            <div className="rounded-[28px] border border-[#E3ECF8] bg-white p-6 shadow-[0_14px_36px_rgba(42,74,122,0.08)] md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8EA0B8]">
                    Chi tiết hồ sơ
                  </p>
                  <h3 className="mt-2 text-[30px] font-bold text-[#27406B]">
                    Đơn đăng ký #{selectedRequest.code}
                  </h3>
                </div>

                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#DCE8F7] bg-[#F3F8FF] px-5 text-sm font-semibold text-[#5C7396] transition hover:bg-[#EAF3FF]"
                >
                  <Download size={16} />
                  Xuất PDF
                </button>
              </div>

              <StatusProgress
                steps={STEPS}
                status={selectedRequest.status}
                getCurrentStep={getCurrentStep}
                getProgressWidth={getProgressWidth}
              />

              <div className="mt-8">
                <div className="w-full rounded-[24px] border border-[#E7EEF9] bg-[#FCFEFF] p-5">
                  <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold !text-[#0D47A1]">
                    <UserRound size={16} />
                    Thông tin hồ sơ
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Ngày tạo"
                      value={formatDate(selectedRequest.createdAt)}
                      icon={<CalendarDays size={16} />}
                    />
                    <DetailField
                      label="Trạng thái"
                      value={selectedRequest.status}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                  Phiếu đăng ký chi tiết
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailField
                    label="Họ và tên"
                    value={selectedRequest.formData?.fullName}
                    icon={<UserRound size={16} />}
                  />

                  <DetailField
                    label="Thu nhập hàng tháng"
                    value={selectedRequest.formData?.income}
                  />

                  <DetailField
                    label="Tình trạng hôn nhân"
                    value={selectedRequest.formData?.tinhTrangHonNhan}
                  />

                  <DetailField
                    label="Loại nơi ở"
                    value={selectedRequest.formData?.loaiNoiO}
                  />

                  <DetailField
                    label="Sức khỏe"
                    value={selectedRequest.formData?.sucKhoeDatYeuCau}
                  />

                  <DetailField
                    label="Quan hệ với trẻ"
                    value={selectedRequest.formData?.quanHeVoiTre}
                  />

                  <DetailField
                    label="Điểm ưu tiên"
                    value={selectedRequest.formData?.diemUuTien}
                  />

                  <div className="md:col-span-2">
                    <LargeField
                      label="Lý do nhận nuôi"
                      value={selectedRequest.formData?.reason}
                    />
                  </div>

                  {selectedRequest.formData?.lyDoTuChoiSoBo && (
                    <div className="md:col-span-2">
                      <LargeField
                        label="Lý do từ chối sơ bộ"
                        value={selectedRequest.formData?.lyDoTuChoiSoBo}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <LargeField
                      label="Mong muốn về trẻ"
                      value={selectedRequest.desiredChild}
                    />
                  </div>

                  {selectedRequest.formData?.ghiChu && (
                    <div className="md:col-span-2">
                      <LargeField
                        label="Ghi chú"
                        value={selectedRequest.formData?.ghiChu}
                      />
                    </div>
                  )}
                </div>
              </div>

              <DocumentUploader
                requestId={selectedRequest.id}
                readOnly={!canUpdate}
                onUploadSuccess={() => setRefetchKey((k) => k + 1)}
              />

              <MeetingSection requestId={selectedRequest.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}