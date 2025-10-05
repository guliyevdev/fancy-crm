import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaChevronLeft, FaChevronRight, FaEdit } from "react-icons/fa";
import InstallmentService from "../services/installmentService";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

const InstallMent = () => {
  const [installments, setInstallments] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, total: 0 });
  const navigate = useNavigate();

  const fetchInstallment = async (page = 1, size = 10, keyword = "", sortDir = "DESC", status = "") => {
    try {
      const params = {};
      if (keyword) params.uuid = keyword;
      if (page) params.page = page;
      if (size) params.size = size;
      if (sortDir) {
        params.sortField = "createdAt";
        params.sortDirection = sortDir;
      }
      if (status) params.status = status;

      const response = await InstallmentService.getAll(params);
      const apiData = response?.data?.data || {};
      const items = apiData?.items || [];

      setInstallments(items);
      setPageInfo({
        page: apiData.page || 1,
        size: apiData.size || 10,
        total: apiData.total || items.length,
      });
    } catch (error) {
      console.error("Fetch installment error:", error);
      setInstallments([]);
    }
  };

  useEffect(() => {
    fetchInstallment();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInstallment(1, pageInfo.size, searchName, sortDirection, statusFilter);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(installments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Installments");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "installments.xlsx");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Installment Applications
        </h2>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
        >
          Export Excel
        </button>
      </div>

      {/* Search + Sort + Status */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by UUID..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Search
        </button>

        <select
          value={sortDirection}
          onChange={(e) => {
            setSortDirection(e.target.value);
            fetchInstallment(1, pageInfo.size, searchName, e.target.value, statusFilter);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="DESC">Ən yeni müraciətlər</option>
          <option value="ASC">Ən köhnə müraciətlər</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchInstallment(1, pageInfo.size, searchName, sortDirection, e.target.value);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="">Bütün statuslar</option>
          <option value="APPROVED">APPROVED</option>
          <option value="PENDING">PENDING</option>
          <option value="REJECTED">REJECTED</option>
        </select>


      </form>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UUID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated At</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {installments.length > 0 ? (
            installments.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100">
                <td className="px-6 py-4 text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-sm font-mono">{item.uuid ? item.uuid.slice(0, 8) : "-"}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-2 text-xs font-semibold rounded-full ${item.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : item.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{item.createdAt ? item.createdAt.slice(0, 10) : "-"}</td>
                <td className="px-6 py-4 text-sm">{item.updatedAt ? item.updatedAt.slice(0, 10) : "-"}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => navigate(`/installment/${item.id}`)}
                  >
                    <FaEdit size={18} />
                  </button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => fetchInstallment(pageInfo.page - 1, pageInfo.size, searchName, sortDirection, statusFilter)}
          disabled={pageInfo.page <= 1}
          className={`p-2 rounded-full ${pageInfo.page <= 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}`}
        >
          <FaChevronLeft size={20} />
        </button>

        <span className="text-gray-800 text-sm">
          Page {pageInfo.page} of {Math.ceil(pageInfo.total / pageInfo.size) || 1}
        </span>

        <button
          onClick={() => fetchInstallment(pageInfo.page + 1, pageInfo.size, searchName, sortDirection, statusFilter)}
          disabled={pageInfo.page * pageInfo.size >= pageInfo.total}
          className={`p-2 rounded-full ${pageInfo.page * pageInfo.size >= pageInfo.total ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-200"}`}
        >
          <FaChevronRight size={20} />
        </button>
      </div>


    </div>
  );
};

export default InstallMent;
