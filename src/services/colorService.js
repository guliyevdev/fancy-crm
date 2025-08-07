import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/colors";

const colorService = {
  create: (data) => axiosInstance.post(BASE_URL, data),
  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),
  search: (params) => axiosInstance.get(BASE_URL, { params }),
  update: (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data),
  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
};

export default colorService;