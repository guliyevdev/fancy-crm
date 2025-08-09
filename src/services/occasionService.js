import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/product/api/v1/occasion";

const occasionService = {
  create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),

  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),

  getAll: () => axiosInstance.get(`${BASE_URL}/occasion-names`),

  update: (id, data) =>
    axiosInstance.put(`${BASE_URL}/upd`, {
      id,
      ...data,
    }),

  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),


  search: (criteria = {}, page = 0, size = 10) => {
    const body = {
      name: criteria.keyword || "", 
      active: true,
      page,
      size,
    };
    return axiosInstance.post(`${BASE_URL}/search`, body);
  },

};

export default occasionService;
