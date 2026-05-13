import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import receptionApi from '../../api/receptionApi';
import { inputCls, selectCls, textareaCls, FormField } from '../../components/common/FormField';

export default function UpdateChildRequest() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm();

  const formRef = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    receptionApi.getById(id).then(reset).catch(console.error);
  }, [id, reset]);

  const onSubmit = async (data) => {
    await receptionApi.update(id, data);
    navigate('/gui-tre/trang-thai');
  };

  return (
    <div className="max-w-2xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <button onClick={() => navigate('/gui-tre/dashboard')} className="hover:text-[#1d4ed8] font-medium transition-colors">Tổng quan</button>
          <span>/</span>
          <button onClick={() => navigate('/gui-tre/trang-thai')} className="hover:text-[#1d4ed8] font-medium transition-colors">Trạng thái</button>
          <span>/</span>
          <span className="text-gray-600 font-semibold">Cập nhật hồ sơ</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">Cập nhật yêu cầu</h1>
        <p className="text-sm text-gray-500 mt-1">Chỉnh sửa thông tin và gửi lại để được xem xét</p>
      </div>

      {/* notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
        <span className="text-lg flex-shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-amber-800 mb-0.5">Cập nhật thông tin</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Bổ sung các thông tin còn thiếu theo yêu cầu của cán bộ tiếp nhận. Hồ sơ sẽ được xem xét lại sau khi bạn gửi.
          </p>
        </div>
      </div>

      <div ref={formRef} className="reveal reveal--left">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* child info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-[#1d4ed8] rounded-full" />
              <h2 className="font-black text-gray-800">Thông tin trẻ em</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Họ và tên trẻ" required error={errors.childName?.message}>
                  <input {...register('childName', { required: 'Vui lòng nhập tên trẻ' })} className={inputCls} />
                </FormField>
                <FormField label="Ngày sinh" error={errors.childDob?.message}>
                  <input type="date" {...register('childDob')} className={inputCls} />
                </FormField>
              </div>
              <FormField label="Tình trạng sức khoẻ">
                <textarea {...register('healthStatus')} rows={3} className={textareaCls}
                  placeholder="Mô tả tình trạng sức khoẻ hiện tại..." />
              </FormField>
            </div>
          </div>

          {/* reason */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="w-1 h-5 bg-[#f97316] rounded-full" />
              <h2 className="font-black text-gray-800">Lý do giao trẻ</h2>
            </div>
            <div className="p-5">
              <FormField label="Mô tả lý do" required error={errors.reason?.message}>
                <textarea {...register('reason', { required: 'Vui lòng điền lý do' })}
                  rows={5} className={textareaCls}
                  placeholder="Mô tả chi tiết lý do và hoàn cảnh gia đình..." />
              </FormField>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-200 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  Lưu &amp; Gửi lại
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none sm:px-8 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
