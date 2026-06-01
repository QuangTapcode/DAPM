import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import CustomSelect from '../../components/common/CustomSelect';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../../api/authApi';
import adoptionApi from '../../api/adoptionApi';
import lookupApi from '../../api/lookupApi';
import FileUpload from '../../components/common/FileUpload';
import userIcon from '../../assets/user.png';
import documentIcon from '../../assets/document.png';
import family from '../../assets/adoption_family.jpg';

const labelClass =
  'block text-[13px] font-semibold uppercase tracking-wide text-[#44474E] mb-2';

const inputClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const readOnlyInputClass =
  'w-full cursor-not-allowed rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none';

const textareaClass =
  'w-full rounded-xl border border-[#e6edf7] bg-[#f7fbff] px-4 py-3 text-sm text-[#334155] outline-none transition resize-none focus:border-[#93c5fd] focus:ring-2 focus:ring-[#bfdbfe]';

const errorClass = 'mt-1 text-xs text-red-500';

const marriageOptions = [
  { value: 'Độc thân', label: 'Độc thân' },
  { value: 'Đã kết hôn', label: 'Đã kết hôn' },
  { value: 'Ly hôn', label: 'Ly hôn' },
  { value: 'Góa', label: 'Góa' },
];

const housingOptions = [
  { value: 'Nhà sở hữu', label: 'Nhà sở hữu' },
  { value: 'Chung cư sở hữu', label: 'Chung cư sở hữu' },
  { value: 'Nhà thuê dài hạn', label: 'Nhà thuê dài hạn' },
  { value: 'Ở cùng gia đình', label: 'Ở cùng gia đình' },
];

const healthOptions = [
  { value: 'true', label: 'Đạt yêu cầu' },
  { value: 'false', label: 'Không đạt yêu cầu' },
];

const relationshipOptions = [
  { value: 'Không', label: 'Không' },
  { value: 'Người thân', label: 'Người thân' },
];

const childGenderOptions = [
  { value: '', label: 'Không yêu cầu' },
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
];

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

function formatDate(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.split('T')[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
}

function formatDisplayDate(value) {
  const dateValue = formatDate(value);

  if (!dateValue) return '';

  const [year, month, day] = dateValue.split('-');

  return `${day}/${month}/${year}`;
}

function buildAddress(profile) {
  return [profile?.diaChiCuThe, profile?.tenPhuongXa, profile?.tenTinhTP]
    .filter(Boolean)
    .join(', ');
}

function ReadOnlyField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <input value={value || ''} readOnly className={readOnlyInputClass} />
    </div>
  );
}

function ApplicantSection({ profile }) {
  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-start gap-2 mb-5">
        <img
          src={userIcon}
          alt="User icon"
          className="w-4 h-4 object-contain mt-1"
        />

        <div>
          <h2 className="text-[15px] font-bold !text-[#0D47A1]">
            Thông tin người nhận nuôi
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Thông tin này lấy từ hồ sơ tài khoản và không thể chỉnh sửa tại đơn nhận nuôi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadOnlyField label="Họ và tên" value={profile?.fullName} />
        <ReadOnlyField label="Số điện thoại" value={profile?.phone} />
        <ReadOnlyField label="Giới tính" value={profile?.gioiTinh} />
        <ReadOnlyField label="Số CCCD" value={profile?.cccd} />
        <ReadOnlyField
          label="Ngày sinh"
          value={formatDisplayDate(profile?.ngaySinh)}
        />
        <ReadOnlyField label="Email" value={profile?.email} />
        <ReadOnlyField
          label="Địa chỉ thường trú"
          value={buildAddress(profile)}
          className="md:col-span-2"
        />
      </div>
    </section>
  );
}

