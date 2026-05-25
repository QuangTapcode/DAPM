export const PENDING_PROFILE_STATUSES = ['Chờ duyệt', 'Đang lập', 'Đang xử lý'];
export const PROCESSED_PROFILE_STATUSES = ['Đã duyệt', 'Từ chối'];

export function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export function getField(item, keys, fallback = '') {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

export function getProfileStatus(item) {
  return getField(item, ['status', 'Status', 'trangThai', 'TrangThai']);
}

export function getProfileId(item, type) {
  return type === 'reception'
    ? getField(item, ['id', 'Id', 'maHSTiepNhan', 'MaHSTiepNhan'])
    : getField(item, [
      'id',
      'Id',
      'maHSNhanNuoi',
      'MaHSNhanNuoi',
      'maHoSoNhanNuoi',
      'MaHoSoNhanNuoi',
    ]);
}

export function normalizeManagerProfile(item = {}, type = 'reception') {
  const isReception = type === 'reception';
  const id = getProfileId(item, type);
  const requestId = isReception
    ? getField(item, ['maYeuCauGuiTre', 'MaYeuCauGuiTre'])
    : getField(item, ['maYeuCauNhan', 'MaYeuCauNhan']);
  const senderName = getField(item, ['tenNguoiGui', 'TenNguoiGui']);
  const adopterName = getField(item, ['tenNguoiNhan', 'TenNguoiNhan']);

  return {
    ...item,
    id,
    type,
    __type: type,
    requestId,
    status: getProfileStatus(item),
    senderName,
    adopterName,
    personName: isReception ? senderName : adopterName,
    phone: getField(item, ['sdtNguoiNhan', 'SDTNguoiNhan', 'sDTNguoiNhan', 'phone', 'Phone']),
    cccd: getField(item, ['cccd', 'CCCD', 'nationalId', 'NationalId']),
    address: getField(item, ['diaChi', 'DiaChi', 'address', 'Address']),
    createdAt: isReception
      ? getField(item, ['ngayTiepNhan', 'NgayTiepNhan', 'ngayTao', 'NgayTao'])
      : getField(item, ['ngayLap', 'NgayLap', 'ngayTao', 'NgayTao']),
    approvedAt: getField(item, ['ngayDuyet', 'NgayDuyet']),
    childId: getField(item, ['maTre', 'MaTre']),
    childName: getField(item, ['tenTre', 'TenTre']),
    childDob: getField(item, ['ngaySinhTre', 'NgaySinhTre', 'ngaySinh', 'NgaySinh']),
    childGender: getField(item, ['gioiTinhTre', 'GioiTinhTre', 'gioiTinh', 'GioiTinh']),
    officerName: getField(item, ['tenCanBo', 'TenCanBo', 'tenCanBoLap', 'TenCanBoLap']),
    senderRelation: getField(item, ['quanHeVoiTre', 'QuanHeVoiTre']),
    reason: getField(item, ['lyDoGui', 'LyDoGui']),
    motivation: getField(item, ['lyDoNhanNuoi', 'LyDoNhanNuoi']),
    childExpectation: getField(item, ['mongMuonVeTre', 'MongMuonVeTre']),
    occupation: getField(item, ['ngheNghiep', 'NgheNghiep']),
    monthlyIncome: getField(item, ['thuNhapHangThang', 'ThuNhapHangThang'], null),
    notes: getField(item, ['ghiChu', 'GhiChu', 'notes', 'Notes']),
  };
}

export function isPendingProfile(item) {
  return PENDING_PROFILE_STATUSES.includes(getProfileStatus(item));
}

export function isProcessedProfile(item) {
  const status = getProfileStatus(item);
  return PROCESSED_PROFILE_STATUSES.includes(status) || Boolean(getField(item, ['ngayDuyet', 'NgayDuyet']));
}

export function compareProfilesByDateDesc(a, b) {
  const dateA = new Date(a.approvedAt || a.createdAt || 0);
  const dateB = new Date(b.approvedAt || b.createdAt || 0);
  return dateB - dateA;
}

export function normalizeDocument(doc = {}, index = 0) {
  return {
    id: getField(doc, ['id', 'Id', 'maGiayTo', 'MaGiayTo'], `DOC-${index + 1}`),
    name: getField(doc, ['name', 'Name', 'tenGiayTo', 'TenGiayTo', 'tenLoaiGiayTo', 'TenLoaiGiayTo'], `Giấy tờ ${index + 1}`),
    type: getField(doc, ['type', 'Type', 'loaiGiayTo', 'LoaiGiayTo', 'maLoaiGiayTo', 'MaLoaiGiayTo'], 'Giấy tờ'),
    status: getField(doc, ['status', 'Status', 'trangThai', 'TrangThai'], 'Chờ xác minh'),
    url: getField(doc, ['url', 'Url', 'duongDanFile', 'DuongDanFile']),
    updatedAt: getField(doc, ['ngayCapNhat', 'NgayCapNhat']),
  };
}
