import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, CalendarDays, UserCheck, UserRound, MapPin, Phone, IdCard, HeartPulse, FileText, BadgeInfo, } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatDate';
import {
  STATUS,
  getCurrentStep,
  getProgressWidth,
  normalizeStatus,
} from '../../utils/statusHelpers';

import receptionApi from '../../api/receptionApi';
import documentApi from '../../api/documentApi';

import StatusListPanel from '../../components/request-status/StatusListPanel';
import StatusProgress from '../../components/request-status/StatusProgress';
import DetailField from '../../components/request-status/DetailField';
import LargeField from '../../components/request-status/LargeField';
import DocumentCard from '../../components/request-status/DocumentCard';

const STEPS = [
  { key: 1, label: 'ĐÃ NỘP YÊU CẦU' },
  { key: 2, label: 'ĐANG XEM XÉT' },
  { key: 3, label: 'YÊU CẦU BỔ SUNG' },
  { key: 4, label: 'ĐÃ DUYỆT' },
];

const SENDER_TYPE_LABELS = {
  CME: 'Cha hoặc mẹ ruột',
  NTH: 'Người thân',
  CQDP: 'Cơ quan địa phương',
};

function getSenderTypeLabel(code) {
  if (!code) return 'Chưa cập nhật';
  return SENDER_TYPE_LABELS[code] || code;
}

function getReasonLabel(reason) {
  const map = {
    mo_coi: 'Trẻ mồ côi',
    kinh_te: 'Hoàn cảnh kinh tế khó khăn',
    suc_khoe: 'Cha / Mẹ bệnh nặng, không thể chăm sóc',
    xa_hoi: 'Hoàn cảnh xã hội đặc biệt',
    khac: 'Lý do khác',
  };

  return map[reason] || reason || 'Chưa cập nhật';
}

function joinAddress(detail, wardName, provinceName) {
  return [detail, wardName, provinceName].filter(Boolean).join(', ') || 'Chưa cập nhật';
}

function mapDocumentArrayToText(value) {
  if (!value) return '-';

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-';
  }

  if (typeof value === 'string') {
    return value;
  }

  return '-';
}

function mapGiayToArrayToGroups(giayTo = []) {
  if (!Array.isArray(giayTo)) {
    return {
      birthCert: '-',
      senderID: '-',
      healthCert: '-',
      otherDocs: '-',
    };
  }

  const grouped = {
    birthCert: [],
    senderID: [],
    healthCert: [],
    otherDocs: [],
  };

  giayTo.forEach((item) => {
    const type = item?.loaiGiayTo || item?.type || item?.documentType;
    const name = item?.tenFile || item?.fileName || item?.name || '-';

    if (grouped[type]) {
      grouped[type].push(name);
    } else {
      grouped.otherDocs.push(name);
    }
  });

  return {
    birthCert: grouped.birthCert.length ? grouped.birthCert.join(', ') : '-',
    senderID: grouped.senderID.length ? grouped.senderID.join(', ') : '-',
    healthCert: grouped.healthCert.length ? grouped.healthCert.join(', ') : '-',
    otherDocs: grouped.otherDocs.length ? grouped.otherDocs.join(', ') : '-',
  };
}

function mapSnapshotToDisplay(snapshot) {
  if (!snapshot) return null;

  const tre = snapshot.thongTinTre || {};

  return {
    id: snapshot.requestId || 'temp-request',
    code: snapshot.requestId
      ? `GT-${String(snapshot.requestId).padStart(6, '0')}`
      : 'GT-2024-001',
    title: 'Yêu cầu gửi trẻ',
    createdAt: snapshot.createdAt || new Date().toISOString(),
    status: snapshot.status || 'Chờ xử lý',
    approverName: 'Chưa có',
    formData: {
      senderName: snapshot.senderName || '',
      senderTypeCode: snapshot.senderTypeCode || '',
      senderNationalId: snapshot.senderNationalId || '',
      senderPhone: snapshot.senderPhone || '',
      senderAddress: joinAddress(
        snapshot.senderAddressDetail,
        snapshot.senderWardName,
        snapshot.senderProvinceName
      ),

      childName: tre.tenTre || '',
      childDob: tre.ngaySinh || '',
      childGender: tre.gioiTinh || '',
      ethnicity: tre.danToc || '',
      childAddress: joinAddress(
        snapshot.childAddressDetail,
        snapshot.childWardName,
        snapshot.childProvinceName
      ),
      healthStatus: snapshot.healthStatus || '',

      reason: snapshot.reason || '',
      reasonDetail: snapshot.reasonDetail || '',

      documents: mapGiayToArrayToGroups(snapshot.giayTo || []),
    },
  };
}

