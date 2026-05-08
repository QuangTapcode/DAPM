import {
    MOCK_RECEPTION_PROFILES,
    mockApiResponse,
    mockApiError,
} from './mockData';

const receptionProfileApi = {
    getAll: async (params = {}) => {
        let items = [...MOCK_RECEPTION_PROFILES];

        if (params.status) {
            items = items.filter((item) => item.status === params.status);
        }

        if (params.staffReceptionId) {
            items = items.filter(
                (item) => item.staffReceptionId === Number(params.staffReceptionId)
            );
        }

        return mockApiResponse({
            items,
            total: items.length,
        });
    },

    getById: async (id) => {
        const profile = MOCK_RECEPTION_PROFILES.find(
            (item) => item.id === Number(id)
        );

        if (!profile) {
            return mockApiError('Reception profile not found');
        }

        return mockApiResponse(profile);
    },

    create: async (data) => {
        const existed = MOCK_RECEPTION_PROFILES.find(
            (item) => item.requestId === Number(data.requestId)
        );

        if (existed) {
            return mockApiError('Yêu cầu này đã có hồ sơ tiếp nhận.');
        }

        const newProfile = {
            id: MOCK_RECEPTION_PROFILES.length + 1,
            ...data,
            requestId: Number(data.requestId),
            childId: Number(data.childId),
            staffReceptionId: Number(data.staffReceptionId),
            status: data.status || 'pending_manager',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        MOCK_RECEPTION_PROFILES.push(newProfile);
        return mockApiResponse(newProfile);
    },

    update: async (id, data) => {
        const index = MOCK_RECEPTION_PROFILES.findIndex(
            (item) => item.id === Number(id)
        );

        if (index === -1) {
            return mockApiError('Reception profile not found');
        }

        MOCK_RECEPTION_PROFILES[index] = {
            ...MOCK_RECEPTION_PROFILES[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        return mockApiResponse(MOCK_RECEPTION_PROFILES[index]);
    },
};

export default receptionProfileApi;