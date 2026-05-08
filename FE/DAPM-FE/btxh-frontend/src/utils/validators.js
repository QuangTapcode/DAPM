export const required = (value) => (value ? undefined : 'Trường này là bắt buộc');

export const minLength = (min) => (value) =>
  value && value.length < min ? `Tối thiểu ${min} ký tự` : undefined;

export const maxLength = (max) => (value) =>
  value && value.length > max ? `Tối đa ${max} ký tự` : undefined;

export const isEmail = (value) =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
    ? 'Email không hợp lệ'
    : undefined;

export const isPhone = (value) =>
  value && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(value)
    ? 'Số điện thoại không hợp lệ'
    : undefined;

export const isNationalId = (value) =>
  value && !/^[0-9]{9,12}$/.test(value)
    ? 'CCCD/CMND không hợp lệ'
    : undefined;
