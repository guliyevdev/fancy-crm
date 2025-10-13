import React, { useEffect, useState } from "react";
import { Eye, PencilLine, Plus, X } from "lucide-react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Authservices from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";

const PartnerUser = () => {
    const [users, setUsers] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const {hasPermission} = usePermission();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        active: true,
        roles: [],
        deposit: 0
    });
    const [searchName, setSearchName] = useState("");
    const [searchStatus, setSearchStatus] = useState("all");
    const navigate = useNavigate();

    const handleAddUser = () => {
        navigate('/user/add-user');
    };


    const fetchUsers = async (page = 0, size = 10, keyword = "") => {
        try {
            const params = {
                search: keyword,
                active: searchStatus === "all" ? null : searchStatus === "active", // true/false/null olmalıdır
                page,
                size,
            };

            const response = await Authservices.searchPartners(params);
            const apiData = response.data?.data || response.data;
            const authData = apiData?.users || [];

            setUsers(authData);
            setCurrentPage(page); // Cari səhifəni saxlayın

            setPageInfo({
                page: page, // API cavabında number olmadığı üçün parametrdən istifadə edin
                size: apiData?.size || size,
                totalElements: apiData?.totalElements || 0,
                totalPages: apiData?.totalPages || 1,
            });
        } catch (error) {
            console.error("Fetch users error:", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchUsers(0);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // fetchUsers(0);
        fetchUsers(0, 10, searchName);
    };

    const handleStatusChange = (e) => {
        setSearchStatus(e.target.value);
        // fetchUsers(0);
        fetchUsers(0, 10, searchName);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            active: user.active,
            roles: Array.isArray(user.roles) ? user.roles : [user.roles],
            deposit: user.deposit
        });
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleChange = (e) => {
        const options = e.target.options;
        const selectedRoles = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedRoles.push(options[i].value);
            }
        }
        setFormData(prev => ({
            ...prev,
            roles: selectedRoles
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        Authservices.updateUserById(editingUser.id, formData)
            .then(() => {
                const updatedUsers = users.map(user =>
                    user.id === editingUser.id
                        ? { ...user, ...formData }
                        : user
                );
                setUsers(updatedUsers);
                handleCloseModal();
            })
            .catch(err => {
                console.error("Failed to update user", err);
            });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Partner Users
                </h2>
                <div className="flex gap-4">
                    {/* <button
                        onClick={handleAddUser}
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

            <div className="flex justify-between items-center mb-4">
                <form className="flex gap-2" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Search by name and surname"
                        className="w-64 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                        Search
                    </button>
                </form>
            </div>


            <div className="overflow-x-auto max-w-[1300px]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white">
                        <tr>
                            <th className="px-6 py-3">#</th>
                            <th className="px-6 py-3"> Name</th>
                            <th className="px-6 py-3">Surname</th>
                            <th className="px-6 py-3">Fin</th>
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
                        {users.map((user, index) => (

                            <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 break-words max-w-[200px]">{index + 1 + pageInfo.page * pageInfo.size}</td>
                                <td className="px-6 py-4 break-words max-w-[200px]">{user.name}</td>
                                <td className="px-6 py-4 break-words max-w-[200px]">{user.surname}</td>
                                <td className="px-6 py-4 break-words max-w-[200px]">{user.fin}</td>
                                <td className="px-6  py-4 break-words max-w-[200px]">{user.email}</td>
                                <td className="px-6 py-4">{user.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.active ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"}`}>
                                        {user.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.roles && user.roles.length > 0 ? (
                                        <select
                                            className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-white min-w-[150px]"
                                            value={user.roles}
                                            onChange={(e) => {
                                                const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
                                                console.log("Yeni seçilən rollar:", selectedRoles);
                                            }}
                                        >
                                            {user.roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-gray-500 italic">Rol təyin edilməyib</span>
                                    )}
                                </td>


                                <td className="px-6 py-4">{user.deposit}</td>
                                <td className="px-6 py-4">{new Date(user.createdDate).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right flex gap-4 justify-end">
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        onClick={() => navigate(`/alluser/${user.id}`)}


                                    >
                                        <Eye size={20} />
                                    </button>


                                   {hasPermission("CAN_UPDATE_USER") && (
                                                                            <button
                                                                           className="text-blue-600 hover:text-blue-900"
                                                                           onClick={() => navigate(`/user-upload/${user.id}`)}
                                   
                                   
                                                                       >
                                                                           <PencilLine size={20} />
                                                                       </button>
                                                                     )} 
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Edit User
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Deposit
                                </label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Roles
                                </label>
                                <select
                                    multiple
                                    name="roles"
                                    value={formData.roles}
                                    onChange={handleRoleChange}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                >
                                    {["admin", "productUser", "agency", "user"].map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Hold Ctrl/Cmd to select multiple roles
                                </p>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="active"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Active User
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerUser;