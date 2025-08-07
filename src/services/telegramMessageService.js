import axiosInstance from "../utils/axiosInstance";

const telegramMessageService = {
  getOrdersWithMessages: async () => {
    const res = await axiosInstance.get(`messages/orders-with-messages`);
    return res.data;
  },

  getMessagesByOrderId: async (orderId) => {
    const res = await axiosInstance.get(`messages/${orderId}`);
    return res.data;
  },

  sendMessage: async (orderId, messageData) => {
    if (!orderId) {
    console.error("Missing orderId in sendMessage");
    return;
    }
    const res = await axiosInstance.post(`messages/${orderId}`, messageData);
    return res.data;
  },
};

export default telegramMessageService;
