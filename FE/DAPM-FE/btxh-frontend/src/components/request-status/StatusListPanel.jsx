import StatusListCard from './StatusListCard';

export default function StatusListPanel({
    items,
    selectedId,
    onSelect,
}) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <StatusListCard
                    key={`${item.id}-${item.code}`}
                    item={item}
                    isActive={String(selectedId) === String(item.id)}
                    onClick={() => onSelect(item.id)}
                />
            ))}
        </div>
    );
}