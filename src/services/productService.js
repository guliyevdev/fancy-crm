import axiosInstance from "../utils/axiosInstance";
const BASE_URL = "/product/api/v1/product";
const productService = {
  create: (productRequestDTO) => axiosInstance.post(`${BASE_URL}/new-product`, productRequestDTO),

  getProductById: async (productId) => {
    const response = await axiosInstance.get(`${BASE_URL}/find-by-id`, {
      headers: {
        'productId': productId,
        'Accept-Language': 'az'
      }
    });
    return response.data;
  },
  getByCode: (code) => axiosInstance.get(`${BASE_URL}/code/${code}`),
  search: (params) => axiosInstance.post(`${BASE_URL}/seacrh`, params),
  update: (productUpdateRequestDTO) =>
    axiosInstance.post(`${BASE_URL}/upd-product`, productUpdateRequestDTO),
  delete: (id) => axiosInstance.delete(`${BASE_URL}/${id}`),

  createImg: (productId, images, mainMediaName = "main-image", acceptLanguage = "az") => {
    const formData = new FormData();


    images.forEach((img) => {
      formData.append("images", img);
    });

    return axiosInstance.post(`${BASE_URL}/upload-media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "productId": productId,
        "mainMedia": mainMediaName,
        "Accept-Language": acceptLanguage,
      },
    });
  },
  uploadScannedFile: (productId, file, documentType = "INITIAL_HANDOVER_SIGNED", acceptLanguage = "az") => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post(`${BASE_URL}/upload-file`, formData, {
       headers: {
      "Content-Type": "multipart/form-data",
      "Product-Id": String(productId), // tam register
      "Document-Type": documentType,   // tam register
      "Accept-Language": acceptLanguage,
    },
    });
  },
};

export default productService;
