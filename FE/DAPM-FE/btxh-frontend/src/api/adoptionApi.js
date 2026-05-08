import { MOCK_ADOPTIONS, mockApiResponse, mockApiError } from './mockData';

const adoptionApi = {
  getAll: async (params = {}) => {
    let filteredAdoptions = [...MOCK_ADOPTIONS];

    // Filter by adopter (for adopter role)
    if (params.adopterId) {
      filteredAdoptions = filteredAdoptions.filter(a => a.adopterId === parseInt(params.adopterId));
    }

    // Filter by status
    if (params.status) {
      filteredAdoptions = filteredAdoptions.filter(a => a.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAdoptions = filteredAdoptions.slice(startIndex, endIndex);

    return mockApiResponse({
      items: paginatedAdoptions,
      total: filteredAdoptions.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAdoptions.length / limit),
    });
  },

  getById: async (id) => {
    const adoption = MOCK_ADOPTIONS.find(a => a.id === parseInt(id));
    if (!adoption) {
      return mockApiError('Adoption request not found');
    }
    return mockApiResponse(adoption);
  },

  create: async (data) => {
    const newAdoption = {
      id: MOCK_ADOPTIONS.length + 1,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
    };

    MOCK_ADOPTIONS.push(newAdoption);
    return mockApiResponse(newAdoption);
  },

  update: async (id, data) => {
    const adoptionIndex = MOCK_ADOPTIONS.findIndex(a => a.id === parseInt(id));
    if (adoptionIndex === -1) {
      return mockApiError('Adoption request not found');
    }

    MOCK_ADOPTIONS[adoptionIndex] = {
      ...MOCK_ADOPTIONS[adoptionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_ADOPTIONS[adoptionIndex]);
  },

  approve: async (id) => {
    const adoptionIndex = MOCK_ADOPTIONS.findIndex(a => a.id === parseInt(id));
    if (adoptionIndex === -1) {
      return mockApiError('Adoption request not found');
    }

    MOCK_ADOPTIONS[adoptionIndex] = {
      ...MOCK_ADOPTIONS[adoptionIndex],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Mock Approver',
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_ADOPTIONS[adoptionIndex]);
  },

  reject: async (id, reason) => {
    const adoptionIndex = MOCK_ADOPTIONS.findIndex(a => a.id === parseInt(id));
    if (adoptionIndex === -1) {
      return mockApiError('Adoption request not found');
    }

    MOCK_ADOPTIONS[adoptionIndex] = {
      ...MOCK_ADOPTIONS[adoptionIndex],
      status: 'rejected',
      reason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'Mock Approver',
      updatedAt: new Date().toISOString(),
    };

    return mockApiResponse(MOCK_ADOPTIONS[adoptionIndex]);
  },

  uploadDocument: async (id, formData) => {
    const adoption = MOCK_ADOPTIONS.find(a => a.id === parseInt(id));
    if (!adoption) {
      return mockApiError('Adoption request not found');
    }

    const newDoc = {
      id: Date.now(),
      name: formData.get('name') || 'Document',
      url: `/docs/mock-${Date.now()}.pdf`,
    };

    adoption.documents.push(newDoc);
    return mockApiResponse(newDoc);
  },
};

export default adoptionApi;
