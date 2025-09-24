import axiosInstance from '../utils/axiosInstance';

const ORDER_API = '/order/api/v1/order/';

const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}/create-order-crm`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};



const getOrderById = (id) =>
  axiosInstance.get(`${ORDER_API}/find-by-id`, {
    headers: {
      "Order-Id": id,
    },
  });


const searchOrders = (params) => axiosInstance.post(`${ORDER_API}/search-order`, params);


const uploadToServer = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post(`${ORDER_API}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
const downloadContract = async (fileId, fileName) => {
  try {
    const response = await axiosInstance.get(`/orders/download/${fileId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Failed to download contract');
  }
};

const uploadFile = async (orderId, file, fileType) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`${ORDER_API}upload-file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Order-Id": orderId,
        "File-Tipe": fileType // Burası əlavə edilməlidir
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};


const CalCulaterPrice = async (orderData) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}/calculate-price-crm`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


const PostPayment = async (PaymentData) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}/office-pay`, PaymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const ReturnSattlement = async (data) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}return-settlement`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const FinishRentOrder = async (data) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}/finish-rent-order`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const CustomerTakeOrder = async (data) => {
  try {
    const response = await axiosInstance.post(`${ORDER_API}/customer-take-order`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


const orderService = {
  createOrder,
  getOrderById,
  downloadContract,
  uploadToServer,
  searchOrders,
  CalCulaterPrice,
  uploadFile,
  PostPayment,
  ReturnSattlement,
  FinishRentOrder,
  CustomerTakeOrder
};

export default orderService;
