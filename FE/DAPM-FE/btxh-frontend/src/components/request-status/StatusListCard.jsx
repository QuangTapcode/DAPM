import { CalendarDays } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import Badge from '../common/Badge';

export default function StatusListCard({ item, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-[22px] border px-5 py-4 text-left transition-all duration-200 ${isActive
                    ? 'border-[#BFD8FB] bg-[#F5FAFF] shadow-[0_10px_24px_rgba(47,128,237,0.10)]'
                    : 'border-[#E6EEF8] bg-white shadow-[0_4px_14px_rgba(31,62,112,0.05)] hover:border-[#D5E4F7] hover:shadow-[0_8px_20px_rgba(31,62,112,0.08)]'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-[#F2F6FC] px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-[#6C7D95]">
                    #{item.code}
                </span>

                <Badge status={item.status} size="sm" />
            </div>

            <h3 className="mt-3 text-[17px] font-semibold leading-6 text-[#2B3C55]">
                {item.title}
            </h3>

            <div className="mt-3 flex items-center gap-2 text-[13px] text-[#7E8FA7]">
                <CalendarDays size={14} className="text-[#8FA8CC]" />
                <span>Ngày tiếp nhận: {formatDate(item.createdAt)}</span>
            </div>
        </button>
    );
}