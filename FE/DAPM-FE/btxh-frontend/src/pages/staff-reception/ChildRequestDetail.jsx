import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { childApi } from '../../api/childApi';
import { formatDate } from '../../utils/formatDate';
import { useBasePath } from '../../hooks/useBasePath';

// Map Vietnamese BE status to FE keys
const BE_STATUS_MAP = {
  'chờ xử lý': 'pending',
  'đang xem xét': 'reviewing',
  'yêu cầu bổ sung': 'missing_info',
  'đã tiếp nhận': 'approved',
  'đã duyệt': 'approved',
  'từ chối': 'rejected',
  'đã hủy': 'cancelled',
};

function normalizeStatus(status) {
  if (!status) return 'pending';
  const s = String(status);
  return BE_STATUS_MAP[s] || BE_STATUS_MAP[s.toLowerCase()] || s.toLowerCase();
}

function mapRequestDetail(item) {
  if (!item) return null;

  // BE trả về: tenNguoiGui, tenLoaiNguoiGui, quanHeVoiTre, lyDoGui, ghiChu
  //            thongTinTre.{tenTre, ngaySinh, gioiTinh, danToc}
  //            giayTos (mảng string ID), trangThaiYC/status
  const childInfo = item.thongTinTre || {};

  // giayTos là mảng string ID từ BE, documents là mảng object từ mock
  let documents = [];
  if (Array.isArray(item.documents) && item.documents.length > 0) {
    documents = item.documents;
  } else if (Array.isArray(item.giayTos) && item.giayTos.length > 0) {
    documents = item.giayTos.map((id) => ({ id, name: id, url: '' }));
  }

  return {
    id: item.id || item.maYeuCauGuiTre,
    code: item.code || item.maYeuCauGuiTre || `GT-${String(item.id || '').padStart(6, '0')}`,
    status: normalizeStatus(item.status || item.trangThaiYC),

    // người gửi (BE chỉ trả tenNguoiGui, không có CCCD/SDT riêng)
    senderName: item.senderName || item.tenNguoiGui || '',
    senderType: item.senderType || item.tenLoaiNguoiGui || '',
    senderIdentityNumber: item.senderIdentityNumber || item.senderCccd || '',
    senderPhone: item.senderPhone || '',
    senderProvinceName: item.senderProvinceName || '',
    senderWardName: item.senderWardName || '',
    senderAddressDetail: item.senderAddressDetail || '',

    // trẻ (lấy từ thongTinTre nếu không có flat field)
    childName: item.childName || childInfo.tenTre || '',
    childBirthDate: item.childBirthDate || childInfo.ngaySinh || '',
    childGender: item.childGender || childInfo.gioiTinh || '',
    childEthnicity: item.childEthnicity || childInfo.danToc || '',
    childProvinceName: item.childProvinceName || '',
    childWardName: item.childWardName || '',
    childAddressDetail: item.childAddressDetail || '',
    childHealthStatus: item.childHealthStatus || '',

    // lý do
    reasonCategory: item.reasonCategory || item.lyDoGui || item.reason || '',
    reasonDetail: item.reasonDetail || item.ghiChu || item.note || '',

    // giấy tờ
    documents,

    createdAt: item.createdAt || item.ngayTao || '',
    updatedAt: item.updatedAt || item.ngayCapNhat || '',
  };
}

function StatusBadge({ status }) {
  const config = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const labelMap = {
    pending: 'Chờ xử lý',
    approved: 'Đã tiếp nhận',
    rejected: 'Từ chối / Bổ sung',
    cancelled: 'Đã hủy',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config[status] || 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
    >
      {labelMap[status] || 'Không xác định'}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="rounded-[26px] border border-[#E3ECF8] bg-white p-5 shadow-[0_8px_24px_rgba(30,64,175,0.06)]">
      <h2 className="mb-5 text-[22px] font-bold !text-[#5a9ef2]">{title}</h2>
      {children}
    </section>
  );
}

