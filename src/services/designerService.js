import axiosInstance from "../utils/axiosInstance";


const BASE_URL = "/designers";

const designerService = {
  // Create a new designer
  create: (designerRequestDTO) => {
    return axiosInstance.post(BASE_URL, designerRequestDTO).then(res => res.data);
  },

  // Get designer by id
  getById: (id) => {
    return axiosInstance.get(`${BASE_URL}/${id}`).then(res => res.data);
  },

  // Search designers with criteria and pageable params
  search: (criteria = {}, pageable = { page: 0, size: 10 }) => {
    // Build query params from criteria + pageable
    const params = {
      ...criteria,
      page: pageable.page,
      size: pageable.size,
      sort: pageable.sort, // if sorting is needed, e.g. 'name,asc'
    };

    return axiosInstance.get(BASE_URL, { params }).then(res => res.data);
  },

  // Update a designer by id
  update: (id, designerUpdateRequestDTO) => {
    return axiosInstance.put(`${BASE_URL}/${id}`, designerUpdateRequestDTO).then(res => res.data);
  },

  // Delete a designer by id
  delete: (id) => {
    return axiosInstance.delete(`${BASE_URL}/${id}`).then(res => res.data);
  }
};

export default designerService;
