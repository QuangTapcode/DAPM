import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useFetch } from '../../hooks/useFetch';
import childApi from '../../api/childApi';
import receptionApi from '../../api/receptionApi';
import { formatDate } from '../../utils/formatDate';

const cardCls =
  'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_12px_32px_rgba(42,74,122,0.08)]';

const inputClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFE] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all placeholder:text-[#9AA9BE] focus:border-[#93C5FD] focus:bg-white';

const selectClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFE] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all focus:border-[#93C5FD] focus:bg-white';

const textareaClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFE] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all placeholder:text-[#9AA9BE] focus:border-[#93C5FD] focus:bg-white resize-none';

function normalizeStatus(status) {
  return String(status || 'pending').toLowerCase();
}

function calculateAge(dateString) {
  if (!dateString) return '—';
  const dob = new Date(dateString);
  if (Number.isNaN(dob.getTime())) return '—';

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : '—';
}

function getInitials(name) {
  if (!name?.trim()) return 'TE';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function mapReceptionRequest(item) {
  if (!item) return null;

  const status = normalizeStatus(item.status);

  return {
    id: item.id,
    code: item.code || `HS-${String(item.id).padStart(4, '0')}`,
    status,
    childName: item.childName || '—',
    childDob: item.childBirthDate || '',
    childGender: item.childGender || '',
    childAge: calculateAge(item.childBirthDate),
    senderName: item.senderName || '—',
    senderPhone: item.senderPhone || '—',
    relationship: item.relationship || '—',
    reason: item.reason || '',
    documents: Array.isArray(item.documents)
      ? item.documents.map((doc) =>
        typeof doc === 'string'
          ? { name: doc, url: '' }
          : { name: doc.name || 'Tài liệu', url: doc.url || '' }
      )
      : [],
    createdAt: item.createdAt || '',
  };
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[13px] font-bold uppercase tracking-[0.04em] text-[#334155]">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className={`${cardCls} p-5`}>
      <div className="mb-5">
        <h2 className="text-[20px] font-bold text-[#083B8A]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[#7C8BA1]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const labelMap = {
    pending: 'Chờ duyệt',
    approved: 'Đã tiếp nhận',
    rejected: 'Cần bổ sung',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${map[status] || 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
    >
      {labelMap[status] || status || '—'}
    </span>
  );
}

export default function CreateReceptionProfile() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const { data: raw, loading } = useFetch(
    () => (requestId ? childApi.getRequestById(requestId) : Promise.resolve(null)),
    [requestId]
  );

  const req = useMemo(() => mapReceptionRequest(raw), [raw]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      childName: '',
      childDob: '',
      childGender: 'male',
      senderName: '',
      relationship: '',
      admissionDate: new Date().toISOString().slice(0, 10),
      assignedRoom: '',
      assignedBed: '',
      initialHealthStatus: 'Bình thường',
      staffNote: '',
      ethnicity: '',
      hometown: '',
    },
  });

  useMemo(() => {
    if (!req) return;
    reset({
      childName: req.childName || '',
      childDob: req.childDob || '',
      childGender: req.childGender || 'male',
      senderName: req.senderName || '',
      relationship: req.relationship || '',
      admissionDate: new Date().toISOString().slice(0, 10),
      assignedRoom: '',
      assignedBed: '',
      initialHealthStatus: 'Bình thường',
      staffNote: '',
      ethnicity: '',
      hometown: '',
    });
  }, [req, reset]);

  const onSubmit = async (data) => {
    try {
      // Gọi approve để BE tạo TRE + HOSOTIEPNHANTRE + cập nhật trạng thái yêu cầu
      await receptionApi.approve(requestId, { ghiChu: data.staffNote });
      navigate('/can-bo-tiep-nhan/tre');
    } catch (err) {
      alert(err?.message || 'Có lỗi khi xác nhận tiếp nhận. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-[#64748B]">
        Đang tải thông tin tiếp nhận...
      </div>
    );
  }

  if (!req) {
    return (
      <div className="py-16 text-center text-sm text-red-500">
        Không tìm thấy yêu cầu tiếp nhận.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`${cardCls} px-6 py-5`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-[34px] font-bold text-[#0D47A1]">
                  Tạo hồ sơ tiếp nhận
                </h1>
                <StatusBadge status={req.status} />
              </div>

              <p className="mt-2 text-sm text-[#73839B]">
                Xác nhận tiếp nhận trẻ vào trung tâm dựa trên hồ sơ gửi trẻ đã được duyệt.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FBFF] px-4 py-3 text-sm text-[#64748B]">
              Hồ sơ: <span className="font-bold text-[#0D47A1]">#{req.code}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className={`${cardCls} px-6 py-5`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[24px] font-bold text-[#0D47A1]">
              {getInitials(req.childName)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-[24px] font-bold text-[#0F172A]">
                  {req.childName}
                </h2>
                <span className="rounded-full bg-[#F3F8FF] px-3 py-1 text-xs font-semibold text-[#0D47A1]">
                  {req.childGender === 'female' ? 'Nữ' : req.childGender === 'male' ? 'Nam' : '—'}
                </span>
                <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
                  {req.childAge === '—' ? '—' : `${req.childAge} tuổi`}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#64748B]">
                Người giao: <span className="font-semibold text-[#334155]">{req.senderName}</span>
                {' • '}
                {req.relationship}
                {' • '}
                {req.senderPhone}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1 */}
          <SectionCard
            title="Thông tin trẻ"
            description="Xác nhận lại thông tin cơ bản trước khi lập hồ sơ tiếp nhận."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Họ và tên">
                <input {...register('childName')} className={inputClass} />
              </Field>

              <Field label="Ngày sinh">
                <input type="date" {...register('childDob')} className={inputClass} />
              </Field>

              <Field label="Giới tính">
                <select {...register('childGender')} className={selectClass}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </Field>

              <Field label="Dân tộc">
                <input
                  {...register('ethnicity')}
                  className={inputClass}
                  placeholder="Ví dụ: Kinh, Tày..."
                />
              </Field>

              <Field label="Người giao trẻ">
                <input {...register('senderName')} className={inputClass} />
              </Field>

              <Field label="Quan hệ với trẻ">
                <input {...register('relationship')} className={inputClass} />
              </Field>

              <Field label="Địa chỉ / nơi ở hiện tại" className="md:col-span-2">
                <input
                  {...register('hometown')}
                  className={inputClass}
                  placeholder="Nhập địa chỉ thường trú hoặc nơi trẻ đang sinh sống"
                />
              </Field>
            </div>
          </SectionCard>

          {/* 2 */}
          <SectionCard
            title="Thông tin tiếp nhận"
            description="Thông tin nội bộ của trung tâm khi đưa trẻ vào danh sách quản lý."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Ngày tiếp nhận">
                <input type="date" {...register('admissionDate')} className={inputClass} />
              </Field>
              <Field label="Tình trạng sức khỏe ban đầu">
                <select {...register('initialHealthStatus')} className={selectClass}>
                  <option value="Bình thường">Bình thường</option>
                  <option value="Cần theo dõi">Cần theo dõi</option>
                  <option value="Cần điều trị">Cần điều trị</option>
                </select>
              </Field>

              <Field label="Ghi chú của cán bộ" className="md:col-span-2">
                <textarea
                  {...register('staffNote')}
                  rows={4}
                  className={textareaClass}
                  placeholder="Nhập ghi chú đặc biệt về trẻ, hoàn cảnh hoặc lưu ý tiếp nhận..."
                />
              </Field>
            </div>
          </SectionCard>

          {/* 3 */}
          <SectionCard
            title="Tài liệu đính kèm"
            description="Danh sách giấy tờ được chuyển cùng hồ sơ gửi trẻ."
          >
            {req.documents.length > 0 ? (
              <div className="space-y-3">
                {req.documents.map((doc, index) => (
                  <div
                    key={`${doc.name}-${index}`}
                    className="flex flex-col gap-3 rounded-2xl border border-[#E3ECF8] bg-[#F8FBFF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-[15px] font-semibold text-[#334155]">{doc.name}</p>
                      <p className="text-sm text-[#8FA0B8]">Tài liệu đính kèm của hồ sơ</p>
                    </div>

                    {doc.url ? (
                      <a
                        href={doc.url}
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
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#F8FBFF] px-4 py-5 text-sm text-[#8FA0B8]">
                Chưa có tài liệu đính kèm.
              </div>
            )}
          </SectionCard>

          {/* 4 */}
          <div className={`${cardCls} px-6 py-5`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Sau khi xác nhận, trẻ sẽ được thêm vào danh sách quản lý chính thức của trung tâm.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/can-bo-tiep-nhan/yeu-cau/${requestId}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#D9E6F7] bg-white px-5 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FBFF]"
                >
                  Hủy
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#0D47A1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1565C0] disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác nhận tiếp nhận'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}