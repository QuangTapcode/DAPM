import { MOCK_USERS, mockApiResponse, mockApiError } from './mockData';

function toAuthUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName || '',
    role: user.role,
    phone: user.phone || '',
    nationalId: user.nationalId || '',
    birthDate: user.birthDate || '',
    gender: user.gender || '',
    provinceCode: user.provinceCode || '',
    wardCode: user.wardCode || '',
    addressDetail: user.addressDetail || '',
    address: user.address || '',
    occupation: user.occupation || '',
    monthlyIncome: user.monthlyIncome || '',
  };
}

const authApi = {
  login: async (credentials) => {
    const user = MOCK_USERS.find(
      (u) =>
        u.email === credentials.email &&
        credentials.password === '123456'
    );

    if (!user) {
      return mockApiError('Email hoặc mật khẩu không đúng', 1000);
    }

    const token = `mock-token-${user.id}-${Date.now()}`;

    return mockApiResponse({
      token,
      user: toAuthUser(user),
    });
  },

  register: async (data) => {
    const existingUser = MOCK_USERS.find((u) => u.email === data.email);

    if (existingUser) {
      return mockApiError('Email đã tồn tại', 1000);
    }

    const newUser = {
      id: MOCK_USERS.length + 1,
      email: data.email,
      password: data.password || '123456',
      role: data.role || 'adopter',
      fullName: '',
      phone: '',
      nationalId: '',
      birthDate: '',
      gender: '',
      provinceCode: '',
      wardCode: '',
      addressDetail: '',
      address: '',
      occupation: '',
      monthlyIncome: '',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    MOCK_USERS.push(newUser);

    const token = `mock-token-${newUser.id}-${Date.now()}`;

    return mockApiResponse({
      token,
      user: toAuthUser(newUser),
    });
  },

  updateProfile: async (payload) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return mockApiError('No token found');
    }

    const userId = token.split('-')[2];
    const userIndex = MOCK_USERS.findIndex(
      (u) => u.id === parseInt(userId)
    );

    if (userIndex === -1) {
      return mockApiError('User not found');
    }

    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(toAuthUser(MOCK_USERS[userIndex]));
  },

  logout: async () => {
    return mockApiResponse({ success: true });
  },

  getProfile: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return mockApiError('No token found');
    }

    const userId = token.split('-')[2];
    const user = MOCK_USERS.find((u) => u.id === parseInt(userId));

    if (!user) {
      return mockApiError('User not found');
    }

    return mockApiResponse(toAuthUser(user));
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return mockApiError('No token found');
    }

    return mockApiResponse({
      token: `mock-token-refreshed-${Date.now()}`,
    });
  },
};

export default authApi;