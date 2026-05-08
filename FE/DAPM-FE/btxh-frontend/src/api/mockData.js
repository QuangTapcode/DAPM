// Mock Data for BTXH Frontend Development
// This file contains sample data for UI development before API integration

export const MOCK_USERS = [
    {
        id: 1,
        email: 'admin@test.com',
        fullName: 'Nguyễn Văn An',
        role: 'admin',
        phone: '0123456789',
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true,
    },
    {
        id: 2,
        email: 'sender@test.com',
        fullName: 'Trần Thị Gửi',
        role: 'sender',
        phone: '0987654321',
        createdAt: '2024-01-15T00:00:00Z',
        isActive: true,
    },
    {
        id: 3,
        email: 'adopter@test.com',
        fullName: 'Lê Văn Nhận',
        role: 'adopter',
        phone: '0912345678',
        createdAt: '2024-02-01T00:00:00Z',
        isActive: true,
    },
    {
        id: 4,
        email: 'staff_reception@test.com',
        fullName: 'Phạm Thị Tiếp',
        role: 'staff_reception',
        phone: '0934567890',
        createdAt: '2024-01-20T00:00:00Z',
        isActive: true,
    },
    {
        id: 5,
        email: 'staff_adoption@test.com',
        fullName: 'Hoàng Văn Nuôi',
        role: 'staff_adoption',
        phone: '0945678901',
        createdAt: '2024-01-25T00:00:00Z',
        isActive: true,
    },
    {
        id: 6,
        email: 'manager@test.com',
        fullName: 'Đỗ Thị Quản',
        role: 'manager',
        phone: '0956789012',
        createdAt: '2024-01-10T00:00:00Z',
        isActive: true,
    },
];

export const MOCK_CHILDREN = [
  {
    id: 1,
    name: 'Nguyễn Minh Anh',
    birthDate: '2020-05-15',
    gender: 'female',
    ethnicity: 'Kinh',

    maPhuongXa: '20194',
    addressDetail: '12 Nguyễn Trãi, tổ 5',
    wardName: 'Phường Hòa Khánh Bắc',
    provinceName: 'Thành phố Đà Nẵng',

    tinhCach: 'Hiền, hòa đồng',
    soThich: 'Vẽ tranh, chơi xếp hình',
    dacDiemNhanDang: 'Có nốt ruồi nhỏ ở má trái',

    status: 'available',
    healthStatus: 'Tốt',
    specialNeeds: false,
    description: '',
    ghiChu: '',
    imageUrl: '',

    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    ngayTiepNhan: '2024-03-02',
    ngayNhanNuoi: '',
    maNguoiCapNhat: 4,

    senderId: 2,
    senderName: 'Trần Thị Gửi',
    documents: [
      { id: 1, name: 'Giấy khai sinh', url: '/docs/birth-cert-1.pdf' },
      { id: 2, name: 'Giấy khám sức khỏe', url: '/docs/health-cert-1.pdf' },
    ],
  },

  {
    id: 2,
    name: 'Trần Văn Đức',
    birthDate: '2019-08-20',
    gender: 'male',
    ethnicity: 'Kinh',

    maPhuongXa: '',
    addressDetail: '',
    wardName: '',
    provinceName: '',

    tinhCach: 'Năng động',
    soThich: 'Đá bóng',
    dacDiemNhanDang: '',

    status: 'available',
    healthStatus: 'Khỏe mạnh',
    specialNeeds: false,
    description: 'Bé trai năng động, thích thể thao',
    ghiChu: '',
    imageUrl: '',

    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    ngayTiepNhan: '2024-02-15',
    ngayNhanNuoi: '',
    maNguoiCapNhat: 4,

    senderId: 2,
    senderName: 'Trần Thị Gửi',
    documents: [{ id: 3, name: 'Giấy khai sinh', url: '/docs/birth-cert-2.pdf' }],
  },

  {
    id: 3,
    name: 'Lê Thị Mai',
    birthDate: '2021-12-10',
    gender: 'female',
    ethnicity: 'Kinh',

    maPhuongXa: '',
    addressDetail: '',
    wardName: '',
    provinceName: '',

    tinhCach: '',
    soThich: '',
    dacDiemNhanDang: '',

    status: 'pending',
    healthStatus: 'Cần theo dõi',
    specialNeeds: true,
    description: 'Bé gái cần chăm sóc đặc biệt',
    ghiChu: '',
    imageUrl: '',

    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    ngayTiepNhan: '',
    ngayNhanNuoi: '',
    maNguoiCapNhat: 4,

    senderId: 2,
    senderName: 'Trần Thị Gửi',
    documents: [],
  },
];

