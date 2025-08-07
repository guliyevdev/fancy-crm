import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import partnerService from "../services/partnerService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  const navigate = useNavigate();

  const fetch = async (page = 0, size = 10, keyword = "") => {
    try {
      const criteria = {};
      if (keyword.trim()) criteria.keyword = keyword.trim();

      const response = await partnerService.searchPartners(criteria, page, size);
      setPartners(response.content || []);
      setPageInfo({
        page: response.number,
        size: response.size,
        totalElements: response.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const exportToExcel = () => {
    const data = partners.map((p) => ({
      ID: p.id,
      Name: p.name,
      Email: p.email,
      Phone: p.phone,
      Address: p.address,
      Company: p.companyName,
      Status: p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Partners");
    const blob = new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
      type: "application/octet-stream",
    });
    saveAs(blob, "partners.xlsx");
  };


  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await partnerService.updatePartner(selectedPartner.id, selectedPartner);
      fetch();
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update partner:", error);
    }
  };



  const confirmDelete = async () => {
    try {
      await partnerService.deletePartner(selectedPartner.id);
      fetch();
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete partner:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetch(0, 10, searchName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPartner((prev) => ({ ...prev, [name]: value }));
  };

  const renderEditModal = () => (
    <Modal
      isOpen={editOpen}
      onRequestClose={() => setEditOpen(false)}
      contentLabel="Edit Partner"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
    >
      <h3 className="text-xl font-semibold mb-4">Edit Partner</h3>
      {selectedPartner && (
        <form onSubmit={saveEdit} className="space-y-4">
          {["name", "email", "phone", "address"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium mb-1 capitalize">
                {field}
              </label>
              <input
                id={field}
                name={field}
                value={selectedPartner[field] || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      )}
    </Modal>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Partners Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/partners/add")}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Partner
          </button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded">
            Export Excel
          </button>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by company name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-3 py-2 border rounded w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
          Search
        </button>
      </form>

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Address</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Company Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {partners.map((partner) => (
            <tr key={partner.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{partner.name}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{partner.email}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{partner.phone}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{partner.address}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{partner.companyName}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                <span
                  className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                    partner.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                  }`}
                >
                  {partner.status}
                </span>
              </td>
              <td className="px-4 py-2 text-right flex justify-end gap-2">
                <button onClick={() => navigate(`/partners/${partner.id}`)} className="text-blue-600">
                  <PencilLine size={18} />
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
          className={`p-2 rounded-full ${pageInfo.page === 0 ? "text-gray-400" : "text-gray-700 dark:text-white"}`}
        >
          <FaChevronLeft />
        </button>
        <span className="text-sm text-gray-800 dark:text-white">
          Page {pageInfo.page + 1} of {Math.ceil(pageInfo.totalElements / pageInfo.size)}
        </span>
        <button
          onClick={() => fetch(pageInfo.page + 1, pageInfo.size, searchName)}
          disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
          className={`p-2 rounded-full ${
            (pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
              ? "text-gray-400"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <FaChevronRight />
        </button>
      </div>

      {renderEditModal()}

      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(false)}
        contentLabel="Delete Partner"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
      >
        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete <strong>{selectedPartner?.name}</strong>?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Partners;
