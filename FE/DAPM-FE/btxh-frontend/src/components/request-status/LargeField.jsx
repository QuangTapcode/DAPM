export default function LargeField({ label, value }) {
    return (
        <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                {label}
            </p>
            <div className="min-h-[112px] rounded-2xl border border-[#DCE8F7] bg-[#F7FBFF] px-4 py-4 text-[15px] leading-7 text-[#334155]">
                {value || '-'}
            </div>
        </div>
    );
}