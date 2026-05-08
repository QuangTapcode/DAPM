export default function DocumentCard({ title, value }) {
    return (
        <div className="rounded-2xl border border-dashed border-[#D6E3F5] bg-[#FAFCFF] p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FA0B8]">
                {title}
            </p>
            <div className="text-sm leading-6 text-[#4B5C73]">{value || '-'}</div>
        </div>
    );
}