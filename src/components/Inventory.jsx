import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus, Eye } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import InventoryServices from "../services/inventoryService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
Modal.setAppElement("#root");

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchName, setSearchName] = useState("");
    const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
    const [errors, setErrors] = React.useState({});
    const [addOpen, setAddOpen] = useState(false);
    const [filterDate, setFilterDate] = useState("");
    const [newProduct, setNewProduct] = useState({

        comment: "",
    });


    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [filteredData, setFilteredData] = useState([]);


    const applyFilter = async (start, end, status) => {
        try {
            const fromDate = start ? start.toISOString() : null;
            const toDate = end ? end.toISOString() : null;


            const filterStatusParam = status === "" ? null : status;

            const response = await InventoryServices.search({
                fromDate,
                toDate,
                status: filterStatusParam,
                searchTerm: searchName,
                page: 0,
                size: pageInfo.size,
            });

            const apiData = response.data?.data || response.data;
            const productsData = apiData?.content || [];

            setProducts(productsData);
            setPageInfo({
                page: apiData?.number || 0,
                size: apiData?.size || pageInfo.size,
                totalElements: apiData?.totalElements || 0,
                totalPages: apiData?.totalPages || 0,
            });
        } catch (error) {
            console.error("Filtrləmə zamanı xəta:", error);
        }
    };



    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        setPageInfo(prev => ({ ...prev, page: 0 }));
        applyFilter(start, end, filterStatus);
    };


    const handleStatusChange = (e) => {
        const newStatus = e.target.value || null;
        setFilterStatus(newStatus);
        setPageInfo(prev => ({ ...prev, page: 0 }));
        applyFilter(startDate, endDate, newStatus);
    };





    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
    };


    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProducts(0, pageInfo.size, searchName);
    };


    const fetchProducts = async (page = 0, size = 10, comment = "") => {
        try {
            const params = {
                comment: comment,
                // active: false,
                page,
                size,
            };
            console.log("Göndərilən parametrlər:", params);
            const response = await InventoryServices.search(params);
            console.log("Alınan cavab:", response.data);
            const apiData = response.data?.data || response.data;
            const productsData = apiData?.content || [];

            setProducts(productsData);
            setPageInfo({
                page: apiData?.number || 0,
                size: apiData?.size || size,
                totalElements: apiData?.totalElements || 0,
                totalPages: apiData?.totalPages || 1
            });
        } catch (error) {
            console.error("Fetch colors error:", error);
            setColors([]);
        }
    };

    useEffect(() => {
        fetchProducts(pageInfo.page, pageInfo.size, searchName);
    }, [pageInfo.page]);

    const exportToExcel = () => {
        const data = products.map(
            ({ id, name, code, price, status, size, clicks, favorite, cart, type, raison }) => ({
                ID: id,
                Name: name,
                Code: code,
                Price: price,
                Status: status,
                raison: raison,
                Size: size,
                Clicks: clicks,
                Favorites: favorite,
                Cart: cart,
                Type: type,
            })
        );
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "products.xlsx");
    };


    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setDeleteOpen(true);
    };





    const confirmDelete = async () => {
        if (!selectedProduct) return;
        try {
            await InventoryServices.delete(selectedProduct.id);
            setDeleteOpen(false);

            fetchProducts(pageInfo.page, pageInfo.size, searchName);
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Failed to delete product")
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pageInfo.totalPages) {
            setPageInfo(prev => ({ ...prev, page: newPage }));
        }
    }




    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };






    const saveAdd = async (e) => {
        e.preventDefault();
        try {
            await InventoryServices.create(newProduct);
            setAddOpen(false);
            setErrors({}); // Xətaları təmizlə
            fetchProducts(); // Refresh the list
        }
        catch (error) {
            console.log("errr", error.response.data.data);
            if (error.response && Array.isArray(error.response.data.data)) {
                const validationErrors = {};
                error.response.data.data.forEach(err => {
                    validationErrors[err.field] = err.comment;
                });
                setErrors(validationErrors);
            } else {
                console.error("Failed to create product:", error.response?.data?.comment);
                toast.error(error.response?.data?.comment || "Failed to create product");
            }
        }

    };




    const renderError = (fieldName) => {
        return errors[fieldName] ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors[fieldName]}</p>
        ) : null;
    };






    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Inventory Management
                </h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Inventory
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
                    >
                        Export Excel
                    </button>
                </div>
            </div>


            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-4">

                <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchName}
                        onChange={handleSearchChange}
                        className="w-64 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                        Search
                    </button>
                </form>

                {/* Filter form */}
                <div className="flex gap-2 items-center">
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        isClearable
                        placeholderText="Select date range"
                        className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    <select
                        value={filterStatus}
                        onChange={handleStatusChange}
                        className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Select Status</option>
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSE">CLOSE</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created at</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Closed at</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product, index) => (
                            <tr key={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{product.createdByUser}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.createdAt}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.closedAt}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">

                                    {product.comment}
                                </td>

                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.status === "SALED"
                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>


                                <td className="px-6 py-4 text-right text-sm font-medium flex gap-4 justify-end">

                                    <button
                                        onClick={() => navigate(`/inventory/${product.id}`)}
                                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                                        title="View Details"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400" aria-label="Delete Product">
                                        <Trash size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                    onClick={() => handlePageChange(pageInfo.page - 1)}
                    disabled={pageInfo.page === 0}
                    className={`p-2 rounded-full ${pageInfo.page === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    <FaChevronLeft size={20} />
                </button>
                <span className="text-gray-800 dark:text-gray-200 text-sm">
                    Page {pageInfo.page + 1} of {pageInfo.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(pageInfo.page + 1)}
                    disabled={pageInfo.page >= pageInfo.totalPages - 1}
                    className={`p-2 rounded-full ${pageInfo.page >= pageInfo.totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    <FaChevronRight size={20} />
                </button>
            </div>

            <Modal
                isOpen={deleteOpen}
                onRequestClose={() => setDeleteOpen(false)}
                contentLabel="Delete Product"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Confirm Delete
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{selectedProduct?.name}</span>?
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



            <Modal
                isOpen={addOpen}
                onRequestClose={() => setAddOpen(false)}
                contentLabel="Add Inventory"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Inventory</h3>
                <form onSubmit={saveAdd} className="space-y-4">
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium mb-1">
                            comment
                        </label>
                        <input
                            id="comment"
                            name="comment"
                            type="text"
                            value={newProduct.comment}
                            onChange={handleAddChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            required
                        />
                        {renderError("comment")}
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
                            Add Inventory
                        </button>
                    </div>
                </form>



            </Modal>





        </div>
    );
};

export default Inventory;