function AdoptionInfoSection({ register, errors, watch, setValue }) {
  const tinhTrangHonNhan = watch('tinhTrangHonNhan');
  const loaiNoiO = watch('loaiNoiO');
  const sucKhoeDatYeuCau = watch('sucKhoeDatYeuCau');
  const quanHeVoiTre = watch('quanHeVoiTre');

  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0D47A1] text-xs">
          ✓
        </span>
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Thông tin điều kiện nhận nuôi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Thu nhập hàng tháng</label>
          <input
            type="number"
            min="0"
            step="100000"
            placeholder="Ví dụ: 15000000"
            {...register('thuNhapHangThang', {
              required: 'Vui lòng nhập thu nhập hàng tháng.',
              min: {
                value: 0,
                message: 'Thu nhập không được nhỏ hơn 0.',
              },
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            Nhập số tiền theo VNĐ/tháng.
          </p>
          <FieldError message={errors.thuNhapHangThang?.message} />
        </div>

        <div>
          <label className={labelClass}>Số con đang nuôi</label>
          <input
            type="number"
            min="0"
            {...register('soConDangNuoi', {
              required: 'Vui lòng nhập số con đang nuôi.',
              min: {
                value: 0,
                message: 'Số con không được nhỏ hơn 0.',
              },
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          <FieldError message={errors.soConDangNuoi?.message} />
        </div>

        <div>
          <label className={labelClass}>Tình trạng hôn nhân</label>
          <input
            type="hidden"
            {...register('tinhTrangHonNhan', {
              required: 'Vui lòng chọn tình trạng hôn nhân.',
            })}
          />

          <CustomSelect
            value={tinhTrangHonNhan}
            options={marriageOptions}
            placeholder="Chọn tình trạng hôn nhân"
            error={!!errors.tinhTrangHonNhan}
            onChange={(value) => {
              setValue('tinhTrangHonNhan', value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          <FieldError message={errors.tinhTrangHonNhan?.message} />
        </div>

        <div>
          <label className={labelClass}>Loại nơi ở</label>
          <input
            type="hidden"
            {...register('loaiNoiO', {
              required: 'Vui lòng chọn loại nơi ở.',
            })}
          />

          <CustomSelect
            value={loaiNoiO}
            options={housingOptions}
            placeholder="Chọn loại nơi ở"
            error={!!errors.loaiNoiO}
            onChange={(value) => {
              setValue('loaiNoiO', value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          <FieldError message={errors.loaiNoiO?.message} />
        </div>

        <div>
          <label className={labelClass}>Sức khỏe đạt yêu cầu</label>
          <input
            type="hidden"
            {...register('sucKhoeDatYeuCau', {
              required: 'Vui lòng chọn tình trạng sức khỏe.',
            })}
          />

          <CustomSelect
            value={String(sucKhoeDatYeuCau)}
            options={healthOptions}
            placeholder="Chọn tình trạng sức khỏe"
            error={!!errors.sucKhoeDatYeuCau}
            onChange={(value) => {
              setValue('sucKhoeDatYeuCau', value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          <FieldError message={errors.sucKhoeDatYeuCau?.message} />
        </div>

        <div>
          <label className={labelClass}>Quan hệ với trẻ</label>
          <input
            type="hidden"
            {...register('quanHeVoiTre', {
              required: 'Vui lòng chọn quan hệ với trẻ.',
            })}
          />

          <CustomSelect
            value={quanHeVoiTre}
            options={relationshipOptions}
            placeholder="Chọn quan hệ"
            error={!!errors.quanHeVoiTre}
            onChange={(value) => {
              setValue('quanHeVoiTre', value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />

          <FieldError message={errors.quanHeVoiTre?.message} />
        </div>
      </div>
    </section>
  );
}

function ExpectationSection({ register, errors, watch, setValue }) {
  const mongMuonGioiTinh = watch('mongMuonGioiTinh');

  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf4ff] text-[#0D47A1] text-xs">
          ♥
        </span>
        <h2 className="text-[15px] font-bold !text-[#0D47A1]">
          Mong muốn nhận nuôi
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Mong muốn tuổi tối đa</label>
          <input
            type="number"
            min="0"
            placeholder="Ví dụ: 6"
            {...register('mongMuonTuoiToiDa', {
              min: {
                value: 0,
                message: 'Tuổi tối đa không được nhỏ hơn 0.',
              },
              valueAsNumber: true,
            })}
            className={inputClass}
          />
          <FieldError message={errors.mongMuonTuoiToiDa?.message} />
        </div>

        <div>
          <label className={labelClass}>Mong muốn giới tính</label>
          <input type="hidden" {...register('mongMuonGioiTinh')} />

          <CustomSelect
            value={mongMuonGioiTinh}
            options={childGenderOptions}
            placeholder="Không yêu cầu"
            onChange={(value) => {
              setValue('mongMuonGioiTinh', value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Lý do nhận nuôi</label>
          <textarea
            {...register('lyDoNhanNuoi', {
              required: 'Vui lòng nhập lý do nhận nuôi.',
            })}
            rows={4}
            className={textareaClass}
            placeholder="Hãy chia sẻ lý do bạn mong muốn nhận nuôi trẻ..."
          />
          <FieldError message={errors.lyDoNhanNuoi?.message} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Ghi chú</label>
          <textarea
            {...register('ghiChu')}
            rows={3}
            className={textareaClass}
            placeholder="Nhập ghi chú nếu có..."
          />
        </div>
      </div>
    </section>
  );
}

function isRelationshipProofDocument(doc) {
  const code = String(doc.maLoaiGiayTo || '').trim().toUpperCase();
  const name = String(doc.tenLoaiGiayTo || '').toLowerCase();

  return (
    code === 'GT0005' ||
    name.includes('quan hệ') ||
    name.includes('người thân')
  );
}

function isDocumentRequired(doc, formValues) {
  if (doc.batBuoc) return true;

  if (
    formValues.quanHeVoiTre === 'Người thân' &&
    isRelationshipProofDocument(doc)
  ) {
    return true;
  }

  return false;
}

function DocumentsSection({
  documentTypes,
  files,
  setFiles,
  formValues,
  missingDocuments,
  submitAttempted,
}) {
  const titleClass =
    'text-[11px] font-semibold uppercase tracking-wide text-[#7f8c9b] mb-3';

  return (
    <section className="rounded-2xl bg-white border border-[#edf2f7] shadow-sm p-5 lg:p-6">
      <div className="flex items-start gap-2 mb-5">
        <img
          src={documentIcon}
          alt="Document icon"
          className="w-4 h-4 object-contain mt-1"
        />

        <div>
          <h2 className="text-[15px] font-bold !text-[#0D47A1]">
            Tài liệu giấy tờ cần thiết
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Danh sách giấy tờ được lấy từ hệ thống. Giấy tờ có dấu * là bắt buộc.
          </p>
        </div>
      </div>

      {documentTypes.length === 0 ? (
        <p className="text-sm text-slate-500">
          Chưa có danh mục giấy tờ nhận nuôi.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documentTypes.map((doc) => {
            const required = isDocumentRequired(doc, formValues);
            const fileList = files[doc.maLoaiGiayTo] || [];
            const missing = missingDocuments.some(
              (item) => item.maLoaiGiayTo === doc.maLoaiGiayTo
            );

            return (
              <div
                key={doc.maLoaiGiayTo}
                className={[
                  'rounded-2xl border p-4 transition',
                  submitAttempted && missing
                    ? 'border-red-200 bg-red-50'
                    : 'border-[#edf2f7] bg-[#f7fbff]',
                ].join(' ')}
              >
                <p className={titleClass}>
                  {doc.tenLoaiGiayTo}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </p>

                {doc.moTa && (
                  <p className="mb-3 text-xs leading-5 text-slate-500">
                    {doc.moTa}
                  </p>
                )}

                <FileUpload
                  label="Chọn file PDF/JPG"
                  accept=".pdf,.jpg,.jpeg,.png"
                  files={fileList}
                  onChange={(newFiles) =>
                    setFiles((prev) => ({
                      ...prev,
                      [doc.maLoaiGiayTo]: newFiles,
                    }))
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {submitAttempted && missingDocuments.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-600">
            Vui lòng tải đầy đủ các giấy tờ bắt buộc:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
            {missingDocuments.map((doc) => (
              <li key={doc.maLoaiGiayTo}>{doc.tenLoaiGiayTo}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function NotesCard() {
  const notes = [
    'Mọi thông tin cung cấp phải chính xác 100% theo quy định pháp luật.',
    'Người đứng tên nhận nuôi phải là chủ tài khoản đang đăng nhập.',
    'Thời gian xem xét dự kiến từ 7–14 ngày làm việc.',
  ];

  return (
    <section className="rounded-2xl bg-[#eaf4ff] border border-[#dbeafe] p-5">
      <h3 className="text-[15px] font-bold text-[#0a3880] mb-4">
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
        className="w-full rounded-xl bg-[#0D47A1] hover:bg-[#0a3880] text-white text-sm font-semibold py-3 px-4 transition disabled:opacity-70"
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

function buildRequestSnapshot(data, profile, files, response) {
  return {
    requestId:
      response?.data?.maYeuCauNhan ||
      response?.data?.id ||
      response?.data?.requestId ||
      '',
    maYeuCauNhan: response?.data?.maYeuCauNhan || response?.data?.id || '',
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    cccd: profile?.cccd || '',
    status: response?.data?.trangThai || response?.data?.status || '',
    statusLabel: response?.data?.trangThai || response?.data?.status || '',
    createdAt: new Date().toISOString(),
    payload: data,
    documents: Object.entries(files).reduce((result, [maLoaiGiayTo, fileList]) => {
      result[maLoaiGiayTo] = (fileList || []).map((file) => file.name);
      return result;
    }, {}),
  };
}

export default function CreateAdoptionRequest() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      childId: searchParams.get('childId') || '',
      thuNhapHangThang: '',
      soConDangNuoi: 0,
      tinhTrangHonNhan: '',
      loaiNoiO: '',
      sucKhoeDatYeuCau: 'true',
      quanHeVoiTre: '',
      lyDoNhanNuoi: '',
      mongMuonTuoiToiDa: '',
      mongMuonGioiTinh: '',
      ghiChu: '',
    },
  });

  const formValues = watch();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, documentTypeRes] = await Promise.all([
          authApi.getProfile(),
          lookupApi.getGiayToBatBuocNhanNuoi(),
        ]);

        setProfile(profileRes);
        setDocumentTypes(Array.isArray(documentTypeRes) ? documentTypeRes : (documentTypeRes?.items || []));
      } catch (error) {
        console.error('Lỗi tải dữ liệu tạo đơn nhận nuôi:', error);
        alert(error?.message || 'Không thể tải dữ liệu tạo đơn');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const missingDocuments = useMemo(() => {
    return documentTypes.filter((doc) => {
      const required = isDocumentRequired(doc, formValues);
      const uploadedFiles = files[doc.maLoaiGiayTo] || [];

      return required && uploadedFiles.length === 0;
    });
  }, [documentTypes, formValues, files]);

  const buildSubmitFormData = (data) => {
    const formData = new FormData();

    formData.append('thuNhapHangThang', Number(data.thuNhapHangThang));
    formData.append('soConDangNuoi', Number(data.soConDangNuoi));
    formData.append('tinhTrangHonNhan', data.tinhTrangHonNhan);
    formData.append('loaiNoiO', data.loaiNoiO);
    formData.append(
      'sucKhoeDatYeuCau',
      data.sucKhoeDatYeuCau === true || data.sucKhoeDatYeuCau === 'true'
    );
    formData.append('quanHeVoiTre', data.quanHeVoiTre);
    formData.append('lyDoNhanNuoi', data.lyDoNhanNuoi || '');
    formData.append('ghiChu', data.ghiChu || '');

    if (data.mongMuonTuoiToiDa !== '' && data.mongMuonTuoiToiDa !== null && data.mongMuonTuoiToiDa !== undefined) {
      formData.append('mongMuonTuoiToiDa', Number(data.mongMuonTuoiToiDa));
    }

    if (data.mongMuonGioiTinh) {
      formData.append('mongMuonGioiTinh', data.mongMuonGioiTinh);
    }

    Object.entries(files).forEach(([maLoaiGiayTo, fileList]) => {
      (fileList || []).forEach((file) => {
        formData.append('maLoaiGiayTos', maLoaiGiayTo);
        formData.append('files', file);
      });
    });

    return formData;
  };

  const onSubmit = async (data) => {
    setSubmitAttempted(true);

    if (missingDocuments.length > 0) {
      return;
    }

    try {
      const formData = buildSubmitFormData(data);
      const response = await adoptionApi.submit(formData);

      const requestSnapshot = buildRequestSnapshot(data, profile, files, response);

      sessionStorage.setItem(
        'adoption-request-status',
        JSON.stringify(requestSnapshot)
      );

      if (response?.trangThai === 'Từ chối sơ bộ') {
        alert(response?.lyDoTuChoiSoBo || 'Hồ sơ bị từ chối sơ bộ');
      } else {
        alert('Đã gửi yêu cầu nhận nuôi thành công');
      }

      navigate('/nhan-nuoi/trang-thai', {
        state: { request: requestSnapshot },
      });
    } catch (error) {
      console.error('Lỗi gửi đơn nhận nuôi:', error);
      alert(error?.message || 'Gửi đơn nhận nuôi thất bại');
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#f6f8fc] min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Đang tải dữ liệu tạo đơn...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f6f8fc] min-h-screen">
      <div className="max-w-[1500px] mx-auto px-3 lg:px-4 py-8">
        <PageHeader />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-5">
              <ApplicantSection profile={profile} />

              <AdoptionInfoSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />

              <ExpectationSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />

              <DocumentsSection
                documentTypes={documentTypes}
                files={files}
                setFiles={setFiles}
                formValues={formValues}
                missingDocuments={missingDocuments}
                submitAttempted={submitAttempted}
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