import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  HeartPulse,
  ShieldCheck,
  FileText,
  ArrowLeft,
  Search,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import childApi from '../../api/childApi';

const STATUS_MAP = {
  active: {
    label: 'Đang nuôi dưỡng',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
  adopted: {
    label: 'Đã nhận nuôi',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  returned: {
    label: 'Đã trả về',
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  pending: {
    label: 'Chờ tiếp nhận',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

const fallbackChildren = [
  {
    id: 'TRE00001',
    childCode: 'TRE00001',
    fullName: 'Nguyễn An',
    dob: '2020-04-12',
    gender: 'male',
    ethnicity: 'Kinh',
    provinceName: 'Đà Nẵng',
    wardName: 'Hải Châu',
    addressDetail: 'Số 12 Nguyễn Văn Linh',
    healthStatus: 'Sức khỏe ổn định',
    admissionDate: '2026-03-12',
    staffName: 'Hoàng Văn Nuôi',
    status: 'active',
    documents: [
      {
        id: 'GT00001',
        name: 'Giấy khai sinh',
        url: '/uploads/giayto/tre00001/giay-khai-sinh.pdf',
      },
      {
        id: 'GT00002',
        name: 'Sổ hộ khẩu',
        url: '/uploads/giayto/tre00001/so-ho-khau.pdf',
      },
    ],
  },
  {
    id: 'TRE00002',
    childCode: 'TRE00002',
    fullName: 'Trần Minh',
    dob: '2019-08-20',
    gender: 'male',
    ethnicity: 'Kinh',
    provinceName: 'Đà Nẵng',
    wardName: 'Thanh Khê',
    addressDetail: 'Phường Thanh Khê Đông',
    healthStatus: 'Cần theo dõi dinh dưỡng',
    admissionDate: '2026-03-18',
    staffName: 'Hoàng Văn Nuôi',
    status: 'active',
    documents: [],
  },
];

function fmtDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getGenderText(value) {
  if (value === 'male') return 'Nam';
  if (value === 'female') return 'Nữ';
  return value || '—';
}

function getStatusMeta(status) {
  return STATUS_MAP[status] || STATUS_MAP.pending;
}

function getInitials(name) {
  if (!name) return 'TE';

  return name
    .trim()
    .split(' ')
    .map((word) => word[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function SectionCard({ title, icon, children, className = '' }) {
  return (
    <section
      className={`rounded-[28px] border border-[#E3EBF6] bg-white p-6 shadow-[0_14px_36px_rgba(31,42,61,0.06)] ${className}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#2563EB]">
          {icon}
        </div>

        <h2 className="text-[18px] font-bold text-[#1E3A5F]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function InfoItem({ label, value, wide = false }) {
  return (
    <div className={`rounded-2xl bg-[#F8FBFF] px-4 py-4 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] leading-none text-[#8FA0B8]">
        {label}
      </p>

      <div className="pt-3">
        <p className="break-words text-[15px] font-semibold leading-6 text-[#334155]">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function DocumentItem({ name, url }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8FBFF] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#334155]">
          {name}
        </p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-xl border border-[#CFE0F5] bg-white px-3 py-2 text-xs font-bold text-[#2563EB] transition hover:bg-[#EEF4FF]"
      >
        Xem
      </a>
    </div>
  );
}

function NoticeState({ title, message, onBack }) {
  return (
    <div className="mx-auto max-w-2xl py-20 text-center">
      <h2 className="text-[28px] font-bold text-[#27406B]">{title}</h2>
      <p className="mt-3 text-[15px] leading-7 text-[#73839B]">{message}</p>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition hover:brightness-105"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>
    </div>
  );
}

function ChildListTable({ childrenList, selectedId, onSelect }) {
  return (
    <section className="rounded-[28px] border border-[#E3EBF6] bg-white shadow-[0_14px_36px_rgba(31,42,61,0.06)]">
      <div className="border-b border-[#E8EEF6] px-6 py-5">
        <h2 className="text-[20px] font-bold text-[#1E3A5F]">
          Danh sách trẻ đã gửi vào trung tâm
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-[22px] border border-[#E6EDF5]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="bg-[#F7FAFF] text-[11px] uppercase tracking-[0.13em] text-[#8FA0B8]">
                <tr>
                  <th className="px-5 py-4 font-bold">Mã trẻ</th>
                  <th className="px-5 py-4 font-bold">Họ tên</th>
                  <th className="px-5 py-4 font-bold">Ngày sinh</th>
                  <th className="px-5 py-4 font-bold">Giới tính</th>
                  <th className="px-5 py-4 font-bold">Ngày tiếp nhận</th>
                  <th className="px-5 py-4 font-bold">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF3FB]">
                {childrenList.map((child) => {
                  const active = child.id === selectedId || child.childCode === selectedId;
                  const statusMeta = getStatusMeta(child.status);

                  return (
                    <tr
                      key={child.id || child.childCode}
                      onClick={() => onSelect(child.id || child.childCode)}
                      className={`cursor-pointer transition ${active ? 'bg-[#EAF3FF]' : 'bg-white hover:bg-[#F8FBFF]'
                        }`}
                    >
                      <td className="px-5 py-4 font-bold text-[#2563EB]">
                        {child.childCode || child.id}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#26364A]">
                        {child.fullName || '—'}
                      </td>

                      <td className="px-5 py-4 text-[#5F738F]">
                        {fmtDate(child.dob)}
                      </td>

                      <td className="px-5 py-4 text-[#5F738F]">
                        {getGenderText(child.gender)}
                      </td>

                      <td className="px-5 py-4 text-[#5F738F]">
                        {fmtDate(child.admissionDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {childrenList.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-[#8FA0B8]"
                    >
                      Không có trẻ đã được tiếp nhận từ hồ sơ của bạn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChildDetail({ child }) {
  if (!child) return null;

  const statusMeta = getStatusMeta(child.status);
  const initials = getInitials(child.fullName);

  return (
    <section className="rounded-[28px] border border-[#E3EBF6] bg-white shadow-[0_14px_36px_rgba(31,42,61,0.06)]">
      <div className="border-b border-[#E8EEF6] bg-gradient-to-r from-white to-[#F1F7FF] px-6 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#EEF4FF] text-[28px] font-black text-[#2563EB]">
              {initials}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8FA0B8]">
                Chi tiết trẻ
              </p>

              <h1 className="mt-2 text-[32px] font-bold leading-tight text-[#1E2F4D]">
                {child.fullName || 'Chưa cập nhật'}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMeta.badge}`}
                >
                  {statusMeta.label}
                </span>

                <span className="rounded-full bg-[#F3F6FB] px-3 py-1 text-[12px] font-medium text-[#60738B]">
                  {getGenderText(child.gender)}
                </span>

                <span className="rounded-full bg-[#F3F6FB] px-3 py-1 text-[12px] font-medium text-[#60738B]">
                  {child.childCode || child.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <SectionCard title="Thông tin trẻ em" icon={<UserRound size={18} />}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoItem label="Họ và tên trẻ" value={child.fullName} />
            <InfoItem label="Ngày sinh" value={fmtDate(child.dob)} />
            <InfoItem label="Giới tính" value={getGenderText(child.gender)} />
            <InfoItem label="Dân tộc" value={child.ethnicity || 'Chưa cập nhật'} />
            <InfoItem label="Tỉnh / Thành phố" value={child.provinceName || 'Chưa cập nhật'} />
            <InfoItem label="Xã / Phường" value={child.wardName || 'Chưa cập nhật'} />
            <InfoItem
              label="Địa chỉ cụ thể của trẻ"
              value={child.addressDetail || 'Chưa cập nhật'}
              wide
            />
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Tình trạng sức khỏe" icon={<HeartPulse size={18} />}>
            <InfoItem
              label="Tình trạng sức khỏe hiện tại"
              value={child.healthStatus || 'Chưa có ghi chú sức khỏe'}
            />
          </SectionCard>

          <SectionCard title="Thông tin tiếp nhận" icon={<ShieldCheck size={18} />}>
            <div className="space-y-3">
              <InfoItem label="Ngày tiếp nhận" value={fmtDate(child.admissionDate)} />
              <InfoItem label="Cán bộ tiếp nhận" value={child.staffName || 'Chưa cập nhật'} />
              <InfoItem label="Trạng thái hiện tại" value={statusMeta.label} />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Giấy tờ" icon={<FileText size={18} />}>
          {child.documents?.length ? (
            <div className="space-y-3">
              {child.documents.map((doc) => (
                <DocumentItem key={doc.id} name={doc.name} url={doc.url} />
              ))}
            </div>
          ) : (
            <InfoItem label="Giấy tờ" value="Chưa có giấy tờ đính kèm" />
          )}
        </SectionCard>
      </div>
    </section>
  );
}

export default function SentChildInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadChildren() {
      if (!user?.id) {
        setChildrenList([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Sau này API nên trả về tất cả trẻ đã được tiếp nhận theo người gửi.
        const res =
          childApi.getReceivedChildrenBySenderId
            ? await childApi.getReceivedChildrenBySenderId(user.id)
            : await childApi.getApprovedChildBySenderId(user.id);

        const list = Array.isArray(res) ? res : res ? [res] : [];

        if (mounted) {
          setChildrenList(list);
          setSelectedChildId(list[0]?.id || list[0]?.childCode || '');
        }
      } catch (error) {
        console.error('Không tải được danh sách trẻ đã gửi:', error);

        // Mock tạm khi chưa có API thật.
        if (mounted) {
          setChildrenList(fallbackChildren);
          setSelectedChildId(fallbackChildren[0]?.id || '');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadChildren();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const filteredChildren = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    if (!kw) return childrenList;

    return childrenList.filter((child) => {
      const searchable = [
        child.id,
        child.childCode,
        child.fullName,
        child.gender,
        child.provinceName,
        child.wardName,
        child.status,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(kw);
    });
  }, [childrenList, keyword]);

  const selectedChild = useMemo(() => {
    return (
      childrenList.find(
        (child) =>
          child.id === selectedChildId || child.childCode === selectedChildId
      ) || null
    );
  }, [childrenList, selectedChildId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1d4ed8]/20 border-t-[#1d4ed8]" />
        <p className="text-sm text-slate-400">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!childrenList.length) {
    return (
      <NoticeState
        title="Chưa có thông tin trẻ"
        message="Hiện chưa có trẻ nào đã được trung tâm tiếp nhận thành công từ hồ sơ gửi trẻ của bạn."
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-5 border-b border-[#E2E8F0] pb-6 md:flex-row md:items-end">
          <div>
            <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#1E2F4D]">
              Thông tin trẻ đã gửi vào trung tâm
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#73839B]">
              Theo dõi thông tin các trẻ đã được trung tâm tiếp nhận từ hồ sơ gửi trẻ của bạn.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl border border-[#DCE7F5] bg-white px-5 text-sm font-semibold text-[#5C7396] transition hover:bg-[#F8FBFF]"
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>
        </header>

        <section className="rounded-[28px] border border-[#E3EBF6] bg-white p-5 shadow-[0_14px_36px_rgba(31,42,61,0.06)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-[#1E3A5F]">
                {filteredChildren.length} trẻ đã được tiếp nhận
              </p>
            </div>

            <div className="relative w-full md:w-[380px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA0B8]"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mã trẻ, tên trẻ, khu vực..."
                className="w-full rounded-2xl border border-[#D7E5F7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#26364A] outline-none transition placeholder:text-[#9AACBF] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
              />
            </div>
          </div>
        </section>

        <ChildListTable
          childrenList={filteredChildren}
          selectedId={selectedChildId}
          onSelect={setSelectedChildId}
        />

        <ChildDetail child={selectedChild} />
      </div>
    </div>
  );
}