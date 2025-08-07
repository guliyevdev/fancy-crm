// src/services/campaignDiscountService.js

import axiosInstance from "../utils/axiosInstance";

const API_BASE_URL = "/campaign-discounts"; // Update if your base path is different

const search = async (searchCriteria = {}, page = 0, size = 10) => {
  const params = {
    ...searchCriteria,
    page,
    size,
  };

  const response = await axiosInstance.get(`${API_BASE_URL}/search`, { params });
  return response.data;
};

const findById = async (id) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

const save = async (campaignDiscountDTO) => {
  const response = await axiosInstance.post(API_BASE_URL, campaignDiscountDTO);
  return response.data;
};

const deleteById = async (id) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
const update=(id, campaignDiscountDTO) => axiosInstance.put(`${API_BASE_URL}/${id}`, campaignDiscountDTO);
export default {
  search,
  update,
  findById,
  save,
  deleteById,
};
