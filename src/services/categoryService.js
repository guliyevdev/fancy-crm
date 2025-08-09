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
  getAll: () => axiosInstance.get(`${BASE_URL}/category-names`),
  search: (criteria = {}, pageable = { page: 0, size: 10 }) => {
    const params = { ...criteria, ...pageable };
    return axiosInstance.get(BASE_URL, { params });
  },
};

export default categoryService;
