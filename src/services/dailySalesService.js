import axiosInstance from "../utils/axiosInstance";

const dailySalesService = {
  create: (data) => axiosInstance.post("/daily-sales", data),
  getById: (id) => axiosInstance.get(`/daily-sales/${id}`),
  update: (id, data) => axiosInstance.put(`/daily-sales/${id}`, data),
  delete: (id) => axiosInstance.delete(`/daily-sales/${id}`),
  search: (criteria = {}, page = 0, size = 10) =>
    axiosInstance.get("/daily-sales", {
      params: { page, size, ...criteria },
    }),
};

export default dailySalesService;
