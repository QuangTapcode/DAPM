import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, CalendarDays, UserRound, MapPin, Phone, IdCard, Briefcase, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import adoptionApi from '../../api/adoptionApi';
import documentApi from '../../api/documentApi';
import lookupApi from '../../api/lookupApi';
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
      if (resDocTypes.success) setDocTypes(resDocTypes.data);
      if (resDocs.success) setExistingDocs(resDocs.data);
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
      const res = await documentApi.upload(formData);
      if (res.success) {
        alert('Tải lên thành công!');
        loadData();
        if (onUploadSuccess) onUploadSuccess();
      } else {
        alert('Lỗi: ' + res.message);
      }
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

function getResponseItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
}

function normalizeMeeting(meeting = {}) {
  const children = meeting.Children ?? meeting.children ?? [];

  return {
    MaLichGap: meeting.MaLichGap || meeting.maLichGap || '',
    MaYeuCauNhan: meeting.MaYeuCauNhan || meeting.maYeuCauNhan || '',
    TenNguoiNhan: meeting.TenNguoiNhan || meeting.tenNguoiNhan || '',
    MaCanBo: meeting.MaCanBo || meeting.maCanBo || '',
    TenCanBo: meeting.TenCanBo || meeting.tenCanBo || '',
    NgayGapMat: meeting.NgayGapMat || meeting.ngayGapMat || null,
    ThoiGian: meeting.ThoiGian || meeting.thoiGian || null,
    DiaDiem: meeting.DiaDiem || meeting.diaDiem || '',
    TrangThai: meeting.TrangThai || meeting.trangThai || '',
    PhanHoiNguoiNhan:
      meeting.PhanHoiNguoiNhan || meeting.phanHoiNguoiNhan || '',
    ThoiGianDeXuatMoi:
      meeting.ThoiGianDeXuatMoi || meeting.thoiGianDeXuatMoi || null,
    NgayTao: meeting.NgayTao || meeting.ngayTao || null,
    NgayCapNhat: meeting.NgayCapNhat || meeting.ngayCapNhat || null,
    Children: Array.isArray(children)
      ? children.map((child) => ({
        MaTre: child.MaTre || child.maTre || '',
        TenTre: child.TenTre || child.tenTre || '',
        KetQua: child.KetQua || child.ketQua || '',
        GhiChuCanBo: child.GhiChuCanBo || child.ghiChuCanBo || '',
      }))
      : [],
  };
}

