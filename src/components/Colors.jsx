import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import colorService from "../services/colorService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { usePermission } from "../hooks/usePermission";

Modal.setAppElement("#root");

const Colors = () => {
  const [colors, setColors] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  const { hasPermission } = usePermission();

  const fetchColors = async (page = 0, size = 10, keyword = "") => {
    try {
      const params = {
        name: keyword,
        active: true,
        page,
        size,
      };

      const response = await colorService.search(params);

      const apiData = response.data?.data || response.data;
      const colorsData = apiData?.content || [];

      setColors(colorsData);
      setPageInfo({
        page: apiData?.number || 0,
        size: apiData?.size || size,
        totalElements: apiData?.totalElements || 0,
      });
    } catch (error) {
      console.error("Fetch colors error:", error);
      setColors([]);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const exportToExcel = () => {
    const data = colors.map(({ id, name, hexCode, status }) => ({
      ID: id,
      Name: name,
      HexCode: hexCode,
      Status: status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colors");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "colors.xlsx");
  };

  const openAddModal = () => {
    setSelectedColor({
      nameAz: "",
      nameEn: "",
      nameRu: "",
      hexCode: "",
      active: true
    });
    setAddOpen(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setSelectedColor((prev) => ({
      ...prev,
      [name]: name === "active" ? value === "true" : value,
    }));
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await colorService.create(selectedColor);
      fetchColors(pageInfo.page, pageInfo.size, searchName);
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to create color:", error);
    }
  };

  const openEditModal = async (color) => {
    try {
      // Fetch full details including nameAz, nameEn, nameRu
      const response = await colorService.getByIdV2(color.id);
      const data = response.data?.data || response.data;
      setSelectedColor(data);
      setEditOpen(true);
    } catch (error) {
      console.error("Error fetching color details:", error);
      // Fallback to table data if fetch fails, though it might be incomplete
      setSelectedColor(color);
      setEditOpen(true);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedColor((prev) => ({
      ...prev,
      [name]: name === "active" ? value === "true" : value,
    }));
  };

  const openDeleteModal = (color) => {
    setSelectedColor(color);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await colorService.delete(selectedColor.id);
      fetchColors(pageInfo.page, pageInfo.size, searchName);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete color:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchColors(0, pageInfo.size, searchName);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await colorService.update(selectedColor.id, selectedColor);
      fetchColors(pageInfo.page, pageInfo.size, searchName);
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update color:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Colors Management
          </h2>
          <div className="flex gap-3">
            {hasPermission("ADD_COLOR") && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                title="Add Color"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Color
              </button>
            )}

            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              title="Export colors to Excel"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {colors?.map((color, index) => (
                <tr
                  key={color.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {index + 1 + (pageInfo.page * pageInfo.size)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {color.name}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                    >
                      {color.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {hasPermission("UPDATE_COLOR") && (
                        <button
                          onClick={() => openEditModal(color)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <PencilLine size={18} />
                        </button>
                      )}
                      {hasPermission("FIND_COLOR_BY_ID") && (
                        <button
                          onClick={() => openDeleteModal(color)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing page <span className="font-medium">{pageInfo.page + 1}</span> of <span className="font-medium">{Math.ceil(pageInfo.totalElements / pageInfo.size) || 1}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchColors(pageInfo.page - 1, pageInfo.size, searchName)}
              disabled={pageInfo.page === 0}
              className={`p-2 rounded-lg border ${pageInfo.page === 0
                ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                } transition-colors duration-200`}
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={() => fetchColors(pageInfo.page + 1, pageInfo.size, searchName)}
              disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
              className={`p-2 rounded-lg border ${(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
                ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                } transition-colors duration-200`}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={addOpen}
        onRequestClose={() => setAddOpen(false)}
        contentLabel="Add Color"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full p-6 outline-none border border-gray-200 dark:border-gray-700 transform transition-all"
      >
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 dark:border-gray-700">Add Color</h3>
        {selectedColor && (
          <form onSubmit={saveAdd} className="space-y-4">
            <div>
              <label htmlFor="nameAz" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (Az)
              </label>
              <input
                id="nameAz"
                name="nameAz"
                type="text"
                value={selectedColor.nameAz || ""}
                onChange={handleAddChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (En)
              </label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={selectedColor.nameEn || ""}
                onChange={handleAddChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="nameRu" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (Ru)
              </label>
              <input
                id="nameRu"
                name="nameRu"
                type="text"
                value={selectedColor.nameRu || ""}
                onChange={handleAddChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="active" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="active"
                name="active"
                value={selectedColor.active?.toString()}
                onChange={handleAddChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Add Color
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Color"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full p-6 outline-none border border-gray-200 dark:border-gray-700 transform transition-all"
      >
        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 dark:border-gray-700">Edit Color</h3>
        {selectedColor && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label htmlFor="nameAz" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (Az)
              </label>
              <input
                id="nameAz"
                name="nameAz"
                type="text"
                value={selectedColor.nameAz || ""}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (En)
              </label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={selectedColor.nameEn || ""}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="nameRu" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name (Ru)
              </label>
              <input
                id="nameRu"
                name="nameRu"
                type="text"
                value={selectedColor.nameRu || ""}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="active" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="active"
                name="active"
                value={selectedColor.active?.toString()}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Color"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm"
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 outline-none border border-gray-200 dark:border-gray-700 transform transition-all"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedColor?.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            Delete Color
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Colors;