function mapApiItemToDisplay(item) {
  if (!item) return null;

  const tre = item.thongTinTre || {};
  const id = item.id || item.maYeuCauGuiTre;

  return {
    id,
    code: `GT-${String(id).padStart(6, '0')}`,
    title: 'Yêu cầu gửi trẻ',
    createdAt: item.createdAt || item.ngayTao,
    status: item.status || item.trangThaiYC,
    approverName: 'Chưa có',
    formData: {
      senderName: item.tenNguoiGui || '',
      senderTypeCode: item.tenLoaiNguoiGui || item.maLoaiNguoiGui || '',
      senderNationalId: '',
      senderPhone: '',
      senderAddress: 'Chưa cập nhật',

      childName: tre.tenTre || '',
      childDob: tre.ngaySinh || '',
      childGender: tre.gioiTinh || '',
      ethnicity: tre.danToc || '',
      childAddress: 'Chưa cập nhật',
      healthStatus: item.ghiChu || '',

      reason: item.lyDoGui || '',
      reasonDetail: '',

      documents: { birthCert: '-', senderID: '-', healthCert: '-', otherDocs: '-' },
    },
  };
}

export default function RequestStatus() {
  const { user } = useAuth();
  const location = useLocation();

  const { data, loading } = useFetch(receptionApi.getAll, {
    senderId: user?.id,
  });

  const apiItems = Array.isArray(data) ? data : (data?.items || data?.data || []);
  const tempRequestFromState = location.state?.request || null;

  const mergedItems = useMemo(() => {
    const mappedApiItems = apiItems.map(mapApiItemToDisplay);
    const mappedTemp = mapSnapshotToDisplay(tempRequestFromState);

    if (!mappedTemp) return mappedApiItems;

    const existedIndex = mappedApiItems.findIndex(
      (item) =>
        String(item.id) === String(mappedTemp.id) ||
        String(item.code) === String(mappedTemp.code)
    );

    if (existedIndex !== -1) return mappedApiItems;

    return [mappedTemp, ...mappedApiItems];
  }, [apiItems, tempRequestFromState]);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    if (mergedItems.length > 0 && !selectedId) {
      setSelectedId(mergedItems[0].id);
    }
  }, [mergedItems, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setSelectedDetail(null);
    setSelectedDocs([]);

    const idStr = String(selectedId);
    if (!idStr.startsWith('temp-')) {
      receptionApi.getById(selectedId)
        .then((res) => setSelectedDetail(mapApiItemToDisplay(res)))
        .catch(() => {});
    }

    documentApi.getDocuments({ maYeuCauGuiTre: selectedId })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res?.items || []);
        setSelectedDocs(items);
      })
      .catch(() => setSelectedDocs([]));
  }, [selectedId]);

  const selectedRequest =
    selectedDetail ||
    mergedItems.find((item) => String(item.id) === String(selectedId)) ||
    mergedItems[0] ||
    null;

  const canUpdate =
    normalizeStatus(selectedRequest?.status) === 'missing_info';

  if (loading && mergedItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-3 !text-[36px] font-bold !text-[#0D47A1]">
          Trạng thái hồ sơ
        </h1>
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    );
  }

  if (mergedItems.length === 0) {
    return (
      <div className="px-4 py-6">
        <h1 className="mb-3 !text-[36px] font-bold !text-[#0D47A1]">
          Trạng thái hồ sơ
        </h1>
        <div className="rounded-[28px] border border-[#E3ECF8] bg-white px-6 py-16 text-center shadow-[0_10px_30px_rgba(38,68,120,0.06)]">
          <p className="text-slate-400">Bạn chưa có yêu cầu nào.</p>
          <Link
            to="/gui-tre/tao-yeu-cau"
            className="mt-3 inline-block text-sm font-medium text-[#0D47A1] hover:underline"
          >
            Tạo yêu cầu đầu tiên
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
            Trạng thái hồ sơ
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#73839B]">
            Theo dõi tình trạng yêu cầu gửi trẻ và các cập nhật xử lý từ trung tâm.
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
                    Yêu cầu #{selectedRequest.code}
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
                      label="Người duyệt"
                      value={selectedRequest.approverName}
                      icon={<UserCheck size={16} />}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                  Thông tin người gửi trẻ
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailField
                    label="Họ và tên"
                    value={selectedRequest.formData?.senderName}
                    icon={<UserRound size={16} />}
                  />
                  <DetailField
                    label="Loại người gửi"
                    value={getSenderTypeLabel(selectedRequest.formData?.senderTypeCode)}
                    icon={<BadgeInfo size={16} />}
                  />
                  <DetailField
                    label="Số CCCD"
                    value={selectedRequest.formData?.senderNationalId}
                    icon={<IdCard size={16} />}
                  />
                  <DetailField
                    label="Số điện thoại"
                    value={selectedRequest.formData?.senderPhone}
                    icon={<Phone size={16} />}
                  />
                  <div className="md:col-span-2">
                    <DetailField
                      label="Địa chỉ cụ thể"
                      value={selectedRequest.formData?.senderAddress}
                      icon={<MapPin size={16} />}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                  Thông tin trẻ em
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailField
                    label="Họ và tên trẻ"
                    value={selectedRequest.formData?.childName}
                    icon={<UserRound size={16} />}
                  />
                  <DetailField
                    label="Giới tính"
                    value={selectedRequest.formData?.childGender}
                  />
                  <DetailField
                    label="Ngày sinh"
                    value={selectedRequest.formData?.childDob}
                    icon={<CalendarDays size={16} />}
                  />
                  <DetailField
                    label="Dân tộc"
                    value={selectedRequest.formData?.ethnicity}
                  />
                  <div className="md:col-span-2">
                    <DetailField
                      label="Địa chỉ của trẻ"
                      value={selectedRequest.formData?.childAddress}
                      icon={<MapPin size={16} />}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LargeField
                      label="Tình trạng sức khỏe hiện tại"
                      value={selectedRequest.formData?.healthStatus}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                  Lý do gửi trẻ
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  <DetailField
                    label="Lý do chính"
                    value={getReasonLabel(selectedRequest.formData?.reason)}
                    icon={<FileText size={16} />}
                  />
                  <LargeField
                    label="Mô tả chi tiết"
                    value={selectedRequest.formData?.reasonDetail}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                  Tài liệu đã tải lên
                </h4>

                {selectedDocs.length === 0 ? (
                  <p className="text-sm text-slate-400">Chưa có giấy tờ nào được tải lên.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {selectedDocs.map((doc) => (
                      <DocumentCard
                        key={doc.maGiayTo || doc.MaGiayTo}
                        title={doc.tenLoaiGiayTo || doc.tenGiayTo || 'Giấy tờ'}
                        value={doc.trangThai || 'Chờ xác minh'}
                      />
                    ))}
                  </div>
                )}
              </div>

              {canUpdate && (
                <div className="mt-8">
                  <Link
                    to={`/gui-tre/cap-nhat/${selectedRequest.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#0D47A1] px-5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(13,71,161,0.20)] transition hover:bg-[#0a3880] active:scale-[0.98]"
                  >
                    Cập nhật hồ sơ
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
