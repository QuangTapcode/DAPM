import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import adoptionApi from '../../api/adoptionApi';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';

const cardClass =
  'rounded-[28px] border border-[#E4EAF2] bg-white shadow-[0_12px_34px_rgba(31,42,61,0.06)]';

const labelClass = 'text-[11px] font-bold uppercase tracking-[0.13em] text-[#8FA0B8]';
const valueClass = 'mt-2 text-[15px] font-semibold leading-6 text-[#26364A]';

function normalizeRequest(item) {
  if (!item) return null;
  return {
    id: item.maYeuCauNhan || item.id,
    maNguoiNhan: item.maNguoiNhan || item.adopterId,
    tenNguoiNhan: item.tenNguoiNhan || 'Chưa rõ',
    ngheNghiep: item.ngheNghiep || 'Chưa cập nhật',
    thuNhapHangThang: item.thuNhapHangThang ?? null,
    lyDoNhanNuoi: item.lyDoNhanNuoi || '',
    mongMuonVeTre: item.mongMuonVeTre || '',
    ngayTao: item.ngayTao || item.createdAt,
    ngayCapNhat: item.ngayCapNhat || item.updatedAt,
    trangThai: item.trangThai || item.status || 'Chờ xử lý',
    nguoiDuyet: item.nguoiDuyet || '',
    giayTos: Array.isArray(item.giayTos) ? item.giayTos : [],
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined) return 'Chưa cập nhật';
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;
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
      {description && <p className="mt-2 text-sm leading-7 text-[#7D90AA]">{description}</p>}
    </div>
  );
}

