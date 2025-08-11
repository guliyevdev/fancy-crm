import axiosInstance from "../utils/axiosInstance";
const BASE_URL = "/product/api/v1/inventory";
const InventoryServices = {
    create: async (productRequestDTO) => {
        const res = await axiosInstance.post(`${BASE_URL}/create`, productRequestDTO);
        return res.data.data; 
    },
    createScan: (productRequestDTO) => axiosInstance.post(`${BASE_URL}/scan`, productRequestDTO),
    closeScan: (data) => axiosInstance.post(`${BASE_URL}/close`, data),
    getById: (id, page = 0, size = 10, direction = "ASC") =>
        axiosInstance.post(`${BASE_URL}/find-by-id`, {
            id,
            page,
            size,
            direction
        }),


    getByCode: (code) => axiosInstance.get(`${BASE_URL}/code/${code}`),


    search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),


    update: (productUpdateRequestDTO) =>
        axiosInstance.post(`${BASE_URL}/upd-product`, productUpdateRequestDTO),


    delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
};

export default InventoryServices;
