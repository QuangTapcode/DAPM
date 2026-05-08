import { MOCK_RECEPTIONS, mockApiResponse, mockApiError } from './mockData';

const receptionApi = {
  getAll: async (params = {}) => {
    let filteredReceptions = [...MOCK_RECEPTIONS];

    // Filter by sender (for sender role)
    if (params.senderId) {
      filteredReceptions = filteredReceptions.filter(r => r.senderId === parseInt(params.senderId));
    }

    // Filter by status
    if (params.status) {
      filteredReceptions = filteredReceptions.filter(r => r.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReceptions = filteredReceptions.slice(startIndex, endIndex);

    return mockApiResponse({
      items: paginatedReceptions,
      total: filteredReceptions.length,
      page,
      limit,
      totalPages: Math.ceil(filteredReceptions.length / limit),
    });
  },

  getById: async (id) => {
    const reception = MOCK_RECEPTIONS.find(r => r.id === parseInt(id));
    if (!reception) {
      return mockApiError('Reception request not found');
    }
    return mockApiResponse(reception);
  },

  create: async (data) => {
    const newReception = {
      id: MOCK_RECEPTIONS.length + 1,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
    };

    MOCK_RECEPTIONS.push(newReception);
    return mockApiResponse(newReception);
  },

  update: async (id, data) => {
    const receptionIndex = MOCK_RECEPTIONS.findIndex(r => r.id === parseInt(id));
    if (receptionIndex === -1) {
      return mockApiError('Reception request not found');
    }

    MOCK_RECEPTIONS[receptionIndex] = {
      ...MOCK_RECEPTIONS[receptionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_RECEPTIONS[receptionIndex]);
  },

  approve: async (id) => {
    const receptionIndex = MOCK_RECEPTIONS.findIndex(r => r.id === parseInt(id));
    if (receptionIndex === -1) {
      return mockApiError('Reception request not found');
    }

    MOCK_RECEPTIONS[receptionIndex] = {
      ...MOCK_RECEPTIONS[receptionIndex],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Mock Approver',
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_RECEPTIONS[receptionIndex]);
  },

  reject: async (id, reason) => {
    const receptionIndex = MOCK_RECEPTIONS.findIndex(r => r.id === parseInt(id));
    if (receptionIndex === -1) {
      return mockApiError('Reception request not found');
    }

    MOCK_RECEPTIONS[receptionIndex] = {
      ...MOCK_RECEPTIONS[receptionIndex],
      status: 'rejected',
      reasonReject: reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'Mock Approver',
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_RECEPTIONS[receptionIndex]);
  },
};

export default receptionApi;
