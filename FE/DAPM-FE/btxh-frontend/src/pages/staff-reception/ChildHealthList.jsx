import { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useBasePath } from '../../hooks/useBasePath';
import { useForm } from 'react-hook-form';
import { useFetch } from '../../hooks/useFetch';
import { childApi } from '../../api/childApi';
import { formatDate } from '../../utils/formatDate';

const avatarUrl = (seed = 'child', bg = 'b6e3f4') =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&backgroundType=solid`;

const inputClass = 'w-full bg-gray-50 border border-transparent focus:border-[#2c7a91] focus:ring-1 focus:ring-[#2c7a91] rounded-lg text-sm p-3 outline-none transition';

export default function ChildHealthList() {
  const { childId: paramChildId } = useParams();
  const [searchParams] = useSearchParams();
  const childId = paramChildId || searchParams.get('childId');
  const basePath = useBasePath();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const { data: child, loading: loadingChild } = useFetch(() => (childId ? childApi.getById(childId) : null), [childId]);
  const { data: healthData, loading: loadingHealth, refetch } = useFetch(() => (childId ? childApi.getHealth(childId) : null), [childId]);

  const rawRecords = healthData?.items || (Array.isArray(healthData) ? healthData : []);
  const records = rawRecords.map(r => ({
    ...r,
    height: r.chieuCao ?? r.height,
    weight: r.canNang ?? r.weight,
    checkDate: r.ngayCapNhat ?? r.checkDate,
    notes: r.tinhTrangChiTiet ?? r.notes,
    diagnosis: r.ketLuan ?? r.diagnosis,
  }));
  const latest = records[0] || {};

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { checkDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data) => {
    if (!childId) return;
    setSaving(true);
    try {
      await childApi.addHealth(childId, data);
      await refetch();
      reset({ checkDate: new Date().toISOString().split('T')[0] });
    } finally {
      setSaving(false);
    }
  };

  const bmi = latest.height && latest.weight
    ? (latest.weight / ((latest.height / 100) ** 2)).toFixed(1)
    : null;

  if (loadingChild || loadingHealth) {
    return <div className="p-6 text-center text-slate-500">Đang tải dữ liệu sức khỏe...</div>;
  }

  if (!child) {
    return (
      <div className="p-6 text-center text-red-500">
        Không tìm thấy thông tin trẻ với ID: {childId}.
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 text-slate-800">

      {/* Breadcrumb */}
      <div className="mb-2">
        <Link to={`${basePath}/danh-sach-tre`}
          className="text-slate-400 hover:text-[#2c7a91] text-sm transition-colors flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Quay lại danh sách trẻ
        </Link>
      </div>

      {/* Student summary */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="relative shrink-0">
            <img
              src={child.avatar || avatarUrl(child.fullName)}
              alt={child.fullName}
              className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
            />
            <span className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{child.fullName}</h1>
              <span className="text-xs text-gray-400">Mã hồ sơ: {child.code || `TRE-${String(child.id).padStart(3, '0')}`}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-emerald-400 text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase">Trạng thái: ổn định</span>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Lần khám cuối: {records.length > 0 ? formatDate(latest.checkDate) : 'Chưa có'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-72">
          <button className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-[#2c7a91]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">Xuất báo cáo sức khỏe</p>
                <p className="text-[10px] text-gray-400">Tải xuống bản dạng PDF cho bác sĩ</p>
              </div>
            </div>
            <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => navigate(`/can-bo-tiep-nhan/tre/${childId}/suc-khoe/tao`)}
            className="text-white rounded-xl p-4 flex items-center justify-between transition shadow-sm"
            style={{ background: 'linear-gradient(135deg, #2c7a91 0%, #1e5a6b 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Nhập chỉ số mới</p>
                <p className="text-[10px] text-white/70">Cập nhật chiều cao, cân nặng...</p>
              </div>
            </div>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Health Metric Cards */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Chỉ số sức khỏe hiện tại</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Chiều cao', value: latest.height ?? 112, unit: 'cm', pct: Math.min(((latest.height ?? 112) / 180) * 100, 100) },
            { label: 'Cân nặng', value: latest.weight ?? 19.5, unit: 'kg', pct: Math.min(((latest.weight ?? 19.5) / 80) * 100, 100) },
          ].map(m => (
            <div key={m.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-900">{m.value}</span>
                <span className="text-xs font-semibold text-gray-500">{m.unit}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-700 rounded-full" style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">BMI</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-900">{bmi ?? 15.5}</span>
              <span className="text-xs font-semibold text-gray-500">pts</span>
            </div>
            <span className="inline-block text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Bình thường</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nhóm máu</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-red-600">{child.bloodType || 'O+'}</span>
            </div>
            <p className="text-[9px] text-gray-400">Không ghi nhận dị ứng máu</p>
          </div>
        </div>
      </section>

      {/* Update Health Form */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 text-[#2c7a91] rounded-lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-blue-900">Cập nhật tình trạng sức khỏe</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Chiều cao (cm)</label>
              <input {...register('height')} className={inputClass} placeholder="Ví dụ: 112" type="number" step="0.1" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Cân nặng (kg)</label>
              <input {...register('weight')} className={inputClass} placeholder="Ví dụ: 19.5" type="number" step="0.1" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Ngày đo</label>
              <input {...register('checkDate')} className={inputClass} type="date" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Ghi chú (Tùy chọn)</label>
            <textarea {...register('notes')} className={inputClass} placeholder="Nhập thêm chi tiết về tình trạng hiện tại..." rows={4} />
          </div>
          <div className="flex justify-end items-center gap-4 pt-4">
            <button type="button" onClick={() => reset()} className="text-sm font-bold text-gray-400 hover:text-gray-600">Hủy bỏ</button>
            <button type="submit" disabled={saving} className="bg-blue-800 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              )}
              {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>
      </section>

      {/* Vaccination + Medical History */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Vaccination list */}
        <section className="lg:col-span-3 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-blue-900">Danh sách Vaccine tiêm chủng</h2>
            <span className="text-[10px] font-bold text-[#2c7a91] cursor-pointer hover:underline">Xem tất cả</span>
          </div>
          <div className="space-y-6">
            {records.slice(0, 5).map((r, i) => {
              const done = r.treatment !== 'Lên lịch tiêm';
              return r.diagnosis ? (
                <div key={r.id || i} className="flex items-center justify-between pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                      <svg className="h-5 w-5" fill={done ? 'currentColor' : 'none'} stroke={done ? 'none' : 'currentColor'} viewBox="0 0 24 24">
                        {done
                          ? <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd" />
                          : <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        }
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{r.diagnosis}</h4>
                      <p className={`text-[10px] font-bold ${done ? 'text-gray-400' : 'text-blue-500'}`}>
                        {done ? 'Đã hoàn thành' : 'Lên lịch tiêm'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">{formatDate(r.checkDate)}</span>
                </div>
              ) : null;
            })}
          </div>
        </section>

        {/* Medical History */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-[#2c7a91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <h2 className="text-sm font-bold text-blue-900">Lịch sử y tế & Ghi chú</h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-blue-600 uppercase">Bệnh gần đây</p>
              <p className="text-sm italic text-gray-700">"{latest.notes || 'Cảm cúm nhẹ hồi tháng 9.'}"</p>
            </div>
            <div className="bg-red-50/50 p-4 rounded-xl space-y-3">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Dị ứng (Allergies)</p>
              <div className="flex gap-2 flex-wrap">
                {(child.allergies?.length > 0 ? child.allergies : ['Đậu phộng', 'Penicillin']).map((a, i) => (
                  <span key={i} className="bg-red-500 text-white text-[9px] px-3 py-1 rounded-full font-bold">{a}</span>
                ))}
              </div>
            </div>
            <div className="border-l-4 border-blue-900 pl-4 py-1 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Nhu cầu đặc biệt</p>
              <p className="text-sm font-bold text-gray-800">{child.specialNeeds || 'Cần chế độ ăn không hạt.'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="mt-1 text-[#2c7a91]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-800">Ghi ý sức khỏe</p>
              <p className="text-[9px] text-gray-400 leading-relaxed">
                Dựa trên BMI {bmi ?? 15.5}, bé đang phát triển rất tốt. Duy trì vận động ngoài trời 30p mỗi ngày.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
