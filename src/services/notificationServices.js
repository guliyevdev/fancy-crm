import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/crm-core/api/v1/notifications";

const NotificationService = {
    getNotifications: () => axiosInstance.get(`${BASE_URL}/notifications`),

};

export default NotificationService;