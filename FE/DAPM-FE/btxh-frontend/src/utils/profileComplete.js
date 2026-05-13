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

// BE trả về camelCase: fullName, cccd, gioiTinh, ngaySinh, phone, email,
// maXaPhuong, tenPhuongXa, maTinhTP, tenTinhTP, diaChiCuThe
const BASE_REQUIRED_FIELDS = [
    {
        label: 'Họ và tên',
        keys: ['fullName', 'FullName', 'HoTen', 'displayName', 'name'],
    },
    {
        label: 'Số CCCD',
        keys: ['cccd', 'CCCD', 'nationalId', 'identityNumber'],
    },
    {
        label: 'Giới tính',
        keys: ['gioiTinh', 'GioiTinh', 'gender'],
    },
    {
        label: 'Ngày sinh',
        keys: ['ngaySinh', 'NgaySinh', 'dateOfBirth', 'birthDate', 'dob'],
    },
    {
        label: 'Số điện thoại',
        keys: ['phone', 'Phone', 'SDT', 'phoneNumber'],
    },
    {
        label: 'Email',
        keys: ['email', 'Email'],
    },
    {
        label: 'Tỉnh / Thành phố',
        // maXaPhuong đủ để suy ra tỉnh; tenTinhTP/maTinhTP là trực tiếp từ BE mới
        keys: ['maTinhTP', 'MaTinhTP', 'tenTinhTP', 'TenTinhTP', 'maXaPhuong', 'MaXaPhuong', 'provinceName', 'provinceCode'],
    },
    {
        label: 'Phường / Xã',
        keys: ['maXaPhuong', 'MaXaPhuong', 'tenPhuongXa', 'TenPhuongXa', 'wardName', 'wardCode'],
    },
    {
        label: 'Địa chỉ cụ thể',
        keys: ['diaChiCuThe', 'DiaChiCuThe', 'addressDetail', 'address', 'specificAddress'],
    },
];

/* =========================
   NGƯỜI NHẬN NUÔI
========================= */

export function getMissingAdopterProfileFields(user) {
    if (!user) return ['Thông tin tài khoản'];
    return BASE_REQUIRED_FIELDS
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
    return BASE_REQUIRED_FIELDS
        .filter((field) => !hasValue(getFirstValue(user, field.keys)))
        .map((field) => field.label);
}

export function isSenderProfileComplete(user) {
    return getMissingSenderProfileFields(user).length === 0;
}
