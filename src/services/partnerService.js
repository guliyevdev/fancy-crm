import axiosInstance from "../utils/axiosInstance";

const BASE_URL = "/partners";

const partnerService = {
  // POST /partners/register
  registerPartner: async (partnerData) => {
    const response = await axiosInstance.post(`${BASE_URL}/register`, partnerData);
    return response.data;
  },

  // GET /partners/{partnerId}
  getPartnerById: async (partnerId) => {
    const response = await axiosInstance.get(`${BASE_URL}/${partnerId}`);
    return response.data;
  },
  getByPartnerCode: async (partnercode) => {
  const trimmedCode = typeof partnercode === 'string' 
  ? partnercode.trim() 
  : (partnercode?.code || '').trim();
  const response = await axiosInstance.get(`${BASE_URL}/code/${encodeURIComponent(trimmedCode)}`);
  return response.data;
},
getByPartnerFinCode: async (partnercode) => {
  const trimmedCode = typeof partnercode === 'string' 
  ? partnercode.trim() 
  : (partnercode?.code || '').trim();
  const response = await axiosInstance.get(`${BASE_URL}/finCode/${encodeURIComponent(trimmedCode)}`);
  return response.data;
},

  // PUT /partners/{partnerId}
  updatePartner: async (partnerId, updatedData) => {
    const response = await axiosInstance.put(`${BASE_URL}/${partnerId}`, updatedData);
    return response.data;
  },

  // GET /partners?companyName=...&status=...&page=0&size=10
  searchPartners: async (criteria = {}, page = 0, size = 10) => {
    const params = {
      ...criteria,
      page,
      size
    };
    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data;
  },
  uploadDocument:async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`${BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  }
};

export default partnerService;
