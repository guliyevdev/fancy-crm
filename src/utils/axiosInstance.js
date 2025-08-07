import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080", // Update if needed
  headers: {
    "Content-Type": "application/json",
  },
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
export const backendBaseUrl = "http://localhost:8080/download";

export default axiosInstance;
