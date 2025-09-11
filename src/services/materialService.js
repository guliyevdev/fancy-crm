import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/product/api/v1/material";

export const createMaterial = async (materialRequestDTO) => {
  const response = await axiosInstance.post(`${BASE_URL}/add`, materialRequestDTO);
  return response.data;
};

export const updateMaterial = async (id, materialUpdateRequestDTO) => {
  const response = await axiosInstance.put(`${BASE_URL}/upd`, materialUpdateRequestDTO);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};

export const getMaterialById = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/find-by-id`,
    {
      headers: {
        id: id
      }
    }
  );
  return response.data;
};





export const searchMaterials = (params) =>
  axiosInstance.post(`${BASE_URL}/search`, params);





export const getAllMaterials = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/material-names`);
  return response.data;
};