import React, { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import InstallmentService from '../services/installmentService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

const InstallmentSecod = () => {
    const [installments, setInstallments] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [searchUserPin, setSearchUserPin] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [sortOrder, setsortOrder] = useState("DESC");
    const [statusFilter, setStatusFilter] = useState("");
    const [pageInfo, setPageInfo] = useState({ page: 1, size: 10, total: 0 });
    const [showMonthlyLimitModal, setShowMonthlyLimitModal] = useState(false);
    const [monthlyLimitUserPin, setMonthlyLimitUserPin] = useState("");
    const [monthlyLimitData, setMonthlyLimitData] = useState(null);
    const [loadingMonthlyLimit, setLoadingMonthlyLimit] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInstallment, setNewInstallment] = useState({
        userPin: "",
        months: "",
        productCodes: [""],
    });

    const [availableMonths, setAvailableMonths] = useState([]);
    const [loadingMonths, setLoadingMonths] = useState(false);
    const [monthsError, setMonthsError] = useState("");

    const navigate = useNavigate();

    const fetchInstallment = async (page = 1, size = 10, userPin = "", code = "", sortDir = "DESC", status = "") => {
        try {
            const params = {};
            if (userPin) params.userPin = userPin; // userPin string olarak kalır
            if (code) params.code = parseInt(code); // code number'a çevrilir
            if (page) params.page = page;
            if (size) params.size = size;
            if (sortDir) {
                params.sortField = "id";
                params.sortOrder = sortDir;
            }
            if (status) params.status = status;

            const response = await InstallmentService.getAllInstallments(params);
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
        fetchInstallment(1, pageInfo.size, searchUserPin, searchCode, sortOrder, statusFilter);
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

    const handleMonthlyLimitCheck = async () => {
        if (!monthlyLimitUserPin.trim()) {
            toast.error("Please enter a User PIN");
            return;
        }

        setLoadingMonthlyLimit(true);
        try {
            const response = await InstallmentService.getMonthlyLimit(monthlyLimitUserPin);
            setMonthlyLimitData(response.data);
            toast.success("Monthly limit data retrieved successfully!");
        } catch (error) {
            console.error("Error fetching monthly limit:", error);
            toast.error("Error fetching monthly limit. Please try again.");
            setMonthlyLimitData(null);
        } finally {
            setLoadingMonthlyLimit(false);
        }
    };


    useEffect(() => {
        const fetchAvailableMonths = async () => {
            const { userPin, productCodes } = newInstallment;
            if (!userPin || productCodes.length === 0 || productCodes.every(c => !c.trim())) {
                setAvailableMonths([]);
                setMonthsError("");
                return;
            }

            setLoadingMonths(true);
            setMonthsError("");
            try {
                const response = await InstallmentService.getAvailableMonths(
                    productCodes.filter(c => c.trim() !== ""),
                    userPin
                );
                setAvailableMonths(response.data.data.months || []);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching available months:", error);
                setAvailableMonths([]);
                setMonthsError(error.response?.data?.message || "Error fetching available months. Please check your inputs.");
            } finally {
                setLoadingMonths(false);
            }
        };

        fetchAvailableMonths();
    }, [newInstallment.userPin, newInstallment.productCodes]);

    const handleCreateInstallment = async () => {
        try {
            const payload = {
                userPin: newInstallment.userPin,
                productCodes: newInstallment.productCodes.filter(c => c.trim() !== ""),
                months: Number(newInstallment.months),
            };

            const response = await InstallmentService.createInstallment(payload);
            toast.success("Installment created successfully!");
            setShowAddModal(false);
            fetchInstallment(); // siyahını yenilə
        } catch (error) {
            console.error("Error creating installment:", error);
            toast.error("Failed to create installment.");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Installment Management
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Manage and monitor all installment applications
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3">
                            <button onClick={() => {
                                setShowAddModal(true);
                                setNewInstallment({
                                    userPin: "",
                                    months: "",
                                    productCodes: [""],
                                });
                                setAvailableMonths([]);
                                setMonthsError("");
                            }} className='inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200'>
                                <FaPlus className="w-4 h-4 mr-2" />
                                Create Installment
                            </button>
                            <button
                                onClick={() => setShowMonthlyLimitModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Monthly Limit
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters & Search</h3>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    User PIN
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter User PIN..."
                                    value={searchUserPin}
                                    onChange={(e) => setSearchUserPin(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Code..."
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sort Order
                                </label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => {
                                        setsortOrder(e.target.value);
                                        fetchInstallment(1, pageInfo.size, searchUserPin, searchCode, e.target.value, statusFilter);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                >
                                    <option value="DESC">Latest First</option>
                                    <option value="ASC">Oldest First</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        fetchInstallment(1, pageInfo.size, searchUserPin, searchCode, sortOrder, e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                >
                                    <option value="">All Status</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="ACTIVE">Active</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Installment Records</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total: {pageInfo.total} records</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        User PIN
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {installments.length > 0 ? (
                                    installments.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                #{item.id || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                                                {item.code || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.status === "COMPLETED"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        : item.status === "PENDING"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : item.status === "ACTIVE"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                                                {item.userPin || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/installment-detail/${item.id}`)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No data found</h3>
                                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <span>
                                Showing page <span className="font-medium">{pageInfo.page}</span> of{' '}
                                <span className="font-medium">{Math.ceil(pageInfo.total / pageInfo.size) || 1}</span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => fetchInstallment(pageInfo.page - 1, pageInfo.size, searchUserPin, searchCode, sortOrder, statusFilter)}
                                disabled={pageInfo.page <= 1}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${pageInfo.page <= 1
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-600'
                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <FaChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    {pageInfo.page} / {Math.ceil(pageInfo.total / pageInfo.size) || 1}
                                </span>
                            </div>

                            <button
                                onClick={() => fetchInstallment(pageInfo.page + 1, pageInfo.size, searchUserPin, searchCode, sortOrder, statusFilter)}
                                disabled={pageInfo.page * pageInfo.size >= pageInfo.total}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${pageInfo.page * pageInfo.size >= pageInfo.total
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed dark:text-gray-600 dark:border-gray-600'
                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Next
                                <FaChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>


                {showMonthlyLimitModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Check Monthly Limit
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowMonthlyLimitModal(false);
                                            setMonthlyLimitData(null);
                                            setMonthlyLimitUserPin("");
                                        }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            User PIN
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter User PIN..."
                                            value={monthlyLimitUserPin}
                                            onChange={(e) => setMonthlyLimitUserPin(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                        />
                                    </div>

                                    <button
                                        onClick={handleMonthlyLimitCheck}
                                        disabled={loadingMonthlyLimit}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                                    >
                                        {loadingMonthlyLimit ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Check Limit
                                            </>
                                        )}
                                    </button>

                                    {monthlyLimitData && (
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Monthly Limit Data:</h4>
                                            <pre className="text-lg text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                                {/* {JSON.stringify(monthlyLimitData, null, 2)} */}
                                                Your Monthly Limit is <strong className="text-red-600">{monthlyLimitData.data.limit}</strong> AZN
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAddModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <FaTimes size={18} />
                            </button>

                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                                Create New Installment
                            </h2>

                            <div className="space-y-4">
                                {/* USER PIN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        User PIN
                                    </label>
                                    <input
                                        type="text"
                                        value={newInstallment.userPin}
                                        onChange={(e) =>
                                            setNewInstallment({
                                                ...newInstallment,
                                                userPin: e.target.value,
                                            })
                                        }
                                        className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                        placeholder="Enter user PIN"
                                    />
                                </div>

                                {/* PRODUCT CODES */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Product Codes
                                    </label>
                                    {newInstallment.productCodes.map((code, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            value={code}
                                            onChange={(e) => {
                                                const updated = [...newInstallment.productCodes];
                                                updated[idx] = e.target.value;
                                                setNewInstallment({
                                                    ...newInstallment,
                                                    productCodes: updated,
                                                });
                                            }}
                                            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 mb-2"
                                            placeholder={`Product Code ${idx + 1}`}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setNewInstallment({
                                                ...newInstallment,
                                                productCodes: [...newInstallment.productCodes, ""],
                                            })
                                        }
                                        className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                        + Add another product
                                    </button>
                                </div>

                                {/* AVAILABLE MONTHS (Dropdown) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Months
                                    </label>

                                    {loadingMonths ? (
                                        <p className="text-sm text-gray-500 mt-1">Loading available months...</p>
                                    ) : monthsError ? (
                                        <div className="mt-1">
                                            <p className="text-sm text-red-600 dark:text-red-400">{monthsError}</p>
                                        </div>
                                    ) : availableMonths.length > 0 ? (
                                        <select
                                            value={newInstallment.months}
                                            onChange={(e) =>
                                                setNewInstallment({
                                                    ...newInstallment,
                                                    months: e.target.value,
                                                })
                                            }
                                            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                        >
                                            <option value="">Select month</option>
                                            {availableMonths.map((m, idx) => (
                                                <option key={idx} value={m}>
                                                    {m} ay
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enter User PIN and Product Codes to load months.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateInstallment}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                                    disabled={!newInstallment.userPin || !newInstallment.months}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InstallmentSecod;