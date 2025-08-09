import axiosInstance from "../utils/axiosInstance";
const BASE_URL = "/product/api/v1/product";
const productService = {
  create: (productRequestDTO) => axiosInstance.post(`${BASE_URL}/new-product`, productRequestDTO),

  getById: (id) => axiosInstance.get(`${BASE_URL}/${id}`),
  getByCode: (code) => axiosInstance.get(`${BASE_URL}/code/${code}`),


  search: (params) => axiosInstance.post(`${BASE_URL}/seacrh`, params),


  update: (productUpdateRequestDTO) =>
    axiosInstance.post(`${BASE_URL}/upd-product`, productUpdateRequestDTO),


  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),
};

export default productService;
