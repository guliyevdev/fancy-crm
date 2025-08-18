import axiosInstance from "../utils/axiosInstance";

const BASE_URL_Login = "/fancy-auth/api/v1/auth/";
const BASE_URL_Register = "/fancy-auth/api/v1/user/";

const Authservices = {
    PostLogin: (data, customDeviceId) => {
        return axiosInstance.post(
            `${BASE_URL_Login}login`,
            data,
            {
                headers: {
                    deviceId: customDeviceId || "1",
                    "Accept-Language": "en"
                }
            }
        );
    }, PostLogOut: (data) => axiosInstance.post(`${BASE_URL_Login}logout`, data),
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
    PostUpdatePassword: (data) => axiosInstance.post(
        `${BASE_URL_Login}forgot-pass/update-password`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'az',
                'salAAm': data.otpCode,
                'email': data.email
            }
        }
    ),
    RefreshToken: () => {
        const refreshToken = Cookies.get("refreshToken"); 
        return axios.get(`${BASE_URL_Login}refresh`, {
            headers: {
                "Refresh-Token": `${refreshToken}`,
                "Accept-Language": "en", 
            },
            withCredentials: true,
        });
    },







    PostRegister: (data) => axiosInstance.post(`${BASE_URL_Register}register`, data),
    ChangePassword: (data) => axiosInstance.post(`${BASE_URL_Register}change-password`, data),
    getUserOwnInfo: (userId) => axiosInstance.get(`${BASE_URL_Register}get-user-own-info`),
    getAllUsers: (params) =>
        axiosInstance.post(
            `${BASE_URL_Register}get-users`,
            params,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'az'
                }
            }
        ),


    updateUserOwnInfo: (data) => axiosInstance.put(
        `${BASE_URL_Register}update-user-own-info`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'az'
            }
        }
    )


};

export default Authservices;
