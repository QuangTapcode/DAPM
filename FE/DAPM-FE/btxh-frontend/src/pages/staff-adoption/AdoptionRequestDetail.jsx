import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const pageClass = 'min-h-screen bg-[#F6F8FC]';

const cardClass =
  'rounded-[28px] border border-[#E4EAF2] bg-white shadow-[0_12px_34px_rgba(31,42,61,0.06)]';

const labelClass =
  'text-[11px] font-bold uppercase tracking-[0.13em] text-[#8FA0B8]';

const valueClass = 'mt-2 text-[15px] font-semibold leading-6 text-[#26364A]';

const fallbackRequests = [
  {
    MaYeuCauNhan: 'YCNN0006',
    MaNguoiNhan: 'ND000008',
    TenNguoiNhan: 'Nguyễn Minh Anh',
    SDTNguoiNhan: '0901234567',
    Email: 'minhanh@example.com',
    CCCD: '048201012345',
    GioiTinh: 'Nữ',
    NgaySinh: '1995-04-12',
    DiaChi: 'Hải Châu, Đà Nẵng',
    NgheNghiep: 'Nhân viên văn phòng',
    ThuNhapHangThang: 18000000,
    LyDoNhanNuoi:
      'Gia đình mong muốn nhận nuôi trẻ có hoàn cảnh khó khăn và chăm sóc lâu dài.',
    MongMuonVeTre:
      'Mong muốn nhận nuôi trẻ từ 3 đến 7 tuổi, sức khỏe ổn định.',
    NgayTao: '2026-03-18',
    NgayCapNhat: null,
    TrangThai: 'Chờ xử lý',
    GhiChu: '',
    documents: [
      {
        MaGiayTo: 'GT000017',
        TenGiayTo: 'Ảnh CCCD người nhận nuôi',
        LoaiGiayTo: 'Tùy thân',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0006/cccd.jpg',
        NgayCapNhat: '2026-03-18',
      },
      {
        MaGiayTo: 'GT000018',
        TenGiayTo: 'Giấy khám sức khỏe',
        LoaiGiayTo: 'Sức khỏe',
        TrangThai: 'Chờ xác minh',
        DuongDanFile: '/uploads/giayto/ycnn0006/giay-kham-suc-khoe.pdf',
        NgayCapNhat: '2026-03-18',
      },
      {
        MaGiayTo: 'GT000019',
        TenGiayTo: 'Giấy xác nhận tình trạng hôn nhân',
        LoaiGiayTo: 'Hôn nhân',
        TrangThai: 'Chờ xác minh',
        DuongDanFile: '/uploads/giayto/ycnn0006/tinh-trang-hon-nhan.pdf',
        NgayCapNhat: '2026-03-18',
      },
      {
        MaGiayTo: 'GT000020',
        TenGiayTo: 'Minh chứng thu nhập',
        LoaiGiayTo: 'Tài chính',
        TrangThai: 'Cần bổ sung',
        DuongDanFile: '/uploads/giayto/ycnn0006/minh-chung-thu-nhap.jpg',
        NgayCapNhat: '2026-03-18',
      },
    ],
  },
  {
    MaYeuCauNhan: 'YCNN0005',
    MaNguoiNhan: 'ND000009',
    TenNguoiNhan: 'Trần Quốc Huy',
    SDTNguoiNhan: '0912345678',
    Email: 'quochuy@example.com',
    CCCD: '048199912345',
    GioiTinh: 'Nam',
    NgaySinh: '1992-09-21',
    DiaChi: 'Thanh Khê, Đà Nẵng',
    NgheNghiep: 'Kỹ sư xây dựng',
    ThuNhapHangThang: 25000000,
    LyDoNhanNuoi:
      'Gia đình có điều kiện chăm sóc và mong muốn nhận nuôi trẻ.',
    MongMuonVeTre:
      'Mong muốn nhận nuôi trẻ trong độ tuổi tiểu học.',
    NgayTao: '2026-03-17',
    NgayCapNhat: '2026-03-18',
    TrangThai: 'Đang xem xét',
    GhiChu: '',
    documents: [
      {
        MaGiayTo: 'GT000013',
        TenGiayTo: 'Ảnh CCCD người nhận nuôi',
        LoaiGiayTo: 'Tùy thân',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0005/cccd.jpg',
        NgayCapNhat: '2026-03-17',
      },
      {
        MaGiayTo: 'GT000014',
        TenGiayTo: 'Giấy khám sức khỏe',
        LoaiGiayTo: 'Sức khỏe',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0005/suc-khoe.pdf',
        NgayCapNhat: '2026-03-17',
      },
      {
        MaGiayTo: 'GT000015',
        TenGiayTo: 'Giấy xác nhận tình trạng hôn nhân',
        LoaiGiayTo: 'Hôn nhân',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0005/hon-nhan.pdf',
        NgayCapNhat: '2026-03-17',
      },
      {
        MaGiayTo: 'GT000016',
        TenGiayTo: 'Minh chứng thu nhập',
        LoaiGiayTo: 'Tài chính',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0005/thu-nhap.pdf',
        NgayCapNhat: '2026-03-17',
      },
    ],
  },
  {
    MaYeuCauNhan: 'YCNN0004',
    MaNguoiNhan: 'ND000010',
    TenNguoiNhan: 'Lê Thanh Mai',
    SDTNguoiNhan: '0987654321',
    Email: 'thanhmai@example.com',
    CCCD: '048198812345',
    GioiTinh: 'Nữ',
    NgaySinh: '1988-03-10',
    DiaChi: 'Sơn Trà, Đà Nẵng',
    NgheNghiep: 'Giáo viên',
    ThuNhapHangThang: 22000000,
    LyDoNhanNuoi:
      'Người nhận nuôi có mong muốn xây dựng gia đình và chăm sóc trẻ lâu dài.',
    MongMuonVeTre:
      'Không yêu cầu cụ thể, ưu tiên trẻ phù hợp sau khi trung tâm tư vấn.',
    NgayTao: '2026-03-15',
    NgayCapNhat: '2026-03-17',
    TrangThai: 'Chờ ghép trẻ',
    GhiChu: 'Đã kiểm tra đủ giấy tờ.',
    documents: [
      {
        MaGiayTo: 'GT000009',
        TenGiayTo: 'Ảnh CCCD người nhận nuôi',
        LoaiGiayTo: 'Tùy thân',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0004/cccd.jpg',
        NgayCapNhat: '2026-03-15',
      },
      {
        MaGiayTo: 'GT000010',
        TenGiayTo: 'Giấy khám sức khỏe',
        LoaiGiayTo: 'Sức khỏe',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0004/suc-khoe.pdf',
        NgayCapNhat: '2026-03-15',
      },
      {
        MaGiayTo: 'GT000011',
        TenGiayTo: 'Giấy xác nhận tình trạng hôn nhân',
        LoaiGiayTo: 'Hôn nhân',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0004/hon-nhan.pdf',
        NgayCapNhat: '2026-03-15',
      },
      {
        MaGiayTo: 'GT000012',
        TenGiayTo: 'Minh chứng thu nhập',
        LoaiGiayTo: 'Tài chính',
        TrangThai: 'Hợp lệ',
        DuongDanFile: '/uploads/giayto/ycnn0004/thu-nhap.pdf',
        NgayCapNhat: '2026-03-15',
      },
    ],
  },
];