function FieldView({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold uppercase tracking-[0.03em] text-[#334155]">
        {label}
      </label>
      <div className="w-full rounded-2xl border border-[#D8E6F5] bg-[#F7FAFE] px-4 py-3 text-[15px] text-[#334155]">
        {value || 'Chưa cập nhật'}
      </div>
    </div>
  );
}

function TextAreaView({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-bold uppercase tracking-[0.03em] text-[#334155]">
        {label}
      </label>
      <div className="min-h-[120px] w-full rounded-2xl border border-[#D8E6F5] bg-[#F7FAFE] px-4 py-3 text-[15px] text-[#334155]">
        {value || 'Chưa cập nhật'}
      </div>
    </div>
  );
}

export default function ChildRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const { data, loading, error } = useFetch(
    () => childApi.getRequestById(id),
    [id]
  );

  const request = useMemo(() => mapRequestDetail(data), [data]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[#64748B]">
        Đang tải chi tiết hồ sơ...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="py-12 text-center text-sm text-red-500">
        Không tải được thông tin hồ sơ.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 rounded-[28px] border border-[#E3ECF8] bg-white px-6 py-5 shadow-[0_8px_24px_rgba(30,64,175,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-[32px] font-bold text-[#0D47A1]">
                  Hồ sơ {request.code}
                </h1>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-2 text-sm text-[#64748B]">
                Ngày tạo: {formatDate(request.createdAt)} • Cập nhật:{' '}
                {formatDate(request.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`${basePath}/yeu-cau`)}
                className="rounded-2xl border border-[#D8E6F5] bg-white px-5 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FBFF]"
              >
                Quay lại
              </button>

              {request.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="rounded-2xl border border-[#F3C7C7] bg-white px-5 py-3 text-sm font-semibold text-[#C24141] transition hover:bg-red-50"
                  >
                    Yêu cầu bổ sung
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${basePath}/tao-ho-so/${request.id}`)
                    }
                    className="rounded-2xl bg-[#0D47A1] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1565C0]"
                  >
                    Tiếp nhận yêu cầu
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Thông tin người gửi trẻ */}
          <SectionCard title="Thông tin người gửi trẻ">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FieldView label="Họ và tên người gửi" value={request.senderName} />
              <FieldView label="Loại người gửi trẻ" value={request.senderType} />
              <FieldView label="Số CCCD" value={request.senderIdentityNumber} />
              <FieldView label="Số điện thoại" value={request.senderPhone} />
              <FieldView label="Tỉnh / Thành phố" value={request.senderProvinceName} />
              <FieldView label="Xã / Phường" value={request.senderWardName} />
              <div className="md:col-span-2">
                <FieldView label="Địa chỉ cụ thể" value={request.senderAddressDetail} />
              </div>
            </div>
          </SectionCard>

          {/* Thông tin trẻ em */}
          <SectionCard title="Thông tin trẻ em">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FieldView label="Họ và tên trẻ" value={request.childName} />
              <FieldView
                label="Ngày sinh"
                value={request.childBirthDate ? formatDate(request.childBirthDate) : ''}
              />
              <FieldView
                label="Giới tính"
                value={
                  request.childGender === 'male'
                    ? 'Nam'
                    : request.childGender === 'female'
                      ? 'Nữ'
                      : request.childGender
                }
              />
              <FieldView label="Dân tộc" value={request.childEthnicity} />
              <FieldView label="Tỉnh / Thành phố" value={request.childProvinceName} />
              <FieldView label="Xã / Phường" value={request.childWardName} />
              <div className="md:col-span-2">
                <FieldView label="Địa chỉ cụ thể của trẻ" value={request.childAddressDetail} />
              </div>
              <div className="md:col-span-2">
                <TextAreaView
                  label="Tình trạng sức khỏe hiện tại"
                  value={request.childHealthStatus}
                />
              </div>
            </div>
          </SectionCard>

          {/* Lý do gửi trẻ */}
          <SectionCard title="Lý do gửi trẻ">
            <div className="space-y-5">
              <FieldView label="Lý do chính" value={request.reasonCategory} />
              <TextAreaView
                label="Mô tả chi tiết hoàn cảnh"
                value={request.reasonDetail}
              />
            </div>
          </SectionCard>

          {/* Tài liệu */}
          <SectionCard title="Tài liệu giấy tờ cần thiết">
            {request.documents.length > 0 ? (
              <div className="space-y-4">
                {request.documents.map((doc, index) => {
                  const docName =
                    typeof doc === 'string' ? doc : doc.name || `Tài liệu ${index + 1}`;
                  const docUrl = typeof doc === 'string' ? '' : doc.url || '';

                  return (
                    <div
                      key={`${docName}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-[#E3ECF8] bg-[#F7FAFE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-[#334155]">
                          {docName}
                        </p>
                        <p className="text-sm text-[#8FA0B8]">
                          Hồ sơ đính kèm của yêu cầu gửi trẻ
                        </p>
                      </div>

                      {docUrl ? (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit items-center justify-center rounded-xl bg-[#EAF3FF] px-4 py-2 text-sm font-semibold text-[#0D47A1] transition hover:bg-[#DCEBFF]"
                        >
                          Xem tài liệu
                        </a>
                      ) : (
                        <span className="inline-flex w-fit items-center justify-center rounded-xl bg-[#EEF4FB] px-4 py-2 text-sm font-semibold text-[#64748B]">
                          Đã tải lên
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#8FA0B8]">Chưa có tài liệu đính kèm.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}