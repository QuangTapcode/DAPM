import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import FileUpload from '../../components/common/FileUpload';
import user from '../../assets/user.png';
import document from '../../assets/document.png';
import family from '../../assets/adoption_family.jpg';

const labelClass =
  'block text-[13px] font-semibold uppercase tracking-wide text-[#44474E] mb-2';

const inputClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const textareaClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition resize-none focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const errorClass = 'mt-1 text-xs text-red-500';

const REQUIRED_FILE_KEYS = ['idCard', 'health', 'marriage', 'income'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function PageHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="!text-[36px] font-bold !text-[#0D47A1]">
        Đăng ký nhận nuôi
      </h1>

      <p className="mt-2 w-full max-w-[620px] text-[16px] leading-7 !text-[#44474E] text-center">
        Hành trình tìm mái ấm cho trẻ em cần sự chuẩn bị kỹ lưỡng và tận tâm.
        Cảm ơn bạn đã đồng hành cùng chúng tôi.
      </p>
    </div>
  );
}

function ApplicantSection({ register, errors }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <img
          src={user}
          alt="User icon"
          className="w-4 h-4 object-contain"
        />
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Thông tin người nhận nuôi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Họ và tên</label>
          <input
            {...register('adopterName', { required: 'Vui lòng nhập họ tên.' })}
            className={inputClass}
          />
          <FieldError message={errors.adopterName?.message} />
        </div>

        <div>
          <label className={labelClass}>Số điện thoại</label>
          <input
            {...register('phone', { required: 'Vui lòng nhập số điện thoại.' })}
            className={inputClass}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <label className={labelClass}>Giới tính</label>
          <select {...register('gender')} className={inputClass}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Số CCCD</label>
          <input
            {...register('nationalId', { required: 'Vui lòng nhập CCCD.' })}
            className={inputClass}
          />
          <FieldError message={errors.nationalId?.message} />
        </div>

        <div>
          <label className={labelClass}>Ngày sinh</label>
          <input
            type="date"
            {...register('birthDate', { required: 'Vui lòng chọn ngày sinh.' })}
            className={inputClass}
          />
          <FieldError message={errors.birthDate?.message} />
        </div>

        <div>
          <label className={labelClass}>Địa chỉ thường trú</label>
          <input
            {...register('address', { required: 'Vui lòng nhập địa chỉ.' })}
            className={inputClass}
          />
          <FieldError message={errors.address?.message} />
        </div>

        <div>
          <label className={labelClass}>Nghề nghiệp</label>
          <input {...register('occupation')} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Thu nhập hàng tháng</label>
          <input
            type="number" min="0" step="100000" placeholder="Ví dụ: 15000000"
            {...register('monthlyIncome', {
              required: 'Vui lòng nhập thu nhập hàng tháng',
              min: { value: 0, message: 'Thu nhập không được nhỏ hơn 0', },
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Nhập số tiền theo VNĐ/tháng, ví dụ 15000000 tương ứng 15 triệu đồng.</p>
          {errors.monthlyIncome && (
            <p className="mt-1 text-sm text-red-500">{errors.monthlyIncome.message}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Lý do nhận nuôi</label>
        <textarea
          {...register('motivation', {
            required: 'Vui lòng nhập lý do nhận nuôi.',
          })}
          rows={4}
          className={textareaClass}
          placeholder="Hãy chia sẻ lý do bạn mong muốn nhận nuôi trẻ..."
        />
        <FieldError message={errors.motivation?.message} />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Mong muốn về trẻ</label>
        <textarea
          {...register('expectedChild')}
          rows={4}
          className={textareaClass}
          placeholder="Nhập mong muốn về độ tuổi, giới tính, tình trạng sức khỏe của trẻ..."
        />
      </div>
    </section>
  );
}

function DocumentsSection({ files, setFiles, showMissingDocsWarning }) {
  const titleClass =
    'text-[11px] font-semibold uppercase tracking-wide text-[#7f8c9b] mb-3';

  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <img
          src={document}
          alt="Document icon"
          className="w-4 h-4 object-contain"
        />
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Tài liệu giấy tờ cần thiết
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className={titleClass}>
            Ảnh CCCD <span className="text-red-500">*</span>
          </p>
          <FileUpload
            label="Tải ảnh trước & sau"
            accept=".pdf,.jpg,.jpeg,.png"
            files={files.idCard}
            onChange={(newFiles) =>
              setFiles((prev) => ({ ...prev, idCard: newFiles }))
            }
          />
        </div>

        <div>
          <p className={titleClass}>
            Giấy khám sức khỏe <span className="text-red-500">*</span>
          </p>
          <FileUpload
            label="Hồ sơ sức khỏe"
            accept=".pdf,.jpg,.jpeg,.png"
            files={files.health}
            onChange={(newFiles) =>
              setFiles((prev) => ({ ...prev, health: newFiles }))
            }
          />
        </div>

        <div>
          <p className={titleClass}>
            Tình trạng hôn nhân <span className="text-red-500">*</span>
          </p>
          <FileUpload
            label="Giấy xác nhận"
            accept=".pdf,.jpg,.jpeg,.png"
            files={files.marriage}
            onChange={(newFiles) =>
              setFiles((prev) => ({ ...prev, marriage: newFiles }))
            }
          />
        </div>

        <div className="md:col-span-1">
          <p className={titleClass}>
            Minh chứng thu nhập <span className="text-red-500">*</span>
          </p>
          <FileUpload
            label="Chọn file PDF/JPG"
            accept=".pdf,.jpg,.jpeg,.png"
            files={files.income}
            onChange={(newFiles) =>
              setFiles((prev) => ({ ...prev, income: newFiles }))
            }
          />
        </div>
      </div>

      {showMissingDocsWarning && (
        <p className="mt-4 text-sm text-red-500 leading-6">
          Vui lòng tải đầy đủ các giấy tờ bắt buộc trước khi gửi hồ sơ.
        </p>
      )}
    </section>
  );
}

function NotesCard() {
  const notes = [
    'Mọi thông tin cung cấp phải chính xác 100% theo quy định pháp luật.',
    'Hồ sơ của bạn được bảo mật tuyệt đối tại hệ thống Sanctuary.',
    'Thời gian xem xét dự kiến từ 7–14 ngày làm việc.',
  ];

  return (
    <section className="rounded-2xl bg-[#eaf4ff] border border-[#dbeafe] p-5">
      <h3 className="text-[15px] font-bold text-[#1f5fbf] mb-4">
        Lưu ý quan trọng
      </h3>

      <ul className="space-y-3">
        {notes.map((note) => (
          <li
            key={note}
            className="flex items-start gap-3 text-sm text-[#5b6b7c] leading-6"
          >
            <span className="mt-1 text-[#3b82f6]">ⓘ</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SubmitCard({ isSubmitting, onCancel }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5">
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#1976D2] hover:bg-[#1f5fbf] text-white text-sm font-semibold py-3 px-4 transition disabled:opacity-70"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Gửi đơn đăng ký'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 w-full text-sm font-medium text-[#94a3b8] hover:text-[#64748b] transition"
      >
        Hủy đơn đăng ký
      </button>
    </section>
  );
}

function ImageCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#edf2f7] shadow-sm bg-white">
      <div className="relative aspect-[4/3] w-full">
        <img
          src={family}
          alt="Gia đình nhận nuôi"
          className="h-full w-full object-cover"
        />

        <p className="absolute bottom-4 left-4 right-4 text-sm italic leading-6 text-white">
          “Mỗi đứa trẻ đều xứng đáng có một gia đình để yêu thương và bảo vệ.”
        </p>
      </div>
    </section>
  );
}

function buildRequestSnapshot(data, files, response) {
  return {
    requestId: response?.data?.id || response?.data?.requestId || '',
    childId: data.childId || '',
    adopterName: data.adopterName || '',
    phone: data.phone || '',
    gender: data.gender || 'Nam',
    nationalId: data.nationalId || '',
    birthDate: data.birthDate || '',
    address: data.address || '',
    occupation: data.occupation || '',
    monthlyIncome: data.monthlyIncome || '',
    motivation: data.motivation || '',
    expectedChild: data.expectedChild || '',
    status: 'created',
    statusLabel: 'Tạo đơn',
    createdAt: new Date().toISOString(),
    documents: {
      idCard: files.idCard.map((file) => file.name),
      health: files.health.map((file) => file.name),
      marriage: files.marriage.map((file) => file.name),
      income: files.income.map((file) => file.name),
    },
  };
}

export default function CreateAdoptionRequest() {
  const [searchParams] = useSearchParams();
  const [files, setFiles] = useState({
    idCard: [],
    health: [],
    marriage: [],
    income: [],
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const navigate = useNavigate();

  const missingRequiredDocs = REQUIRED_FILE_KEYS.filter(
    (key) => !files[key] || files[key].length === 0
  );

  const canSubmit = missingRequiredDocs.length === 0;
  const showMissingDocsWarning = submitAttempted && !canSubmit;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      childId: searchParams.get('childId') || '',
      adopterName: user?.fullName || '',
      phone: user?.phone || '',
      gender: user?.gender || 'Nam',
      nationalId: user?.nationalId || '',
      birthDate: user?.dateOfBirth || user?.birthDate || '',
      address: [
        user?.addressDetail,
        user?.wardName,
        user?.provinceName,
      ]
        .filter(Boolean)
        .join(', '),
      occupation: user?.occupation || '',
      monthlyIncome: user?.monthlyIncome || '',
      motivation: '',
      expectedChild: '',
    },
  });

  const onSubmit = async (data) => {
    if (!canSubmit) {
      setSubmitAttempted(true);
      return;
    }

    try {
      setSubmitAttempted(false);

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });

      [
        ...files.idCard,
        ...files.health,
        ...files.marriage,
        ...files.income,
      ].forEach((file) => formData.append('documents', file));

      const response = await adoptionApi.create(formData);

      const requestSnapshot = buildRequestSnapshot(data, files, response);

      sessionStorage.setItem(
        'adoption-request-status',
        JSON.stringify(requestSnapshot)
      );

      navigate('/nhan-nuoi/trang-thai', {
        state: { request: requestSnapshot },
      });
    } catch (error) {
      console.error('Lỗi tạo đơn nhận nuôi:', error);
    }
  };

  return (
    <div className="w-full bg-[#f6f8fc] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-3 lg:px-4 py-8">
        <PageHeader />
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-5">
              <ApplicantSection register={register} errors={errors} />
              <DocumentsSection
                files={files}
                setFiles={setFiles}
                showMissingDocsWarning={showMissingDocsWarning}
              />
            </div>

            <div className="lg:col-span-4 space-y-5">
              <NotesCard />
              <SubmitCard
                isSubmitting={isSubmitting}
                onCancel={() => navigate(-1)}
              />
              <ImageCard />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}