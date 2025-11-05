import axiosInstance from "../utils/axiosInstance";

const FANCY_BASE_URL = "/fancy-website/api/v1";

const CustomOrderService = {

    getNotifications: (page = 1, size = 10) => {
        return axiosInstance.get(
            `${FANCY_BASE_URL}/custom-order-form`,
            {
                params: { page, size }
            }
        );
    },



};

export default CustomOrderService;
