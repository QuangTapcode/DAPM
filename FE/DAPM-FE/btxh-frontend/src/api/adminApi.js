import { MOCK_USERS, MOCK_STATS, mockApiResponse, mockApiError } from './mockData';

const adminApi = {
  getUsers: async (params = {}) => {
    let filteredUsers = [...MOCK_USERS];

    // Filter by role
    if (params.role) {
      filteredUsers = filteredUsers.filter(u => u.role === params.role);
    }

    // Filter by search
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return mockApiResponse({
      items: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
    });
  },

  getUserById: async (id) => {
    const user = MOCK_USERS.find(u => u.id === parseInt(id));
    if (!user) {
      return mockApiError('User not found');
    }
    return mockApiResponse(user);
  },

  createUser: async (data) => {
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      return mockApiError('Email already exists');
    }

    const newUser = {
      id: MOCK_USERS.length + 1,
      ...data,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    MOCK_USERS.push(newUser);
    return mockApiResponse(newUser);
  },

  updateUser: async (id, data) => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return mockApiError('User not found');
    }

    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      ...data,
    };

    return mockApiResponse(MOCK_USERS[userIndex]);
  },

  deleteUser: async (id) => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return mockApiError('User not found');
    }

    MOCK_USERS.splice(userIndex, 1);
    return mockApiResponse({ success: true });
  },

  getStats: async () => {
    return mockApiResponse(MOCK_STATS);
  },
};

export default adminApi;
