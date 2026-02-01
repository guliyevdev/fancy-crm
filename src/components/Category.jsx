import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus, Upload, X } from "lucide-react";
import Modal from "react-modal";
import categoryService from "../services/categoryService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

Modal.setAppElement("#root");

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  const [searchName, setSearchName] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { hasPermission } = usePermission();

  const fetchCategories = async (page = 0, size = 10, keyword = "") => {
    try {
      const params = {
        name: keyword,
        active: true,
        page,
        size,
      };

      const response = await categoryService.search(params);

      const apiData = response.data?.data || response.data;
      const categoriesData = apiData?.content || [];

      setCategories(categoriesData);
      setPageInfo({
        page: apiData?.number || 0,
        size: apiData?.size || size,
        totalElements: apiData?.totalElements || 0,
      });
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setSelectedCategory({
      nameAz: "",
      nameEn: "",
      nameRu: "",
      status: "ACTIVE"
    });
    setUploadedImages([]);
    setMainImageIndex(0);
    setAddOpen(true);
  };

  const openEditModal = async (category) => {
    try {
      const response = await categoryService.getByIdV2(category.id);
      const data = response.data?.data || response.data;
      setSelectedCategory(data);
      setEditOpen(true);
    } catch (error) {
      console.error("Error fetching category details:", error);
      setSelectedCategory(category);
      setEditOpen(true);
    }
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setUploadedImages(prev => [...prev, ...imageFiles]);
    }

    // Input'u temizle ki aynı dosya tekrar yüklenebilsin
    e.target.value = '';
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 1. Kateqoriya yarat
      const payload = {
        nameAz: selectedCategory.nameAz,
        nameEn: selectedCategory.nameEn,
        nameRu: selectedCategory.nameRu,
        status: selectedCategory.status,
      };

      console.log("Kateqoriya yaradılır...", payload);
      const response = await categoryService.create(payload);
      console.log("Kateqoriya yaradıldı:", response.data);
      const createdCategoryId = response?.data?.data;

      if (!createdCategoryId) {
        throw new Error("Kateqoriya ID-si alına bilmədi");
      }

      // 2. Əgər şəkil seçilibsə, media upload et
      if (uploadedImages.length > 0) {
        console.log("Şəkillər yüklənir...", uploadedImages);

        try {
          console.log("UploadMedia funksiyası çağırılır...");
          const uploadResponse = await categoryService.uploadMedia(
            createdCategoryId,
            uploadedImages[mainImageIndex].name, // mainMedia olaraq əsas şəklin adı
            uploadedImages // bütün şəkillər
          );
          console.log("Şəkillər uğurla yükləndi", uploadResponse.data);
        } catch (uploadError) {
          console.error("Şəkil yükləmə xətası:", uploadError);
          console.error("Xəta detalları:", uploadError.response?.data);
          throw new Error("Şəkil yüklənərkən xəta baş verdi: " + (uploadError.response?.data?.message || uploadError.message));
        }
      }

      // 3. Refresh et
      await fetchCategories();
      setAddOpen(false);
      setSelectedCategory(null);
      setUploadedImages([]);
      setMainImageIndex(0);

    } catch (error) {
      console.error("Xəta:", error);
      alert("Xəta baş verdi: " + (error.message || "Naməlum xəta"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 1. Kateqoriya məlumatlarını yenilə
      const payload = {
        nameAz: selectedCategory.nameAz,
        nameEn: selectedCategory.nameEn,
        nameRu: selectedCategory.nameRu,
        status: selectedCategory.status
      };

      console.log("Kateqoriya yenilənir...", payload);
      await categoryService.update(selectedCategory.id, payload);
      console.log("Kateqoriya uğurla yeniləndi");

      // 2. Əgər YENİ şəkil yüklənibsə, media upload et
      if (uploadedImages.length > 0) {
        console.log("Yeni şəkillər yüklənir...", uploadedImages);

        try {
          console.log("UploadMedia funksiyası çağırılır...");
          const uploadResponse = await categoryService.uploadMedia(
            selectedCategory.id, // Edit edilən kateqoriyanın ID-si
            uploadedImages[mainImageIndex].name, // mainMedia olaraq əsas şəklin adı
            uploadedImages // bütün yeni şəkillər
          );
          console.log("Yeni şəkillər uğurla yükləndi", uploadResponse.data);
        } catch (uploadError) {
          console.error("Şəkil yükləmə xətası:", uploadError);
          console.error("Xəta detalları:", uploadError.response?.data);
          throw new Error("Şəkil yüklənərkən xəta baş verdi: " + (uploadError.response?.data?.message || uploadError.message));
        }
      }

      // 3. Refresh et
      await fetchCategories();
      setEditOpen(false);
      setSelectedCategory(null);
      setUploadedImages([]);
      setMainImageIndex(0);

    } catch (error) {
      console.error("Xəta:", error);
      alert("Xəta baş verdi: " + (error.message || "Naməlum xəta"));
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryService.delete(selectedCategory.id);
      fetchCategories(pageInfo.page, pageInfo.size, searchName);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategories(0, pageInfo.size, searchName);
  };

  const isFormValid = selectedCategory &&
    selectedCategory.nameAz &&
    selectedCategory.nameEn &&
    selectedCategory.nameRu &&
    (addOpen ? uploadedImages.length > 0 : true); // Edit-də şəkil məcburi deyil

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Category Management
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchName}
                onChange={handleSearchChange}
                className="w-full md:w-64 pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {hasPermission("ADD_CATEGORY") && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories?.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {pageInfo.page * pageInfo.size + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {category.mainMediaUrl ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <img
                          src={category.mainMediaUrl}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${category.status === "ACTIVE" ? "bg-green-600" : "bg-yellow-600"
                        }`}></span>
                      {category.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {hasPermission("UPDATE_CATEGORY") && (
                        <button
                          onClick={() => openEditModal(category)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit"
                        >
                          <PencilLine size={18} />
                        </button>
                      )}
                      {hasPermission("DELETE_CATEGORY") && (
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">No categories found</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{pageInfo.page * pageInfo.size + 1}</span> to <span className="font-medium">{Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)}</span> of <span className="font-medium">{pageInfo.totalElements}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchCategories(pageInfo.page - 1, pageInfo.size, searchName)}
              disabled={pageInfo.page === 0}
              className={`p-2 rounded-lg border ${pageInfo.page === 0
                  ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <FaChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
              Page {pageInfo.page + 1} of {Math.max(1, Math.ceil(pageInfo.totalElements / pageInfo.size))}
            </span>
            <button
              onClick={() => fetchCategories(pageInfo.page + 1, pageInfo.size, searchName)}
              disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
              className={`p-2 rounded-lg border ${(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
                  ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={addOpen}
        onRequestClose={() => !isUploading && setAddOpen(false)}
        contentLabel="Add Category"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 outline-none border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Category</h3>
          <button onClick={() => !isUploading && setAddOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {selectedCategory && (
          <form onSubmit={saveAdd} className="space-y-5">
            <div>
              <label htmlFor="nameAz" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (Azərbaycanca)
              </label>
              <input
                id="nameAz"
                name="nameAz"
                type="text"
                value={selectedCategory.nameAz || ""}
                onChange={handleAddChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter name in Azerbaijani"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (English)
              </label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={selectedCategory.nameEn || ""}
                onChange={handleAddChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter name in English"
              />
            </div>

            <div>
              <label htmlFor="nameRu" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (Русский)
              </label>
              <input
                id="nameRu"
                name="nameRu"
                type="text"
                value={selectedCategory.nameRu || ""}
                onChange={handleAddChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter name in Russian"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedCategory.status}
                onChange={handleAddChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload Images ({uploadedImages.length} selected)
              </label>
              <div className="w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Select main image
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-full object-cover rounded-lg cursor-pointer border-2 transition-all ${mainImageIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        onClick={() => setMainImageIndex(index)}
                      />
                      {mainImageIndex === index && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          MAIN
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        onClick={() => removeImage(index)}
                        disabled={isUploading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                disabled={isUploading || !isFormValid}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : 'Create Category'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Category"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 outline-none border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Category</h3>
          <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {selectedCategory && (
          <form onSubmit={saveEdit} className="space-y-5">
            <div>
              <label htmlFor="nameAz" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (Azərbaycanca)
              </label>
              <input
                id="nameAz"
                name="nameAz"
                type="text"
                value={selectedCategory.nameAz || ""}
                onChange={handleEditChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (English)
              </label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={selectedCategory.nameEn || ""}
                onChange={handleEditChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="nameRu" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Name (Русский)
              </label>
              <input
                id="nameRu"
                name="nameRu"
                type="text"
                value={selectedCategory.nameRu || ""}
                onChange={handleEditChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedCategory.status}
                onChange={handleEditChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Upload New Images ({uploadedImages.length} selected)
              </label>
              <div className="w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG (Max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Select main image
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-full object-cover rounded-lg cursor-pointer border-2 transition-all ${mainImageIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        onClick={() => setMainImageIndex(index)}
                      />
                      {mainImageIndex === index && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          MAIN
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        onClick={() => removeImage(index)}
                        disabled={isUploading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Category"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 outline-none border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <Trash size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Delete Category?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-200">"{selectedCategory?.name}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm w-full"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Category;
