import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, CalendarDays, UserCheck, UserRound, MapPin, Phone, IdCard, Briefcase, } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';

import { STATUS, getCurrentStep, getProgressWidth } from '../../utils/statusHelpers';
import StatusListPanel from '../../components/request-status/StatusListPanel';
import StatusProgress from '../../components/request-status/StatusProgress';
import DetailField from '../../components/request-status/DetailField';
import LargeField from '../../components/request-status/LargeField';
import DocumentCard from '../../components/request-status/DocumentCard';

const STEPS = [
  { key: 1, label: 'ĐÃ NỘP ĐƠN' },
  { key: 2, label: 'ĐANG XEM XÉT' },
  { key: 3, label: 'YÊU CẦU BỔ SUNG' },
  { key: 4, label: 'ĐÃ PHÊ DUYỆT' },
];

function getStoredRequest() {
  try {
    const raw = sessionStorage.getItem('adoption-request-status');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function mapSnapshotToDisplay(snapshot) {
  if (!snapshot) return null;
  return {
    id: snapshot.requestId || 'temp-request',
    code: snapshot.requestId
      ? `AD-${String(snapshot.requestId).padStart(6, '0')}`
      : 'AD-2024-001',
    title: 'Đơn nhận nuôi',
    createdAt: snapshot.createdAt || new Date().toISOString(),
    status: snapshot.status || STATUS.CREATED,
    approverName: 'Chưa có',
    desiredChild: snapshot.expectedChild || 'Chưa cập nhật nguyện vọng',
    formData: {
      fullName: snapshot.adopterName || '',
      phone: snapshot.phone || '',
      nationalId: snapshot.nationalId || '',
      address: snapshot.address || '',
      occupation: snapshot.occupation || '',
      income: snapshot.monthlyIncome || '',
      reason: snapshot.motivation || '',
      birthDate: snapshot.birthDate || '',
      gender: snapshot.gender || '',
      documents: snapshot.documents || {},
    },
  };
}

function mapApiItemToDisplay(item) {
  if (!item) return null;

  return {
    id: item.id,
    code: item.code || `AD-${String(item.id).padStart(6, '0')}`,
    title: 'Đơn nhận nuôi',
    createdAt: item.createdAt,
    status: item.status,
    approverName:
      item.approverName || item.reviewerName || item.approvedBy || 'Chưa có',
    desiredChild: item.expectedChild || 'Chưa cập nhật',
    formData: {
      fullName: item.adopterName || item.applicantName || '',
      phone: item.phone || '',
      nationalId: item.nationalId || '',
      address: item.address || '',
      occupation: item.occupation || '',
      income: item.monthlyIncome || item.income || '',
      reason: item.motivation || item.reasonText || '',
      birthDate: item.birthDate || '',
      gender: item.gender || '',
      documents: item.documents || {},
    },
  };
}

export default function AdoptionStatus() {
  const { user } = useAuth();
  const location = useLocation();
  const { data, loading } = useFetch(adoptionApi.getAll, { adopterId: user?.id });

  const apiItems = data?.items || [];
  const tempRequestFromState = location.state?.request || null;
  const tempRequestFromStorage = getStoredRequest();

  const mergedItems = useMemo(() => {
    const mappedApiItems = apiItems.map(mapApiItemToDisplay);
    const tempSource = tempRequestFromState || tempRequestFromStorage;
    const mappedTemp = mapSnapshotToDisplay(tempSource);

    if (!mappedTemp) return mappedApiItems;

    const existed = mappedApiItems.some(
      (item) =>
        String(item.id) === String(mappedTemp.id) ||
        String(item.code) === String(mappedTemp.code)
    );

    return existed ? mappedApiItems : [mappedTemp, ...mappedApiItems];
  }, [apiItems, tempRequestFromState, tempRequestFromStorage]);

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
    selectedRequest?.status === 'MISSING_INFO';
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
                      label="Người duyệt"
                      value={selectedRequest.approverName}
                      icon={<UserCheck size={16} />}
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
                    label="Giới tính"
                    value={selectedRequest.formData?.gender}
                  />
                  <DetailField
                    label="Số điện thoại"
                    value={selectedRequest.formData?.phone}
                    icon={<Phone size={16} />}
                  />
                  <DetailField
                    label="Ngày sinh"
                    value={selectedRequest.formData?.birthDate}
                    icon={<CalendarDays size={16} />}
                  />
                  <DetailField
                    label="CCCD"
                    value={selectedRequest.formData?.nationalId}
                    icon={<IdCard size={16} />}
                  />
                  <DetailField
                    label="Nghề nghiệp"
                    value={selectedRequest.formData?.occupation}
                    icon={<Briefcase size={16} />}
                  />
                  <DetailField
                    label="Thu nhập hàng tháng"
                    value={selectedRequest.formData?.income}
                  />

                  <div className="md:col-span-2">
                    <DetailField
                      label="Địa chỉ thường trú"
                      value={selectedRequest.formData?.address}
                      icon={<MapPin size={16} />}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <LargeField
                      label="Lý do nhận nuôi"
                      value={selectedRequest.formData?.reason}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <LargeField
                      label="Mong muốn về trẻ"
                      value={selectedRequest.desiredChild}
                    />
                  </div>
                </div>
              </div>

              {selectedRequest.formData?.documents && (
                <div className="mt-8 rounded-[24px] border border-[#E7EEF9] bg-white p-5">
                  <h4 className="mb-5 text-[15px] font-bold !text-[#0D47A1]">
                    Tài liệu đã tải lên
                  </h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DocumentCard
                      title="Ảnh CCCD"
                      value={
                        selectedRequest.formData.documents.idCard?.join(', ') || '-'
                      }
                    />
                    <DocumentCard
                      title="Giấy khám sức khỏe"
                      value={
                        selectedRequest.formData.documents.health?.join(', ') || '-'
                      }
                    />
                    <DocumentCard
                      title="Tình trạng hôn nhân"
                      value={
                        selectedRequest.formData.documents.marriage?.join(', ') || '-'
                      }
                    />
                    <DocumentCard
                      title="Minh chứng thu nhập"
                      value={
                        selectedRequest.formData.documents.income?.join(', ') || '-'
                      }
                    />
                  </div>
                </div>
              )}

              {canUpdate && (
                <div className="mt-8">
                  <Link
                    to={`/nhan-nuoi/cap-nhat/${selectedRequest.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2F80ED] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(47,128,237,0.22)] transition hover:brightness-105"
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