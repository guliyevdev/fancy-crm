import axiosInstance from "../utils/axiosInstance"; // or wherever your Axios instance is configured

const BASE_URL = "/materials"; // adjust this if your API base path is different

export const createMaterial = async (materialRequestDTO) => {
  const response = await axiosInstance.post(BASE_URL, materialRequestDTO);
  return response.data;
};

export const updateMaterial = async (id, materialUpdateRequestDTO) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, materialUpdateRequestDTO);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const getMaterialById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const searchMaterials = async (searchParams, pageable = { page: 0, size: 10 }) => {
  const params = {
    ...searchParams,
    page: pageable.page,
    size: pageable.size,
  };

  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data;
};
