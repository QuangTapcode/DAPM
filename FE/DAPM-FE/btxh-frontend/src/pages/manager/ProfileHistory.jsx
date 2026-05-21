import { useMemo, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import receptionProfileApi from '../../api/receptionProfileApi';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import {
  compareProfilesByDateDesc,
  getItems,
  isProcessedProfile,
  normalizeManagerProfile,
} from './managerProfileUtils';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-orange-400',
  'bg-teal-500',
  'bg-rose-400',
  'bg-violet-500',
  'bg-emerald-500',
];

function Avatar({ name, idx }) {
  const safeName = (name || 'Người dùng').trim();
  const initials =
    safeName
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'ND';

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
    >
      {initials}
    </div>
  );
}

function ProfileRow({ item, idx, onClick }) {
  const isReception = item.type === 'reception';
  const mainName = item.personName || item.childName || 'Chưa có tên';

  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/40"
      onClick={() => onClick(item)}
    >
      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-blue-600">
        #{item.id}
      </td>
      <td className="px-3 py-3.5">
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            isReception ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isReception ? 'Gửi trẻ' : 'Nhận nuôi'}
        </span>
      </td>
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={mainName} idx={idx} />
          <div>
            <p className="text-sm font-semibold leading-tight text-gray-800">{mainName}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              Mã yêu cầu: {item.requestId || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-500">
        {formatDate(item.approvedAt || item.createdAt)}
      </td>
      <td className="px-3 py-3.5">
        <Badge status={item.status} />
      </td>
    </tr>
  );
}

function DetailModal({ item, isOpen, onClose }) {
  if (!item) return null;

  const isReception = item.type === 'reception';
  const mainName = item.personName || item.childName || 'Chưa có tên';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết hồ sơ đã xử lý" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã hồ sơ</label>
            <p className="mt-1 text-sm text-gray-900">#{item.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại hồ sơ</label>
            <p className="mt-1 text-sm text-gray-900">{isReception ? 'Gửi trẻ' : 'Nhận nuôi'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Người liên quan</label>
            <p className="mt-1 text-sm text-gray-900">{mainName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trẻ</label>
            <p className="mt-1 text-sm text-gray-900">{item.childName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày lập</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(item.createdAt)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày duyệt/từ chối</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(item.approvedAt || item.createdAt)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cán bộ lập</label>
            <p className="mt-1 text-sm text-gray-900">{item.officerName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <div className="mt-1">
              <Badge status={item.status} />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="mb-2 text-md font-semibold text-gray-900">Ghi chú xử lý</h4>
          <p className="text-sm text-gray-700">{item.notes || 'Không có ghi chú'}</p>
        </div>
      </div>
    </Modal>
  );
}

export default function ProfileHistory() {
  const [tab, setTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: recData, loading: recLoading, error: recError } = useFetch(() =>
    receptionProfileApi.getAll({ page: 1, limit: 200 })
  );
  const { data: adpData, loading: adpLoading, error: adpError } = useFetch(() =>
    adoptionProfileApi.getAll({ page: 1, limit: 200 })
  );

  const receptions = useMemo(
    () =>
      getItems(recData)
        .map((item) => normalizeManagerProfile(item, 'reception'))
        .filter(isProcessedProfile),
    [recData]
  );

  const adoptions = useMemo(
    () =>
      getItems(adpData)
        .map((item) => normalizeManagerProfile(item, 'adoption'))
        .filter(isProcessedProfile),
    [adpData]
  );

  const visibleItems = useMemo(() => {
    const rows = [
      ...(tab !== 'adoption' ? receptions : []),
      ...(tab !== 'reception' ? adoptions : []),
    ];
    return rows.sort(compareProfilesByDateDesc);
  }, [adoptions, receptions, tab]);

  const tabs = [
    { value: 'all', label: 'Tất cả', count: receptions.length + adoptions.length },
    { value: 'reception', label: 'Gửi trẻ', count: receptions.length },
    { value: 'adoption', label: 'Nhận nuôi', count: adoptions.length },
  ];

  const loading = recLoading || adpLoading;
  const error = recError || adpError;

  return (
    <div className="mx-auto max-w-[1720px] space-y-6 px-5 py-8 sm:px-8 lg:px-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Lịch sử hồ sơ</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Xem lại các hồ sơ đã được trưởng phòng duyệt hoặc từ chối.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex gap-6">
            {tabs.map((item) => (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                  tab === item.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Mã hồ sơ</th>
                <th className="px-6 py-4 text-left font-semibold">Loại</th>
                <th className="px-6 py-4 text-left font-semibold">Người liên quan</th>
                <th className="px-6 py-4 text-left font-semibold">Ngày xử lý</th>
                <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Đang tải lịch sử hồ sơ...
                  </td>
                </tr>
              ) : visibleItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Chưa có hồ sơ đã xử lý.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, idx) => (
                  <ProfileRow
                    key={`${item.type}-${item.id || idx}`}
                    item={item}
                    idx={idx}
                    onClick={setSelectedItem}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <DetailModal item={selectedItem} isOpen={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
