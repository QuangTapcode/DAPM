import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import adoptionApi from '../../api/adoptionApi';
import Button from '../../components/common/Button';

const fieldClass =
  'w-full rounded-2xl border border-[#D7E5F7] bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#4B82C4] focus:bg-white';

export default function CreateAdoptionProfile() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm();

  // Pre-fill from adoption request
  useEffect(() => {
    if (!requestId) return;
    adoptionApi.getById(requestId).then((req) => {
      reset({
        maYeuCauNhan: req?.maYeuCauNhan || requestId,
        maTre: req?.maTre || '',
        ghiChu: '',
      });
    }).catch(() => {
      reset({ maYeuCauNhan: requestId, maTre: '', ghiChu: '' });
    });
  }, [requestId, reset]);

  const onSubmit = async (data) => {
    try {
      await adoptionApi.createProfile({
        MaYeuCauNhan: data.maYeuCauNhan,
        MaTre: data.maTre,
        GhiChu: data.ghiChu || undefined,
      });
      navigate('/can-bo-nhan-nuoi/ho-so');
    } catch (err) {
      alert(err?.message || 'Có lỗi khi tạo hồ sơ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-[34px] font-bold text-[#0D47A1]">Lập hồ sơ nhận nuôi</h1>
          <p className="mt-1 text-sm text-[#8FA0B8]">Mã yêu cầu: {requestId}</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[28px] border border-[#DCE8F6] bg-white p-8 shadow-[0_14px_40px_rgba(42,74,122,0.06)] space-y-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#334155]">
              Mã yêu cầu nhận nuôi
            </label>
            <input
              {...register('maYeuCauNhan', { required: 'Bắt buộc' })}
              readOnly
              className={`${fieldClass} bg-gray-50`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#334155]">
              Mã trẻ <span className="text-red-500">*</span>
            </label>
            <input
              {...register('maTre', { required: 'Vui lòng nhập mã trẻ' })}
              placeholder="Ví dụ: TRE000001"
              className={fieldClass}
            />
            {errors.maTre && (
              <p className="mt-1 text-xs text-red-500">{errors.maTre.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#334155]">
              Ghi chú
            </label>
            <textarea
              {...register('ghiChu')}
              rows={3}
              placeholder="Điều kiện theo dõi sau nhận nuôi, ghi chú của cán bộ..."
              className={fieldClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>
              Tạo hồ sơ
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
