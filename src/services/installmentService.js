import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/fancy-website/api/v1/crm/installment-applications";
const BASE_URL_ALL = "/order/api/v1/crm/installments";
const InstallmentService = {
    getAll: (params) => axiosInstance.get(BASE_URL, { params }),
    getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),

    getFileById: (fileId) =>
        axiosInstance.get(`${BASE_URL}/files/${fileId}`, {
            responseType: 'blob',
        }),

    updateById: (id, payload) =>
        axiosInstance.patch(`${BASE_URL}/${id}`, payload),


    // second part of the code
    getAllInstallments: (params) => axiosInstance.get(BASE_URL_ALL, { params }),
    getAllInstallmentsById: (id) => axiosInstance.get(`${BASE_URL_ALL}/${id}`),
    uploadFiles: (id, formData) => axiosInstance.post(`${BASE_URL_ALL}/${id}/files`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    downloadFile: (fileId) => axiosInstance.get(`/order/api/v1/installments/files/${fileId}`, {
        responseType: 'blob',
    }),
    viewFile: (fileId) => {
        // Browser'da dosyayı açmak için yeni tab'da aç
        window.open(`http://62.233.53.11:8084/order/api/v1/installments/files/${fileId}`, '_blank');
    },
    getMonthlyLimit: (userPin) => axiosInstance.get(`/order/api/v1/crm/installments/monthly-limit`, {
        params: { userPin }
    }),
    updateStatus: (id, status) => axiosInstance.patch(`${BASE_URL_ALL}/${id}`, { status }),
};

export default InstallmentService;
