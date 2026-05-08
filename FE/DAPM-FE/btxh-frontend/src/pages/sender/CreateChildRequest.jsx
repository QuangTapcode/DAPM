import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import family from '../../assets/sender.jpg';

const SENDER_TYPES = [
  { code: 'CME', label: 'Cha hoặc mẹ ruột', requireDocs: true },
  { code: 'NTH', label: 'Người thân', requireDocs: true },
  { code: 'CQDP', label: 'Cơ quan địa phương', requireDocs: false },
];

const BASE_DOCS = [
  {
    key: 'birthCert',
    label: 'Giấy khai sinh của trẻ',
    baseRequired: true,
    hint: 'PDF, JPG, PNG — tối đa 5MB',
  },
  {
    key: 'senderID',
    label: 'CCCD/CMND người gửi',
    baseRequired: true,
    hint: 'PDF, JPG, PNG — tối đa 5MB',
  },
  {
    key: 'healthCert',
    label: 'Giấy xác nhận tình trạng sức khỏe',
    baseRequired: false,
    hint: 'PDF, JPG, PNG — tối đa 5MB',
  },
  {
    key: 'otherDocs',
    label: 'Giấy tờ khác (nếu có)',
    baseRequired: false,
    hint: 'PDF, JPG, PNG — tối đa 5MB',
  },
];

/**
 * Dữ liệu mẫu để lọc xã/phường theo tỉnh.
 * Khi nối dữ liệu thật, thay phần này bằng API hoặc danh mục địa giới hành chính.
 */
const LOCATION_DATA = [
  {
    provinceCode: '48',
    provinceName: 'Thành phố Đà Nẵng',
    wards: [
      { wardCode: '20194', wardName: 'Phường Hòa Khánh Bắc' },
      { wardCode: '20197', wardName: 'Phường Hòa Khánh Nam' },
      { wardCode: '20200', wardName: 'Phường Hòa Minh' },
      { wardCode: '20203', wardName: 'Phường Hòa Hiệp Nam' },
    ],
  },
  {
    provinceCode: '01',
    provinceName: 'Thành phố Hà Nội',
    wards: [
      { wardCode: '00001', wardName: 'Phường Phúc Xá' },
      { wardCode: '00004', wardName: 'Phường Trúc Bạch' },
      { wardCode: '00006', wardName: 'Phường Vĩnh Phúc' },
      { wardCode: '00007', wardName: 'Phường Cống Vị' },
    ],
  },
  {
    provinceCode: '79',
    provinceName: 'Thành phố Hồ Chí Minh',
    wards: [
      { wardCode: '26734', wardName: 'Phường Bến Nghé' },
      { wardCode: '26737', wardName: 'Phường Bến Thành' },
      { wardCode: '26740', wardName: 'Phường Cầu Kho' },
      { wardCode: '26743', wardName: 'Phường Cầu Ông Lãnh' },
    ],
  },
];

const labelClass =
  'block text-[13px] font-semibold uppercase tracking-wide text-[#44474E] mb-2';

const inputClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const textareaClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition resize-none focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const errorClass = 'mt-1 text-xs text-red-500';

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function PageHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="!text-[36px] font-bold !text-[#0D47A1]">
        Đăng ký gửi trẻ
      </h1>

      <p className="mt-2 w-full max-w-[720px] text-[16px] leading-7 !text-[#44474E] text-center">
        Mỗi đứa trẻ đều xứng đáng có một điểm tựa vững chắc để trưởng thành. Cảm ơn bạn đã kết nối để chúng tôi được trở thành mái nhà của các em.
      </p>
    </div>
  );
}

