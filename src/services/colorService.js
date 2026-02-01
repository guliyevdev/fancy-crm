import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/product/api/v1/color";

const colorService = {
  create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),
  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),
  getByIdV2: (id) => axiosInstance.get(`${BASE_URL}/find-by-id/${id}`),
  search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),

  update: (id, data) =>
    axiosInstance.put(`${BASE_URL}/upd`, {

      id,
      ...data,
    }),
  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
  getByName: () => axiosInstance.get(`${BASE_URL}/color-names`),
};

export default colorService;