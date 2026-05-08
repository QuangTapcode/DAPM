function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== '';
}

function getFirstValue(user, keys) {
    for (const key of keys) {
        if (hasValue(user?.[key])) {
            return user[key];
        }
    }

    return '';
}

/* =========================
   NGƯỜI NHẬN NUÔI
========================= */

export function getMissingAdopterProfileFields(user) {
    if (!user) return ['Thông tin tài khoản'];

    const requiredFields = [
        {
            label: 'Họ và tên',
            keys: ['fullName', 'displayName', 'name', 'HoTen'],
        },
        {
            label: 'Số CCCD',
            keys: ['nationalId', 'cccd', 'identityNumber', 'CCCD'],
        },
        {
            label: 'Giới tính',
            keys: ['gender', 'GioiTinh'],
        },
        {
            label: 'Ngày sinh',
            keys: ['dateOfBirth', 'birthDate', 'dob', 'NgaySinh'],
        },
        {
            label: 'Số điện thoại',
            keys: ['phone', 'phoneNumber', 'SoDienThoai', 'SDT'],
        },
        {
            label: 'Email',
            keys: ['email', 'Email'],
        },
        {
            label: 'Tỉnh / Thành phố',
            keys: ['provinceName', 'provinceCode', 'province', 'TenTinhTP', 'MaTinhTP'],
        },
        {
            label: 'Phường / Xã',
            keys: ['wardName', 'wardCode', 'ward', 'TenXaPhuong', 'MaXaPhuong'],
        },
        {
            label: 'Địa chỉ cụ thể',
            keys: ['addressDetail', 'address', 'specificAddress', 'DiaChiCuThe'],
        },
    ];

    return requiredFields
        .filter((field) => !hasValue(getFirstValue(user, field.keys)))
        .map((field) => field.label);
}

export function isAdopterProfileComplete(user) {
    return getMissingAdopterProfileFields(user).length === 0;
}

/* =========================
   NGƯỜI GỬI TRẺ
========================= */

export function getMissingSenderProfileFields(user) {
    if (!user) return ['Thông tin tài khoản'];

    const requiredFields = [
        {
            label: 'Họ và tên',
            keys: ['fullName', 'displayName', 'name', 'HoTen'],
        },
        {
            label: 'Số CCCD',
            keys: ['nationalId', 'cccd', 'identityNumber', 'CCCD'],
        },
        {
            label: 'Giới tính',
            keys: ['gender', 'GioiTinh'],
        },
        {
            label: 'Ngày sinh',
            keys: ['dateOfBirth', 'birthDate', 'dob', 'NgaySinh'],
        },
        {
            label: 'Số điện thoại',
            keys: ['phone', 'phoneNumber', 'SoDienThoai', 'SDT'],
        },
        {
            label: 'Email',
            keys: ['email', 'Email'],
        },
        {
            label: 'Tỉnh / Thành phố',
            keys: ['provinceName', 'provinceCode', 'province', 'TenTinhTP', 'MaTinhTP'],
        },
        {
            label: 'Phường / Xã',
            keys: ['wardName', 'wardCode', 'ward', 'TenXaPhuong', 'MaXaPhuong'],
        },
        {
            label: 'Địa chỉ cụ thể',
            keys: ['addressDetail', 'address', 'specificAddress', 'DiaChiCuThe'],
        },
    ];

    return requiredFields
        .filter((field) => !hasValue(getFirstValue(user, field.keys)))
        .map((field) => field.label);
}

export function isSenderProfileComplete(user) {
    return getMissingSenderProfileFields(user).length === 0;
}