function normalizeDocuments(documents = []) {
  return documents.map((doc) => ({
    MaGiayTo: doc.MaGiayTo || doc.maGiayTo || doc.id,
    TenGiayTo: doc.TenGiayTo || doc.tenGiayTo || doc.name || 'Giấy tờ',
    LoaiGiayTo: doc.LoaiGiayTo || doc.loaiGiayTo || doc.type || 'Khác',
    TrangThai:
      doc.TrangThai || doc.trangThai || doc.status || 'Chờ xác minh',
    DuongDanFile:
      doc.DuongDanFile || doc.duongDanFile || doc.url || doc.fileUrl || '',
    NgayCapNhat:
      doc.NgayCapNhat || doc.ngayCapNhat || doc.updatedAt || null,
  }));
}

function normalizeRequests(data) {
  const raw = Array.isArray(data) ? data : data?.items;

  if (!raw || raw.length === 0) return fallbackRequests;

  return raw.map((item) => ({
    MaYeuCauNhan: item.MaYeuCauNhan || item.maYeuCauNhan || item.id,
    MaNguoiNhan: item.MaNguoiNhan || item.maNguoiNhan,
    TenNguoiNhan:
      item.TenNguoiNhan || item.tenNguoiNhan || item.adopterName || 'Chưa rõ',
    SDTNguoiNhan:
      item.SDTNguoiNhan || item.sdtNguoiNhan || item.phone || 'Chưa cập nhật',
    Email: item.Email || item.email || 'Chưa cập nhật',
    CCCD: item.CCCD || item.cccd || item.nationalId || 'Chưa cập nhật',
    GioiTinh: item.GioiTinh || item.gender || 'Chưa cập nhật',
    NgaySinh: item.NgaySinh || item.birthDate || item.dateOfBirth || null,
    DiaChi: item.DiaChi || item.diaChi || item.address || 'Chưa cập nhật',
    NgheNghiep:
      item.NgheNghiep || item.ngheNghiep || item.job || 'Chưa cập nhật',
    ThuNhapHangThang:
      item.ThuNhapHangThang ?? item.thuNhapHangThang ?? item.monthlyIncome,
    LyDoNhanNuoi:
      item.LyDoNhanNuoi || item.lyDoNhanNuoi || item.reason || 'Chưa cập nhật',
    MongMuonVeTre:
      item.MongMuonVeTre ||
      item.mongMuonVeTre ||
      item.expectation ||
      'Chưa cập nhật',
    NgayTao: item.NgayTao || item.ngayTao || item.createdAt,
    NgayCapNhat: item.NgayCapNhat || item.ngayCapNhat || item.updatedAt,
    TrangThai: item.TrangThai || item.trangThai || item.status || 'Chờ xử lý',
    GhiChu: item.GhiChu || item.ghiChu || '',
    documents: normalizeDocuments(item.documents || item.GiayTo || item.giayTo || []),
  }));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#E6EDF5] bg-white px-5 py-4">
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value || 'Chưa cập nhật'}</p>
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
    'Chờ xử lý': 'Yêu cầu mới, cần kiểm tra thông tin và giấy tờ pháp lý.',
    'Đang xem xét': 'Yêu cầu đang trong quá trình kiểm tra điều kiện và giấy tờ.',
    'Chờ ghép trẻ': 'Yêu cầu đủ điều kiện cơ bản, có thể chuyển sang bước chọn trẻ.',
    'Đã duyệt': 'Yêu cầu đã được duyệt, vui lòng theo dõi hồ sơ liên quan.',
    'Từ chối': 'Yêu cầu đã bị từ chối, không thể tiếp tục xử lý.',
    'Đã hoàn tất': 'Quy trình nhận nuôi đã hoàn tất.',
  };

  return messages[status] || 'Theo dõi trạng thái xử lý yêu cầu.';
}