function ApplicantSection({
  register,
  errors,
  senderProvinceOptions,
  senderWardOptions,
  senderTypeCode,
}) {
  const selectedSenderType = SENDER_TYPES.find(
    (item) => item.code === senderTypeCode
  );

  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Thông tin người gửi trẻ
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Họ và tên người gửi</label>
          <input
            {...register('senderName', {
              required: 'Vui lòng nhập họ tên.',
            })}
            className={inputClass}
            placeholder="Nguyễn Văn A"
          />
          <FieldError message={errors.senderName?.message} />
        </div>

        <div>
          <label className={labelClass}>Loại người gửi trẻ</label>
          <select
            {...register('senderTypeCode', {
              required: 'Vui lòng chọn loại người gửi.',
            })}
            className={inputClass}
          >
            <option value="">Chọn loại người gửi</option>
            {SENDER_TYPES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.senderTypeCode?.message} />
        </div>

        <div>
          <label className={labelClass}>Số CCCD</label>
          <input
            {...register('senderNationalId', {
              required: 'Vui lòng nhập số CCCD.',
              pattern: {
                value: /^\d{9,12}$/,
                message: 'Số CCCD không hợp lệ.',
              },
            })}
            className={inputClass}
            placeholder="012345678901"
            maxLength={12}
          />
          <FieldError message={errors.senderNationalId?.message} />
        </div>

        <div>
          <label className={labelClass}>Số điện thoại</label>
          <input
            {...register('senderPhone', {
              required: 'Vui lòng nhập số điện thoại.',
              pattern: {
                value: /^0\d{9}$/,
                message: 'Số điện thoại không hợp lệ.',
              },
            })}
            className={inputClass}
            placeholder="0901234567"
            maxLength={10}
          />
          <FieldError message={errors.senderPhone?.message} />
        </div>

        <div>
          <label className={labelClass}>Tỉnh / Thành phố</label>
          <select
            {...register('senderProvinceCode', {
              required: 'Vui lòng chọn tỉnh/thành.',
            })}
            className={inputClass}
          >
            <option value="">Chọn tỉnh/thành</option>
            {senderProvinceOptions.map((item) => (
              <option key={item.provinceCode} value={item.provinceCode}>
                {item.provinceName}
              </option>
            ))}
          </select>
          <FieldError message={errors.senderProvinceCode?.message} />
        </div>

        <div>
          <label className={labelClass}>Xã / Phường</label>
          <select
            {...register('senderWardCode', {
              required: 'Vui lòng chọn xã/phường.',
            })}
            className={inputClass}
          >
            <option value="">Chọn xã/phường</option>
            {senderWardOptions.map((item) => (
              <option key={item.wardCode} value={item.wardCode}>
                {item.wardName}
              </option>
            ))}
          </select>
          <FieldError message={errors.senderWardCode?.message} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Địa chỉ cụ thể</label>
        <input
          {...register('senderAddressDetail', {
            required: 'Vui lòng nhập địa chỉ cụ thể.',
          })}
          className={inputClass}
          placeholder="Số nhà, đường/thôn/xóm, tổ dân phố..."
        />
        <FieldError message={errors.senderAddressDetail?.message} />
      </div>

      {selectedSenderType?.code === 'CQDP' && (
        <div className="mt-4 rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-3">
          <p className="text-sm font-medium text-[#1d4ed8]">
            Bạn đang chọn loại người gửi là <b>Cơ quan địa phương</b>. Hệ thống sẽ
            không bắt buộc tải lên giấy tờ khi nộp hồ sơ.
          </p>
        </div>
      )}
    </section>
  );
}

function ChildSection({
  register,
  errors,
  childProvinceOptions,
  childWardOptions,
}) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Thông tin trẻ em
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Họ và tên trẻ</label>
          <input
            {...register('childName', {
              required: 'Vui lòng nhập tên trẻ.',
            })}
            className={inputClass}
            placeholder="Nguyễn Thị B"
          />
          <FieldError message={errors.childName?.message} />
        </div>

        <div>
          <label className={labelClass}>Ngày sinh</label>
          <input
            type="date"
            {...register('childDob', {
              required: 'Vui lòng chọn ngày sinh.',
            })}
            className={inputClass}
          />
          <FieldError message={errors.childDob?.message} />
        </div>

        <div>
          <label className={labelClass}>Giới tính</label>
          <select {...register('childGender')} className={inputClass}>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Dân tộc</label>
          <input
            {...register('ethnicity')}
            className={inputClass}
            placeholder="Kinh, Tày, Nùng..."
          />
        </div>

        <div>
          <label className={labelClass}>Tỉnh / Thành phố</label>
          <select
            {...register('childProvinceCode', {
              required: 'Vui lòng chọn tỉnh/thành.',
            })}
            className={inputClass}
          >
            <option value="">Chọn tỉnh/thành</option>
            {childProvinceOptions.map((item) => (
              <option key={item.provinceCode} value={item.provinceCode}>
                {item.provinceName}
              </option>
            ))}
          </select>
          <FieldError message={errors.childProvinceCode?.message} />
        </div>

        <div>
          <label className={labelClass}>Xã / Phường</label>
          <select
            {...register('childWardCode', {
              required: 'Vui lòng chọn xã/phường.',
            })}
            className={inputClass}
          >
            <option value="">Chọn xã/phường</option>
            {childWardOptions.map((item) => (
              <option key={item.wardCode} value={item.wardCode}>
                {item.wardName}
              </option>
            ))}
          </select>
          <FieldError message={errors.childWardCode?.message} />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Địa chỉ cụ thể của trẻ</label>
        <input
          {...register('childAddressDetail', {
            required: 'Vui lòng nhập địa chỉ cụ thể của trẻ.',
          })}
          className={inputClass}
          placeholder="Số nhà, đường/thôn/xóm, tổ dân phố..."
        />
        <FieldError message={errors.childAddressDetail?.message} />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Tình trạng sức khỏe hiện tại</label>
        <textarea
          {...register('healthStatus')}
          rows={4}
          className={textareaClass}
          placeholder="Mô tả tình trạng sức khỏe, bệnh lý hoặc lưu ý đặc biệt nếu có..."
        />
      </div>
    </section>
  );
}

