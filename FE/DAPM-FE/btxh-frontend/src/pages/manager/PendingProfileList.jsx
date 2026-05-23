import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import receptionProfileApi from '../../api/receptionProfileApi';
import adoptionProfileApi from '../../api/adoptionProfileApi';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatDate';
import {
  compareProfilesByDateDesc,
  getItems,
  isPendingProfile,
  normalizeManagerProfile,
} from './managerProfileUtils';

function EyeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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

function ProfileRow({ item, idx, checked, onToggle }) {
  const navigate = useNavigate();
  const isReception = item.type === 'reception';
  const detailPath = `/truong-phong/duyet/${item.type}/${item.id}`;
  const mainName = item.personName || 'Chưa có tên';

  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/40 [&>td]:align-middle"
      onClick={() => navigate(detailPath)}
    >
      <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 accent-[#BFD8FF] focus:ring-2 focus:ring-[#DDEBFF]"
        />
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-blue-600">
        #{item.id}
      </td>

      <td className="px-3 py-3.5">
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            isReception
              ? 'bg-blue-100 text-blue-700'
              : 'bg-emerald-100 text-emerald-700'
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

      <td className="px-3 py-3.5">
        <p className="text-sm font-medium text-gray-700">{item.phone || '-'}</p>
        <p className="mt-0.5 text-xs text-gray-400">
          {item.childName ? `Trẻ: ${item.childName}` : item.address || 'Chưa cập nhật'}
        </p>
      </td>

      <td className="whitespace-nowrap px-3 py-3.5 text-sm text-gray-500">
        {formatDate(item.createdAt)}
      </td>

      <td className="px-3 py-3.5">
        <Badge status={item.status} />
      </td>

      <td className="px-4 py-3.5 text-center" onClick={(event) => event.stopPropagation()}>
        <Link
          to={detailPath}
          title="Xem chi tiết"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700"
        >
          <EyeIcon />
        </Link>
      </td>
    </tr>
  );
}

export default function PendingProfileList() {
  const [tab, setTab] = useState('all');
  const [selectedRows, setSelectedRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const {
    data: recData,
    loading: recLoading,
    error: recError,
    refetch: refetchReceptions,
  } = useFetch(() => receptionProfileApi.getAll({ page: 1, limit: 200 }));

  const {
    data: adpData,
    loading: adpLoading,
    error: adpError,
    refetch: refetchAdoptions,
  } = useFetch(() => adoptionProfileApi.getAll({ page: 1, limit: 200 }));

  const receptions = useMemo(
    () =>
      getItems(recData)
        .map((item) => normalizeManagerProfile(item, 'reception'))
        .filter(isPendingProfile),
    [recData]
  );

  const adoptions = useMemo(
    () =>
      getItems(adpData)
        .map((item) => normalizeManagerProfile(item, 'adoption'))
        .filter(isPendingProfile),
    [adpData]
  );

  const visibleRows = useMemo(() => {
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

  const getRowKey = (item) => `${item.type}:${item.id}`;
  const allVisibleKeys = visibleRows.map(getRowKey);

  const isAllSelected =
    allVisibleKeys.length > 0 && allVisibleKeys.every((key) => selectedRows.includes(key));
  const isIndeterminate =
    selectedRows.length > 0 &&
    allVisibleKeys.some((key) => selectedRows.includes(key)) &&
    !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows((prev) => prev.filter((key) => !allVisibleKeys.includes(key)));
      return;
    }
    setSelectedRows((prev) => [...new Set([...prev, ...allVisibleKeys])]);
  };

  const toggleSelectRow = (key) => {
    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRows.length === 0 || saving) return;

    try {
      setSaving(true);
      for (const rowKey of selectedRows) {
        const [type, id] = rowKey.split(':');
        if (type === 'reception') await receptionProfileApi.approve(id);
        if (type === 'adoption') await adoptionProfileApi.approve(id);
      }

      setSelectedRows([]);
      await Promise.all([refetchReceptions(), refetchAdoptions()]);
    } finally {
      setSaving(false);
    }
  };

  const loading = recLoading || adpLoading;
  const error = recError || adpError;

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-6 px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh sách hồ sơ chờ duyệt</h1>
          <p className="mt-1 text-sm text-gray-400">
            Trưởng phòng xem hồ sơ tiếp nhận và hồ sơ nhận nuôi đang chờ phê duyệt.
          </p>
        </div>

        <button
          onClick={handleBulkApprove}
          disabled={selectedRows.length === 0 || saving}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
            selectedRows.length === 0 || saving
              ? 'cursor-not-allowed bg-blue-300'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Đang phê duyệt...' : `Phê duyệt (${selectedRows.length})`}
        </button>
      </div>

      <div className="flex w-fit gap-1.5 rounded-xl bg-gray-100 p-1">
        {tabs.map((item) => {
          const active = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setTab(item.value);
                setSelectedRows([]);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  active ? 'bg-blue-50 text-blue-500' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 accent-[#BFD8FF] focus:ring-2 focus:ring-[#DDEBFF]"
                  />
                </th>
                {[
                  'Mã hồ sơ',
                  'Loại hồ sơ',
                  'Người đăng ký',
                  'Thông tin liên hệ',
                  'Ngày nộp',
                  'Trạng thái',
                  'Thao tác',
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 ${
                      header === 'Thao tác' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                    Đang tải hồ sơ...
                  </td>
                </tr>
              ) : (
                visibleRows.map((item, index) => {
                  const rowKey = getRowKey(item);
                  return (
                    <ProfileRow
                      key={rowKey}
                      item={item}
                      idx={index}
                      checked={selectedRows.includes(rowKey)}
                      onToggle={() => toggleSelectRow(rowKey)}
                    />
                  );
                })
              )}

              {!loading && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                    Không có hồ sơ nào chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-400">
          <span>
            Hiển thị {visibleRows.length} trong tổng số {receptions.length + adoptions.length} hồ sơ
          </span>
          <span>Chọn hồ sơ để xem chi tiết trước khi phê duyệt.</span>
        </div>
      </div>
    </div>
  );
}
