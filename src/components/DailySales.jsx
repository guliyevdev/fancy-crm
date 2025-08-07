import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import dailySalesService from "../services/dailySalesService";
import { setDay } from "date-fns";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

Modal.setAppElement("#root");

const DailySales = () => {
  const [sales, setSales] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });

  const fetchSales = async () => {
    try {
      const response = await dailySalesService.search({ page: 0, size: 100 });
      setSales(response.data.content);
    } catch (error) {
      console.error("Failed to fetch daily sales:", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAddModal = () => {
    setSelectedSale({ days: 0, percent: 0, status: "ACTIVE" });
    setAddOpen(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setSelectedSale((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await dailySalesService.create(selectedSale);
      fetchSales();
      setAddOpen(false);
    } catch (error) {
      console.error("Failed to create daily sale:", error);
    }
  };

  const openEditModal = (sale) => {
    setSelectedSale(sale);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedSale((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await dailySalesService.update(selectedSale.id, selectedSale);
      fetchSales();
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update daily sale:", error);
    }
  };
  
   const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

   const fetch = async (page = 0, size = 10, keyword = "") => {
    try {
      const criteria = {};
      if (keyword.trim()) criteria.keyword = keyword.trim();

      const pageable = { page, size };
      const response = await dailySalesService.search(criteria,pageable.page,pageable.size);
      setSales(response.data.content);
      setPageInfo({
        page: response.data.number,
        size: response.data.size,
        totalElements: response.data.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetch(0, pageInfo.size, searchName);
  };

  const openDeleteModal = (sale) => {
    setSelectedSale(sale);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dailySalesService.delete(selectedSale.id);
      fetchSales();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete daily sale:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Daily Sales Management
        </h2>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Add Daily Sale"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </button>
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Percent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {sales?.map((sale, index) => (
            <tr key={sale.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{sale.days}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{sale.percent}</td>
              <td className="px-6 py-4 text-sm whitespace-nowrap">
                <span
                  className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    sale.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {sale.status === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium flex gap-4 justify-end">
                <button
                  onClick={() => openEditModal(sale)}
                  className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                  aria-label={`Edit sale #${index + 1}`}
                >
                  <PencilLine size={20} />
                </button>
                <button
                  onClick={() => openDeleteModal(sale)}
                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                  aria-label={`Delete sale #${index + 1}`}
                >
                  <Trash size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
        contentLabel="Add Daily Sale"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Daily Sale</h3>
        {selectedSale && (
          <form onSubmit={saveAdd} className="space-y-4">
            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Days
              </label>
              <input
                id="days"
                name="days"
                type="number"
                value={selectedSale.days}
                onChange={handleAddChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="percent" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Percent
              </label>
              <input
                id="percent"
                name="percent"
                type="number"
                value={selectedSale.percent}
                onChange={handleAddChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedSale.status}
                onChange={handleAddChange}
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
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
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
        contentLabel="Edit Daily Sale"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Daily Sale</h3>
        {selectedSale && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Days
              </label>
              <input
                id="days"
                name="days"
                type="number"
                value={selectedSale.days}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="percent" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Percent
              </label>
              <input
                id="percent"
                name="percent"
                type="number"
                value={selectedSale.percent}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={selectedSale.status}
                onChange={handleEditChange}
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
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
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
        contentLabel="Delete Daily Sale"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirm Delete</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this daily sale entry?
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

export default DailySales;