function ReasonSection({ register, errors }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Lý do gửi trẻ
        </h2>
      </div>

      <div>
        <label className={labelClass}>Lý do chính</label>
        <select
          {...register('reason', {
            required: 'Vui lòng chọn lý do.',
          })}
          className={inputClass}
        >
          <option value="">Chọn lý do chính</option>
          <option value="mo_coi">Trẻ mồ côi (cha mẹ qua đời)</option>
          <option value="kinh_te">Hoàn cảnh kinh tế khó khăn</option>
          <option value="suc_khoe">Cha / Mẹ bệnh nặng, không thể chăm sóc</option>
          <option value="xa_hoi">Hoàn cảnh xã hội đặc biệt</option>
          <option value="khac">Lý do khác</option>
        </select>
        <FieldError message={errors.reason?.message} />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Mô tả chi tiết hoàn cảnh</label>
        <textarea
          {...register('reasonDetail', {
            required: 'Vui lòng mô tả chi tiết.',
            minLength: {
              value: 30,
              message: 'Tối thiểu 30 ký tự.',
            },
          })}
          rows={6}
          className={textareaClass}
          placeholder="Mô tả chi tiết hoàn cảnh gia đình và lý do cần gửi trẻ vào trung tâm bảo trợ..."
        />
        <FieldError message={errors.reasonDetail?.message} />
      </div>
    </section>
  );
}

