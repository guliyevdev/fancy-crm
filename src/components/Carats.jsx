import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import caratService from "../services/caratService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

Modal.setAppElement("#root");

const Carats = () => {
  const [carats, setCarats] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCarat, setSelectedCarat] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  

  const fetchCarats = async () => {
    try {
      const response = await caratService.search();
      setCarats(response.data.content);
    } catch (error) {
      console.error("Failed to fetch carats:", error);
    }
  };
   const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  useEffect(() => {
    fetch(0, pageInfo.size, "");
  }, []);

  const exportToExcel = () => {
    const data = carats.map(({ id, name, status }) => ({
      ID: id,
      Name: name,
      Status: status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Carats");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "carats.xlsx");
  };

  // Open modals
  const openAddModal = () => {
    setSelectedCarat({ name: "", status: "ACTIVE" });
    setAddOpen(true);
  };

  const openEditModal = (carat) => {
    setSelectedCarat(carat);
    setEditOpen(true);
  };

  const openDeleteModal = (carat) => {
    setSelectedCarat(carat);
    setDeleteOpen(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCarat((prev) => ({ ...prev, [name]: value }));
  };

  // Add carat
  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await caratService.create(selectedCarat);
      fetchCarats();
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to create carat:", error);
    }
  };

  // Edit carat
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await caratService.update(selectedCarat.id, selectedCarat);
      fetchCarats();
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update carat:", error);
    }
  };

  const fetch = async (page = 0, size = 10, name = "") => {
    try {
      const criteria = {};
      if (name.trim()) criteria.name = name.trim();

      const pageable = { page, size };
      const response = await caratService.search(criteria, pageable.page,pageable.size);
      setCarats(response.data.content);
      setPageInfo({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch karats:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetch(0, pageInfo.size, searchName);
  };
  // Delete carat
  const confirmDelete = async () => {
    try {
      await caratService.delete(selectedCarat.id);
      fetchCarats();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete carat:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Karats Management</h2>
        <div className="flex gap-4">
          <button
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Karat
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {carats?.map((carat, index) => (
            <tr key={carat.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{carat.name}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    carat.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {carat.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium flex gap-4 justify-end">
                <button
                  onClick={() => openEditModal(carat)}
                  className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                  aria-label={`Edit ${carat.name}`}
                >
                  <PencilLine size={20} />
                </button>
                <button
                  onClick={() => openDeleteModal(carat)}
                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                  aria-label={`Delete ${carat.name}`}
                >
                  <Trash size={20} />
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

      {/* Add Modal */}
      <Modal
        isOpen={addOpen}
        onRequestClose={() => setAddOpen(false)}
        contentLabel="Add Carat"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Carat</h3>
        {selectedCarat && (
          <form onSubmit={saveAdd} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={selectedCarat.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedCarat.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                Add
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Carat"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Carat</h3>
        {selectedCarat && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={selectedCarat.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedCarat.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Carat"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirm Delete</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete <span className="font-semibold">{selectedCarat?.name}</span>?
        </p>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Carats;
