import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  UserRound,
  Phone,
  IdCard,
  Briefcase,
  MapPin,
  Save,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import adoptionApi from '../../api/adoptionApi';
import Button from '../../components/common/Button';
import FileUpload from '../../components/common/FileUpload';

const labelClass =
  'mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]';

const inputClass =
  'w-full min-h-[52px] rounded-2xl border border-[#DCE8F7] bg-[#F7FBFF] px-4 py-3 text-[15px] text-[#334155] outline-none transition placeholder:text-[#9AA9BC] focus:border-[#BFD5F3] focus:bg-white focus:ring-2 focus:ring-[#E6F0FD]';

const textareaClass =
  'w-full min-h-[112px] rounded-2xl border border-[#DCE8F7] bg-[#F7FBFF] px-4 py-4 text-[15px] leading-7 text-[#334155] outline-none transition resize-none placeholder:text-[#9AA9BC] focus:border-[#BFD5F3] focus:bg-white focus:ring-2 focus:ring-[#E6F0FD]';

const errClass = 'mt-1 text-xs text-red-500';

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errClass}>{message}</p>;
}

function InputField({ label, icon, error, children }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6C8FC7]">
            {icon}
          </span>
        ) : null}
        {children}
        <FieldError message={error} />
      </div>
    </div>
  );
}

function UploadCard({ title, currentValue, uploadLabel, files, onChange }) {
  const displayText = (() => {
    if (!currentValue) return 'Chưa có minh chứng';
    if (Array.isArray(currentValue)) return currentValue.join(', ');
    return String(currentValue);
  })();

  return (
    <div className="rounded-2xl border border-dashed border-[#D6E3F5] bg-[#FAFCFF] p-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
        {title}
      </p>

      <div className="mb-4 min-h-[48px] rounded-xl border border-[#E3ECF8] bg-white px-3 py-2 text-sm leading-6 text-[#4B5C73]">
        {displayText}
      </div>

      <FileUpload
        label={uploadLabel}
        accept=".pdf,.jpg,.jpeg,.png"
        files={files}
        onChange={onChange}
      />
    </div>
  );
}

function UploadSection({ files, setFiles, oldDocuments }) {
  return (
    <div className="rounded-[28px] border border-[#E3ECF8] bg-white p-6 shadow-[0_14px_36px_rgba(42,74,122,0.08)] md:p-8">
      <h2 className="mb-6 flex items-center gap-2 text-[15px] font-bold !text-[#0D47A1]">
        <FileText size={16} />
        Cập nhật minh chứng
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <UploadCard
          title="Ảnh CCCD"
          currentValue={oldDocuments?.idCard}
          uploadLabel="Chọn file CCCD"
          files={files.idCard}
          onChange={(newFiles) =>
            setFiles((prev) => ({ ...prev, idCard: newFiles }))
          }
        />

        <UploadCard
          title="Giấy khám sức khỏe"
          currentValue={oldDocuments?.health}
          uploadLabel="Chọn hồ sơ sức khỏe"
          files={files.health}
          onChange={(newFiles) =>
            setFiles((prev) => ({ ...prev, health: newFiles }))
          }
        />

        <UploadCard
          title="Tình trạng hôn nhân"
          currentValue={oldDocuments?.marriage}
          uploadLabel="Chọn giấy xác nhận"
          files={files.marriage}
          onChange={(newFiles) =>
            setFiles((prev) => ({ ...prev, marriage: newFiles }))
          }
        />

        <UploadCard
          title="Minh chứng thu nhập"
          currentValue={oldDocuments?.income}
          uploadLabel="Chọn minh chứng thu nhập"
          files={files.income}
          onChange={(newFiles) =>
            setFiles((prev) => ({ ...prev, income: newFiles }))
          }
        />
      </div>
    </div>
  );
}

