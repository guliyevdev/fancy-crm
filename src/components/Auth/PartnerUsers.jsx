import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Authservices from "../../services/authServices";

const PartnerUsers = () => {
    const [users, setUsers] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    // API-dən istifadəçiləri çəkirik
    const fetchUsers = (page = 0) => {
        Authservices.getAllUsers({
            page: page,
            size: pageInfo.size,
            active: true
        }).then((res) => {
            const data = res.data.data;
            setUsers(data.users);
            setPageInfo({
                page: page,
                size: data.currentPageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages
            });
        }).catch(err => {
            console.error("Failed to fetch users", err);
        });
    };

    useEffect(() => {
        fetchUsers(0);
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Product Users
                </h2>
                <div className="flex gap-4">
                    {/* <button
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </button> */}
                    <button
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        Export Excel
                    </button>
                </div>
            </div>

            <form className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-64 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                    Search
                </button>
            </form>

            <div className="overflow-x-auto max-w-[1300px]">

                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3">Full Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Active</th>
                            <th className="px-6 py-3">Roles</th>
                            <th className="px-6 py-3">Deposit</th>
                            <th className="px-6 py-3">Created Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 dark:text-white">
                        {users.filter(user => user.roles.includes("productUser")).map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 break-words max-w-[200px]">{index + 1 + pageInfo.page * pageInfo.size}</td>
                                <td className="px-6 py-4 break-words max-w-[200px]">{user.fullName}</td>
                                <td className="px-6  py-4 break-words max-w-[200px]">{user.email}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.active ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"}`}>
                                        {user.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                                        value={user.roles}
                                        onChange={(e) => {
                                            const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
                                            console.log("Yeni seçilən rollar:", selectedRoles);

                                        }}
                                    >
                                        {["admin", "productUser", "agency", "user"].map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                <td className="px-6 py-4">{user.deposit}</td>
                                <td className="px-6 py-4">{new Date(user.createdDate).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right flex gap-4 justify-end">
                                    <button className="text-blue-600 hover:text-blue-900">
                                        <PencilLine size={20} />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <Trash size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => fetchUsers(pageInfo.page - 1)}
                    disabled={pageInfo.page === 0}
                    className={`p-2 rounded-full ${pageInfo.page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                >
                    <FaChevronLeft size={20} />
                </button>
                <span className="text-gray-800 dark:text-gray-200 text-sm">
                    Page {pageInfo.page + 1} of {pageInfo.totalPages}
                </span>
                <button
                    onClick={() => fetchUsers(pageInfo.page + 1)}
                    disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                    className={`p-2 rounded-full ${pageInfo.page + 1 >= pageInfo.totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                >
                    <FaChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default PartnerUsers;
