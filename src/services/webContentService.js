import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "fancy-website/api/v1/content-nodes";

const webContentServices = {
    search: (params) => axiosInstance.post(`${BASE_URL}/search`, params),

    getByPageKey: (pageKey, language) => {
        return axiosInstance.get(`${BASE_URL}/by-page-key`, {
            params: { pageKey },
            headers: language ? { "Accept-Language": language } : {},
        });
    },

    create: (data) => {
        return axiosInstance.post(`${BASE_URL}/create`, data);
    },

    // Find content by ID
    findById: (id) => {
        return axiosInstance.get(`${BASE_URL}/find-by-id`, {
            headers: { id },
        });
    },

    // Update content by ID
    updateContent: (id, data) => {
        return axiosInstance.put(`${BASE_URL}/update-content`, data, {
            headers: { id },
        });
    },

    // Delete content by ID
    deleteContent: (id) => {
        return axiosInstance.delete(`${BASE_URL}/delete-content`, {
            headers: { id },
        });
    },


    uploadMedia: (nodeId, files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("media", file);
        });

        return axiosInstance.post(`${BASE_URL}/upload-media`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                nodeId,
            },
        });
    },
};

export default webContentServices;
