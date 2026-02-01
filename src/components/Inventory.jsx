import React, { useEffect, useState } from "react";
import {
    Trash,
    Plus,
    Eye,
    Search,
    Filter,
    X,
    Download,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Calendar,
    MessageSquare,
    User,
    Clock
} from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
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
    const [newProduct, setNewProduct] = useState({
        comment: "",
    });

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);

    const navigate = useNavigate();

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
                page,
                size,
            };
            const response = await InventoryServices.search(params);
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
            console.error("Fetch error:", error);
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
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "inventory.xlsx");
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
            toast.success("Məhsul silindi");
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Silinmə zamanı xəta");
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
            setNewProduct({ comment: "" });
            setErrors({});
            fetchProducts();
            toast.success("Yeni inventar əlavə edildi");
        }
        catch (error) {
            if (error.response && Array.isArray(error.response.data.data)) {
                const validationErrors = {};
                error.response.data.data.forEach(err => {
                    validationErrors[err.field] = err.comment;
                });
                setErrors(validationErrors);
            } else {
                toast.error(error.response?.data?.comment || "Xəta baş verdi");
            }
        }
    };

    const renderError = (fieldName) => {
        return errors[fieldName] ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500 flex items-center gap-1">
                <Info size={14} /> {errors[fieldName]}
            </p>
        ) : null;
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-200">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <ClipboardList size={120} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            <ClipboardList className="text-blue-600" /> İnventar İdarəetməsi
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">
                            İnventar qeydlərinin izlənilməsi və idarə olunması
                        </p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                        <button
                            onClick={() => setAddOpen(true)}
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Yeni İnventar
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
                        >
                            <Download className="mr-2 h-4 w-4" /> Excel
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Axtarış və Filtrlər</h3>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearchSubmit} className="relative group flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Ada görə axtar..."
                                value={searchName}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none group-hover:bg-white dark:group-hover:bg-gray-700"
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </form>

                        <div className="flex gap-4 flex-wrap">
                            <div className="relative z-20">
                                <DatePicker
                                    selectsRange
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateChange}
                                    isClearable
                                    placeholderText="Tarix aralığı seçin"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none cursor-pointer"
                                />
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative min-w-[150px]">
                                <select
                                    value={filterStatus || ""}
                                    onChange={handleStatusChange}
                                    className="w-full pl-10 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Bütün Statuslar</option>
                                    <option value="OPEN">AÇIQ</option>
                                    <option value="CLOSE">BAĞLI</option>
                                </select>
                                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                <ChevronLeft className="absolute right-3 top-3 h-4 w-4 text-gray-400 transform -rotate-90 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İstifadəçi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yaradılma Tarixi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bağlanma Tarixi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Şərh</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <User size={16} />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.createdByUser}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock size={14} />
                                                {product.createdAt}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.closedAt || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={product.comment}>
                                                <MessageSquare size={14} className="flex-shrink-0 text-gray-400" />
                                                {product.comment}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${product.status === "OPEN"
                                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.status === "OPEN" ? "bg-green-500" : "bg-gray-500"}`}></div>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/inventory/${product.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Ətraflı"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(product)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash size={18} />
                                                </button>
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
                            Səhifə {pageInfo.page + 1} / {pageInfo.totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pageInfo.page - 1)}
                                disabled={pageInfo.page === 0}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                            <button
                                onClick={() => handlePageChange(pageInfo.page + 1)}
                                disabled={pageInfo.page >= pageInfo.totalPages - 1}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteOpen}
                onRequestClose={() => setDeleteOpen(false)}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 outline-none transform transition-all border border-gray-100 dark:border-gray-700"
                overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-6 ring-4 ring-red-50 dark:ring-red-900/10">
                        <Trash className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">İnventarı silmək istəyirsiniz?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        <span className="font-semibold text-gray-900 dark:text-white">"{selectedProduct?.name}"</span> silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setDeleteOpen(false)}
                            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Ləğv et
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            Sil, Təsdiqlə
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Modal */}
            <Modal
                isOpen={addOpen}
                onRequestClose={() => setAddOpen(false)}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-0 outline-none overflow-hidden border border-gray-100 dark:border-gray-700"
                overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Yeni İnventar</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Yeni inventar əlavə etmək üçün məlumatları daxil edin</p>
                        </div>
                    </div>
                    <button onClick={() => setAddOpen(false)} className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={saveAdd} className="space-y-6">
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Şərh <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="comment"
                                    name="comment"
                                    type="text"
                                    value={newProduct.comment}
                                    onChange={handleAddChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none placeholder:text-gray-400"
                                    placeholder="Şərh yazın..."
                                    required
                                />
                                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                            {renderError("comment")}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setAddOpen(false)}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Ləğv et
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Plus size={16} /> Əlavə et
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Inventory;