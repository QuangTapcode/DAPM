export const ROLES = {
  ADMIN: 'admin',
  GUEST: 'guest',
  SENDER: 'sender',
  ADOPTER: 'adopter',
  STAFF_RECEPTION: 'staff_reception',
  STAFF_ADOPTION: 'staff_adoption',
  MANAGER: 'manager',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',           // Đang chờ xử lý
  MISSING_INFO: 'missing_info', // Thiếu thông tin
  INVALID: 'invalid',           // Không hợp lệ
  APPROVED: 'approved',         // Đã duyệt
  REJECTED: 'rejected',         // Từ chối
};

export const REQUEST_STATUS_LABEL = {
  [REQUEST_STATUS.PENDING]: 'Đang chờ',
  [REQUEST_STATUS.MISSING_INFO]: 'Thiếu thông tin',
  [REQUEST_STATUS.INVALID]: 'Không hợp lệ',
  [REQUEST_STATUS.APPROVED]: 'Đã duyệt',
  [REQUEST_STATUS.REJECTED]: 'Từ chối',
};

export const ROLE_REDIRECT = {
  [ROLES.SENDER]: '/',
  [ROLES.ADOPTER]: '/',
  [ROLES.STAFF_RECEPTION]: '/can-bo-tiep-nhan/dashboard',
  [ROLES.STAFF_ADOPTION]: '/can-bo-nhan-nuoi/dashboard',
  [ROLES.MANAGER]: '/truong-phong/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};