function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null;

  const fileUrl = document.DuongDanFile;
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

export default function AdoptionRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(adoptionApi.getAll);

  const requests = useMemo(() => normalizeRequests(data), [data]);

  const foundRequest = useMemo(() => {
    return requests.find((item) => item.MaYeuCauNhan === id) || fallbackRequests[0];
  }, [requests, id]);

  const [request, setRequest] = useState(foundRequest);
  const [documents, setDocuments] = useState(foundRequest.documents || []);
  const [note, setNote] = useState(foundRequest.GhiChu || '');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [viewedDocs, setViewedDocs] = useState({});

  useEffect(() => {
    setRequest(foundRequest);
    setDocuments(foundRequest.documents || []);
    setNote(foundRequest.GhiChu || '');
    setPreviewDoc(null);
    setViewedDocs({});
  }, [foundRequest]);

  const validDocuments = documents.filter((doc) => doc.TrangThai === 'Hợp lệ');

  const allDocumentsValid =
    documents.length > 0 && validDocuments.length === documents.length;

  const canStartReview = request.TrangThai === 'Chờ xử lý';

  const canUpdateDocuments = ['Chờ xử lý', 'Đang xem xét'].includes(
    request.TrangThai
  );

  const canMoveToMatching =
    ['Chờ xử lý', 'Đang xem xét'].includes(request.TrangThai) &&
    allDocumentsValid;

  const canReject = ['Chờ xử lý', 'Đang xem xét'].includes(request.TrangThai);

  const canSelectChild = request.TrangThai === 'Chờ ghép trẻ';

  const readOnly = ['Từ chối', 'Đã duyệt', 'Đã hoàn tất'].includes(
    request.TrangThai
  );

  function updateRequestStatus(status) {
    setRequest((prev) => ({
      ...prev,
      TrangThai: status,
      NgayCapNhat: new Date().toISOString(),
    }));
  }

  function openDocumentPreview(doc) {
    setPreviewDoc(doc);

    if (doc.DuongDanFile) {
      setViewedDocs((prev) => ({
        ...prev,
        [doc.MaGiayTo]: true,
      }));
    }
  }

  function updateDocumentStatus(maGiayTo, status) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.MaGiayTo === maGiayTo
          ? {
            ...doc,
            TrangThai: status,
            NgayCapNhat: new Date().toISOString(),
          }
          : doc
      )
    );

    if (request.TrangThai === 'Chờ xử lý') {
      updateRequestStatus('Đang xem xét');
    }
  }

  if (loading && !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Xét duyệt yêu cầu nhận nuôi
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                {request.MaYeuCauNhan}
              </h1>

              <Badge status={request.TrangThai} size="md" />
            </div>
          </div>

          <Link
            to="/can-bo-nhan-nuoi/danh-sach"
            className="w-fit rounded-2xl border border-[#CFE0F5] bg-white px-5 py-3 text-sm font-bold text-[#0D47A1] transition hover:bg-[#EEF6FF]"
          >
            Quay lại danh sách
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left content */}
          <main className="space-y-8 lg:col-span-8">
            {/* Applicant */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <div className="mb-6">
                <SectionTitle
                  title="Thông tin người nhận nuôi"
                  description="Thông tin khai báo trong đơn đăng ký nhận nuôi."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoItem label="Họ và tên" value={request.TenNguoiNhan} />
                <InfoItem label="Số điện thoại" value={request.SDTNguoiNhan} />
                <InfoItem label="Email" value={request.Email} />
                <InfoItem label="Số CCCD" value={request.CCCD} />
                <InfoItem label="Giới tính" value={request.GioiTinh} />
                <InfoItem
                  label="Ngày sinh"
                  value={request.NgaySinh ? formatDate(request.NgaySinh) : ''}
                />
                <InfoItem label="Nghề nghiệp" value={request.NgheNghiep} />
                <InfoItem
                  label="Thu nhập hàng tháng"
                  value={formatCurrency(request.ThuNhapHangThang)}
                />
              </div>

              <div className="mt-5">
                <InfoItem label="Địa chỉ thường trú" value={request.DiaChi} />
              </div>
            </section>

            {/* Request content */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Nội dung yêu cầu" />

              <div className="mt-6 grid gap-5">
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                  <p className={labelClass}>Lý do nhận nuôi</p>
                  <p className="mt-3 text-sm leading-7 text-[#26364A]">
                    {request.LyDoNhanNuoi}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                  <p className={labelClass}>Mong muốn về trẻ</p>
                  <p className="mt-3 text-sm leading-7 text-[#26364A]">
                    {request.MongMuonVeTre}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="Ngày tạo" value={formatDate(request.NgayTao)} />
                  <InfoItem
                    label="Ngày cập nhật"
                    value={
                      request.NgayCapNhat
                        ? formatDate(request.NgayCapNhat)
                        : 'Chưa cập nhật'
                    }
                  />
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-[#E4EAF2] px-6 py-6 lg:px-7">
                <SectionTitle
                  title="Giấy tờ pháp lý"
                  description={`${validDocuments.length}/${documents.length} giấy tờ hợp lệ`}
                />
              </div>

              <div className="grid gap-5 p-6 lg:p-7">
                {documents.map((doc) => {
                  const hasViewed = viewedDocs[doc.MaGiayTo];
                  const canReviewThisDoc =
                    canUpdateDocuments && !readOnly && doc.DuongDanFile && hasViewed;

                  return (
                    <div
                      key={doc.MaGiayTo}
                      className="rounded-[22px] border border-[#E1ECF8] bg-[#FAFCFF] p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-bold leading-6 text-[#1F2A3D]">
                              {doc.TenGiayTo}
                            </p>

                            <Badge status={doc.TrangThai} size="sm" />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-[#7D90AA]">
                            <span>
                              Cập nhật:{' '}
                              {doc.NgayCapNhat
                                ? formatDate(doc.NgayCapNhat)
                                : 'Chưa cập nhật'}
                            </span>
                          </div>

                          {!doc.DuongDanFile && (
                            <p className="mt-3 text-sm font-semibold text-red-500">
                              Chưa có file đính kèm.
                            </p>
                          )}

                          {doc.DuongDanFile &&
                            !hasViewed &&
                            canUpdateDocuments &&
                            !readOnly && (
                              <p className="mt-3 text-xs font-semibold text-amber-600">
                                Cần xem giấy tờ trước khi cập nhật trạng thái.
                              </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                          <button
                            type="button"
                            onClick={() => openDocumentPreview(doc)}
                            disabled={!doc.DuongDanFile}
                            className="rounded-xl border border-[#CFE0F5] bg-white px-4 py-2.5 text-xs font-bold text-[#0D47A1] transition hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            Xem giấy tờ
                          </button>

                          {canUpdateDocuments && !readOnly && (
                            <>
                              <button
                                type="button"
                                disabled={!canReviewThisDoc}
                                onClick={() =>
                                  updateDocumentStatus(doc.MaGiayTo, 'Hợp lệ')
                                }
                                className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Hợp lệ
                              </button>

                              <button
                                type="button"
                                disabled={!canReviewThisDoc}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.MaGiayTo,
                                    'Cần bổ sung'
                                  )
                                }
                                className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Bổ sung
                              </button>

                              <button
                                type="button"
                                disabled={!canReviewThisDoc}
                                onClick={() =>
                                  updateDocumentStatus(
                                    doc.MaGiayTo,
                                    'Không hợp lệ'
                                  )
                                }
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                              >
                                Không hợp lệ
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
          </main>

          {/* Right side */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Processing panel */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Xử lý yêu cầu" />

              <div className="mt-6 rounded-2xl border border-[#E3ECF8] bg-[#FAFCFF] p-5">
                <p className={labelClass}>Trạng thái hiện tại</p>

                <div className="mt-3">
                  <Badge status={request.TrangThai} size="md" />
                </div>

                <p className="mt-4 text-sm leading-7 text-[#6F83A3]">
                  {getStatusMessage(request.TrangThai)}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {canStartReview && (
                  <button
                    type="button"
                    onClick={() => updateRequestStatus('Đang xem xét')}
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    Bắt đầu kiểm tra
                  </button>
                )}

                {canMoveToMatching && (
                  <button
                    type="button"
                    onClick={() => updateRequestStatus('Chờ ghép trẻ')}
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    Chuyển sang chờ ghép trẻ
                  </button>
                )}

                {!canMoveToMatching &&
                  ['Chờ xử lý', 'Đang xem xét'].includes(request.TrangThai) && (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500"
                    >
                      Cần đủ giấy tờ hợp lệ
                    </button>
                  )}

                {canSelectChild && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/can-bo-nhan-nuoi/tao-ho-so/${request.MaYeuCauNhan}`
                      )
                    }
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    Chọn trẻ phù hợp
                  </button>
                )}

                {request.TrangThai === 'Đã duyệt' && (
                  <Link
                    to="/can-bo-nhan-nuoi/ho-so"
                    className="block w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    Theo dõi hồ sơ
                  </Link>
                )}

                {canReject && (
                  <button
                    type="button"
                    onClick={() => updateRequestStatus('Từ chối')}
                    className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                  >
                    Từ chối yêu cầu
                  </button>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Ghi chú xử lý" />

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={readOnly}
                rows={7}
                placeholder="Nhập ghi chú xử lý nếu cần..."
                className="mt-5 w-full resize-none rounded-2xl border border-[#D7E5F7] bg-[#FAFCFF] px-4 py-4 text-sm font-medium leading-7 text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <button
                type="button"
                disabled={readOnly}
                onClick={() =>
                  setRequest((prev) => ({
                    ...prev,
                    GhiChu: note,
                    NgayCapNhat: new Date().toISOString(),
                  }))
                }
                className="mt-4 w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#0D47A1] ring-1 ring-[#CFE0F5] transition hover:bg-[#F4F8FF] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                Lưu ghi chú
              </button>
            </section>

            {/* Rule note */}
            <section className="rounded-[28px] border border-[#D7E5F7] bg-[#EAF4FF] p-6">
              <h3 className="text-[15px] font-bold text-[#0D47A1]">
                Nguyên tắc xử lý
              </h3>

              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#5F738F]">
                <li>• Không chọn trẻ khi giấy tờ chưa hợp lệ.</li>
                <li>• Hồ sơ chỉ được lập sau khi gặp mặt phù hợp.</li>
                <li>• Hồ sơ nhận nuôi phải gửi trưởng phòng duyệt.</li>
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