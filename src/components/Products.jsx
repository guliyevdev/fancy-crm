import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus, Eye, Pencil, Search, Filter, X, Download, ChevronLeft, ChevronRight, Package, Tag, Layers, DollarSign, Info } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import { toast } from "sonner";
import categoryService from "../services/categoryService";
import colorService from "../services/colorService";
import occasionService from "../services/occasionService";
import { getAllMaterials } from "../services/materialService";
import CustomSelect from "../shared/CustomSelect";
import partnerService from "../services/partnerService";
import { usePermission } from "../hooks/usePermission";

Modal.setAppElement("#root");

const Products = () => {
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [partners, setPartners] = useState([]);

  // UI States
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);

  // Forms
  const [newProduct, setNewProduct] = useState({
    nameAz: "", nameEn: "", nameRu: "",
    descAz: "", descEn: "", descRu: "",
    categoryIds: [], colorIds: [], materialIds: [], occasionIds: [],
    partnerId: null,
    carat: "", quantity: 0, weight: 0, size: 0,
    productFor: ["FOR_SALE"],
    salePrice: 0, rentPricePerDay: 0,
    saleCompanyPercent: 0, salePartnerPercent: 0,
    damageCompanyCompensation: 0, lossCompanyCompensation: 0,
    partnerTakeBackFeePercent: 0, rentCompanyPercent: 0, rentPartnerPercent: 0,
    returnFeePercent: 0, customerLatePenaltyPercent: 0,
    validFrom: "", validTo: "", message: "",
  });

  const [editProduct, setEditProduct] = useState({});

  // Fetch Data
  const fetchProducts = async (page = 0, size = 10, searchTerm = "") => {
    try {
      const params = {
        searchTerm,
        page,
        size,
        categoryIds: selectedCategory || [],
        colorIds: selectedColors || [],
        partnerId: selectedPartner ? selectedPartner.value : null,
        materialIds: selectedMaterials || [],
        occasionIds: selectedOccasions || [],
      };

      const response = await productService.search(params);
      const apiData = response.data?.data;
      const productsData = Array.isArray(apiData) ? apiData : (apiData?.content || []);

      setProducts(productsData);
      setPageInfo({
        page: apiData?.number || 0,
        size: apiData?.size || size,
        totalElements: apiData?.totalElements || productsData.length,
        totalPages: apiData?.totalPages || 1,
      });
    } catch (error) {
      toast.error("Məhsullar gətirilərkən xəta baş verdi");
    }
  };

  useEffect(() => {
    fetchProducts(pageInfo.page, pageInfo.size, searchName);
  }, [pageInfo.page, selectedCategory, selectedPartner, selectedColors, selectedMaterials, selectedOccasions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (hasPermission("SEARCH_CATEGORY") || hasPermission("ALL_CATEGORY_NAMES")) {
          const res = await categoryService.getByName();
          setCategories(res.data?.data || []);
        }
        if (hasPermission("SEARCH_COLOR") || hasPermission("ALL_COLOR_NAMES")) {
          const res = await colorService.getByName();
          setColors(res.data?.data || []);
        }
        if (hasPermission("SEARCH_MATERIAL") || hasPermission("ALL_MATERIAL_NAMES")) {
          const res = await getAllMaterials();
          setMaterials(res.data || []);
        }
        if (hasPermission("SEARCH_OCCASION") || hasPermission("ALL_OCCASION_NAMES")) {
          const res = await occasionService.getByName();
          setOccasions(res.data?.data || []);
        }
        if (hasPermission("SEARCH_PARTNER") || hasPermission("FIND_PARTNER_BY_ID") || hasPermission("FIND_PARTNER_BY_CODE")) {
          const res = await partnerService.getByName("");
          setPartners(res.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch filter data", err);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSearchSubmit = (e, type) => {
    e.preventDefault();
    const term = type === "name" ? searchName : searchCode;
    fetchProducts(0, pageInfo.size, term);
  };

  const handlePartnerSearch = async (val) => {
    try {
      const res = await partnerService.getByName(val);
      setPartners(res.data.data);
    } catch (error) { }
  };

  const handleFilterChange = (setter) => (selectedOptions) => {
    setter(selectedOptions?.target ? selectedOptions.target.value : selectedOptions);
  };

  const clearFilters = () => {
    setSelectedCategory([]);
    setSelectedPartner(null);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedOccasions([]);
    setSearchName("");
    setSearchCode("");
    fetchProducts(0, pageInfo.size, "");
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productService.delete(selectedProduct.id);
      setDeleteOpen(false);
      fetchProducts(pageInfo.page, pageInfo.size, searchName);
      toast.success("Məhsul silindi");
    } catch (error) {
      toast.error("Silinmə zamanı xəta");
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: [value] }));
  };

  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await productService.create(newProduct);
      setAddOpen(false);
      setErrors({});
      fetchProducts();
      toast.success("Yeni məhsul əlavə edildi");
    } catch (error) {
      if (error.response && Array.isArray(error.response.data.data)) {
        const validationErrors = {};
        error.response.data.data.forEach(err => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.response?.data?.message || "Failed to create product");
      }
    }
  };

  // Edit Handlers (Basic Implementation)
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      // Note: This is a basic update. For full update, use the dedicated Edit Page.
      await productService.update(editProduct);
      setEditOpen(false);
      fetchProducts(pageInfo.page, pageInfo.size, searchName);
      toast.success("Məhsul yeniləndi");
    } catch (error) {
      toast.error("Yeniləmə zamanı xəta");
    }
  };


  const exportToExcel = () => {
    const data = products.map(p => ({
      ID: p.id,
      Name: p.name,
      Code: p.code,
      Price: p.salePrice,
      Status: p.status,
      Type: p.productFor?.join(", "),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "products.xlsx");
  };

  const renderError = (fieldName) => errors[fieldName] ? (
    <p className="mt-1 text-sm text-red-600 dark:text-red-500 flex items-center gap-1">
      <Info size={14} /> {errors[fieldName]}
    </p>
  ) : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Package size={120} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Package className="text-blue-600" /> Məhsullar
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">
              Məhsulların idarə edilməsi və axtarışı
            </p>
          </div>
          <div className="flex gap-3 relative z-10">
            {hasPermission("ADD_PRODUCT") && (
              <button
                onClick={() => navigate("/products/addproduct")}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus className="mr-2 h-4 w-4" /> Yeni Məhsul
              </button>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Name */}
            {hasPermission("SEARCH_PRODUCT") && (
              <form onSubmit={(e) => handleSearchSubmit(e, "name")} className="relative group">
                <input
                  type="text"
                  placeholder="Ada görə axtar..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none group-hover:bg-white dark:group-hover:bg-gray-700"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </form>
            )}
            {/* Search Code */}
            {hasPermission("SEARCH_PRODUCT") && (
              <form onSubmit={(e) => handleSearchSubmit(e, "code")} className="relative group">
                <input
                  type="text"
                  placeholder="Koda görə axtar..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all outline-none group-hover:bg-white dark:group-hover:bg-gray-700"
                />
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {hasPermission("ALL_CATEGORY_NAMES") && (
              <CustomSelect
                value={selectedCategory}
                options={categories?.map(c => ({ value: c.id, label: c.name }))}
                onChange={handleFilterChange(setSelectedCategory)}
                placeholder="Kateqoriya"
                isMulti={true}
                className="text-sm"
              />
            )}
            {hasPermission("FIND_PARTNER_BY_CODE") && (
              <CustomSelect
                value={selectedPartner ? selectedPartner.value : ""}
                options={[{ value: "", label: "Hamısı" }, ...partners?.map(p => ({ value: p.id, label: p.customerCode || p.name }))]}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const found = partners.find(p => p.id === parseInt(val));
                    setSelectedPartner({ value: found.id, label: found.customerCode || found.name });
                  } else setSelectedPartner(null);
                }}
                placeholder="Partner"
                onSearchChange={handlePartnerSearch}
                className="text-sm"
              />
            )}
            {hasPermission("ALL_COLOR_NAMES") && (
              <CustomSelect
                value={selectedColors}
                options={colors?.map(c => ({ value: c.id, label: c.name }))}
                onChange={handleFilterChange(setSelectedColors)}
                placeholder="Rəng"
                isMulti={true}
                className="text-sm"
              />
            )}
            {hasPermission("ALL_MATERIAL_NAMES") && (
              <CustomSelect
                value={selectedMaterials}
                options={materials?.map(m => ({ value: m.id, label: m.name }))}
                onChange={handleFilterChange(setSelectedMaterials)}
                placeholder="Material"
                isMulti={true}
                className="text-sm"
              />
            )}
            {hasPermission("ALL_OCCASION_NAMES") && (
              <CustomSelect
                value={selectedOccasions}
                options={occasions?.map(o => ({ value: o.id, label: o.name }))}
                onChange={handleFilterChange(setSelectedOccasions)}
                placeholder="Münasibət"
                isMulti={true}
                className="text-sm"
              />
            )}
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} /> Təmizlə
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Şəkil</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kod</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Satış Qiyməti</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kirayə Qiyməti</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Növ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Popular</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {products?.map((product) => (
                  <tr key={product.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-100 dark:border-gray-600 shadow-sm group-hover:shadow-md transition-all">
                        <img
                          src={product.mainMediaUrl || "https://via.placeholder.com/100"}
                          alt={product.name}
                          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">
                        {product.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {product.salePrice?.toFixed(2) ?? "-"} ₼
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.rentPricePerDay?.toFixed(2) ?? "-"} ₼
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                        ${product.status === "SALED"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${product.status === "SALED" ? "bg-green-500" : "bg-amber-500"}`}></div>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                        {product.forList?.join(", ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasPermission("UPDATE_PRODUCT") ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={product.popular}
                            onChange={async () => {
                              try {
                                await productService.updateProductPopularity(product.id);
                                product.popular = !product.popular;
                                setProducts([...products]);
                              } catch (e) { }
                            }}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      ) : <span className="text-xs text-red-500">No Access</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Ətraflı"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/upload-product/${product.id}`)}
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="Düzəliş et"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => { setSelectedProduct(product); setDeleteOpen(true); }}
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
                onClick={() => setPageInfo(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                disabled={pageInfo.page === 0}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 shadow-sm"
              >
                <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setPageInfo(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
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
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Məhsulu silmək istəyirsiniz?</h3>
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
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-5xl w-full p-0 outline-none overflow-hidden max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Məhsul</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yeni məhsul əlavə etmək üçün formanı doldurun</p>
            </div>
          </div>
          <button onClick={() => setAddOpen(false)} className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={saveAdd} className="space-y-8">

            {/* Section 1: Names */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <Tag className="w-4 h-4 text-blue-500" /> Adlandırma
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ad (AZ) <span className="text-red-500">*</span></label>
                  <input name="nameAz" value={newProduct.nameAz} onChange={handleAddChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400" placeholder="Məhsulun adı" />
                  {renderError('nameAz')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ad (EN) <span className="text-red-500">*</span></label>
                  <input name="nameEn" value={newProduct.nameEn} onChange={handleAddChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400" placeholder="Product name" />
                  {renderError('nameEn')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ad (RU) <span className="text-red-500">*</span></label>
                  <input name="nameRu" value={newProduct.nameRu} onChange={handleAddChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400" placeholder="Название продукта" />
                </div>
              </div>
            </div>

            {/* Section 2: Descriptions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <Info className="w-4 h-4 text-blue-500" /> Təsvir
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Təsvir (AZ)</label>
                  <textarea name="descAz" value={newProduct.descAz} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none placeholder:text-gray-400" placeholder="Ətraflı məlumat..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Təsvir (EN)</label>
                  <textarea name="descEn" value={newProduct.descEn} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none placeholder:text-gray-400" placeholder="Detailed description..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Təsvir (RU)</label>
                  <textarea name="descRu" value={newProduct.descRu} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none placeholder:text-gray-400" placeholder="Подробное описание..." />
                </div>
              </div>
            </div>

            {/* Section 3: Relations */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <Layers className="w-4 h-4 text-blue-500" /> Xüsusiyyətlər
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kateqoriya</label>
                  <CustomSelect
                    name="categoryId"
                    options={categories?.map(c => ({ value: c.id, label: c.name, name: 'categoryId' }))}
                    value={newProduct.categoryId}
                    onChange={handleAddChange}
                    placeholder="Seçin"
                    className="text-sm"
                  />
                  {renderError('categoryId')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Partner</label>
                  <CustomSelect
                    name="partnerId"
                    options={partners?.map(p => ({ value: p.id, label: p.name, name: 'partnerId' }))}
                    value={newProduct.partnerId}
                    onChange={handleAddChange}
                    placeholder="Seçin"
                    className="text-sm"
                  />
                  {renderError('partnerId')}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rənglər</label>
                  <CustomSelect
                    name="colorIds"
                    options={colors?.map(c => ({ value: c.id, label: c.name, name: 'colorIds' }))}
                    value={newProduct.colorIds}
                    onChange={handleAddChange}
                    placeholder="Seçin"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Materiallar</label>
                  <CustomSelect
                    name="materialIds"
                    options={materials?.map(m => ({ value: m.id, label: m.name, name: 'materialIds' }))}
                    value={newProduct.materialIds}
                    onChange={handleAddChange}
                    placeholder="Seçin"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Occasions</label>
                  <CustomSelect
                    name="occasionIds"
                    options={occasions?.map(o => ({ value: o.id, label: o.name, name: 'occasionIds' }))}
                    value={newProduct.occasionIds}
                    onChange={handleAddChange}
                    placeholder="Seçin"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Məhsul Tipi</label>
                  <select
                    value={newProduct.productFor[0]}
                    onChange={(e) => handleArrayChange("productFor", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="FOR_SALE">Satış üçün</option>
                    <option value="FOR_RENT">Kirayə üçün</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Details & Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <Package className="w-4 h-4 text-blue-500" /> Detallar
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Karat</label>
                    <input name="carat" value={newProduct.carat} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Say</label>
                    <input type="number" name="quantity" value={newProduct.quantity} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Çəki</label>
                    <input type="number" name="weight" value={newProduct.weight} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ölçü</label>
                    <input type="number" name="size" value={newProduct.size} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" /> Qiymətləndirmə
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Satış Qiyməti</label>
                    <div className="relative">
                      <input type="number" name="salePrice" value={newProduct.salePrice} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pl-8" />
                      <span className="absolute left-3 top-2.5 text-gray-400">₼</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kirayə (Günlük)</label>
                    <div className="relative">
                      <input type="number" name="rentPricePerDay" value={newProduct.rentPricePerDay} onChange={handleAddChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pl-8" />
                      <span className="absolute left-3 top-2.5 text-gray-400">₼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
          <button type="button" onClick={() => setAddOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 font-semibold transition-colors">
            Ləğv et
          </button>
          <button onClick={saveAdd} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 flex items-center gap-2">
            <Plus size={18} /> Yadda saxla
          </button>
        </div>
      </Modal>

      {/* Edit Modal - Basic */}
      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 outline-none overflow-y-auto max-h-[90vh] border border-gray-100 dark:border-gray-700"
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-500" /> Məhsulu Redaktə Et
          </h3>
          <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {editProduct && (
          <form onSubmit={saveEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ad (AZ)</label>
                <input name="nameAz" value={editProduct.nameAz || ""} onChange={handleEditChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ad (EN)</label>
                <input name="nameEn" value={editProduct.nameEn || ""} onChange={handleEditChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
              </div>
              {/* Add more fields as needed based on editProduct structure */}
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-center gap-2">
                  <Info size={18} />
                  Qeyd: Tam redaktə üçün cədvəldəki "Düzəliş et" düyməsindən istifadə edin.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setEditOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors">
                Ləğv et
              </button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 transition-all transform active:scale-95">
                Yadda saxla
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default Products;
