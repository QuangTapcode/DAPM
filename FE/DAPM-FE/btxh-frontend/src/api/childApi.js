import { MOCK_CHILDREN, MOCK_RECEPTIONS, MOCK_USERS, mockApiResponse } from './mockData';

function mapChildStatus(status) {
  if (status === 'available') return 'active';
  return status || 'pending';
}

function mapChildToView({ child, sender, reception }) {
  if (!child || !sender || !reception) return null;

  return {
    id: child.id,
    fullName: child.name,
    dob: child.birthDate,
    gender: child.gender,
    ethnicity: child.ethnicity || 'Chưa cập nhật',
    healthStatus: child.healthStatus || 'Chưa cập nhật',
    specialNeeds: child.specialNeeds ?? false,
    description: child.description || '',
    status: mapChildStatus(child.status),

    addressDetail: child.addressDetail || '',
    wardName: child.wardName || '',
    provinceName: child.provinceName || '',
    childAddress:
      [child.addressDetail, child.wardName, child.provinceName]
        .filter(Boolean)
        .join(', ') || 'Chưa cập nhật',

    documents: child.documents || [],

    admissionDate: reception.approvedAt || reception.createdAt,
    staffName: reception.approvedBy || 'Chưa cập nhật',
    receptionStatus: reception.status,

    senderId: sender.id,
    senderPhone: sender.phone,
    senderEmail: sender.email,
  };
}

function mapChildForList(child) {
  if (!child) return null;

  return {
    id: child.id,
    code: `TRE-${String(child.id).padStart(3, '0')}`,
    fullName: child.name || 'Chưa cập nhật',
    dob: child.birthDate || '',
    gender: child.gender || '',
    ethnicity: child.ethnicity || 'Chưa cập nhật',
    admissionDate: child.ngayTiepNhan || child.createdAt || '',
    healthStatus: child.healthStatus || 'Chưa cập nhật',
    specialNeeds: child.specialNeeds ?? false,
    description: child.description || '',
    addressDetail: child.addressDetail || '',
    wardName: child.wardName || '',
    provinceName: child.provinceName || '',
    address:
      [child.addressDetail, child.wardName, child.provinceName]
        .filter(Boolean)
        .join(', ') || 'Chưa cập nhật',
    documents: child.documents || [],
    status:
      child.status === 'available'
        ? 'available'
        : child.status === 'pending'
          ? 'processing'
          : child.status || 'available',
  };
}

function mapChildToForm(child) {
  if (!child) return null;

  return {
    maTre: `TRE-${String(child.id).padStart(3, '0')}`,
    hoTen: child.name || '',
    ngaySinh: child.birthDate || '',
    gioiTinh: child.gender === 'female' ? 'Nữ' : 'Nam',
    maPhuongXa: child.maPhuongXa || '',
    diaChiCuThe: child.addressDetail || '',
    danToc: child.ethnicity || '',
    tinhCach: child.tinhCach || '',
    soThich: child.soThich || '',
    dacDiemNhanDang: child.dacDiemNhanDang || '',
    trangThai:
      child.status === 'available'
        ? 'Đang quản lý'
        : child.status === 'pending'
          ? 'Đang tiếp nhận'
          : child.status || '',
    ngayTiepNhan: child.ngayTiepNhan || '',
    ngayCapNhat: child.updatedAt ? String(child.updatedAt).slice(0, 10) : '',
    ngayNhanNuoi: child.ngayNhanNuoi || '',
    ghiChu: child.ghiChu || '',
    maNguoiCapNhat: child.maNguoiCapNhat || '',
    hinhAnh: child.imageUrl || '',
    healthStatus: child.healthStatus || '',
  };
}

function normalizeFormPayload(formData) {
  return {
    name: formData.hoTen,
    birthDate: formData.ngaySinh,
    gender: formData.gioiTinh === 'Nữ' ? 'female' : 'male',
    ethnicity: formData.danToc,
    maPhuongXa: formData.maPhuongXa,
    addressDetail: formData.diaChiCuThe,
    tinhCach: formData.tinhCach,
    soThich: formData.soThich,
    dacDiemNhanDang: formData.dacDiemNhanDang,
    status:
      formData.trangThai === 'Đang quản lý'
        ? 'available'
        : formData.trangThai === 'Đang tiếp nhận'
          ? 'pending'
          : formData.trangThai,
    ngayTiepNhan: formData.ngayTiepNhan,
    updatedAt: formData.ngayCapNhat || new Date().toISOString(),
    ngayNhanNuoi: formData.ngayNhanNuoi,
    ghiChu: formData.ghiChu,
    maNguoiCapNhat: formData.maNguoiCapNhat,
    imageUrl: formData.hinhAnh || '',
    healthStatus: formData.healthStatus || '',
  };
}

const childApi = {
  async getAll(params = {}) {
    const page = Number(params.page || 1);
    const pageSize = 10;
    const search = (params.search || '').trim().toLowerCase();

    let items = MOCK_CHILDREN.map(mapChildForList);

    if (search) {
      items = items.filter(
        (item) =>
          item.fullName.toLowerCase().includes(search) ||
          item.code.toLowerCase().includes(search)
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const pagedItems = items.slice(start, start + pageSize);

    return mockApiResponse({
      items: pagedItems,
      total,
      totalPages,
      page,
    });
  },

  async getFormById(id) {
    const child = MOCK_CHILDREN.find((item) => String(item.id) === String(id));
    return mockApiResponse(mapChildToForm(child));
  },

  async create(formData) {
    const payload = normalizeFormPayload(formData);
    const nextId =
      MOCK_CHILDREN.length > 0
        ? Math.max(...MOCK_CHILDREN.map((item) => Number(item.id))) + 1
        : 1;

    const newChild = {
      id: nextId,
      senderId: 2,
      senderName: 'Trần Thị Gửi',
      documents: [],
      createdAt: new Date().toISOString(),
      ...payload,
    };

    MOCK_CHILDREN.push(newChild);

    return mockApiResponse({
      success: true,
      item: newChild,
    });
  },

  async update(id, formData) {
    const index = MOCK_CHILDREN.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return mockApiResponse(null);

    const payload = normalizeFormPayload(formData);

    MOCK_CHILDREN[index] = {
      ...MOCK_CHILDREN[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse({
      success: true,
      item: MOCK_CHILDREN[index],
    });
  },

  async getById(id) {
    const child = MOCK_CHILDREN.find((item) => String(item.id) === String(id));

    if (!child) {
      return mockApiResponse(null);
    }

    const reception = MOCK_RECEPTIONS.find(
      (item) =>
        String(item.childId) === String(id) &&
        String(item.senderId) === String(child.senderId)
    );

    if (!reception) {
      return mockApiResponse(null);
    }

    const sender = MOCK_USERS.find(
      (item) => String(item.id) === String(reception.senderId)
    );

    return mockApiResponse(mapChildToView({ child, sender, reception }));
  },

  async getApprovedChildBySenderId(senderId) {
    const approvedReception = [...MOCK_RECEPTIONS]
      .reverse()
      .find(
        (item) =>
          String(item.senderId) === String(senderId) &&
          item.status === 'approved' &&
          item.childId
      );

    if (!approvedReception) {
      return mockApiResponse(null);
    }

    const child = MOCK_CHILDREN.find(
      (item) => String(item.id) === String(approvedReception.childId)
    );

    const sender = MOCK_USERS.find(
      (item) => String(item.id) === String(approvedReception.senderId)
    );

    return mockApiResponse(
      mapChildToView({
        child,
        sender,
        reception: approvedReception,
      })
    );
  },
};

export default childApi;