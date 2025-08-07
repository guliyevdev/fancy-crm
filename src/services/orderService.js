import axiosInstance from '../utils/axiosInstance';

const ORDER_API = '/orders';

const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(ORDER_API, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`${ORDER_API}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const searchOrders = async (searchCriteria, page = 0, size = 10) => {
  try {
    const params = {
      ...searchCriteria,
      page,
      size
    };
    const response = await axiosInstance.get(`${ORDER_API}/search`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const uploadToServer=async (file) => {
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


const orderService = {
  createOrder,
  getOrderById,
  downloadContract,
  uploadToServer,
  searchOrders,
};

export default orderService;
