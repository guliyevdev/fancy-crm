import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/product/api/v1/occasion";

const occasionService = {
  create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),

  getById: (id) => axiosInstance.get(`${BASE_URL}/find-by-id`, {
    headers: {
      id: id
    }
  }),
  getByIdV2: (id) => axiosInstance.get(`${BASE_URL}/find-by-id/${id}`),

  getAll: () => axiosInstance.get(`${BASE_URL}/occasion-names`),

  update: (id, data) =>
    axiosInstance.put(`${BASE_URL}/upd`, {
      id,
      ...data,
    }),

  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),


  getByName: () => axiosInstance.get(`${BASE_URL}/occasion-names`),


  search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),


};

export default occasionService;
