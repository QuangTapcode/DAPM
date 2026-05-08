export default function DetailField({ label, value, icon }) {
    return (
        <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                {label}
            </p>
            <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#DCE8F7] bg-[#F7FBFF] px-4 py-3 text-[15px] text-[#334155]">
                {icon ? <span className="text-[#6C8FC7]">{icon}</span> : null}
                <span>{value || '-'}</span>
            </div>
        </div>
    );
}