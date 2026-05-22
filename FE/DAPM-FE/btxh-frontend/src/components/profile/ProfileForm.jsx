import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    User,
    MapPin,
    ShieldCheck,
    CalendarDays,
    Phone,
    Mail,
    CreditCard,
    Camera,
    Check,
    ChevronDown,
} from 'lucide-react';

const inputClass = (disabled) =>
    [
        'w-full rounded-2xl border px-4 py-3 text-[15px] outline-none transition',
        disabled
            ? 'border-[#E6EEF8] bg-[#F6FAFF] text-slate-700 cursor-not-allowed'
            : 'border-[#D8E6F5] bg-white text-slate-800 focus:border-[#2F80ED] focus:ring-4 focus:ring-blue-100',
    ].join(' ');

const labelClass =
    'mb-2 block text-[12px] font-semibold uppercase tracking-wide text-slate-500';

const sectionTitleClass =
    'flex items-center gap-2 text-[18px] font-semibold text-slate-800';

const cardClass =
    'rounded-[28px] border border-[#E6EEF8] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]';

function formatDateForInput(value) {
    if (!value) return '';

    if (typeof value === 'string') {
        return value.split('T')[0];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().split('T')[0];
}

function formatMemberSince(value) {
    if (!value) return 'Chưa cập nhật';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function getInitialValues(user) {
    return {
        fullName: user?.fullName || '',
        displayName: user?.fullName || '',

        nationalId: user?.cccd || '',
        gender: user?.gioiTinh || 'Nam',
        dateOfBirth: formatDateForInput(user?.ngaySinh),

        phone: user?.phone || '',
        email: user?.email || '',

        province: user?.maTinhTP || '',
        ward: user?.maPhuongXa || '',

        addressDetail: user?.diaChiCuThe || '',

        avatarUrl: user?.avatarUrl || user?.avatar || '',
        profileStatus: user?.profileStatus || 'Đã xác minh CCCD',
        memberSince: user?.createdAt || '',
    };
}

function CustomSelect({
    value,
    options = [],
    placeholder = 'Chọn',
    disabled = false,
    getValue,
    getLabel,
    onChange,
}) {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find((item) => getValue(item) === value);
    const selectedLabel = selectedOption ? getLabel(selectedOption) : placeholder;

    const handleSelect = (item) => {
        onChange(getValue(item));
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) setOpen((prev) => !prev);
                }}
                className={[
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-[15px] outline-none transition',
                    disabled
                        ? 'border-[#E6EEF8] bg-[#F6FAFF] text-slate-500 cursor-not-allowed'
                        : open
                            ? 'border-[#2F80ED] bg-white text-slate-800 ring-4 ring-blue-100'
                            : 'border-[#D8E6F5] bg-white text-slate-800 hover:border-[#9FC5F8]',
                ].join(' ')}
            >
                <span
                    className={[
                        'block truncate',
                        selectedOption ? 'font-medium text-slate-800' : 'text-slate-400',
                    ].join(' ')}
                >
                    {selectedLabel}
                </span>

                <ChevronDown
                    size={18}
                    className={[
                        'ml-3 shrink-0 text-[#7DA4D6] transition-transform',
                        open ? 'rotate-180' : '',
                    ].join(' ')}
                />
            </button>

            {open && !disabled && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setOpen(false)}
                        tabIndex={-1}
                    />

                    <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#D8E6F5] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                        <div className="max-h-60 overflow-y-auto p-2">
                            {options.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-slate-400">
                                    Không có dữ liệu
                                </div>
                            ) : (
                                options.map((item) => {
                                    const optionValue = getValue(item);
                                    const optionLabel = getLabel(item);
                                    const selected = optionValue === value;

                                    return (
                                        <button
                                            key={optionValue}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className={[
                                                'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] transition',
                                                selected
                                                    ? 'bg-[#E9F2FF] font-semibold text-[#1D5FD6]'
                                                    : 'text-slate-700 hover:bg-[#F6FAFF]',
                                            ].join(' ')}
                                        >
                                            <span className="truncate">{optionLabel}</span>

                                            {selected && (
                                                <span className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F80ED] text-white">
                                                    <Check size={14} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ProfileForm({
    user,
    title = 'Thông tin cá nhân',
    description = '',
    formId = 'profile-form',
    onSave,
    provinceOptions = [],
    wardOptions = [],
}) {
    const [isEditing, setIsEditing] = useState(false);

    const initialValues = useMemo(() => getInitialValues(user), [user]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: initialValues,
    });

    const selectedProvince = watch('province');
    const selectedWard = watch('ward');

    const filteredWardOptions = useMemo(() => {
        if (!selectedProvince) return [];

        return wardOptions.filter(
            (item) => item.maTinhTP === selectedProvince
        );
    }, [wardOptions, selectedProvince]);

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const onSubmit = async (data) => {
        const payload = {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            cccd: data.nationalId,
            gioiTinh: data.gender,
            ngaySinh: data.dateOfBirth || null,
            maPhuongXa: data.ward,
            diaChiCuThe: data.addressDetail,
        };

        try {
            if (onSave) {
                await onSave(payload);
            }

            reset({
                ...data,
                displayName: data.fullName,
                avatarUrl: initialValues.avatarUrl,
                profileStatus: initialValues.profileStatus,
                memberSince: initialValues.memberSince,
            });

            setIsEditing(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancel = () => {
        reset(initialValues);
        setIsEditing(false);
    };

    const avatarSrc =
        initialValues.avatarUrl ||
        'https://ui-avatars.com/api/?name=' +
        encodeURIComponent(initialValues.displayName || 'User') +
        '&background=E8F1FF&color=2563EB&size=160';

    return (
        <div className="min-h-screen bg-[#F4F8FD] p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="!text-[36px] font-bold !text-[#0D47A1]">
                            {title}
                        </h1>

                        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-slate-500">
                            {description}
                        </p>
                    </div>

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2F80ED] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(47,128,237,0.28)] transition hover:brightness-105"
                        >
                            Thay đổi thông tin
                        </button>
                    ) : (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#EEF3FA] px-6 text-[15px] font-semibold text-slate-700 transition hover:bg-[#E4ECF7]"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="submit"
                                form={formId}
                                disabled={isSubmitting}
                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2F80ED] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(47,128,237,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    )}
                </div>

                <form
                    id={formId}
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
                >
                    <div className={`${cardClass} p-6`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                <img
                                    src={avatarSrc}
                                    alt={initialValues.displayName || 'User'}
                                    className="h-32 w-32 rounded-[28px] border-4 border-[#EDF5FF] object-cover"
                                />

                                <button
                                    type="button"
                                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#2F80ED] text-white shadow-md"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>

                            <h2 className="mt-5 text-[28px] font-bold text-slate-800">
                                {initialValues.displayName || 'Chưa cập nhật'}
                            </h2>
                        </div>

                        <div className="mt-7 space-y-4">
                            <div className="rounded-3xl bg-[#F6FAFF] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9F2FF] text-[#2F80ED]">
                                        <ShieldCheck size={18} />
                                    </div>

                                    <div className="text-left">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#7DA4D6]">
                                            Trạng thái hồ sơ
                                        </p>

                                        <p className="mt-1 text-[15px] font-semibold text-slate-800">
                                            {initialValues.profileStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-[#F6FAFF] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E9F2FF] text-[#2F80ED]">
                                        <CalendarDays size={18} />
                                    </div>

                                    <div className="text-left">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#7DA4D6]">
                                            Thành viên từ
                                        </p>

                                        <p className="mt-1 text-[15px] font-semibold text-slate-800">
                                            {formatMemberSince(initialValues.memberSince)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className={`${cardClass} p-6 md:p-8`}>
                            <div className="mb-6">
                                <h3 className={sectionTitleClass}>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F2FF] text-[#2F80ED]">
                                        <User size={18} />
                                    </span>
                                    Thông tin cơ bản
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Họ và tên</label>
                                    <input
                                        {...register('fullName')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Số CCCD *</label>
                                    <div className="relative">
                                        <CreditCard
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7DA4D6]"
                                        />

                                        <input
                                            {...register('nationalId')}
                                            disabled={!isEditing}
                                            className={`${inputClass(!isEditing)} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Giới tính</label>
                                    <select
                                        {...register('gender')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Ngày sinh</label>
                                    <input
                                        type="date"
                                        {...register('dateOfBirth')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Số điện thoại</label>
                                    <div className="relative">
                                        <Phone
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7DA4D6]"
                                        />

                                        <input
                                            {...register('phone')}
                                            disabled={!isEditing}
                                            className={`${inputClass(!isEditing)} pl-11`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Email</label>
                                    <div className="relative">
                                        <Mail
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7DA4D6]"
                                        />

                                        <input
                                            {...register('email')}
                                            disabled
                                            className={`${inputClass(true)} pl-11`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${cardClass} p-6 md:p-8`}>
                            <div className="mb-6">
                                <h3 className={sectionTitleClass}>
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9F2FF] text-[#2F80ED]">
                                        <MapPin size={18} />
                                    </span>
                                    Địa chỉ liên hệ
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Tỉnh / Thành phố</label>

                                    <CustomSelect
                                        value={selectedProvince}
                                        options={provinceOptions}
                                        placeholder="Chọn tỉnh/thành phố"
                                        disabled={!isEditing}
                                        getValue={(item) => item.maTinhTP}
                                        getLabel={(item) => item.tenTinhTP}
                                        onChange={(value) => {
                                            setValue('province', value);
                                            setValue('ward', '');
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Phường / Xã</label>

                                    <CustomSelect
                                        value={selectedWard}
                                        options={filteredWardOptions}
                                        placeholder={
                                            selectedProvince
                                                ? 'Chọn phường/xã'
                                                : 'Chọn tỉnh/thành phố trước'
                                        }
                                        disabled={!isEditing || !selectedProvince}
                                        getValue={(item) => item.maPhuongXa}
                                        getLabel={(item) => item.tenPhuongXa}
                                        onChange={(value) => {
                                            setValue('ward', value);
                                        }}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Địa chỉ cụ thể</label>
                                    <input
                                        {...register('addressDetail')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}