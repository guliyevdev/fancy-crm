import React, { useEffect, useState } from "react";
import { Eye, PencilLine, Plus, X, Users, Search, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Authservices from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { usePermission } from "../../hooks/usePermission";

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
    const [, setCurrentPage] = useState(0);
    const { hasPermission } = usePermission();

    const [searchName, setSearchName] = useState("");
    const [searchStatus,] = useState("all");
    const navigate = useNavigate();

    const handleAddUser = () => {
        navigate('/user/add-user');
    };

    const fetchUsers = async (page = 0, size = 10, keyword = "") => {
        const token = Cookies.get("accessToken");
        if (!token) return;

        try {
            const params = {
                search: keyword,
                active: searchStatus === "all" ? null : searchStatus === "active",
                page,
                size,
            };

            const response = await Authservices.search(params);
            const apiData = response.data?.data || response.data;
            const authData = apiData?.users || [];

            setUsers(authData);
            setCurrentPage(page);

            setPageInfo({
                page,
                size: apiData?.size || size,
                totalElements: apiData?.totalElements || 0,
                totalPages: apiData?.totalPages || 1,
            });
        } catch (error) {
            if (error.response?.status === 401) {
                navigate("/login");
            } else {
                setUsers([]);
            }
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(0, 10, searchName);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-200">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Users size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Users className="text-blue-600" /> All Users
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">
                            Manage system users and their roles
                        </p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                        {hasPermission("CAN_CREATE_USER") && (
                            <button
                                onClick={handleAddUser}
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add User
                            </button>
                        )}
                        <button
                            className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
                        >
                            <Download className="mr-2 h-4 w-4" /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Search & Filters</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearchSubmit} className="relative group flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by name and surname..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none group-hover:bg-white dark:group-hover:bg-gray-700"
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </form>
                        <button
                            onClick={handleSearchSubmit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Surname</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fin</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deposit</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map((user, index) => (
                                    <tr key={user.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200">
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {index + 1 + pageInfo.page * pageInfo.size}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {user.surname}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {user.fin}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {user.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${user.active
                                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.active ? "bg-green-500" : "bg-red-500"}`}></div>
                                                {user.active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.roles && user.roles.length > 0 ? (
                                                <select
                                                    className="px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    value={user.roles[0]} // Showing first role or handling multiple? Original code had value={user.roles} which might be an array, select value expects single string usually unless multiple. Assuming just display for now or basic select.
                                                    onChange={(e) => {
                                                        const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
                                                        console.log("New selected roles:", selectedRoles);
                                                    }}
                                                >
                                                    {user.roles.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No roles</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                            {user.deposit}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.createdDate).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/alluser/${user.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {hasPermission("CAN_UPDATE_USER") && (
                                                    <button
                                                        onClick={() => navigate(`/user-upload/${user.id}`)}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <PencilLine size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Page {pageInfo.page + 1} of {pageInfo.totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchUsers(pageInfo.page - 1)}
                                disabled={pageInfo.page === 0}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={() => fetchUsers(pageInfo.page + 1)}
                                disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllUsers;