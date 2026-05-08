import { useState, useMemo } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useFetch } from '../../hooks/useFetch';
import { childApi } from '../../api/childApi';
import Button from '../../components/common/Button';
import { inputCls, textareaCls, FormField } from '../../components/common/FormField';

const getAvatarText = (name = '') =>
  name.trim().split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || 'TE';

// ─── Shared child sidebar ────────────────────────────
function ChildSidebar({ childId, child }) {
  const base = `/can-bo-tiep-nhan/tre/${childId}`;
  const NAV = [
    { to: `${base}/sua`, label: 'Tổng quan' },
    { to: `${base}/suc-khoe`, label: 'Chỉ số sức khỏe' },
    { to: `${base}/suc-khoe`, label: 'Tiêm chủng' },
    { to: `${base}/suc-khoe`, label: 'Lịch sử tây' },
  ];
  return (
    <div className="w-48 flex-shrink-0 space-y-2">
      <div className="bg-white rounded-xl shadow-md p-4 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#1d4ed8] mx-auto mb-2">
          {getAvatarText(child.fullName)}
        </div>
        <p className="font-semibold text-gray-800 text-sm leading-snug">{child.fullName}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{child.code}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {NAV.map((item, i) => (
          <NavLink key={i} to={item.to}
            className={({ isActive }) =>
              `w-full flex px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition ${isActive && i > 0
                ? 'bg-blue-50 text-[#1d4ed8] font-semibold border-l-2 border-l-[#1d4ed8]'
                : 'text-gray-600 hover:bg-blue-50 hover:text-[#1d4ed8]'
              }`
            }>
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Metric card ────────────────────────────────────
function MetricCard({ label, value, unit, accent, sub }) {
  const map = {
    blue: { bg: 'bg-blue-50', text: 'text-[#1d4ed8]', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  }[accent] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  return (
    <div className={`rounded-xl p-4 border ${map.bg} ${map.border}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-black ${map.text}`}>
        {value}<span className="text-sm font-normal ml-1 text-gray-500">{unit}</span>
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ChildHealthForm() {
  const { childId } = useParams();
  const { data: child, loading: loadingChild } = useFetch(() => childId ? childApi.getById(childId) : null, [childId]);
  const { data: healthData, loading: loadingHealth, refetch } = useFetch(() => childId ? childApi.getHealth(childId) : null, [childId]);

  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { checkDate: new Date().toISOString().split('T')[0] },
  });

  const { records, latest, vaccines, history, bmi } = useMemo(() => {
    const recs = healthData?.items || (Array.isArray(healthData) ? healthData : []);
    const last = recs[0] || {};
    // Normalize BE field names (chieuCao, canNang) to display aliases
    const norm = (r) => ({
      ...r,
      height: r.chieuCao ?? r.height,
      weight: r.canNang ?? r.weight,
      checkDate: r.ngayCapNhat ?? r.checkDate,
      notes: r.tinhTrangChiTiet ?? r.notes,
      diagnosis: r.ketLuan ?? r.diagnosis,
    });
    const normLast = norm(last);
    const vacs = recs.map(norm).filter(r => r.diagnosis).slice(0, 3);
    const hist = recs.map(norm).filter(r => r.notes).slice(0, 4);
    const calcBmi = normLast.height && normLast.weight
      ? (normLast.weight / ((normLast.height / 100) ** 2)).toFixed(1) : null;

    return { records: recs, latest: normLast, vaccines: vacs, history: hist, bmi: calcBmi };
  }, [healthData]);

  const onSubmit = async (data) => {
    if (!childId) return;
    setSaving(true);
    try {
      await childApi.addHealth(childId, data);
      await refetch();
      reset({ checkDate: new Date().toISOString().split('T')[0], height: '', weight: '', notes: '' });
    } catch (error) {
      console.error("Lỗi lưu thông tin sức khỏe:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loadingChild) {
    return <div className="p-6 text-center">Đang tải thông tin trẻ...</div>;
  }

  if (!child) {
    return <div className="p-6 text-center text-red-500">Không tìm thấy trẻ.</div>;
  }

  return (
    <div className="flex gap-4 min-h-full">
      {/* ── Left sidebar ── */}
      <ChildSidebar childId={childId} child={child} />

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Child header card */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#1d4ed8] flex-shrink-0 ring-2 ring-blue-200">
            {getAvatarText(child.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-800">{child.fullName}</h1>
              <span className="text-xs text-gray-400">{child.code}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200`}>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{child.status || 'Đang quản lý'}
              </span>
              {latest.checkDate && <span className="text-xs text-blue-500">Cập nhật lần cuối: {latest.checkDate}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm"
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}>
              Xuất báo cáo sức khỏe
            </Button>
            <Button variant="primary" size="sm"
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}>
              Nhập chỉ số mới
            </Button>
          </div>
        </div>

        {/* Metric cards */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chỉ số sức khỏe hiện tại</p>
          <div className="grid grid-cols-4 gap-3">
            <MetricCard label="Chiều cao" value={latest.height || 'N/A'} unit="cm" accent="blue" sub="Đạt chuẩn" />
            <MetricCard label="Cân nặng" value={latest.weight || 'N/A'} unit="kg" accent="green" sub="Bình thường" />
            <MetricCard label="BMI" value={bmi || 'N/A'} unit="" accent="orange" sub="Thiếu cân nhẹ" />
            <MetricCard label="Nhóm máu" value={child.bloodType || 'N/A'} unit="" accent="red" sub="Rh dương" />
          </div>
        </div>

        {/* Update form + vaccines */}
        <div className="grid grid-cols-5 gap-4">
          {/* Update form */}
          <div className="col-span-3 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#1d4ed8] px-5 py-2.5">
              <p className="text-white font-semibold text-sm">Cập nhật tình trạng sức khỏe</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <FormField label="Chiều cao (cm)">
                  <input {...register('height')} placeholder="Vd: 113" className={inputCls} />
                </FormField>
                <FormField label="Cân nặng (kg)">
                  <input {...register('weight')} placeholder="Vd: 20.0" className={inputCls} />
                </FormField>
                <FormField label="Ngày đo">
                  <input type="date" {...register('checkDate')} className={inputCls} />
                </FormField>
              </div>
              <FormField label="Ghi chú (Thầy thuốc)">
                <textarea {...register('notes')} rows={3}
                  placeholder="Nhập tình trạng sức khỏe, lưu ý điều trị..."
                  className={textareaCls} />
              </FormField>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" loading={saving}>Lưu cập nhật</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => reset()}>Hủy</Button>
              </div>
            </form>
          </div>

          {/* Vaccine list */}
          <div className="col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#1d4ed8] px-5 py-2.5 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Danh sách Vaccine tiêm chủng</p>
              <button className="text-blue-200 hover:text-white text-xs transition">Xem tất cả</button>
            </div>
            <div className="divide-y divide-gray-50 p-1">
              {loadingHealth ? <p className="p-4 text-xs text-center text-gray-400">Đang tải...</p> :
                vaccines.map(v => (
                  <div key={v.id} className="px-4 py-3 flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${v.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                      {v.done ? '✓' : '○'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{v.diagnosis}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {v.done ? 'Đã tiêm' : 'Chưa tiêm'} &bull; {v.date}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: History panel ── */}
      <div className="w-52 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
          <div className="bg-[#1d4ed8] px-4 py-2.5">
            <p className="text-white font-semibold text-sm">Lịch sử tây & Ghi chú</p>
          </div>
          <div className="divide-y divide-gray-50 p-1">
            {loadingHealth ? <p className="p-4 text-xs text-center text-gray-400">Đang tải...</p> :
              history.map((h, i) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-[11px] text-gray-400 mb-1">{h.date}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{h.note}</p>
                  {h.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {h.tags.map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
