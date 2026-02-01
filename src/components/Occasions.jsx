import { useEffect, useState } from "react";
import { PencilLine, Trash, Plus, X } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import occasionService from "../services/occasionService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

Modal.setAppElement("#root");

const Occasions = () => {
  const [occasions, setOccasions] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  const { hasPermission } = usePermission();

  const fetch = async (page = 0, size = 10, keyword = "") => {
    try {
      const params = {
        name: keyword,
        active: true,
        page,
        size,
      };

      const response = await occasionService.search(params);

      const apiData = response.data?.data || response.data;
      const occasionsData = apiData?.content || [];

      setOccasions(occasionsData);
      setPageInfo({
        page: apiData?.number || 0,
        size: apiData?.size || size,
        totalElements: apiData?.totalElements || 0,
      });
    } catch (error) {
      console.error("Fetch occasions error:", error);
      setOccasions([]);
    }
  };

  const fetchAllOccasions = async () => {
    // Initial load, similar to fetch but maybe intended for something else or just initial load
    // Reusing logic via useEffect is better, but keeping function for now
    fetch(0, 10, "");
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetch(0, pageInfo.size, searchName);
  };

  useEffect(() => {
    fetchAllOccasions();
  }, []);

  const exportToExcel = () => {
    const data = occasions.map(({ id, name, status }) => ({
      ID: id,
      Name: name,
      Status: status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Occasions");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "occasions.xlsx");
  };

  const openAddModal = () => {
    setSelectedOccasion({ nameAz: "", nameEn: "", nameRu: "", status: "ACTIVE" });
    setAddOpen(true);
  };

  const openEditModal = async (occasion) => {
    try {
      const response = await occasionService.getByIdV2(occasion.id);
      const data = response.data?.data || response.data;
      setSelectedOccasion(data);
      setEditOpen(true);
    } catch (error) {
      console.error("Failed to fetch occasion details:", error);
      setSelectedOccasion(occasion); // Fallback
      setEditOpen(true);
    }
  };

  const openDeleteModal = (occasion) => {
    setSelectedOccasion(occasion);
    setDeleteOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedOccasion((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await occasionService.create(selectedOccasion);
      fetch(0, pageInfo.size, searchName); // Refresh list
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to create occasion:", error);
      alert("Xəta baş verdi: " + (error.message || "Naməlum xəta"));
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await occasionService.update(selectedOccasion.id, selectedOccasion);
      fetch(pageInfo.page, pageInfo.size, searchName); // Refresh current page
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update occasion:", error);
      alert("Xəta baş verdi: " + (error.message || "Naməlum xəta"));
    }
  };

  const confirmDelete = async () => {
    try {
      await occasionService.delete(selectedOccasion.id);
      fetch(pageInfo.page, pageInfo.size, searchName);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete occasion:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Occasions Management
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search occasions..."
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

            <div className="flex gap-2">
              {hasPermission("ADD_OCCASION") && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </button>
              )}

              <button
                onClick={exportToExcel}
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {occasions?.map((occasion, index) => (
                <tr key={occasion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {pageInfo.page * pageInfo.size + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {occasion.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${occasion.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${occasion.status === "ACTIVE" ? "bg-green-600" : "bg-yellow-600"
                        }`}></span>
                      {occasion.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {hasPermission("UPDATE_OCCASION") && (
                        <button
                          onClick={() => openEditModal(occasion)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit"
                        >
                          <PencilLine size={18} />
                        </button>
                      )}
                      {hasPermission("FIND_OCCASION_BY_ID") && (
                        <button
                          onClick={() => openDeleteModal(occasion)}
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
              {occasions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">No occasions found</p>
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
              onClick={() => fetch(pageInfo.page - 1, pageInfo.size, searchName)}
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
              onClick={() => fetch(pageInfo.page + 1, pageInfo.size, searchName)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={addOpen || editOpen}
        onRequestClose={() => { setAddOpen(false); setEditOpen(false); }}
        contentLabel="Occasion Modal"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 outline-none border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {addOpen ? "Add Occasion" : "Edit Occasion"}
          </h3>
          <button onClick={() => { setAddOpen(false); setEditOpen(false); }} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={addOpen ? saveAdd : saveEdit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Name (Azərbaycanca)
            </label>
            <input
              name="nameAz"
              type="text"
              value={selectedOccasion?.nameAz || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              placeholder="Enter name in Azerbaijani"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Name (English)
            </label>
            <input
              name="nameEn"
              type="text"
              value={selectedOccasion?.nameEn || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              placeholder="Enter name in English"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Name (Русский)
            </label>
            <input
              name="nameRu"
              type="text"
              value={selectedOccasion?.nameRu || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              placeholder="Enter name in Russian"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={selectedOccasion?.status || "ACTIVE"}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => { setAddOpen(false); setEditOpen(false); }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              {addOpen ? "Add Occasion" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Occasion"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 outline-none border border-gray-100 dark:border-gray-700"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <Trash size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Delete Occasion?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-200">"{selectedOccasion?.name}"</span>? This action cannot be undone.
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

export default Occasions;
