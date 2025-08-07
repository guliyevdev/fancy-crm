import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/carat";

const caratService = {
  create: (data) => axiosInstance.post(BASE_URL, data),

  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),

  search: (criteria = {}, page = 0, size = 10) =>
    axiosInstance.get(BASE_URL, {
      params: { ...criteria, page, size },
    }),

  update: (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data),

  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
};

export default caratService;
