import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "order/api/v1";

const ReturnPaymentService = {

    GetPaymentTransactions: (params = {}) => {
        const queryParams = new URLSearchParams();

        // Yalnız göndərilən parametrləri əlavə edirik
        Object.keys(params).forEach(key => {
            const value = params[key];
            // Yalnız doldurulmuş dəyərləri göndəririk (boş string və null/undefined yox)
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const url = `${BASE_URL}/payment-transactions?${queryParams.toString()}`;
        console.log('Request URL:', url); // Debug
        console.log('Request Params:', params); // Debug

        return axiosInstance.get(url);
    },

    ReversePayment: (id) => {
        return axiosInstance.post(`${BASE_URL}/returns/reverse`, {
            id: id
        });
    },

    RefundPayment: (id) => {
        return axiosInstance.post(`${BASE_URL}/returns/refund`, {
            id: id
        });
    },

};

export default ReturnPaymentService;
