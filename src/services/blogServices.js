import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "fancy-website/api/v1/blog";

const BlogServices = {
    getAllBlogs: async (page = 0, size = 20, acceptLanguage = "az") => {
        const response = await axiosInstance.get(`${BASE_URL}/all`, {
            headers: { "Accept-Language": acceptLanguage },
            params: { page, size },
        });
        return response.data;
    },
    getBlogById: async (blogId, acceptLanguage = "az") => {
        const response = await axiosInstance.get(`${BASE_URL}/by-id`, {
            headers: { blogId, "Accept-Language": acceptLanguage },
        });
        return response.data;
    },
    updateBlog: async (blogData) => {
        const response = await axiosInstance.post(`${BASE_URL}/update`, blogData, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    },
    createBlog: async (blogData, acceptLanguage = "az") => {
        const response = await axiosInstance.post(`${BASE_URL}/create`, blogData, {
            headers: {
                "Content-Type": "application/json",
                "Accept-Language": acceptLanguage,
            },
        });
        return response.data;
    },
    uploadMedia: async (blogId, file, acceptLanguage = "az") => {
        const formData = new FormData();
        formData.append("media", file);

        const response = await axiosInstance.post(`${BASE_URL}/upload-media`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "blogId": blogId.toString(),
                "Accept-Language": acceptLanguage,
            },
        });

        return response.data;
    },
    updateActivateBlog: async (blogId, acceptLanguage = "az") => {
        const response = await axiosInstance.post(`${BASE_URL}/update-activate`, null, {
            headers: {
                "blogId": blogId.toString(),
                "Accept-Language": acceptLanguage,
            },
        });
        return response.data;
    },
};

export default BlogServices;
