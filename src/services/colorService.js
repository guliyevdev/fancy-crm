import axiosInstance from "../utils/axiosInstance";

// const BASE_URL = "/colors/color-names";
const BASE_URL = "/product/api/v1/color";

const colorService = {
  create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),
  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),
  // search: (params) => axiosInstance.get(`${BASE_URL}/color-names`, { params }),
  search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),

  // update: (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data),
  update: (id, data) =>
    axiosInstance.put(`${BASE_URL}/upd`, {
      
      id,
      ...data,
    }),
  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
};

export default colorService;