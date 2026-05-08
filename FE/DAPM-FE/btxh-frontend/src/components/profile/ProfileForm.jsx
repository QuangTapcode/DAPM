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
    if (typeof value === 'string' && value.includes('-')) return value;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
}

function formatMemberSince(value) {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function getInitialValues(user) {
    return {
        fullName: user?.fullName || user?.name || '',
        displayName: user?.displayName || user?.fullName || user?.name || '',
        nationalId: user?.nationalId || user?.cccd || '',
        gender: user?.gender || 'Nam',
        dateOfBirth: formatDateForInput(user?.dateOfBirth || user?.dob),
        phone: user?.phone || '',
        email: user?.email || '',
        province: user?.province || user?.city || 'TP. Đà Nẵng',
        ward: user?.ward || user?.district || 'Quận Hải Châu',
        addressDetail: user?.addressDetail || user?.address || '',
        avatarUrl: user?.avatarUrl || user?.avatar || '',
        profileStatus: user?.profileStatus || 'Đã xác minh CCCD',
        memberSince: user?.createdAt || user?.memberSince || '',
    };
}

export default function ProfileForm({
    user,
    title = 'Thông tin cá nhân',
    description = '',
    formId = 'profile-form',
    onSave,
    provinceOptions = [
        'TP. Đà Nẵng',
        'Quảng Nam',
        'Thừa Thiên Huế',
        'TP. Hồ Chí Minh',
        'Hà Nội',
    ],
    wardOptions = [
        'Quận Hải Châu',
        'Quận Thanh Khê',
        'Quận Sơn Trà',
        'Quận Ngũ Hành Sơn',
        'Quận Liên Chiểu',
    ],
}) {
    const [isEditing, setIsEditing] = useState(false);

    const initialValues = useMemo(() => getInitialValues(user), [user]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: initialValues,
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            address: data.addressDetail,
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
                        <h1 className="!text-[36px] font-bold !text-[#0D47A1]">{title}</h1>
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
                                    alt={initialValues.displayName}
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
                                    <select
                                        {...register('province')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    >
                                        {provinceOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Phường / Xã / Quận</label>
                                    <select
                                        {...register('ward')}
                                        disabled={!isEditing}
                                        className={inputClass(!isEditing)}
                                    >
                                        {wardOptions.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
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