export const MOCK_ADOPTIONS = [
    {
        id: 1,
        adopterId: 3,
        adopterName: 'Lê Văn Nhận',
        childId: 1,
        childName: 'Nguyễn Minh Anh',
        status: 'pending',
        reason: 'Gia đình tôi có điều kiện tốt để nuôi dạy con',
        documents: [
            { id: 1, name: 'CMND/CCCD', url: '/docs/id-card-1.pdf' },
            { id: 2, name: 'Giấy kết hôn', url: '/docs/marriage-cert-1.pdf' },
            { id: 3, name: 'Giấy xác nhận thu nhập', url: '/docs/income-cert-1.pdf' },
        ],
        createdAt: '2024-03-05T00:00:00Z',
        updatedAt: '2024-03-05T00:00:00Z',
    },
    {
        id: 2,
        adopterId: 3,
        adopterName: 'Lê Văn Nhận',
        childId: 2,
        childName: 'Trần Văn Đức',
        status: 'approved',
        reason: 'Chúng tôi rất yêu trẻ em và muốn tạo môi trường tốt',
        documents: [
            { id: 4, name: 'CMND/CCCD', url: '/docs/id-card-2.pdf' },
            { id: 5, name: 'Giấy xác nhận thu nhập', url: '/docs/income-cert-2.pdf' },
        ],
        createdAt: '2024-02-20T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
        approvedAt: '2024-03-01T00:00:00Z',
        approvedBy: 'Hoàng Văn Nuôi',
    },
    {
        id: 3,
        adopterId: 3,
        adopterName: 'Lê Văn Nhận',
        childId: null,
        childName: 'Lê Thị Mai',
        status: 'missing_info',
        reason: 'Gia đình chúng tôi sẵn sàng nhận nuôi',
        note: 'Cần bổ sung giấy khám sức khỏe định kỳ',
        documents: [
            { id: 6, name: 'CMND/CCCD', url: '/docs/id-card-3.pdf' },
        ],
        createdAt: '2024-03-12T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z',
    },
];

export const MOCK_RECEPTIONS = [
    {
        id: 1,
        senderId: 2,
        senderName: 'Trần Thị Gửi',
        senderPhone: '0987654321',
        childId: 1,
        childName: 'Nguyễn Minh Anh',
        childBirthDate: '2020-05-15',
        childGender: 'female',
        relationship: 'Bà ngoại',
        reason: 'Không có điều kiện nuôi dưỡng',
        status: 'approved',
        documents: [
            { id: 1, name: 'Giấy khai sinh', url: '/docs/birth-cert-1.pdf' },
            { id: 2, name: 'Giấy khám sức khỏe', url: '/docs/health-cert-1.pdf' },
            { id: 3, name: 'CMND người gửi', url: '/docs/sender-id-1.pdf' },
        ],
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-02T00:00:00Z',
        approvedAt: '2024-03-02T00:00:00Z',
        approvedBy: 'Phạm Thị Tiếp',
    },
    {
        id: 2,
        senderId: 2,
        senderName: 'Trần Thị Gửi',
        senderPhone: '0987654321',
        childId: 2,
        childName: 'Trần Văn Đức',
        childBirthDate: '2019-08-20',
        childGender: 'male',
        relationship: 'Mẹ đẻ',
        reason: 'Gia đình gặp khó khăn tài chính kéo dài',
        status: 'pending',
        documents: [
            { id: 4, name: 'Giấy khai sinh', url: '/docs/birth-cert-2.pdf' },
            { id: 5, name: 'CMND người gửi', url: '/docs/sender-id-2.pdf' },
        ],
        createdAt: '2024-03-08T00:00:00Z',
        updatedAt: '2024-03-08T00:00:00Z',
    },
    {
        id: 3,
        senderId: 2,
        senderName: 'Trần Thị Gửi',
        senderPhone: '0987654321',
        childId: 3,
        childName: 'Lê Thị Mai',
        childBirthDate: '2021-12-10',
        childGender: 'female',
        relationship: 'Dì ruột',
        reason: 'Người giám hộ hiện tại không đủ khả năng chăm sóc dài hạn',
        status: 'rejected',
        note: 'Thiếu giấy xác nhận tình trạng sức khỏe mới nhất của trẻ',
        documents: [
            { id: 6, name: 'Giấy khai sinh', url: '/docs/birth-cert-3.pdf' },
        ],
        createdAt: '2024-03-12T00:00:00Z',
        updatedAt: '2024-03-15T00:00:00Z',
        rejectedAt: '2024-03-15T00:00:00Z',
        rejectedBy: 'Phạm Thị Tiếp',
    },
    {
        id: 4,
        senderId: 2,
        senderName: 'Trần Thị Gửi',
        senderPhone: '0987654321',
        childId: 4,
        childName: 'Phạm Gia Hân',
        childBirthDate: '2018-11-02',
        childGender: 'female',
        relationship: 'Mẹ đẻ',
        reason: 'Cần hỗ trợ môi trường chăm sóc ổn định cho trẻ',
        status: 'pending',
        documents: [
            { id: 7, name: 'Giấy khai sinh', url: '/docs/birth-cert-4.pdf' },
            { id: 8, name: 'CMND người gửi', url: '/docs/sender-id-4.pdf' },
            { id: 9, name: 'Giấy khám sức khỏe', url: '/docs/health-cert-4.pdf' },
        ],
        createdAt: '2024-03-18T00:00:00Z',
        updatedAt: '2024-03-18T00:00:00Z',
    },
];
export const MOCK_RECEPTION_PROFILES = [];

export const MOCK_STATS = {
    totalUsers: 45,
    totalChildren: 12,
    totalAdoptions: 8,
    pendingRequests: 15,
    approvedRequests: 23,
    rejectedRequests: 4,
    monthlyStats: [
        { month: '2024-01', adoptions: 2, receptions: 3 },
        { month: '2024-02', adoptions: 3, receptions: 4 },
        { month: '2024-03', adoptions: 3, receptions: 5 },
    ],
};

// Utility functions for mock API
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiResponse = (data, delayMs = 300) => {
    return delay(delayMs).then(() => Promise.resolve(data));
};

export const mockApiError = (message = 'Mock API Error', delayMs = 300) => {
    return delay(delayMs).then(() => Promise.reject(new Error(message)));
};