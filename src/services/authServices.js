import axiosInstance from "../utils/axiosInstance";

const BASE_URL_Login = "/fancy-auth/api/v1/auth/";
const BASE_URL_Register = "/fancy-auth/api/v1/user/";

const Authservices = {
    PostRegister: (data) => axiosInstance.post(`${BASE_URL_Register}register`, data),
    PostLogin: (data) => axiosInstance.post(`${BASE_URL_Login}login`, data),
    PostLogOut: (data) => axiosInstance.post(`${BASE_URL_Login}logout`, data),
    PostForgetPassword: (email) => axiosInstance.get(`${BASE_URL_Login}forgot-password`, {
        headers: {
            email: email
        }
    }),

    CheckOtp: (otpCode, email) => axiosInstance.get(`${BASE_URL_Login}forgot-pass/check-otp`, {
        headers: {
            otpCode: otpCode,
            email: email
        }
    }),
    ChangePassword: (data) => axiosInstance.post(`${BASE_URL_Register}change-password`, data)



};

export default Authservices;
