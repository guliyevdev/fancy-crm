import React, { useEffect, useState } from "react";
import {
  Eye,
  PencilLine,
  Plus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Trash2,
  X,
  Building2,
  FileUp
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import partnerService from "../services/partnerService";
import { useNavigate } from "react-router-dom";

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
  const [partnerType, setPartnerType] = useState('');
  const [status, setStatus] = useState('');

  const navigate = useNavigate();

  const fetchPartners = async (page = 0, size = 10, search = "", type = '', statusFilter = '') => {
    try {
      const criteria = {};
      if (search.trim()) criteria.searchBox = search.trim();
      if (type) criteria.partnerType = type;
      if (statusFilter) criteria.status = statusFilter;

      const response = await partnerService.searchPartners(criteria, page, size);

      setPartners(response.data.content || []);
      setPageInfo({
        page: response.data.pageable.pageNumber,
        size: response.data.pageable.pageSize,
        totalElements: response.data.totalElements
      });
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      setPartners([]);
    }
  };

  useEffect(() => {
    fetchPartners(0, pageInfo.size, searchName, partnerType, status);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPartners(0, pageInfo.size, searchName, partnerType, status);
  };

  const handlePartnerTypeChange = (event) => {
    const value = event.target.value || '';
    setPartnerType(value);
    fetchPartners(0, pageInfo.size, searchName, value, status);
  };

  const handleStatusChange = (event) => {
    const value = event.target.value || '';
    setStatus(value);
    fetchPartners(0, pageInfo.size, searchName, partnerType, value);
  };

  // 📊 Export to Excel
  const exportToExcel = () => {
    const data = partners.map((p) => ({
      ID: p.id,
      Name: p.name,
      Surname: p.surname,
      Email: p.email,
      Phone: p.phoneNumber,
      "Customer Code": p.customerCode,
      "Partner Type": p.partnerType,
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

  // 📝 Edit Partner
  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await partnerService.updatePartner(selectedPartner.id, selectedPartner);
      fetchPartners(pageInfo.page, pageInfo.size, searchName, partnerType, status);
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to update partner:", error);
    }
  };

  const confirmDelete = async () => {
    try {
      await partnerService.deletePartner(selectedPartner.id);
      fetchPartners(pageInfo.page, pageInfo.size, searchName, partnerType, status);
      setDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete partner:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPartner((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (partner) => {
    setSelectedPartner(partner);
    setEditOpen(true);
  };

  const openDeleteModal = (partner) => {
    setSelectedPartner(partner);
    setDeleteOpen(true);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
            <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Partners Management
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage partner companies and entities
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/partners/add")}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by name, surname or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
            />
          </form>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={partnerType}
                onChange={handlePartnerTypeChange}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white appearance-none cursor-pointer transition-all"
              >
                <option value="">All Types</option>
                <option value="PHYSICAL">Physical</option>
                <option value="CORPORATE">Corporate</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white appearance-none cursor-pointer transition-all"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partner Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type & Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {partners.map((partner) => (
                <tr
                  key={partner.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium shadow-sm">
                          {partner.name?.[0]}{partner.surname?.[0]}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {partner.name} {partner.surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        {partner.email || "-"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {partner.phoneNumber || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {partner.partnerType}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {partner.customerCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${partner.status === "VERIFIED"
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      : partner.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${partner.status === "VERIFIED"
                        ? "bg-green-600 dark:bg-green-400"
                        : partner.status === "PENDING"
                          ? "bg-amber-600 dark:bg-amber-400"
                          : "bg-red-600 dark:bg-red-400"
                        }`}></span>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => navigate(`/partners/${partner.id}`)}
                        className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/partner-upload/${partner.id}`)}
                        className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                        title="Upload Documents"
                      >
                        <FileUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(partner)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                        title="Edit Partner"
                      >
                        <PencilLine className="w-4 h-4" />
                      </button>
                      {/* Add delete button if needed, assuming trash icon */}
                      {/* <button
                                                onClick={() => openDeleteModal(partner)}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                title="Delete Partner"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing page <span className="font-medium">{pageInfo.page + 1}</span> of <span className="font-medium">{Math.ceil(pageInfo.totalElements / pageInfo.size)}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPartners(pageInfo.page - 1, pageInfo.size, searchName, partnerType, status)}
              disabled={pageInfo.page === 0}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => fetchPartners(pageInfo.page + 1, pageInfo.size, searchName, partnerType, status)}
              disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setEditOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all scale-100">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                  <PencilLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Edit Partner
              </h3>
              <button
                onClick={() => setEditOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveEdit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={selectedPartner.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={selectedPartner.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={selectedPartner.phoneNumber || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Customer Code
                    </label>
                    <input
                      type="text"
                      name="customerCode"
                      value={selectedPartner.customerCode || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete <strong>{selectedPartner.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setDeleteOpen(false)}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
