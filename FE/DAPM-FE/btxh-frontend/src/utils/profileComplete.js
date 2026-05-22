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

const commonRequiredFields = [
    {
        label: 'Họ và tên',
        keys: ['fullName', 'displayName', 'name', 'hoTen', 'HoTen'],
    },
    {
        label: 'Số CCCD',
        keys: ['cccd', 'nationalId', 'identityNumber', 'CCCD'],
    },
    {
        label: 'Giới tính',
        keys: ['gioiTinh', 'gender', 'GioiTinh'],
    },
    {
        label: 'Ngày sinh',
        keys: ['ngaySinh', 'dateOfBirth', 'birthDate', 'dob', 'NgaySinh'],
    },
    {
        label: 'Số điện thoại',
        keys: ['phone', 'phoneNumber', 'soDienThoai', 'sdt', 'SoDienThoai', 'SDT'],
    },
    {
        label: 'Email',
        keys: ['email', 'Email'],
    },
    {
        label: 'Tỉnh / Thành phố',
        keys: [
            'maTinhTP',
            'tenTinhTP',
            'provinceName',
            'provinceCode',
            'province',
            'MaTinhTP',
            'TenTinhTP',
        ],
    },
    {
        label: 'Phường / Xã',
        keys: [
            'maPhuongXa',
            'tenPhuongXa',
            'maXaPhuong',
            'tenXaPhuong',
            'wardName',
            'wardCode',
            'ward',
            'MaPhuongXa',
            'TenPhuongXa',
            'MaXaPhuong',
            'TenXaPhuong',
        ],
    },
    {
        label: 'Địa chỉ cụ thể',
        keys: ['diaChiCuThe', 'addressDetail', 'address', 'specificAddress', 'DiaChiCuThe'],
    },
];

/* =========================
   NGƯỜI NHẬN NUÔI
========================= */

export function getMissingAdopterProfileFields(user) {
    if (!user) return ['Thông tin tài khoản'];

    return commonRequiredFields
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

    return commonRequiredFields
        .filter((field) => !hasValue(getFirstValue(user, field.keys)))
        .map((field) => field.label);
}

export function isSenderProfileComplete(user) {
    return getMissingSenderProfileFields(user).length === 0;
}