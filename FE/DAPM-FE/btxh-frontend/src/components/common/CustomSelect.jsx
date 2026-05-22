import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function CustomSelect({
    value,
    options = [],
    placeholder = 'Chọn',
    disabled = false,
    error = false,
    onChange,
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = options.find((item) => item.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (option) => {
        onChange(option.value);
        setOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) setOpen((prev) => !prev);
                }}
                className={[
                    'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm outline-none transition',
                    disabled
                        ? 'cursor-not-allowed border-[#e6edf7] bg-[#f7fbff] text-slate-500'
                        : 'bg-[#f7fbff] text-[#334155]',
                    open
                        ? 'border-[#1976D2] ring-2 ring-[#bfdbfe]'
                        : error
                            ? 'border-red-300'
                            : 'border-[#e6edf7] hover:border-[#93c5fd]',
                ].join(' ')}
            >
                <span
                    className={[
                        'block truncate',
                        selectedOption ? 'text-[#334155]' : 'text-slate-400',
                    ].join(' ')}
                >
                    {selectedOption?.label || placeholder}
                </span>

                <ChevronDown
                    size={17}
                    className={[
                        'ml-3 shrink-0 text-[#7DA4D6] transition-transform',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {open && !disabled && (
                <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[#dbeafe] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                    <div className="max-h-60 overflow-y-auto p-2">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-400">
                                Không có dữ liệu
                            </div>
                        ) : (
                            options.map((option) => {
                                const selected = option.value === value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={[
                                            'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition',
                                            selected
                                                ? 'bg-[#eaf4ff] font-semibold text-[#1976D2]'
                                                : 'text-slate-700 hover:bg-[#f7fbff]',
                                        ].join(' ')}
                                    >
                                        <span className="truncate">{option.label}</span>

                                        {selected && (
                                            <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1976D2] text-white">
                                                <Check size={14} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}