import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import receptionApi from '../../api/receptionApi';
import adoptionApi from '../../api/adoptionApi';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { REQUEST_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-orange-400', 'bg-teal-500',
    'bg-rose-400', 'bg-violet-500', 'bg-emerald-500',
];

function Avatar({ name, idx }) {
    const safeName = (name || 'Người dùng').trim();
    const initials = safeName
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

    return (
        <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
        >
            {initials || 'ND'}
        </div>
    );
}

function ProfileRow({ item, type, idx, onClick }) {
    const isReception = type === 'reception';
    const mainName = isReception
        ? item.senderName || item.parentName || item.fullName || 'Chưa có tên'
        : item.adopterName || item.applicantName || item.fullName || 'Chưa có tên';

    return (
        <tr
            className="border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors"
            onClick={() => onClick(item)}
        >
            <td className="py-3.5 px-4 text-sm font-bold text-blue-600 whitespace-nowrap">
                #{item.id}
            </td>
            <td className="py-3.5 px-3">
                <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
            ${isReception ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}
                >
                    {isReception ? 'Gửi trẻ' : 'Nhận nuôi'}
                </span>
            </td>
            <td className="py-3.5 px-3">
                <div className="flex items-center gap-2.5">
                    <Avatar name={mainName} idx={idx} />
                    <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{mainName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            CCCD: {item.cccd || item.nationalId || 'Chưa cập nhật'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-3.5 px-3 text-sm text-gray-500 whitespace-nowrap">
                {formatDate(item.updatedAt || item.createdAt)}
            </td>
            <td className="py-3.5 px-3">
                <Badge status={item.status} />
            </td>
        </tr>
    );
}

function DetailModal({ item, type, isOpen, onClose }) {
    if (!item) return null;

    const isReception = type === 'reception';
    const mainName = isReception
        ? item.senderName || item.parentName || item.fullName || 'Chưa có tên'
        : item.adopterName || item.applicantName || item.fullName || 'Chưa có tên';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết phiếu xét duyệt" size="lg">
            <div className="space-y-4">
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                </div>

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
                        <label className="block text-sm font-medium text-gray-700">Người nộp</label>
                        <p className="mt-1 text-sm text-gray-900">{mainName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CCCD</label>
                        <p className="mt-1 text-sm text-gray-900">{item.cccd || item.nationalId || '—'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <p className="mt-1 text-sm text-gray-900">{item.phone || '—'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <p className="mt-1 text-sm text-gray-900">{item.city || item.address || '—'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày nộp</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(item.createdAt)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày duyệt</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(item.updatedAt || item.createdAt)}</p>
                    </div>
                </div>

                {isReception && item.children && item.children.length > 0 && (
                    <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">Thông tin trẻ</h4>
                        <div className="space-y-2">
                            {item.children.map((child, idx) => (
                                <div key={idx} className="border rounded p-3 bg-gray-50">
                                    <p className="text-sm"><strong>Tên:</strong> {child.name || '—'}</p>
                                    <p className="text-sm"><strong>Tuổi:</strong> {child.age || '—'}</p>
                                    <p className="text-sm"><strong>Giới tính:</strong> {child.gender || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t pt-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Ghi chú xét duyệt</h4>
                    <p className="text-sm text-gray-700">{item.notes || 'Không có ghi chú'}</p>
                </div>
            </div>
        </Modal>
    );
}

export default function ProfileHistory() {
    const [tab, setTab] = useState('reception');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: recData } = useFetch(() => receptionApi.getAll({ status: REQUEST_STATUS.APPROVED }));
    const { data: adpData } = useFetch(() => adoptionApi.getAll({ status: REQUEST_STATUS.APPROVED }));

    const receptions = recData?.items || [];
    const adoptions = adpData?.items || [];

    const tabs = [
        { value: 'reception', label: 'Gửi trẻ', count: receptions.length },
        { value: 'adoption', label: 'Nhận nuôi', count: adoptions.length },
    ];

    const visibleItems = tab === 'reception' ? receptions : adoptions;
    const itemType = tab;

    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="mx-auto max-w-[1720px] space-y-6 px-5 py-8 sm:px-8 lg:px-10">
            <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="mt-3 text-3xl font-bold text-slate-950">Lịch sử hồ sơ</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Xem lại các hồ sơ đã duyệt, bao gồm hồ sơ gửi trẻ và hồ sơ nhận nuôi.
                </p>
            </header>

            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex gap-6">
                        {tabs.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setTab(t.value)}
                                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${tab === t.value
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {t.label} ({t.count})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold">Mã hồ sơ</th>
                                <th className="px-6 py-4 text-left font-semibold">Loại</th>
                                <th className="px-6 py-4 text-left font-semibold">Người nộp</th>
                                <th className="px-6 py-4 text-left font-semibold">Ngày duyệt</th>
                                <th className="px-6 py-4 text-left font-semibold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {visibleItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Chưa có hồ sơ đã duyệt
                                    </td>
                                </tr>
                            ) : (
                                visibleItems.map((item, idx) => (
                                    <ProfileRow
                                        key={item.id}
                                        item={item}
                                        type={itemType}
                                        idx={idx}
                                        onClick={handleRowClick}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <DetailModal
                item={selectedItem}
                type={itemType}
                isOpen={isModalOpen}
                onClose={closeModal}
            />
        </div>
    );
}