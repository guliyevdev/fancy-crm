import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "fancy-website/api/v1/mail/newsletter/";

const SubscriptionsServices = {
    getSubscriptions: (active, search, page = 0, size = 20) => {
        const params = {
            page,
            size
        };
        if (active !== undefined && active !== null && active !== "all") {
            params.active = active;
        }
        if (search) {
            params.search = search;
        }
        return axiosInstance.get(`${BASE_URL}subscriptions`, { params });
    },
    sendNewsletter: (data) => axiosInstance.post(`${BASE_URL}send`, data),
    unsubscribe: (data) => axiosInstance.post(`${BASE_URL}unsubscribe`, data),
};

export default SubscriptionsServices;