export default function UpdateAdoptionRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentRequest, setCurrentRequest] = useState(null);
  const [files, setFiles] = useState({
    idCard: [],
    health: [],
    marriage: [],
    income: [],
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      adopterName: '',
      phone: '',
      gender: '',
      birthDate: '',
      nationalId: '',
      address: '',
      occupation: '',
      monthlyIncome: '',
      motivation: '',
      expectedChild: '',
    },
  });

  useEffect(() => {
    adoptionApi
      .getById(id)
      .then((item) => {
        setCurrentRequest(item);

        reset({
          adopterName: item?.adopterName || item?.applicantName || '',
          phone: item?.phone || '',
          gender: item?.gender || '',
          birthDate: item?.birthDate || '',
          nationalId: item?.nationalId || '',
          address: item?.address || '',
          occupation: item?.occupation || '',
          monthlyIncome: item?.monthlyIncome || item?.income || '',
          motivation: item?.motivation || item?.reason || '',
          expectedChild: item?.expectedChild || '',
        });
      })
      .catch(console.error);
  }, [id, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    files.idCard.forEach((file) => formData.append('idCard', file));
    files.health.forEach((file) => formData.append('health', file));
    files.marriage.forEach((file) => formData.append('marriage', file));
    files.income.forEach((file) => formData.append('income', file));

    await adoptionApi.update(id, formData);
    navigate('/nhan-nuoi/trang-thai');
  };

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mt-2 !text-[36px] font-bold !text-[#0D47A1]">
            Cập nhật đơn nhận nuôi
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#73839B]">
            Bạn có thể chỉnh sửa thông tin và tải lại các minh chứng cần thiết
            trước khi hồ sơ được xử lý tiếp.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-[28px] border border-[#E3ECF8] bg-white p-6 shadow-[0_14px_36px_rgba(42,74,122,0.08)] md:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-[15px] font-bold !text-[#0D47A1]">
              <UserRound size={16} />
              Thông tin người nhận nuôi
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Họ và tên"
                icon={<UserRound size={16} />}
                error={errors.adopterName?.message}
              >
                <input
                  {...register('adopterName', { required: 'Bắt buộc' })}
                  className={`${inputClass} pl-11`}
                  placeholder="Nhập họ tên người nhận nuôi"
                />
              </InputField>

              <InputField
                label="Số điện thoại"
                icon={<Phone size={16} />}
                error={errors.phone?.message}
              >
                <input
                  {...register('phone')}
                  className={`${inputClass} pl-11`}
                  placeholder="Nhập số điện thoại"
                />
              </InputField>

              <InputField label="Giới tính" error={errors.gender?.message}>
                <select {...register('gender')} className={inputClass}>
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </InputField>

              <InputField
                label="Ngày sinh"
                icon={<CalendarDays size={16} />}
                error={errors.birthDate?.message}
              >
                <input
                  type="date"
                  {...register('birthDate')}
                  className={`${inputClass} pl-11`}
                />
              </InputField>

              <InputField
                label="CCCD"
                icon={<IdCard size={16} />}
                error={errors.nationalId?.message}
              >
                <input
                  {...register('nationalId')}
                  className={`${inputClass} pl-11`}
                  placeholder="Nhập số CCCD"
                />
              </InputField>

              <InputField
                label="Nghề nghiệp"
                icon={<Briefcase size={16} />}
                error={errors.occupation?.message}
              >
                <input
                  {...register('occupation')}
                  className={`${inputClass} pl-11`}
                  placeholder="Nhập nghề nghiệp"
                />
              </InputField>

              <InputField
                label="Thu nhập hàng tháng"
                error={errors.monthlyIncome?.message}
              >
                <input
                  {...register('monthlyIncome')}
                  className={inputClass}
                  placeholder="Ví dụ: Trên 20 triệu"
                />
              </InputField>

              <div className="md:col-span-2">
                <InputField
                  label="Địa chỉ thường trú"
                  icon={<MapPin size={16} />}
                  error={errors.address?.message}
                >
                  <input
                    {...register('address')}
                    className={`${inputClass} pl-11`}
                    placeholder="Nhập địa chỉ thường trú"
                  />
                </InputField>
              </div>

              <div className="md:col-span-2">
                <p className={labelClass}>Lý do nhận nuôi</p>
                <textarea
                  {...register('motivation')}
                  rows={4}
                  className={textareaClass}
                  placeholder="Hãy chia sẻ lý do bạn mong muốn nhận nuôi trẻ..."
                />
              </div>

              <div className="md:col-span-2">
                <p className={labelClass}>Mong muốn về trẻ</p>
                <textarea
                  {...register('expectedChild')}
                  rows={4}
                  className={textareaClass}
                  placeholder="Nhập mong muốn về độ tuổi, giới tính, tình trạng sức khỏe của trẻ..."
                />
              </div>
            </div>
          </div>

          <UploadSection
            files={files}
            setFiles={setFiles}
            oldDocuments={currentRequest?.documents || currentRequest?.formData?.documents || {}}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              loading={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2F80ED] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(47,128,237,0.22)] transition hover:brightness-105"
            >
              <Save size={16} />
              Lưu thay đổi
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#DCE8F7] bg-[#F3F8FF] px-5 text-sm font-semibold text-[#5C7396] transition hover:bg-[#EAF3FF]"
            >
              <ArrowLeft size={16} />
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}