export default function AdoptionRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: raw, loading, error, refetch } = useFetch(
    () => adoptionApi.getById(id),
    [id]
  );

  const request = useMemo(() => normalizeRequest(raw), [raw]);

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trangThai = request?.trangThai || '';
  const readOnly = ['Từ chối', 'Đã duyệt', 'Đã hoàn tất'].includes(trangThai);
  const canReject = ['Chờ xử lý', 'Đang xem xét'].includes(trangThai);
  const canApprove = ['Chờ xử lý', 'Đang xem xét', 'Chờ ghép trẻ'].includes(trangThai);

  const handleUpdateStatus = async (newStatus) => {
    setSubmitting(true);
    try {
      await adoptionApi.update(id, { TrangThai: newStatus, GhiChu: note || undefined });
      refetch();
    } catch (err) {
      alert(err?.message || 'Lỗi cập nhật trạng thái.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Xác nhận duyệt yêu cầu nhận nuôi này?')) return;
    setSubmitting(true);
    try {
      await adoptionApi.approve(id, { ghiChu: note || undefined });
      refetch();
    } catch (err) {
      alert(err?.message || 'Lỗi duyệt yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Xác nhận từ chối yêu cầu nhận nuôi này?')) return;
    setSubmitting(true);
    try {
      await adoptionApi.reject(id, { ghiChu: note || undefined });
      refetch();
    } catch (err) {
      alert(err?.message || 'Lỗi từ chối yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    setSubmitting(true);
    try {
      await adoptionApi.update(id, { GhiChu: note });
      alert('Đã lưu ghi chú.');
    } catch (err) {
      alert(err?.message || 'Lỗi lưu ghi chú.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#0D47A1]" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC]">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">
            {error?.message || 'Không tìm thấy yêu cầu nhận nuôi.'}
          </p>
          <Link to="/can-bo-nhan-nuoi/danh-sach" className="text-[#0D47A1] underline text-sm">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <div className="mx-auto max-w-[1720px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#DDE6F0] pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6F83A3]">
              Xét duyệt yêu cầu nhận nuôi
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-[34px] font-bold leading-tight text-[#0D47A1] md:text-[42px]">
                {request.id}
              </h1>
              <Badge status={request.trangThai} size="md" />
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
          {/* Left */}
          <main className="space-y-8 lg:col-span-8">
            {/* Thông tin người nhận nuôi */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <div className="mb-6">
                <SectionTitle
                  title="Thông tin người nhận nuôi"
                  description="Thông tin khai báo trong đơn đăng ký nhận nuôi."
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InfoItem label="Họ và tên" value={request.tenNguoiNhan} />
                <InfoItem label="Mã người dùng" value={request.maNguoiNhan} />
                <InfoItem label="Nghề nghiệp" value={request.ngheNghiep} />
                <InfoItem label="Thu nhập hàng tháng" value={formatCurrency(request.thuNhapHangThang)} />
              </div>
            </section>

            {/* Nội dung yêu cầu */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Nội dung yêu cầu" />
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                  <p className={labelClass}>Lý do nhận nuôi</p>
                  <p className="mt-3 text-sm leading-7 text-[#26364A]">
                    {request.lyDoNhanNuoi || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E6EDF5] bg-[#FAFCFF] p-5">
                  <p className={labelClass}>Mong muốn về trẻ</p>
                  <p className="mt-3 text-sm leading-7 text-[#26364A]">
                    {request.mongMuonVeTre || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <InfoItem label="Ngày tạo" value={formatDate(request.ngayTao)} />
                  <InfoItem
                    label="Ngày cập nhật"
                    value={request.ngayCapNhat ? formatDate(request.ngayCapNhat) : 'Chưa cập nhật'}
                  />
                  {request.nguoiDuyet && (
                    <InfoItem label="Người duyệt" value={request.nguoiDuyet} />
                  )}
                </div>
              </div>
            </section>

            {/* Giấy tờ */}
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#E4EAF2] px-6 py-6 lg:px-7">
                <SectionTitle
                  title="Giấy tờ pháp lý"
                  description={`${request.giayTos.length} tệp đính kèm`}
                />
              </div>
              <div className="p-6 lg:p-7">
                {request.giayTos.length === 0 ? (
                  <p className="text-sm text-[#8FA0B8]">Chưa có giấy tờ đính kèm.</p>
                ) : (
                  <div className="space-y-3">
                    {request.giayTos.map((docId) => (
                      <div
                        key={docId}
                        className="flex items-center justify-between rounded-2xl border border-[#E1ECF8] bg-[#FAFCFF] px-5 py-4"
                      >
                        <div>
                          <p className="font-semibold text-[#1F2A3D] text-sm">{docId}</p>
                          <p className="text-xs text-[#8FA0B8] mt-1">Giấy tờ đính kèm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* Right */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Xử lý yêu cầu */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Xử lý yêu cầu" />

              <div className="mt-6 rounded-2xl border border-[#E3ECF8] bg-[#FAFCFF] p-5">
                <p className={labelClass}>Trạng thái hiện tại</p>
                <div className="mt-3">
                  <Badge status={request.trangThai} size="md" />
                </div>
                <p className="mt-4 text-sm leading-7 text-[#6F83A3]">
                  {getStatusMessage(request.trangThai)}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {trangThai === 'Chờ xử lý' && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('Đang xem xét')}
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778] disabled:opacity-60"
                  >
                    Bắt đầu kiểm tra
                  </button>
                )}

                {['Đang xem xét', 'Chờ ghép trẻ'].includes(trangThai) && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleUpdateStatus('Chờ ghép trẻ')}
                    className="w-full rounded-2xl bg-[#1565C0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0D47A1] disabled:opacity-60"
                  >
                    Chuyển chờ ghép trẻ
                  </button>
                )}

                {canApprove && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleApprove}
                    className="w-full rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Duyệt yêu cầu
                  </button>
                )}

                {trangThai === 'Đã duyệt' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/can-bo-nhan-nuoi/tao-ho-so/${request.id}`)}
                    className="w-full rounded-2xl bg-[#0D47A1] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#083778]"
                  >
                    Lập hồ sơ nhận nuôi
                  </button>
                )}

                {canReject && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleReject}
                    className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    Từ chối yêu cầu
                  </button>
                )}
              </div>
            </section>

            {/* Ghi chú */}
            <section className={`${cardClass} p-6 lg:p-7`}>
              <SectionTitle title="Ghi chú xử lý" />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={readOnly || submitting}
                rows={6}
                placeholder="Nhập ghi chú xử lý nếu cần..."
                className="mt-5 w-full resize-none rounded-2xl border border-[#D7E5F7] bg-[#FAFCFF] px-4 py-4 text-sm font-medium leading-7 text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              {!readOnly && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSaveNote}
                  className="mt-4 w-full rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#0D47A1] ring-1 ring-[#CFE0F5] transition hover:bg-[#F4F8FF] disabled:opacity-60"
                >
                  Lưu ghi chú
                </button>
              )}
            </section>

            {/* Nguyên tắc */}
            <section className="rounded-[28px] border border-[#D7E5F7] bg-[#EAF4FF] p-6">
              <h3 className="text-[15px] font-bold text-[#0D47A1]">Nguyên tắc xử lý</h3>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#5F738F]">
                <li>• Kiểm tra đầy đủ giấy tờ trước khi duyệt.</li>
                <li>• Hồ sơ chỉ được lập sau khi yêu cầu được duyệt.</li>
                <li>• Hồ sơ nhận nuôi phải gửi trưởng phòng phê duyệt.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