function DocumentItem({ doc, file, onChange }) {
  const inputRef = useRef();

  return (
    <div className="rounded-xl border border-[#e6edf7] bg-[#f7fbff] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#334155]">{doc.label}</p>
            {doc.required && (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                Bắt buộc
              </span>
            )}
          </div>

          <p
            className={`mt-1 text-xs ${file ? 'text-emerald-600' : 'text-[#7f8c9b]'
              }`}
          >
            {file ? file.name : doc.hint}
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-xl bg-[#eaf4ff] px-4 py-2 text-sm font-semibold text-[#1f5fbf] transition hover:bg-[#dbeafe]"
        >
          {file ? 'Đổi file' : 'Tải lên'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function DocumentsSection({ docs, setDocs, docsConfig }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Tài liệu giấy tờ cần thiết
        </h2>
      </div>

      <div className="space-y-4">
        {docsConfig.map((doc) => (
          <DocumentItem
            key={doc.key}
            doc={doc}
            file={docs[doc.key]}
            onChange={(newFile) =>
              setDocs((prev) => ({
                ...prev,
                [doc.key]: newFile,
              }))
            }
          />
        ))}
      </div>
    </section>
  );
}

function NotesCard() {
  const notes = [
    'Mọi thông tin cung cấp phải chính xác và có thể đối chiếu khi cần.',
    'Địa chỉ được nhập theo tỉnh/thành, sau đó chọn xã/phường tương ứng để đảm bảo đúng mã địa giới.',
    'Thời gian xem xét dự kiến từ 7–14 ngày làm việc.',
  ];

  return (
    <section className="h-full rounded-2xl bg-[#eaf4ff] border border-[#dbeafe] p-5">
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
function SubmitCard({ isSubmitting, requiredMissing, onCancel }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 min-h-[110px] flex flex-col justify-center">
      <button
        type="submit"
        disabled={isSubmitting || requiredMissing > 0}
        className="w-full rounded-xl bg-[#1976D2] hover:bg-[#1f5fbf] text-white text-sm font-semibold py-3 px-4 transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
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
function RightTopPanel({ isSubmitting, requiredMissing, onCancel }) {
  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-5">
      <NotesCard />

      <SubmitCard
        isSubmitting={isSubmitting}
        requiredMissing={requiredMissing}
        onCancel={onCancel}
      />
    </div>
  );
}
function ImageCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#edf2f7] shadow-sm bg-white">
      <div className="relative h-[360px] w-full">
        <img
          src={family}
          alt="Hỗ trợ trẻ em"
          className="h-full w-full object-cover"
        />

        <p className="absolute bottom-4 left-4 right-4 text-sm italic leading-6 text-white">
          “Mỗi hồ sơ được tiếp nhận đầy đủ là một cơ hội để trẻ được chăm sóc tốt
          hơn và an toàn hơn.”
        </p>
      </div>
    </section>
  );
}
export default function CreateChildRequest() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      senderName: '',
      senderTypeCode: '',
      senderNationalId: '',
      senderPhone: '',
      senderProvinceCode: '',
      senderWardCode: '',
      senderAddressDetail: '',
      childName: '',
      childDob: '',
      childGender: 'male',
      ethnicity: '',
      childProvinceCode: '',
      childWardCode: '',
      childAddressDetail: '',
      healthStatus: '',
      reason: '',
      reasonDetail: '',
    },
  });

  const senderTypeCode = watch('senderTypeCode');
  const senderProvinceCode = watch('senderProvinceCode');
  const childProvinceCode = watch('childProvinceCode');

  const senderProvinceOptions = LOCATION_DATA;
  const childProvinceOptions = LOCATION_DATA;

  const senderWardOptions = useMemo(() => {
    const selected = LOCATION_DATA.find(
      (item) => item.provinceCode === senderProvinceCode
    );
    return selected?.wards ?? [];
  }, [senderProvinceCode]);

  const childWardOptions = useMemo(() => {
    const selected = LOCATION_DATA.find(
      (item) => item.provinceCode === childProvinceCode
    );
    return selected?.wards ?? [];
  }, [childProvinceCode]);

  useEffect(() => {
    setValue('senderWardCode', '');
  }, [senderProvinceCode, setValue]);

  useEffect(() => {
    setValue('childWardCode', '');
  }, [childProvinceCode, setValue]);

  const selectedSenderType = SENDER_TYPES.find(
    (item) => item.code === senderTypeCode
  );

  const docsConfig = useMemo(() => {
    return BASE_DOCS.map((doc) => ({
      ...doc,
      required: selectedSenderType?.requireDocs ? doc.baseRequired : false,
    }));
  }, [selectedSenderType]);

  const requiredMissing = docsConfig.filter(
    (doc) => doc.required && !docs[doc.key]
  ).length;

  const onSubmit = async (data) => {
    const payload = {
      nguoiGui: {
        hoTen: data.senderName,
        maLoaiNguoiGui: data.senderTypeCode,
        soCCCD: data.senderNationalId,
        soDienThoai: data.senderPhone,
        maXa: data.senderWardCode,
        diaChiCuThe: data.senderAddressDetail,
      },
      tre: {
        hoTen: data.childName,
        ngaySinh: data.childDob,
        gioiTinh: data.childGender,
        danToc: data.ethnicity,
        maXa: data.childWardCode,
        diaChiCuThe: data.childAddressDetail,
        tinhTrangSucKhoe: data.healthStatus,
      },
      lyDo: {
        maLyDo: data.reason,
        moTaChiTiet: data.reasonDetail,
      },
      giayTo: Object.entries(docs)
        .filter(([, file]) => !!file)
        .map(([key, file]) => ({
          loaiGiayTo: key,
          tenFile: file.name,
          kichThuoc: file.size,
        })),
    };

    console.log('Payload gửi đi:', payload);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/gui-tre/trang-thai');
  };

  return (
    <div className="w-full bg-[#f6f8fc] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-3 lg:px-4 py-8">
        <PageHeader />
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-stretch">
            {/* Hàng 1 */}
            <div className="lg:col-span-8">
              <ApplicantSection
                register={register}
                errors={errors}
                senderProvinceOptions={senderProvinceOptions}
                senderWardOptions={senderWardOptions}
                senderTypeCode={senderTypeCode}
              />
            </div>

            <div className="lg:col-span-4 h-full">
              <div className="grid h-full grid-rows-[1fr_auto] gap-5">
                <NotesCard />

                <SubmitCard
                  isSubmitting={isSubmitting}
                  requiredMissing={requiredMissing}
                  onCancel={() => navigate(-1)}
                />
              </div>
            </div>

            {/* Hàng 2 */}
            <div className="lg:col-span-8">
              <ChildSection
                register={register}
                errors={errors}
                childProvinceOptions={childProvinceOptions}
                childWardOptions={childWardOptions}
              />
            </div>

            <div className="lg:col-span-4">
              <ImageCard />
            </div>

            {/* Hàng 3 */}
            <div className="lg:col-span-8">
              <ReasonSection register={register} errors={errors} />
            </div>

            {/* Hàng 4 */}
            <div className="lg:col-span-8">
              <DocumentsSection
                docs={docs}
                setDocs={setDocs}
                docsConfig={docsConfig}
              />
            </div>

            {requiredMissing > 0 && (
              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    Còn thiếu tài liệu bắt buộc
                  </p>
                  <p className="mt-1 text-sm leading-6 text-red-600">
                    Vui lòng tải lên {requiredMissing} tài liệu bắt buộc trước khi
                    gửi hồ sơ.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}