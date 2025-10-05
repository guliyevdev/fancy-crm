import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/fancy-website/api/v1/crm/installment-applications";

const InstallmentService = {
    getAll: (params) => axiosInstance.get(BASE_URL, { params }),
    getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),

    getFileById: (fileId) =>
        axiosInstance.get(`${BASE_URL}/files/${fileId}`, {
            responseType: 'blob', // faylı browser-da açmaq üçün
        }),

    updateById: (id, payload) =>
        axiosInstance.patch(`${BASE_URL}/${id}`, payload),
};

export default InstallmentService;
