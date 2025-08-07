import axiosInstance from "../utils/axiosInstance";

const productService = {
  create: (productRequestDTO) => axiosInstance.post("/products", productRequestDTO),

  getById: (id) => axiosInstance.get(`/products/${id}`),
  getByCode: (code) => axiosInstance.get(`/products/code/${code}`),

  search: (criteria = {}, pageable = { page: 0, size: 100 }) =>
    axiosInstance.get("/products", { params: { ...criteria, ...pageable } }),

  update: (id, productUpdateRequestDTO) =>
    axiosInstance.put(`/products/${id}`, productUpdateRequestDTO),

  delete: (id) => axiosInstance.delete(`/products/${id}`),
};

export default productService;