export default function AdoptionStatus() {
  const { user } = useAuth();

  const [apiItems, setApiItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

        if (res.success) {
          setApiItems(res.data?.items || []);
        } else {
          setApiItems([]);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách đơn nhận nuôi:', error);
        setApiItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadAdoptions();
  }, [user?.id]);
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

  const [meeting, setMeeting] = useState(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [adopterFeedback, setAdopterFeedback] = useState('');

  useEffect(() => {
    if (!selectedRequest?.id) {
      setMeeting(null);
      return;
    }

    let active = true;
    const loadMeeting = async () => {
      try {
        setMeetingLoading(true);
        const res = await adoptionApi.getMeetings({ maYeuCauNhan: selectedRequest.id, limit: 1 });
        if (!active) return;
        const items = getResponseItems(res);
        if (items && items.length > 0) {
          setMeeting(normalizeMeeting(items[0]));
        } else {
          setMeeting(null);
        }
      } catch (error) {
        console.error('Lỗi tải lịch gặp:', error);
        if (active) setMeeting(null);
      } finally {
        if (active) setMeetingLoading(false);
      }
    };

    loadMeeting();
    setShowRescheduleForm(false);
    setProposedDate('');
    setProposedTime('');
    setAdopterFeedback('');

    return () => {
      active = false;
    };
  }, [selectedRequest?.id]);

  async function handleConfirmMeeting() {
    if (!meeting) return;
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận lịch hẹn gặp mặt này?')) return;

    setActionLoading(true);
    try {
      const res = await adoptionApi.updateMeeting(meeting.MaLichGap, {
        TrangThai: 'Đã xác nhận',
      });
      if (res.success) {
        alert('Xác nhận lịch gặp mặt thành công!');
        setMeeting(normalizeMeeting(res.data));
      } else {
        alert('Xác nhận lịch thất bại: ' + res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi xác nhận lịch gặp.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRequestReschedule(e) {
    e.preventDefault();
    if (!meeting) return;
    if (!proposedDate || !proposedTime) {
      alert('Vui lòng chọn ngày và giờ đề xuất mới.');
      return;
    }

    setActionLoading(true);
    const newProposedTime = new Date(`${proposedDate}T${proposedTime}`);
    try {
      const res = await adoptionApi.updateMeeting(meeting.MaLichGap, {
        TrangThai: 'Yêu cầu đổi lịch',
        ThoiGianDeXuatMoi: newProposedTime,
        PhanHoiNguoiNhan: adopterFeedback,
      });
      if (res.success) {
        alert('Đã gửi yêu cầu đổi lịch gặp mặt thành công.');
        setMeeting(normalizeMeeting(res.data));
        setShowRescheduleForm(false);
      } else {
        alert('Gửi yêu cầu đổi lịch thất bại: ' + res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi gửi yêu cầu đổi lịch.');
    } finally {
      setActionLoading(false);
    }
  }
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
                onUploadSuccess={() => {
                  window.location.reload();
                }}
              />

              {meetingLoading ? (
                <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-[#FAFCFF] p-6 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#0D47A1] mb-2" size={24} />
                  <p className="text-sm text-slate-400">Đang tải thông tin lịch gặp mặt...</p>
                </div>
              ) : meeting ? (
                <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-[#FCFEFF] p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E7EEF9] pb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="text-[#0D47A1]" size={20} />
                      <h4 className="text-base font-bold !text-[#0D47A1]">Lịch hẹn gặp mặt</h4>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      meeting.TrangThai === 'Chờ xác nhận' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      meeting.TrangThai === 'Đã xác nhận' ? 'bg-green-50 border-green-200 text-green-700' :
                      meeting.TrangThai === 'Yêu cầu đổi lịch' ? 'bg-red-50 border-red-200 text-red-700' :
                      meeting.TrangThai === 'Đã gặp mặt' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      {meeting.TrangThai}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#F6F8FC] p-4">
                      <p className="text-[10px] font-bold text-[#8FA0B8] uppercase">Thời gian gặp</p>
                      <p className="font-bold text-[#26364A] text-sm mt-1">
                        {meeting.ThoiGian ? formatDate(meeting.ThoiGian) : 'Chưa xác định'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F6F8FC] p-4">
                      <p className="text-[10px] font-bold text-[#8FA0B8] uppercase">Địa điểm</p>
                      <div className="flex items-start gap-1 mt-1">
                        <MapPin className="text-[#8FA0B8] shrink-0 mt-0.5" size={14} />
                        <p className="font-bold text-[#26364A] text-sm leading-5">
                          {meeting.DiaDiem || 'Chưa xác định'}
                        </p>
                      </div>
                    </div>
                    {meeting.TenCanBo && (
                      <div className="rounded-xl bg-[#F6F8FC] p-4">
                        <p className="text-[10px] font-bold text-[#8FA0B8] uppercase">Cán bộ phụ trách</p>
                        <p className="font-bold text-[#26364A] text-sm mt-1">{meeting.TenCanBo}</p>
                      </div>
                    )}
                    <div className="rounded-xl bg-[#F6F8FC] p-4">
                      <p className="text-[10px] font-bold text-[#8FA0B8] uppercase">Mã lịch hẹn</p>
                      <p className="font-bold text-[#26364A] text-sm mt-1">{meeting.MaLichGap}</p>
                    </div>
                  </div>

                  {meeting.TrangThai === 'Chờ xác nhận' && !showRescheduleForm && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleConfirmMeeting}
                        disabled={actionLoading}
                        className="flex-1 rounded-xl bg-[#27AE60] hover:bg-[#219653] py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                      >
                        {actionLoading ? 'Đang xử lý...' : 'Xác nhận tham gia'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRescheduleForm(true)}
                        disabled={actionLoading}
                        className="flex-1 rounded-xl border border-[#CFE0F5] bg-white hover:bg-slate-50 py-2.5 text-xs font-bold text-[#2F80ED] transition disabled:opacity-50"
                      >
                        Yêu cầu đổi lịch
                      </button>
                    </div>
                  )}

                  {showRescheduleForm && (
                    <form onSubmit={handleRequestReschedule} className="mt-6 border-t border-[#E7EEF9] pt-5 space-y-4">
                      <p className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Đề xuất lịch gặp mới</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8FA0B8] mb-1">Ngày đề xuất</label>
                          <input
                            type="date"
                            required
                            value={proposedDate}
                            onChange={(e) => setProposedDate(e.target.value)}
                            className="w-full rounded-xl border border-[#D7E5F7] px-3 py-2 text-xs font-medium outline-none focus:border-[#0D47A1]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8FA0B8] mb-1">Giờ đề xuất</label>
                          <input
                            type="time"
                            required
                            value={proposedTime}
                            onChange={(e) => setProposedTime(e.target.value)}
                            className="w-full rounded-xl border border-[#D7E5F7] px-3 py-2 text-xs font-medium outline-none focus:border-[#0D47A1]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#8FA0B8] mb-1">Lý do đổi lịch / Phản hồi</label>
                        <textarea
                          rows={2}
                          required
                          value={adopterFeedback}
                          onChange={(e) => setAdopterFeedback(e.target.value)}
                          className="w-full rounded-xl border border-[#D7E5F7] px-3 py-2 text-xs font-medium outline-none focus:border-[#0D47A1]"
                          placeholder="Vui lòng nhập lý do hoặc đề xuất cụ thể..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="flex-1 rounded-xl bg-[#2F80ED] hover:bg-[#1f66c9] py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                        >
                          {actionLoading ? 'Đang gửi...' : 'Gửi yêu cầu đổi lịch'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRescheduleForm(false)}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}

                  {meeting.TrangThai === 'Yêu cầu đổi lịch' && (
                    <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-4 space-y-2 text-xs text-red-800">
                      <p className="font-bold">Đã gửi yêu cầu thay đổi lịch gặp:</p>
                      <p className="italic">"{meeting.PhanHoiNguoiNhan}"</p>
                      {meeting.ThoiGianDeXuatMoi && (
                        <p className="font-bold">Đề xuất: {formatDate(meeting.ThoiGianDeXuatMoi)}</p>
                      )}
                      <p className="text-[10px] text-red-600 mt-2 font-semibold">Đang chờ cán bộ xác nhận và cập nhật lịch mới.</p>
                    </div>
                  )}

                  {meeting.TrangThai === 'Đã xác nhận' && (
                    <div className="mt-5 rounded-xl bg-green-50 border border-green-100 p-4 text-xs text-green-800 text-center font-semibold">
                      Lịch hẹn gặp đã được xác nhận. Vui lòng có mặt đúng giờ tại địa điểm đã hẹn.
                    </div>
                  )}

                  {meeting.TrangThai === 'Đã gặp mặt' && (
                    <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-[#0D47A1] text-center font-semibold">
                      Đã hoàn thành cuộc gặp mặt. Trung tâm đang tiến hành đánh giá độ hòa hợp và lập hồ sơ.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}