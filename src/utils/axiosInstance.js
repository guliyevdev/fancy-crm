import axios from "axios";

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Add this for cookies if needed
});

// Optional: global error handler (can be expanded)
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
