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

export function getMissingAdopterProfileFields(user) {
    if (!user) return ['Thông tin tài khoản'];

    const requiredFields = [
        {
            label: 'Họ và tên',
            keys: ['fullName', 'displayName', 'name'],
        },
        {
            label: 'Số CCCD',
            // BE trả cccd (từ normalizeUser), hoặc nationalId/identityNumber từ mock
            keys: ['cccd', 'nationalId', 'identityNumber'],
        },
        {
            label: 'Giới tính',
            // BE trả gioiTinh
            keys: ['gioiTinh', 'gender'],
        },
        {
            label: 'Ngày sinh',
            // BE trả ngaySinh
            keys: ['ngaySinh', 'dateOfBirth', 'birthDate', 'dob'],
        },
        {
            label: 'Số điện thoại',
            keys: ['phone', 'phoneNumber'],
        },
        {
            label: 'Địa chỉ cụ thể',
            // BE trả diaChiCuThe
            keys: ['diaChiCuThe', 'addressDetail', 'address', 'specificAddress'],
        },
    ];

    return requiredFields
        .filter((field) => !hasValue(getFirstValue(user, field.keys)))
        .map((field) => field.label);
}

export function isAdopterProfileComplete(user) {
    return getMissingAdopterProfileFields(user).length === 0;
}