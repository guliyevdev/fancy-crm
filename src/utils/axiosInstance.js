import axios from "axios";
import Cookies from "js-cookie"; // token üçün

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Add this for cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `${token}`; 
  }
  return config;
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const uploadToServer = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.url; // Your backend must return this
};
export const backendBaseUrl = "/api/download";

export default axiosInstance;
