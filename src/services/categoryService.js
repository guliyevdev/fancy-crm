import axiosInstance from "../utils/axiosInstance"; // your configured axios instance


const BASE_URL = "/product/api/v1/category";

const categoryService = {
  create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),


  update: (id, data) =>
    axiosInstance.put(`${BASE_URL}/upd`, {
      id,
      ...data,
    }),
  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),
  search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),

};

export default categoryService;
