import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axiosInstance from "../utils/axiosInstance";
import occasionService from "../services/occasionService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

Modal.setAppElement("#root");

const Occasions = () => {
  const [occasions, setOccasions] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  

  const fetchOccasions = async () => {
    try {
      const response = await occasionService.search();
      setOccasions(response.data.content);
    } catch (error) {
      console.error("Failed to fetch occasions:", error);
    }
  };

  const fetch = async (page = 0, size = 10, keyword = "") => {
    try {
      const criteria = {};
      if (keyword.trim()) criteria.keyword = keyword.trim();

      const pageable = { page, size };
      const response = await occasionService.search(criteria, pageable.page,pageable.size);
      setOccasions(response.data.content);
      setPageInfo({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch occasions:", error);
    }
  };
  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

   const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("tklikaat")
    fetch(0, pageInfo.size, searchName);
  };
  

  useEffect(() => {
    fetch(0, pageInfo.size, "");
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
    setSelectedOccasion({ name: "", status: "ACTIVE" });
    setAddOpen(true);
  };

  const openEditModal = (occasion) => {
    setSelectedOccasion(occasion);
    setEditOpen(true);
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
      fetchOccasions();
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to create occasion:", error);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await occasionService.update(selectedOccasion.id, selectedOccasion);
      fetchOccasions();
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update occasion:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await occasionService.delete(selectedOccasion.id);
      fetchOccasions();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete occasion:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Occasions Management</h2>
        <div className="flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Occasion
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
          >
            Export Excel
          </button>
        </div>
      </div>
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={handleSearchChange}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Search
        </button>
      </form>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {occasions?.map((occasion, index) => (
            <tr key={occasion.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{occasion.name}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                    occasion.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {occasion.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button onClick={() => openEditModal(occasion)} className="text-blue-600 hover:text-blue-900">
                  <PencilLine size={18} />
                </button>
                <button onClick={() => openDeleteModal(occasion)} className="text-red-600 hover:text-red-900">
                  <Trash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
<div className="flex justify-center items-center mt-6 space-x-4">
  <button
    onClick={() => fetch(pageInfo.page - 1, pageInfo.size, searchName)}
    disabled={pageInfo.page === 0}
    className={`p-2 rounded-full ${
      pageInfo.page === 0
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    <FaChevronLeft size={20} />
  </button>
  <span className="text-gray-800 dark:text-gray-200 text-sm">
    Page {pageInfo.page + 1} of {Math.ceil(pageInfo.totalElements / pageInfo.size)}
  </span>
  <button
    onClick={() => fetch(pageInfo.page + 1, pageInfo.size, searchName)}
    disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
    className={`p-2 rounded-full ${
      (pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
    }`}
  >
    <FaChevronRight size={20} />
  </button>
</div>

      {/* Add/Edit/Delete Modals */}
      <Modal
        isOpen={addOpen || editOpen}
        onRequestClose={() => { setAddOpen(false); setEditOpen(false); }}
        contentLabel="Occasion Modal"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <form onSubmit={addOpen ? saveAdd : saveEdit} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {addOpen ? "Add Occasion" : "Edit Occasion"}
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={selectedOccasion?.name || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={selectedOccasion?.status || "ACTIVE"}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setAddOpen(false); setEditOpen(false); }} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {addOpen ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Occasion"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Confirm Delete</h3>
        <p className="text-gray-700 dark:text-gray-300 mt-4">Are you sure you want to delete <strong>{selectedOccasion?.name}</strong>?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600">
            Cancel
          </button>
          <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Occasions;
