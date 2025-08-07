// src/services/occasionService.js
import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/occasions";

const occasionService = {
  create: (data) => axiosInstance.post(BASE_URL, data),

  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),

  getAll: () => axiosInstance.get(BASE_URL),

  update: (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data),

  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
  search: (criteria = {}, page = 0, size = 10) =>
    axiosInstance.get(BASE_URL, {
      params: { ...criteria, page, size },
    })
};

export default occasionService;
