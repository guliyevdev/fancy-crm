import axiosInstance from "../utils/axiosInstance";

const BASE_URL_Login = "/fancy-auth/api/v1/auth/";
const BASE_URL_Register = "/fancy-auth/api/v1/user/";
const BASE_URL_TypePerms = "/fancy-auth/api/v1/type-perms";

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
    },
    search: (params) => axiosInstance.post(`${BASE_URL_Register}/search-users`, params),

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


    getUserId: async (UserId) => {
        const response = await axiosInstance.get(`${BASE_URL_Register}/user-by-id`, {
            headers: {
                'UserId': UserId,
                'Accept-Language': 'az'
            }
        });
        return response.data;
    },


    RefreshToken: () => {
        return axiosInstance.post(`${BASE_URL_Login}refresh`, {}, { withCredentials: true });
    },

    updateUserById: (id, data) =>
        axiosInstance.put(`${BASE_URL_Register}/update-user-by-id`, data, {
            headers: {
                'UserId': id,
                'Accept-Language': 'az',
                'Content-Type': 'application/json'
            }
        }),

    UpdateUserActivityStatus: async (userId) => {
        const response = await axiosInstance.put(
            `${BASE_URL_Register}update-user-active`,
            {},
            {
                headers: {
                    'UserId': userId,
                }
            }
        );
        return response.data;
    },





    getUsersByFin: (fin) => axiosInstance.get(`${BASE_URL_Register}get-users-by-fin`, {
        headers: {
            fin: fin,
            'Accept-Language': 'az'
        }
    }),








    CreateUser: (data) => axiosInstance.post(`${BASE_URL_Register}create`, data),
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
    ),





    GetTypesLists: () => axiosInstance.get(`${BASE_URL_TypePerms}/get-type-list`),

    updateUserPermissionsById: (userId, data) => {
        return axiosInstance.put(
            `${BASE_URL_Register}update-user-permissions-by-id`,
            data,
            {
                headers: {
                    'userId': userId,
                    'Accept-Language': 'az',
                    'Content-Type': 'application/json'
                }
            }
        );
    },


};

export default Authservices;
