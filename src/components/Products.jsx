import React, { useEffect, useState } from "react";
import { PencilLine, Trash, Plus, Eye } from "lucide-react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import categoryService from "../services/categoryService";
import colorService from "../services/colorService";
import occasionService from "../services/occasionService";
import { getAllMaterials } from "../services/materialService";
import CustomSelect from "../shared/CustomSelect";
import partnerService from "../services/partnerService";

Modal.setAppElement("#root");

const Products = () => {
  const [products, setProducts] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  const [errors, setErrors] = React.useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [partners, setPartners] = useState([]);
  const navigate = useNavigate();

  const [addOpen, setAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nameAz: "",
    nameEn: "",
    nameRu: "",
    descAz: "",
    descEn: "",
    descRu: "",
    categoryId: 0,
    colorIds: [],
    materialIds: [],
    occasionIds: [],
    partnerId: 0,
    carat: "",
    quantity: 0,
    weight: 0,
    size: 0,
    productFor: ["FOR_SALE"],
    salePrice: 0,
    rentPricePerDay: 0,
    saleCompanyPercent: 0,
    salePartnerPercent: 0,
    damageCompanyCompensation: 0,
    lossCompanyCompensation: 0,
    partnerTakeBackFeePercent: 0,
    rentCompanyPercent: 0,
    rentPartnerPercent: 0,
    returnFeePercent: 0,
    customerLatePenaltyPercent: 0,
    validFrom: "",
    validTo: "",
    message: "",
  });




  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(0, pageInfo.size, searchName);
  };


  const fetchProducts = async (page = 0, size = 10, searchTerm = "") => {
    try {
      const params = {
        searchTerm: searchTerm,
        // active: false,
        page,
        size,
      };
      console.log("Göndərilən parametrlər:", params);
      const response = await productService.search(params);
      console.log("Alınan cavab:", response.data);

      const apiData = response.data?.data || {};
      const productsData = apiData?.content || [];

      setProducts(productsData);
      setPageInfo({
        page: apiData?.number || 0,
        size: apiData?.size || size,
        totalElements: apiData?.totalElements || 0,
        totalPages: apiData?.totalPages || 1
      });
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Məhsullar gətirilərkən xəta baş verdi");
    }
  };

  useEffect(() => {
    fetchProducts(pageInfo.page, pageInfo.size, searchName);
  }, [pageInfo.page]);

  useEffect(() => {
    const fetchData = async () => {
      const categoriesRes = await categoryService.getByName();
      setCategories(categoriesRes.data.data);
      console.log(categoriesRes.data.data);

      const colorsRes = await colorService.getByName();
      setColors(colorsRes.data.data);
      console.log(colorsRes.data.data);

      const MaterialsRes = await getAllMaterials();
      setMaterials(MaterialsRes.data);
      console.log(MaterialsRes.data);

      const occasionsRes = await occasionService.getByName();
      setOccasions(occasionsRes.data.data);
      console.log(occasionsRes.data.data);
      const PartnerRes = await partnerService.getByName("lorem");
      setPartners(PartnerRes.data.data);
      console.log(PartnerRes.data.data);
    };
    fetchData();
  }, []);

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
      await productService.delete(selectedProduct.id);
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

  const handleArrayChange = (field, value) => {
    setNewProduct(prev => ({ ...prev, [field]: [value] }));
  };

  const handleNumberArrayChange = (field, value) => {
    const numValue = parseInt(value, 10);
    setNewProduct(prev => ({ ...prev, [field]: [numValue] }));
  };

  const handleDateChange = (name, value) => {
    if (!value) {
      setNewProduct(prev => ({ ...prev, [name]: "" }));
      return;
    }

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      setNewProduct(prev => ({ ...prev, [name]: date.toISOString() }));
    } else {
      console.error("Invalid date value:", value);
      setNewProduct(prev => ({ ...prev, [name]: "" }));
    }
  };




  const saveAdd = async (e) => {
    e.preventDefault();
    try {
      await productService.create(newProduct);
      setAddOpen(false);
      setErrors({});
      fetchProducts();
    }
    catch (error) {
      console.log("errr", error.response.data.data);
      if (error.response && Array.isArray(error.response.data.data)) {
        const validationErrors = {};
        error.response.data.data.forEach(err => {
          validationErrors[err.field] = err.message;
        });
        setErrors(validationErrors);
      } else {
        console.error("Failed to create product:", error.response?.data?.message);
        toast.error(error.response?.data?.message || "Failed to create product");
      }
    }

  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setErrors({});
    setEditOpen(true);
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    const payload = {
      productId: editProduct.id,
      nameAz: editProduct.nameAz,
      nameEn: editProduct.nameEn,
      nameRu: editProduct.nameRu || "",
      descAz: editProduct.descAz || "",
      descEn: editProduct.descEn || "",
      descRu: editProduct.descRu || "",

    };

    try {
      await productService.update(payload);
      setEditOpen(false);
      fetchProducts(pageInfo.page, pageInfo.size, searchName);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product");
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
          Products Management
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/products/addproduct")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm"
          >
            Export Excel
          </button>
        </div>
      </div>
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">For</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <img
                    src={product.mainMediaUrl}
                    alt={product.name || "Product"}
                    className="max-w-[100px] max-h-[40px] rounded-[10px] object-cover"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.code}</td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${product.salePrice?.toFixed(2) ?? "-"}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.status === "SALED"
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                    }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <span
                    className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.forList?.includes("FOR_SALE")
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                      }`}
                  >
                    {product.forList?.join(", ")}
                  </span>
                </td>

                <td className="px-6 py-4 text-right text-sm font-medium  gap-4 flex items-center justify-center  ">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400" aria-label="Edit Product">
                    {/* <PencilLine size={20} /> */}
                  </button>

                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400  p-2"
                    title="View Details"
                  >
                    <Eye size={20} />
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





      {/* Add Product Modal */}
      <Modal
        isOpen={addOpen}
        onRequestClose={() => setAddOpen(false)}
        contentLabel="Add Product"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full p-6 outline-none overflow-y-auto max-h-screen"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Product</h3>
        <form onSubmit={saveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Name (Azerbaijani)</label>
              <input
                name="nameAz"
                value={newProduct.nameAz}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                required
              />
              {renderError('nameAz')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Name (English)</label>
              <input
                name="nameEn"
                value={newProduct.nameEn}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                required
              />
              {renderError('nameEn')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Name (Russian)</label>
              <input
                name="nameRu"
                value={newProduct.nameRu}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Description (Azerbaijani)</label>
              <textarea
                name="descAz"
                value={newProduct.descAz}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('descAz')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Description (English)</label>
              <textarea
                name="descEn"
                value={newProduct.descEn}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('descEn')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Description (Russian)</label>
              <textarea
                name="descRu"
                value={newProduct.descRu}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('descRu')}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                Kateqoriya
              </label>

              <CustomSelect
                name="categoryId"
                options={categories.map(category => ({
                  value: category.id,
                  label: category.name,
                  name: 'categoryId' // Bu name handleAddChange funksiyası üçün vacibdir
                }))}
                value={newProduct.categoryId}
                onChange={handleAddChange}
                placeholder="Kateqoriya seçin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />

              {renderError('categoryId')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                Partner
              </label>

              <CustomSelect
                name="partnerId"
                options={partners.map(partner => ({
                  value: partner.id,
                  label: partner.name, // partner.name varsa, yoxsa partner.companyName və s.
                  name: 'partnerId'
                }))}
                value={newProduct.partnerId}
                onChange={handleAddChange}
                placeholder="Partner seçin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />

              {renderError('partnerId')}
            </div>

            {/* Arrays */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Color IDs</label>
              <CustomSelect
                name="colorIds"
                options={colors?.map(color => ({
                  value: color.id,
                  label: color.name,
                  name: 'colorIds'
                }))}
                value={newProduct.colorIds}
                onChange={handleAddChange}
                placeholder="Rəng seçin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('colorIds')}


            </div>





            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Material IDs</label>
              <CustomSelect
                name="materialIds"
                options={materials?.map(material => ({
                  value: material.id,
                  label: material.name,
                  name: 'materialIds'
                }))}
                value={newProduct.materialIds}
                onChange={handleAddChange}
                placeholder="Material seçin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('materialIds')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Occasion IDs</label>
              <CustomSelect
                name="occasionIds"
                options={occasions?.map(occasion => ({
                  value: occasion.id,
                  label: occasion.name,
                  name: 'occasionIds'
                }))}
                value={newProduct.occasionIds}
                onChange={handleAddChange}
                placeholder="Occasion seçin"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('occasionIds')}
            </div>

            {/* Product Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Carat</label>
              <input
                name="carat"
                value={newProduct.carat}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('carat')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={newProduct.quantity}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('quantity')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Weight</label>
              <input
                type="number"
                name="weight"
                value={newProduct.weight}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('weight')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Size</label>
              <input
                type="number"
                name="size"
                value={newProduct.size}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('size')}
            </div>

            {/* Product For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Product For</label>
              <select
                value={newProduct.productFor[0]}
                onChange={(e) => handleArrayChange("productFor", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              >
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENT">For Rent</option>
              </select>
              {renderError('productFor')}
            </div>

            {/* Prices */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Sale Price</label>
              <input
                type="number"
                name="salePrice"
                value={newProduct.salePrice}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('salePrice')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Rent Price Per Day</label>
              <input
                type="number"
                name="rentPricePerDay"
                value={newProduct.rentPricePerDay}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('rentPricePerDay')}
            </div>

            {/* Percentages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Sale Company %</label>
              <input
                type="number"
                name="saleCompanyPercent"
                value={newProduct.saleCompanyPercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('saleCompanyPercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Sale Partner %</label>
              <input
                type="number"
                name="salePartnerPercent"
                value={newProduct.salePartnerPercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('salePartnerPercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Damage Compensation</label>
              <input
                type="number"
                name="damageCompanyCompensation"
                value={newProduct.damageCompanyCompensation}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('damageCompanyCompensation')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Loss Compensation</label>
              <input
                type="number"
                name="lossCompanyCompensation"
                value={newProduct.lossCompanyCompensation}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('lossCompanyCompensation')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Take Back Fee %</label>
              <input
                type="number"
                name="partnerTakeBackFeePercent"
                value={newProduct.partnerTakeBackFeePercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('partnerTakeBackFeePercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Rent Company %</label>
              <input
                type="number"
                name="rentCompanyPercent"
                value={newProduct.rentCompanyPercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('rentCompanyPercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Rent Partner %</label>
              <input
                type="number"
                name="rentPartnerPercent"
                value={newProduct.rentPartnerPercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('rentPartnerPercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Return Fee %</label>
              <input
                type="number"
                name="returnFeePercent"
                value={newProduct.returnFeePercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('returnFeePercent')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Late Penalty %</label>
              <input
                type="number"
                name="customerLatePenaltyPercent"
                value={newProduct.customerLatePenaltyPercent}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('customerLatePenaltyPercent')}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Valid From</label>
              <input
                type="datetime-local"
                onChange={(e) => handleDateChange("validFrom", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('validFrom')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Valid To</label>
              <input
                type="datetime-local"
                onChange={(e) => handleDateChange("validTo", e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('validTo')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">Carat</label>
              <input
                name="message"
                value={newProduct.message}
                onChange={handleAddChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
              />
              {renderError('carat')}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 rounded border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>


      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
        contentLabel="Edit Product"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full p-6 outline-none overflow-y-auto max-h-screen"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Product</h3>

        {editProduct && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Name fields */}
              <div>
                <label className="block text-sm font-medium">Name (Azerbaijani)</label>
                <input name="nameAz" value={editProduct.nameAz || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Name (English)</label>
                <input name="nameEn" value={editProduct.nameEn || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium">Name (Russian)</label>
                <input name="nameRu" value={editProduct.nameRu || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" />
              </div>

              {/* Description fields */}
              <div>
                <label className="block text-sm font-medium">Description (AZ)</label>
                <textarea name="descAz" value={editProduct.descAz || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-0.3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium">Description (EN)</label>
                <textarea name="descEn" value={editProduct.descEn || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium">Description (RU)</label>
                <textarea name="descRu" value={editProduct.descRu || ""} onChange={handleEditChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white" />
              </div>


            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>


    </div>
  );
};

export default Products;
