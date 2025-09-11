import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import categoryService from "../../services/categoryService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

Modal.setAppElement("#root");

const SiteCategory = () => {
    const [categories, setCategories] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0 });
    const [searchName, setSearchName] = useState("");

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);




    const fetchCategories = async (page = 0, size = 10, keyword = "") => {
        try {
            const params = {
                name: keyword,
                active: true,
                page,
                size,
            };

            const response = await categoryService.search(params);

            const apiData = response.data?.data || response.data;
            const categoriesData = apiData?.content || [];

            setCategories(categoriesData);
            setPageInfo({
                page: apiData?.number || 0,
                size: apiData?.size || size,
                totalElements: apiData?.totalElements || 0,
            });
        } catch (error) {
            console.error("Fetch colors error:", error);
            setColors([]);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setSelectedCategory({
            nameAz: "",
            nameEn: "",
            nameRu: "",
            status: "ACTIVE"
        });
        setAddOpen(true);
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setEditOpen(true);
    };

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setDeleteOpen(true);
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setSelectedCategory((prev) => ({ ...prev, [name]: value }));
    };

    const saveAdd = async (e) => {
        e.preventDefault();
        try {
            console.log("Current selectedCategory:", selectedCategory);

            const payload = {
                nameAz: selectedCategory.nameAz,
                nameEn: selectedCategory.nameEn,
                nameRu: selectedCategory.nameRu
            };

            console.log("Final payload:", payload);

            const response = await categoryService.create(payload);
            console.log("API Response:", response.data);

            fetchCategories();
            setAddOpen(false);
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
        }
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedCategory((prev) => ({ ...prev, [name]: value }));
    };


    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nameAz: selectedCategory.nameAz,
                nameEn: selectedCategory.nameEn,
                nameRu: selectedCategory.nameRu,
                status: selectedCategory.status
            };

            await categoryService.update(selectedCategory.id, payload);
            fetchCategories(pageInfo.page, pageInfo.size, searchName);
            setEditOpen(false);
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const confirmDelete = async () => {
        try {
            await categoryService.delete(selectedCategory.id);
            fetchCategories(pageInfo.page, pageInfo.size, searchName);
            setDeleteOpen(false);
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCategories(0, pageInfo.size, searchName);
    };

    const goToPage = (newPage) => {
        fetchCategories(newPage, pageInfo.size, searchName);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Category Management</h2>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Add Category"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {categories?.map((category, index) => (
                        <tr key={category.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{pageInfo.page * pageInfo.size + index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                                <span
                                    className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${category.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                                        }`}
                                >
                                    {category.status === "ACTIVE" ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium flex gap-4 justify-end">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                                    aria-label={`Edit category ${category.name}`}
                                >
                                    <PencilLine size={20} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(category)}
                                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                    aria-label={`Delete category ${category.name}`}
                                >
                                    <Trash size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                No categories found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => fetch(pageInfo.page - 1, pageInfo.size, searchName)}
                    disabled={pageInfo.page === 0}
                    className={`p-2 rounded-full ${pageInfo.page === 0
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
                    onClick={() => fetchCategories(pageInfo.page + 1, pageInfo.size, searchName)}
                    disabled={(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements}
                    className={`p-2 rounded-full ${(pageInfo.page + 1) * pageInfo.size >= pageInfo.totalElements
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
                contentLabel="Add Category"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Category</h3>
                {selectedCategory && (
                    <form onSubmit={saveAdd} className="space-y-4">
                        {/* Name (Az) */}
                        <div>
                            <label htmlFor="nameAz" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Name (Azərbaycanca)
                            </label>
                            <input
                                id="nameAz"
                                name="nameAz"
                                type="text"
                                value={selectedCategory.nameAz || ""}
                                onChange={handleAddChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        {/* Name (English) */}
                        <div>
                            <label htmlFor="nameEn" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Name (English)
                            </label>
                            <input
                                id="nameEn"
                                name="nameEn"
                                type="text"
                                value={selectedCategory.nameEn || ""}
                                onChange={handleAddChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        {/* Name (Russian) */}
                        <div>
                            <label htmlFor="nameRu" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Name (Русский)
                            </label>
                            <input
                                id="nameRu"
                                name="nameRu"
                                type="text"
                                value={selectedCategory.nameRu || ""}
                                onChange={handleAddChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            />
                        </div>

                        {/* Status (eyni qalır) */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={selectedCategory.status}
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
                contentLabel="Edit Category"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Category</h3>
                {selectedCategory && (
                    <div>
                        salam
                    </div>
                )}
            </Modal>


            <Modal
                isOpen={deleteOpen}
                onRequestClose={() => setDeleteOpen(false)}
                contentLabel="Delete Category"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Confirm Delete</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete the category <span className="font-semibold">{selectedCategory?.name}</span>?
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

export default SiteCategory;
