import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, HeartPulse, Search } from 'lucide-react';

import { formatDate } from '../../utils/formatDate';
import childApi from '../../api/childApi';

const card28 =
  'rounded-[28px] border border-[#E3ECF8] bg-white shadow-[0_14px_36px_rgba(42,74,122,0.08)]';

function getInitials(name) {
  if (!name) return 'TE';
  return name
    .trim()
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function getGenderText(value) {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  return value || '—';
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const isAdopted = s.includes('nhận nuôi') || s === 'adopted';
  const isPending = s.includes('chờ') || s === 'processing';
  const cls = isAdopted
    ? 'bg-slate-50 text-slate-700 border border-slate-200'
    : isPending
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${cls}`}>
      {status || '—'}
    </span>
  );
}

export default function ChildList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadChildren = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await childApi.getAll({ page: 1, search: '' });

        if (!mounted) return;

        setChildren(res?.items || []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Không thể tải danh sách trẻ');
        setChildren([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChildren();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredChildren = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return children;

    return children.filter((item) =>
      [
        item.fullName || item.hoTen,
        item.danToc,
        item.diaChiCuThe,
        item.status || item.trangThai,
        item.id || item.maTre,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [children, keyword]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-[#8FA0B8]">
        Đang tải danh sách trẻ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FE]">
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[36px] font-bold text-[#0D47A1]">
              Danh sách trẻ đã quản lý
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#73839B]">
              Quản lý thông tin trẻ, cập nhật hồ sơ cơ bản và chuyển nhanh sang
              phần sức khỏe khi cần.
            </p>
          </div>

          <button
            onClick={() => navigate('/can-bo-tiep-nhan/tre/tao')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D47A1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1565C0]"
          >
            <Plus size={16} />
            Thêm mới
          </button>
        </div>

        <div className={`${card28} p-4`}>
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
            />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên trẻ, dân tộc, địa chỉ..."
              className="h-11 w-full rounded-2xl border border-[#D9E6F5] bg-[#F8FBFF] pl-11 pr-4 text-sm text-[#334155] outline-none transition focus:border-[#0D47A1]"
            />
          </div>
        </div>

        <div className={`${card28} overflow-hidden`}>
          <div className="border-b border-[#E3ECF8] px-6 py-5">
            <h3 className="text-[15px] font-bold text-[#0D47A1]">
              Hồ sơ trẻ
            </h3>
          </div>

          {filteredChildren.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-[#8FA0B8]">
              Chưa có trẻ nào trong danh sách.
            </div>
          ) : (
            <div className="divide-y divide-[#F0F5FC]">
              {filteredChildren.map((child) => (
                <div
                  key={child.id}
                  className="grid grid-cols-1 gap-4 px-6 py-5 transition-colors hover:bg-[#F8FBFF] xl:grid-cols-[1.4fr_1fr_1fr_1.1fr_260px]"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-sm font-bold text-[#0D47A1]">
                      {getInitials(child.fullName)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-[#334155]">
                        {child.fullName || child.hoTen}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#7B8BA3]">
                        <span>{getGenderText(child.gioiTinh || child.gender)}</span>
                        <span>•</span>
                        <span>{formatDate(child.ngaySinh || child.dob) || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                      Địa chỉ
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#334155]">
                      {child.diaChiCuThe || child.address || '—'}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                      Dân tộc
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#334155]">
                      {child.danToc || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                      Trạng thái
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={child.status} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                      Thao tác
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/can-bo-tiep-nhan/tre/${child.id}/sua`)}
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl bg-[#EAF3FF] px-3 whitespace-nowrap text-xs font-semibold text-[#0D47A1] transition-colors hover:bg-[#DCE8F7]"
                      >
                        <Pencil size={14} />
                        Sửa
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/can-bo-tiep-nhan/tre/${child.id}/suc-khoe/tao`)
                        }
                        className="inline-flex h-10 items-center justify-center gap-1 rounded-2xl bg-[#0D47A1] px-3 whitespace-nowrap text-xs font-semibold text-white transition-colors hover:bg-[#1565C0]"
                      >
                        <HeartPulse size={14} />
                        Sức khỏe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#E3ECF8] px-6 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#8FA0B8]">
              Hiển thị {filteredChildren.length} / {children.length} trẻ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}