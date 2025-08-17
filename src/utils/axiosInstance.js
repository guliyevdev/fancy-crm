// import axios from "axios";
// import Cookies from "js-cookie"; // token üçün

// const axiosInstance = axios.create({
//   baseURL: '/api',
//   withCredentials: true, // Add this for cookies if needed
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, 
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = Cookies.get("accessToken");
//   if (token) {
//     config.headers.Authorization = `${token}`; 
//   }
//   return config;
// });


// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error);
//     return Promise.reject(error);
//   }
// );

// export const uploadToServer = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await axiosInstance.post('/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });

//   return res.data.url; // Your backend must return this
// };
// export const backendBaseUrl = "/api/download";

// export default axiosInstance;



import axios from "axios";
import Cookies from "js-cookie";
import Authservices from "../services/authServices"; // refresh endpoint burda olacaq

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor: access token əlavə et
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: access token expired olarsa refresh token ilə yenilə
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 və təkrar edilməyibsə
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token endpoint
        const refreshResponse = await Authservices.RefreshToken(); // yeni funksiya əlavə et services-ə
        const newAccessToken = refreshResponse.data.accessToken;

        // Yeni access token cookie-yə yaz
        Cookies.set("accessToken", newAccessToken, { expires: 7 });

        // Orijinal request headers-i yenilə
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Orijinal request-i təkrar göndər
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        Cookies.remove("accessToken");
        // logout və ya login səhifəsinə yönləndir
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

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

  return res.data.url;
};

export const backendBaseUrl = "/api/download";

export default axiosInstance;
