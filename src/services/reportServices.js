import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "crm-core/api/v1";

const Reportservices = {
    create: (data) => axiosInstance.post(`${BASE_URL}/add`, data),
    getReports: () => axiosInstance.get(`${BASE_URL}/reports`),
    getReportByType: (type, from, to) =>
        axiosInstance.get(`${BASE_URL}/reports/types/${type}`, {
            params: { from, to },
        }),
};

export default Reportservices;
