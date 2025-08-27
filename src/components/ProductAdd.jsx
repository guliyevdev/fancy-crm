import React, { useState, useRef, useEffect } from "react";
import categoryService from "../services/categoryService";
import colorService from "../services/colorService";
import { getAllMaterials } from "../services/materialService";
import occasionService from "../services/occasionService";
import partnerService from "../services/partnerService";
import productService from "../services/productService";
import CustomSelect from "../shared/CustomSelect";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProductAdd = () => {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [mainMediaIndex, setMainMediaIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdProductId, setCreatedProductId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [partners, setPartners] = useState([]);
    const [errors, setErrors] = React.useState({});
    const [partnerSearch, setPartnerSearch] = useState("");
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

    useEffect(() => {
        const isSale = newProduct.productFor.includes("FOR_SALE");
        const isRent = newProduct.productFor.includes("FOR_RENT");

        setNewProduct((prev) => ({
            ...prev,
            saleCompanyPercent: isSale ? 0 : isRent ? null : prev.saleCompanyPercent,
            salePartnerPercent: isSale ? 0 : isRent ? null : prev.salePartnerPercent,
            rentCompanyPercent: isRent ? 0 : isSale ? null : prev.rentCompanyPercent,
            rentPartnerPercent: isRent ? 0 : isSale ? null : prev.rentPartnerPercent,
            returnFeePercent: isRent ? 0 : isSale ? null : prev.returnFeePercent,
            quantity: 0,
            weight: 0,
            size: 0,
            salePrice: 0,
            rentPricePerDay: isRent ? 0 : isSale ? null : prev.returnFeePercent,
            damageCompanyCompensation: isRent ? 0 : isSale ? null : prev.rentCompanyPercent,
            lossCompanyCompensation: isRent ? 0 : isSale ? null : prev.rentCompanyPercent,
            partnerTakeBackFeePercent: 0,
            customerLatePenaltyPercent: 0,
        }));
    }, [newProduct.productFor]);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const categoriesRes = await categoryService.getByName();
            setCategories(categoriesRes.data.data);

            const colorsRes = await colorService.getByName();
            setColors(colorsRes.data.data);

            const MaterialsRes = await getAllMaterials();
            setMaterials(MaterialsRes.data);

            const occasionsRes = await occasionService.getByName();
            setOccasions(occasionsRes.data.data);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (partnerSearch.trim() === "") return;
        const fetchPartners = async () => {
            const res = await partnerService.getByName(partnerSearch);
            setPartners(res.data.data);
        };
        fetchPartners();
    }, [partnerSearch]);

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
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

    const handleSaveAndUpload = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await productService.create(newProduct);

            if (response.status === 200) {
                const productId = response.data.data.productId;
                console.log(response)
                setCreatedProductId(productId);
                toast.success('Məhsul uğurla əlavə edildi!');

                if (files.length > 0) {
                    try {
                        const mainMediaName = files[mainMediaIndex]?.name || "main-product-image";
                        const uploadResponse = await productService.createImg(
                            productId,
                            files,
                            mainMediaName,
                            "az"
                        );

                        if (uploadResponse.status === 200) {
                        }
                    } catch (uploadError) {
                        console.error('Upload error:', uploadError);
                        toast.error('Şəkillər yüklənmədi: ' + (uploadError.response?.data?.message || uploadError.message));
                    }
                }

                // 3. Səhifəyə yönləndir
                setTimeout(() => {
                    navigate('/products');
                }, 2000);
            }
        } catch (error) {
            console.log("error", error.response?.data);
            if (error.response && Array.isArray(error.response.data.data)) {
                const validationErrors = {};
                error.response.data.data.forEach(err => {
                    validationErrors[err.field] = err.message;
                });
                setErrors(validationErrors);
            } else {
                console.error("Failed to create product:", error.response?.data?.message);
                toast.error(error.response?.data?.message || "Məhsul yaradılarkən xəta baş verdi");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleArrayChange = (field, value) => {
        setNewProduct(prev => ({
            ...prev,
            [field]: Array.isArray(value) ? value : [value]
        }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleFiles = (newFiles) => {
        const validFiles = newFiles.filter(file =>
            ['image/jpeg', 'image/png'].includes(file.type) &&
            file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== newFiles.length) {
            toast.error('Yalnız JPEG/PNG və 5MB-dan kiçik fayllar qəbul olunur');
        }

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);

            const newPreviews = [];
            validFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviews.push(e.target.result);
                    if (newPreviews.length === validFiles.length) {
                        setPreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        handleFiles(newFiles);
    };

    const renderError = (fieldName) => {
        return errors[fieldName] ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors[fieldName]}</p>
        ) : null;
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ">
            <Link className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-2 rounded border-blue-500 px-5 py-2 mb-4 w-[10%] " to="/products"><ArrowLeft size={16} className="mr-2" /> Back </Link>



            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-1 gap-6">


                <form action="" onSubmit={handleSaveAndUpload} className="lg:col-span-2 space-y-6 mt-5">

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4 w-full">
                            <h3 className="font-semibold text-lg mb-2">Məhsul növü</h3>

                            <div className="flex gap-4">
                                {["FOR_SALE", "FOR_RENT"].map((type) => {
                                    const isSelected = newProduct.productFor.includes(type);
                                    const label = type === "FOR_SALE" ? "Satış üçün" : "Kirayə üçün";

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    handleArrayChange("productFor", newProduct.productFor.filter((t) => t !== type));
                                                } else {
                                                    handleArrayChange("productFor", [...newProduct.productFor, type]);
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-200 font-medium
            ${isSelected
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                                }`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className="w-6 h-6 text-green-500" // ✅ check işarəsi yaşıldır
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {renderError("productFor")}
                        </div>
                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Ümumi məlumatlar</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Məhsul adı (Azərbaycanca) <span className="text-red-500">*</span></label>
                                    <input
                                        value={newProduct.nameAz}
                                        onChange={(e) => handleAddChange({ target: { name: 'nameAz', value: e.target.value } })}
                                        placeholder="Məhsulun adı az"
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md ${errors.nameAz ? 'border-red-500' : ''}`}

                                    />
                                    {renderError('nameAz')}
                                </div>





                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Məhsul adı (İngiliscə) <span className="text-red-500">*</span></label>
                                    <input
                                        value={newProduct.nameEn}
                                        onChange={(e) => handleAddChange({ target: { name: 'nameEn', value: e.target.value } })}
                                        placeholder="Məhsulun adı en"
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md ${errors.nameEn ? 'border-red-500' : ''}`} // Error olduqda border rəngini dəyişir
                                    // required
                                    />
                                    {renderError('nameEn')}
                                </div>




                                {/* Russian */}
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Məhsul adı (Rusca)</label>
                                    <input
                                        value={newProduct.nameRu}
                                        onChange={(e) => handleAddChange({ target: { name: 'nameRu', value: e.target.value } })}
                                        placeholder="Məhsulun adı ru"
                                        className="w-full border px-4 py-3 dark:bg-gray-700 rounded-md"
                                    />
                                    {renderError('nameRu')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Təsvir (Azərbaycanca)</label>
                                    <input
                                        value={newProduct.descAz}
                                        onChange={(e) => handleAddChange({ target: { name: 'descAz', value: e.target.value } })}
                                        placeholder="Təsviri burada yazın..."
                                        className="w-full border px-4 py-3 dark:bg-gray-700 rounded-md"
                                    />
                                    {renderError('descAz')}
                                </div>

                                {/* English Description */}
                                <div>
                                    <label className="block text-sm font-medium">Təsvir (İngiliscə)</label>
                                    <input
                                        value={newProduct.descEn}
                                        onChange={(e) => handleAddChange({ target: { name: 'descEn', value: e.target.value } })}
                                        placeholder="Type your text here..."
                                        className="w-full border px-4 py-3 dark:bg-gray-700 rounded-md"
                                    />
                                    {renderError('descEn')}
                                </div>

                                {/* Russian Description */}
                                <div>
                                    <label className="block text-sm font-medium">Təsvir (Rusca)</label>
                                    <input
                                        value={newProduct.descRu}
                                        onChange={(e) => handleAddChange({ target: { name: 'descRu', value: e.target.value } })}
                                        placeholder="Введите текст здесь..."
                                        className="w-full border px-4 py-3 dark:bg-gray-700 rounded-md"
                                    />
                                    {renderError('descRu')}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 dark:text-white rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Kateqoriya və Partner</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Kateqoriya <span className="text-red-500">*</span></label>
                                    <CustomSelect
                                        name="categoryId"
                                        options={categories.map(category => ({
                                            value: category.id,
                                            label: category.name,
                                            name: 'categoryId'
                                        }))}
                                        value={newProduct.categoryId}
                                        onChange={handleAddChange}
                                        placeholder="Kateqoriya seçin"
                                        className="w-full border px-4 py-3 rounded-md"
                                        isMulti={false}
                                    />
                                    {renderError('categoryId')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Partner <span className="text-red-500">*</span></label>
                                    <CustomSelect
                                        name="partnerId"
                                        options={partners.map(partner => ({
                                            value: partner.id,
                                            label: partner.customerCode,
                                            name: 'partnerId'
                                        }))}
                                        value={newProduct.partnerId}
                                        onChange={handleAddChange}
                                        placeholder="Partner seçin"
                                        className="w-full border px-4 py-3 rounded-md"
                                        isMulti={false}
                                        onSearchChange={(val) => setPartnerSearch(val)}
                                    />
                                    {renderError('partnerId')}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 dark:text-white rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Xüsusiyyətlər</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Rənglər</label>
                                    <CustomSelect
                                        name="colorIds"
                                        options={colors.map(color => ({
                                            value: color.id,
                                            label: color.name,
                                            name: 'colorIds'
                                        }))}
                                        value={newProduct.colorIds || []}
                                        onChange={handleAddChange}
                                        placeholder="Rəng seçin"
                                        className="w-full border px-4 py-3 rounded-md"
                                        isMulti={true}
                                    />
                                    {renderError('colorIds')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Materiallar</label>
                                    <CustomSelect
                                        name="materialIds"
                                        options={materials.map(material => ({
                                            value: material.id,
                                            label: material.name,
                                            name: 'materialIds'
                                        }))}
                                        value={newProduct.materialIds || []}
                                        onChange={handleAddChange}
                                        placeholder="Material seçin"
                                        className="w-full border px-4 py-3 rounded-md"
                                        isMulti={true}
                                    />
                                    {renderError('materialIds')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Occasions</label>
                                    <CustomSelect
                                        name="occasionIds"
                                        options={occasions.map(occasion => ({
                                            value: occasion.id,
                                            label: occasion.name,
                                            name: 'occasionIds'
                                        }))}
                                        value={newProduct.occasionIds || []}
                                        onChange={handleAddChange}
                                        placeholder="Münasibət seçin"
                                        className="w-full border px-4 py-3 rounded-md"
                                        isMulti={true}
                                    />
                                    {renderError('occasionIds')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-700 dark:text-white rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Məhsul detalları</h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Karat</label>
                                    <input
                                        type="number"
                                        value={newProduct.carat}
                                        onChange={(e) => handleAddChange({ target: { name: 'carat', value: e.target.value } })}
                                        className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"
                                    />
                                    {renderError('carat')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Miqdar</label>
                                    <input
                                        type="number"
                                        value={newProduct.quantity}
                                        onChange={(e) => handleAddChange({ target: { name: 'quantity', value: e.target.value } })}
                                        className="w-full border dark:bg-gray-700 dark:text-white px-4 py-3 rounded-md"
                                    />
                                    {renderError('quantity')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Çəki (q)</label>
                                    <input
                                        type="number"
                                        value={newProduct.weight}
                                        onChange={(e) => handleAddChange({ target: { name: 'weight', value: e.target.value } })}
                                        className="w-full border dark:bg-gray-700 dark:text-white px-4 py-3 rounded-md"
                                    />
                                    {renderError('weight')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Ölçü</label>
                                    <input
                                        type="number"
                                        value={newProduct.size}
                                        onChange={(e) => handleAddChange({ target: { name: 'size', value: e.target.value } })}
                                        className="w-full border dark:bg-gray-700 dark:text-white px-4 py-3 rounded-md"
                                    />
                                    {renderError('size')}
                                </div>
                            </div>
                        </div>




                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Qiymətlər</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Satış qiyməti</label>
                                    <input
                                        type="number"
                                        value={newProduct.salePrice}
                                        onChange={(e) => handleAddChange({ target: { name: 'salePrice', value: e.target.value } })}
                                        className="w-full border dark:bg-gray-700 dark:text-white px-4 py-3 rounded-md"

                                    // disabled={newProduct.productFor.includes("FOR_RENT") && !newProduct.productFor.includes("FOR_SALE")}




                                    />
                                    {renderError('salePrice')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Günlük kirayə qiyməti</label>
                                    <input
                                        type="number"
                                        value={newProduct.rentPricePerDay}
                                        onChange={(e) => handleAddChange({ target: { name: 'rentPricePerDay', value: e.target.value } })}
                                        // className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"

                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('rentPricePerDay')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm dark:bg-gray-700 dark:text-white space-y-4">
                            <h3 className="font-semibold text-lg">Faizlər</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Şirkət satış faizi (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.saleCompanyPercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'saleCompanyPercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_RENT") && !newProduct.productFor.includes("FOR_SALE") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_RENT") && !newProduct.productFor.includes("FOR_SALE")}



                                    />
                                    {renderError('saleCompanyPercent')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Partner satış faizi (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.salePartnerPercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'salePartnerPercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_RENT") && !newProduct.productFor.includes("FOR_SALE") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_RENT") && !newProduct.productFor.includes("FOR_SALE")}



                                    />
                                    {renderError('salePartnerPercent')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Şirkət kirayə faizi (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.rentCompanyPercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'rentCompanyPercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('rentCompanyPercent')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Partner kirayə faizi (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.rentPartnerPercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'rentPartnerPercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('rentPartnerPercent')}
                                </div>

                                {/* <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Geri qaytarma haqqı (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.returnFeePercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'returnFeePercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('returnFeePercent')}
                                </div> */}

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Gecikmə cəriməsi (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.customerLatePenaltyPercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'customerLatePenaltyPercent', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('customerLatePenaltyPercent')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 dark:bg-gray-700 dark:text-white shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Kompesasiyalar</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Zərər kompesasiyası</label>
                                    <input
                                        type="number"
                                        value={newProduct.damageCompanyCompensation}
                                        onChange={(e) => handleAddChange({ target: { name: 'damageCompanyCompensation', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('damageCompanyCompensation')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">İtki kompesasiyası</label>
                                    <input
                                        type="number"
                                        value={newProduct.lossCompanyCompensation}
                                        onChange={(e) => handleAddChange({ target: { name: 'lossCompanyCompensation', value: e.target.value } })}
                                        className={`w-full border px-4 py-3 dark:bg-gray-700 rounded-md 
        
        ${newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT") ? 'cursor-not-allowed bg-gray-300 dark:bg-gray-600' : ''}
    `}
                                        disabled={newProduct.productFor.includes("FOR_SALE") && !newProduct.productFor.includes("FOR_RENT")}

                                    />
                                    {renderError('lossCompanyCompensation')}
                                </div>

                                {/* <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Geri qaytarma haqqı (%)</label>
                                    <input
                                        type="number"
                                        value={newProduct.partnerTakeBackFeePercent}
                                        onChange={(e) => handleAddChange({ target: { name: 'partnerTakeBackFeePercent', value: e.target.value } })}
                                        className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"
                                    />
                                    {renderError('partnerTakeBackFeePercent')}
                                </div> */}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm dark:bg-gray-700 dark:text-white space-y-4">
                            <h3 className="font-semibold text-lg dark:bg-gray-700 dark:text-white">Tarixlər</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Etibarlıdır (başlanğıc)</label>
                                    <input
                                        type="datetime-local"
                                        onChange={(e) => handleDateChange("validFrom", e.target.value)}
                                        className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"
                                    />
                                    {renderError('validFrom')}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="block text-sm font-medium">Etibarlıdır (son)</label>
                                    <input
                                        type="datetime-local"
                                        onChange={(e) => handleDateChange("validTo", e.target.value)}
                                        className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"
                                    />
                                    {renderError('validTo')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Mesaj</h3>

                            <div className="flex flex-col gap-1">
                                <label className="block text-sm font-medium">Xüsusi mesaj</label>
                                <input
                                    value={newProduct.message}
                                    onChange={(e) => handleAddChange({ target: { name: 'message', value: e.target.value } })}
                                    className="w-full border px-4 py-3 dark:bg-gray-700 dark:text-white rounded-md"
                                />
                            </div>
                            {renderError('message')}
                        </div>
                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-lg">Mesaj</h3>

                            <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm space-y-4">
                                <h3 className="font-semibold text-lg">Şəkillər</h3>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                                    <h3 className="font-semibold text-lg mb-4">Şəkillər</h3>

                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center h-44 bg-gray-50 mb-4 dark:bg-gray-800 dark:text-white cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="text-center text-gray-400 dark:bg-gray-800 dark:text-white">
                                            <svg className="mx-auto mb-2 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7V4a2 2 0 012-2h6a2 2 0 012 2v3" />
                                            </svg>
                                            <p className="text-sm">Şəkilləri bura sürükləyin və ya klikləyin</p>
                                            <p className="text-xs mt-1 text-gray-300">Yalnız *.png, *.jpg və *.jpeg qəbul olunur (max 5MB)</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {previews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index}`}
                                                    className={`w-full h-32 object-cover rounded-md border-2 ${mainMediaIndex === index ? 'border-blue-500' : 'border-transparent'
                                                        }`}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMainMediaIndex(index);
                                                        }}
                                                        className={`px-2 py-1 text-xs rounded ${mainMediaIndex === index
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white text-gray-800'
                                                            }`}
                                                    >
                                                        {mainMediaIndex === index ? 'Əsas şəkil' : 'Əsas et'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newFiles = [...files];
                                                            const newPreviews = [...previews];
                                                            newFiles.splice(index, 1);
                                                            newPreviews.splice(index, 1);
                                                            setFiles(newFiles);
                                                            setPreviews(newPreviews);
                                                            if (mainMediaIndex === index) {
                                                                setMainMediaIndex(0);
                                                            } else if (mainMediaIndex > index) {
                                                                setMainMediaIndex(mainMediaIndex - 1);
                                                            }
                                                        }}
                                                        className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded"
                                                    >
                                                        Sil
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        multiple
                                    />

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-2 bg-white border rounded-md text-sm shadow-sm"
                                        >
                                            Fayl seç ({files.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFiles([]);
                                                setPreviews([]);
                                                setMainMediaIndex(0);
                                            }}
                                            className="px-3 py-2 bg-red-50 text-red-600 border rounded-md text-sm"
                                            disabled={files.length === 0}
                                        >
                                            Hamısını sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl dark:bg-gray-700 dark:text-white p-6 shadow-sm flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
                            >
                                Məhsulu Yadda Saxla
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductAdd;

