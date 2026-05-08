import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import childApi from '../../api/childApi';

const inputClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFC] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all placeholder:text-[#9AA9BE] focus:border-[#93C5FD] focus:bg-white';

const textareaClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFC] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all placeholder:text-[#9AA9BE] focus:border-[#93C5FD] focus:bg-white resize-none';

const selectClass =
  'w-full rounded-2xl border border-[#D9E6F7] bg-[#F7FAFC] px-4 py-3 text-[15px] text-[#334155] outline-none transition-all focus:border-[#93C5FD] focus:bg-white';

const EMPTY_FORM = {
  hoTen: '',
  ngaySinh: '',
  gioiTinh: 'Nữ',
  maPhuongXa: '',
  diaChiCuThe: '',
  danToc: '',
  tinhCach: '',
  soThich: '',
  dacDiemNhanDang: '',
  trangThai: 'Chờ tiếp nhận',
  ngayTiepNhan: '',
  ngayCapNhat: '',
  ngayNhanNuoi: '',
  ghiChu: '',
  maNguoiCapNhat: '',
};

function FormField({ label, children, error, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-[13px] font-bold uppercase tracking-[0.04em] text-[#334155]">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="rounded-[24px] border border-[#E3ECF8] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h2 className="mb-5 text-[20px] font-bold !text-[#083B8A]">{title}</h2>
      {children}
    </section>
  );
}

export default function ChildForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const fullName = watch('hoTen');
  const avatarText = useMemo(() => {
    if (!fullName?.trim()) return 'TE';
    const words = fullName.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }, [fullName]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!isEdit) {
        reset(EMPTY_FORM);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await childApi.getById(id);

        if (!active) return;

        if (data) {
          reset({
            ...EMPTY_FORM,
            ...data,
          });
        } else {
          reset(EMPTY_FORM);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu trẻ:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id, isEdit, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await childApi.update(id, values);
      } else {
        await childApi.create(values);
      }

      navigate('/can-bo-tiep-nhan/tre');
    } catch (error) {
      console.error('Lỗi lưu hồ sơ trẻ:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[#64748B]">
        Đang tải dữ liệu trẻ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header đơn giản: avatar + tên */}
          <div className="rounded-[24px] border border-[#E3ECF8] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[24px] font-bold text-[#0D47A1]">
                  {avatarText}
                </div>

                <div>
                  <p className="text-sm font-medium text-[#8FA0B8]">
                    Hồ sơ trẻ
                  </p>
                  <h1 className="text-[28px] font-bold text-[#0F172A]">
                    {fullName?.trim() || 'Thông tin trẻ'}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/can-bo-tiep-nhan/tre')}
                className="rounded-2xl border border-[#D9E6F7] bg-white px-5 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FBFF]"
              >
                Quay lại
              </button>
            </div>
          </div>

          {/* Thông tin trẻ */}
          <SectionCard title="Thông tin trẻ" >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Họ và tên trẻ" error={errors.hoTen?.message}>
                <input
                  {...register('hoTen', {
                    required: 'Vui lòng nhập họ tên trẻ',
                  })}
                  className={inputClass}
                  placeholder="Nhập họ và tên trẻ"
                />
              </FormField>

              <FormField label="Ngày sinh">
                <input
                  type="date"
                  {...register('ngaySinh')}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Giới tính">
                <select {...register('gioiTinh')} className={selectClass}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </FormField>

              <FormField label="Dân tộc">
                <input
                  {...register('danToc')}
                  className={inputClass}
                  placeholder="Ví dụ: Kinh"
                />
              </FormField>

              <FormField label="Mã phường/xã">
                <input
                  {...register('maPhuongXa')}
                  className={inputClass}
                  placeholder="Nhập mã phường/xã"
                />
              </FormField>

              <FormField label="Tính cách">
                <input
                  {...register('tinhCach')}
                  className={inputClass}
                  placeholder="Ví dụ: Hòa đồng, vui vẻ"
                />
              </FormField>

              <FormField label="Sở thích">
                <input
                  {...register('soThich')}
                  className={inputClass}
                  placeholder="Ví dụ: Vẽ, hát, đá bóng"
                />
              </FormField>

              <FormField
                label="Địa chỉ cụ thể"
                className="md:col-span-2"
              >
                <input
                  {...register('diaChiCuThe')}
                  className={inputClass}
                  placeholder="Số nhà, đường, thôn/xóm..."
                />
              </FormField>

              <FormField
                label="Đặc điểm nhận dạng"
                className="md:col-span-2"
              >
                <input
                  {...register('dacDiemNhanDang')}
                  className={inputClass}
                  placeholder="Ví dụ: Có nốt ruồi ở má trái..."
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Thông tin quản lý */}
          <SectionCard title="Thông tin quản lý">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Trạng thái">
                <select {...register('trangThai')} className={selectClass}>
                  <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                  <option value="Đang chăm sóc">Đang chăm sóc</option>
                  <option value="Chờ nhận nuôi">Chờ nhận nuôi</option>
                  <option value="Đã nhận nuôi">Đã nhận nuôi</option>
                  <option value="Đã trả về gia đình">Đã trả về gia đình</option>
                </select>
              </FormField>

              <FormField label="Mã người cập nhật">
                <input
                  {...register('maNguoiCapNhat')}
                  className={inputClass}
                  placeholder="Ví dụ: CBTN001"
                />
              </FormField>

              <FormField label="Ngày tiếp nhận">
                <input
                  type="date"
                  {...register('ngayTiepNhan')}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Ngày cập nhật">
                <input
                  type="date"
                  {...register('ngayCapNhat')}
                  className={inputClass}
                />
              </FormField>

              <FormField label="Ngày nhận nuôi">
                <input
                  type="date"
                  {...register('ngayNhanNuoi')}
                  className={inputClass}
                />
              </FormField>

              <div className="hidden md:block" />

              <FormField label="Ghi chú" className="md:col-span-2">
                <textarea
                  {...register('ghiChu')}
                  rows={4}
                  className={textareaClass}
                  placeholder="Nhập ghi chú thêm..."
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Liên kết sang form sức khỏe riêng */}
          <section className="rounded-[24px] border border-[#E3ECF8] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[20px] font-bold text-[#0D47A1]">
                  Thông tin sức khỏe
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Quản lý thông tin sức khỏe của trẻ tại form riêng.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    isEdit
                      ? `/can-bo-tiep-nhan/tre/${id}/suc-khoe`
                      : '/can-bo-tiep-nhan/tre/suc-khoe'
                  )
                }
                className="rounded-2xl bg-[#EAF3FF] px-5 py-3 text-sm font-semibold text-[#0D47A1] transition hover:bg-[#DCEEFF]"
              >
                Mở form sức khỏe
              </button>
            </div>
          </section>

          {/* Action */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/can-bo-tiep-nhan/tre')}
              className="rounded-2xl border border-[#D9E6F7] bg-white px-5 py-3 text-sm font-semibold text-[#64748B] transition hover:bg-[#F8FBFF]"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#0D47A1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1565C0] disabled:opacity-60"
            >
              {isSubmitting
                ? 'Đang lưu...'
                : isEdit
                  ? 'Lưu cập nhật'
                  : 'Tạo hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}