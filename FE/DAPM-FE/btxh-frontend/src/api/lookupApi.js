import axiosClient from './axiosClient';

const lookupApi = {
    getTinhTp: () => {
        return axiosClient.get('/lookups/tinh-tp');
    },

    getPhuongXa: (maTinhTP) => {
        return axiosClient.get('/lookups/phuong-xa', { params: maTinhTP ? { maTinhTP } : {} });
    },

    getGiayToBatBuocNhanNuoi: () => {
        return axiosClient.get('/lookups/loai-giay-to-bat-buoc-nhan-nuoi');
    },

    getGiayToBatBuocGuiTre: () => {
        return axiosClient.get('/lookups/loai-giay-to-bat-buoc-gui-tre');
    },
};

export default lookupApi;