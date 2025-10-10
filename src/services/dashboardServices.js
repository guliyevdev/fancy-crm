import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/crm-core/api/v1/dashboard";

const DashboardService = {
    getTopCustomers: () => axiosInstance.get(`${BASE_URL}/top-customers`),
    getMonthlyRevenue: () => axiosInstance.get(`${BASE_URL}/monthly-revenue`),
    getTopRentProducts: () => axiosInstance.get(`${BASE_URL}/top-rented-products`),
    getSummary: () => axiosInstance.get(`${BASE_URL}/summary`),

};

export default DashboardService;