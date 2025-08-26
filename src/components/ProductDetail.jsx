import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import productService from '../services/productService';
import CustomSelect from '../shared/CustomSelect';
import categoryService from '../services/categoryService';
import colorService from '../services/colorService';
import { getAllMaterials } from '../services/materialService';
import occasionService from '../services/occasionService';
import partnerService from '../services/partnerService';
import { ArrowLeft } from 'lucide-react';


const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [errors, setErrors] = React.useState({});
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [editProduct, setEditProduct] = useState({
    nameAz: product?.nameAz || "",
    nameEn: product?.nameEn || "",
    nameRu: product?.nameRu || "",
    descAz: product?.descAz || "",
    descEn: product?.descEn || "",
    descRu: product?.descRu || "",
    categoryId: product?.categoryId || 0,
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
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [contractFiles, setContractFiles] = useState([]);
  const [mainMediaIndex, setMainMediaIndex] = useState(0);
  const [barcode, setBarcode] = useState({});


  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await productService.getProductById(id);
        const p = response.data;
        console.log(p.contractFileList)
        setContractFiles(p.contractFileList);
        setBarcode(p);
        console.log(response.data.barcodeBase64)

        const formatDateForInput = (dateString) => {
          if (!dateString) return "";

          try {
            const date = new Date(dateString);
            // Local time üçün offset əlavə etməliyik
            const offset = date.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - offset);

            return localDate.toISOString().slice(0, 16);
          } catch (error) {
            console.error("Tarix formatlama xətası:", error);
            return "";
          }
        };


        setEditProduct({
          nameAz: p.nameAz || "",
          nameEn: p.nameEn || "",
          nameRu: p.nameRu || "",
          descAz: p.descAz || "",
          descEn: p.descEn || "",
          descRu: p.descRu || "",
          categoryId: p.categoryInfo?.id || 0,
          colorIds: p.colorsInfo?.map(c => c.id) || [],
          materialIds: p.materialsInfo?.map(m => m.id) || [],
          occasionIds: p.occasionsInfo?.map(o => o.id) || [],
          partnerId: p.partnerInfo?.id || "hello",
          carat: p.carat || "",
          quantity: p.quantity || 0,
          weight: p.weight || 0,
          size: p.size || 0,
          productFor: p.productFor || ["FOR_SALE"],
          salePrice: p.salePrice || 0,
          rentPricePerDay: p.rentPricePerDay || 0,
          saleCompanyPercent: p.contractDetail?.saleCompanyPercent || 0,
          salePartnerPercent: p.contractDetail?.salePartnerPercent || 0,
          damageCompanyCompensation: p.contractDetail?.damageCompanyCompensation || 0,
          lossCompanyCompensation: p.contractDetail?.lossCompanyCompensation || 0,
          partnerTakeBackFeePercent: p.contractDetail?.partnerTakeBackFeePercent || 0,
          rentCompanyPercent: p.contractDetail?.rentCompanyPercent || 0,
          rentPartnerPercent: p.contractDetail?.rentPartnerPercent || 0,
          returnFeePercent: p.contractDetail?.returnFeePercent || 0,
          customerLatePenaltyPercent: p.contractDetail?.customerLatePenaltyPercent || 0,
          validFrom: formatDateForInput(p.contractDetail?.validFrom),
          validTo: formatDateForInput(p.contractDetail?.validTo),
          message: p.message || "salam",
        });

        setProduct(p);
      } catch (error) {
        toast.error("Product details could not be loaded");
      }
    };


    fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (partnerSearch.trim() === "") return;
    const fetchPartners = async () => {
      const res = await partnerService.getByName(partnerSearch);
      setPartners(res.data.data);
      console.log(res.data.data)
    };
    fetchPartners();
  }, [partnerSearch]);


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
      const PartnerRes = await partnerService.getByName("lorem");
      setPartners(PartnerRes.data.data);
    };
    fetchData();
  }, []);




  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct(prev => ({ ...prev, [name]: value }));
  };




  const saveEdit = async (e) => {
    e.preventDefault();

    const payload = {
      productId: parseInt(id),
      nameAz: editProduct.nameAz,
      nameEn: editProduct.nameEn,
      nameRu: editProduct.nameRu,
      descAz: editProduct.descAz,
      descEn: editProduct.descEn,
      descRu: editProduct.descRu,
      categoryId: editProduct.categoryId,
      colorIds: editProduct.colorIds,
      materialIds: editProduct.materialIds,
      occasionIds: editProduct.occasionIds,
      partnerId: editProduct.partnerId,
      carat: editProduct.carat,
      quantity: editProduct.quantity,
      weight: editProduct.weight,
      size: editProduct.size,
      productFor: editProduct.productFor,
      salePrice: editProduct.salePrice,
      rentPricePerDay: editProduct.rentPricePerDay,
      saleCompanyPercent: editProduct.saleCompanyPercent,
      salePartnerPercent: editProduct.salePartnerPercent,
      damageCompanyCompensation: editProduct.damageCompanyCompensation,
      lossCompanyCompensation: editProduct.lossCompanyCompensation,
      partnerTakeBackFeePercent: editProduct.partnerTakeBackFeePercent,
      rentCompanyPercent: editProduct.rentCompanyPercent,
      rentPartnerPercent: editProduct.rentPartnerPercent,
      returnFeePercent: editProduct.returnFeePercent,
      customerLatePenaltyPercent: editProduct.customerLatePenaltyPercent,
      validFrom: editProduct.validFrom ? new Date(editProduct.validFrom).toISOString() : null,
      validTo: editProduct.validTo ? new Date(editProduct.validTo).toISOString() : null,
      message: editProduct.message
    };

    try {
      await productService.update(payload);
      toast.success("Məhsul uğurla yeniləndi!");
    } catch (error) {
      toast.error("Yeniləmə uğursuz oldu: " + error.response?.data?.message);
    }
  };



  const fileInputRef = useRef(null);


  const handleArrayChange = (field, value, checked) => {
    setEditProduct((prev) => {
      let newArray = [...prev[field]];
      if (checked) {
        if (!newArray.includes(value)) {
          newArray.push(value);
        }
      } else {
        newArray = newArray.filter((item) => item !== value);
      }
      return { ...prev, [field]: newArray };
    });
  };


  useEffect(() => {
    if (!thumb) {
      setThumbPreview(null);
      return;
    }
    const url = URL.createObjectURL(thumb);
    setThumbPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumb]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // Fayl tipi və ölçüsü yoxlanışı
    const validFiles = newFiles.filter(file =>
      ['image/jpeg', 'image/png'].includes(file.type) &&
      file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== newFiles.length) {
      toast.error('Yalnız JPEG/PNG və 5MB-dan kiçik fayllar qəbul olunur');
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);

      // Preview yaratmaq
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange({ target: { files: [file] } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Şəkli silmək
  const removeThumb = () => {
    setThumb(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !id) {
      toast.warning('Şəkil və ya məhsul ID-si tapılmadı');
      return;
    }

    try {
      // Əsas şəkil adını təyin edirik
      const mainMediaName = files[mainMediaIndex]?.name || "main-product-image";

      const response = await productService.createImg(
        id,
        files,
        mainMediaName,
        "az"
      );

      if (response.status === 200) {
        toast.success(`${files.length} şəkil uğurla yükləndi`);
        // Yeniləmə əməliyyatları
        setFiles([]);
        setPreviews([]);
        setMainMediaIndex(0);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Şəkillər yüklənmədi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleScannedFileUploadRef = useRef(null);

  const handleUploadClick = () => {
    handleScannedFileUploadRef.current.click();
  };

  const handleScannedUploadChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await productService.uploadScannedFile(
        id,
        file,
        "INITIAL_HANDOVER_SIGNED"
      );
      toast.success("Upload successful!", response.message);
    } catch (error) {
      toast.error("Upload failed: " + (error.response?.data?.message || error.message));
    }
  };


  const renderError = (fieldName) => {
    return errors[fieldName] ? (
      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors[fieldName]}</p>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Link className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300    " to="/products"><ArrowLeft size={16} className="mr-2" /> Back </Link>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

        <div className='flex flex-col'>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Şəkillər</h3>

              {/* Fayl əlavə etmə zonası */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center h-44 bg-gray-50 mb-4 dark:bg-gray-800 dark:text-white"
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

              {/* Seçilmiş şəkillərin siyahısı */}
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

                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-50"
                  disabled={files.length === 0}
                >
                  Şəkilləri Yüklə
                </button>
              </div>
            </div>
          </form>



          <div className='space-y-6'>
            <div className="bg-white dark:bg-gray-900 rounded-2xl py-2 shadow-sm mt-4 border flex flex-col items-center  justify-center gap-3">
              <h3 className='font-semibold text-lg mb-4  w-[70%]'>Barcode</h3>
              <img className='w-full h-auto' src={`data:image/png;base64,${barcode.barcodeBase64}`} alt="barcode" />
              <p>{barcode.code}</p>
            </div>

          </div>
        </div>



        <form action="" onSubmit={saveEdit} className="lg:col-span-2 space-y-6">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:bg-gray-800 dark:text-white">Ümumi məlumatlar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Məhsul adı (Azərbaycanca) <span className="text-red-500">*</span></label>
                  <input
                    value={editProduct.nameAz}
                    onChange={(e) => handleEditChange({ target: { name: 'nameAz', value: e.target.value } })}
                    placeholder="Məhsulun adı az"
                    className={`w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white ${errors.nameAz ? 'border-red-500' : ''}`}
                  />
                  {renderError('nameAz')}
                </div>





                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Məhsul adı (İngiliscə) <span className="text-red-500">*</span></label>
                  <input
                    value={editProduct.nameEn}
                    onChange={(e) => handleEditChange({ target: { name: 'nameEn', value: e.target.value } })}
                    placeholder="Məhsulun adı en"
                    className={`w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white ${errors.nameEn ? 'border-red-500' : ''}`} // Error olduqda border rəngini dəyişir
                  // required
                  />
                  {renderError('nameEn')}
                </div>




                {/* Russian */}
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white" >Məhsul adı (Rusca)</label>
                  <input
                    value={editProduct.nameRu}
                    onChange={(e) => handleEditChange({ target: { name: 'nameRu', value: e.target.value } })}
                    placeholder="Məhsulun adı ru"
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('nameRu')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Təsvir (Azərbaycanca)</label>
                  <input
                    value={editProduct.descAz}
                    onChange={(e) => handleEditChange({ target: { name: 'descAz', value: e.target.value } })}
                    placeholder="Təsviri burada yazın..."
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('descAz')}
                </div>

                {/* English Description */}
                <div>
                  <label className="block text-sm font-medium dark:text-white">Təsvir (İngiliscə)</label>
                  <input
                    value={editProduct.descEn}
                    onChange={(e) => handleEditChange({ target: { name: 'descEn', value: e.target.value } })}
                    placeholder="Type your text here..."
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('descEn')}
                </div>

                {/* Russian Description */}
                <div>
                  <label className="block text-sm font-medium dark:text-white">Təsvir (Rusca)</label>
                  <input
                    value={editProduct.descRu}
                    onChange={(e) => handleEditChange({ target: { name: 'descRu', value: e.target.value } })}
                    placeholder="Введите текст здесь..."
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('descRu')}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Kateqoriya və Partner</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Kateqoriya <span className="text-red-500">*</span></label>
                  <CustomSelect
                    name="categoryId"
                    options={categories.map(category => ({
                      value: category.id,
                      label: category.name,
                      name: 'categoryId'
                    }))}
                    value={editProduct.categoryId}
                    onChange={handleEditChange}
                    placeholder="Kateqoriya seçin"
                    className="w-full border px-4 py-3 rounded-md"
                    isMulti={false}
                  />
                  {renderError('categoryId')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Partner <span className="text-red-500">*</span></label>
                  {console.log("editProduct.partnerId:", editProduct.partnerId)}
                  {console.log("partners:", partners)}
                  {console.log("options:", partners.map(partner => ({
                    value: partner.id,
                    label: partner.customerCode ? partner.customerCode : `${partner.partnerInfo?.name || ''} ${partner.partnerInfo?.surname || ''}`.trim()
                  })))}
                  <CustomSelect
                    name="partnerId"
                    options={partners.map(partner => ({

                      value: partner.id,
                      label: partner.customerCode
                        ? partner.customerCode
                        : `${partner.partnerInfo?.name || ''} ${partner.partnerInfo?.surname || ''}`.trim(),
                      name: 'partnerId'
                    }))}
                    value={editProduct.partnerId || ''}
                    onChange={handleEditChange}
                    placeholder="Partner seçin"
                    className="w-full border px-4 py-3 rounded-md"
                    isMulti={false}
                    onSearchChange={(val) => setPartnerSearch(val)}
                  />
                  {renderError('partnerId')}
                </div>
              </div>
            </div>



            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Xüsusiyyətlər</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Rənglər</label>
                  <CustomSelect
                    name="colorIds"
                    options={colors.map(color => ({
                      value: color.id,
                      label: color.name,
                      name: 'colorIds'
                    }))}
                    value={editProduct.colorIds || []}
                    onChange={handleEditChange}
                    placeholder="Rəng seçin"
                    className="w-full border px-4 py-3 rounded-md"
                    isMulti={true}
                  />
                  {renderError('colorIds')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Materiallar</label>
                  <CustomSelect
                    name="materialIds"
                    options={materials.map(material => ({
                      value: material.id,
                      label: material.name,
                      name: 'materialIds'
                    }))}
                    value={editProduct.materialIds || []}
                    onChange={handleEditChange}
                    placeholder="Material seçin"
                    className="w-full border px-4 py-3 rounded-md"
                    isMulti={true}
                  />
                  {renderError('materialIds')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Occasions</label>
                  <CustomSelect
                    name="occasionIds"
                    options={occasions.map(occasion => ({
                      value: occasion.id,
                      label: occasion.name,
                      name: 'occasionIds'
                    }))}
                    value={editProduct.occasionIds || []}
                    onChange={handleEditChange}
                    placeholder="Münasibət seçin"
                    className="w-full border px-4 py-3 rounded-md"
                    isMulti={true}
                  />
                  {renderError('occasionIds')}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Məhsul detalları</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Karat</label>
                  <input
                    type="number"
                    value={editProduct.carat}
                    onChange={(e) => handleEditChange({ target: { name: 'carat', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('carat')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Miqdar</label>
                  <input
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) => handleEditChange({ target: { name: 'quantity', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('quantity')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Çəki (q)</label>
                  <input
                    type="number"
                    value={editProduct.weight}
                    onChange={(e) => handleEditChange({ target: { name: 'weight', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('weight')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Ölçü</label>
                  <input
                    type="number"
                    value={editProduct.size}
                    onChange={(e) => handleEditChange({ target: { name: 'size', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('size')}
                </div>
              </div>
            </div>

            {/* Product For */}
            <div className="bg-white rounded-2xl dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Məhsul növü</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium dark:text-white">Məhsul üçün</label>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="forSale"
                      checked={editProduct.productFor.includes("FOR_SALE")}
                      onChange={(e) =>
                        handleArrayChange("productFor", "FOR_SALE", e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor="forSale" className="dark:text-white">Satış üçün</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="forRent"
                      checked={editProduct.productFor.includes("FOR_RENT")}
                      onChange={(e) =>
                        handleArrayChange("productFor", "FOR_RENT", e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor="forRent" className="dark:text-white">Kirayə üçün</label>
                  </div>

                  {renderError("productFor")}
                </div>
              </div>
            </div>


            {/* Prices */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Qiymətlər</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Satış qiyməti</label>
                  <input
                    type="number"
                    value={editProduct.salePrice}
                    onChange={(e) => handleEditChange({ target: { name: 'salePrice', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('salePrice')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Günlük kirayə qiyməti</label>
                  <input
                    type="number"
                    value={editProduct.rentPricePerDay}
                    onChange={(e) => handleEditChange({ target: { name: 'rentPricePerDay', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('rentPricePerDay')}
                </div>
              </div>
            </div>

            {/* Percentages */}
            <div className="bg-white rounded-2xl dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Faizlər</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Şirkət satış faizi (%)</label>
                  <input
                    type="number"
                    value={editProduct.saleCompanyPercent}
                    onChange={(e) => handleEditChange({ target: { name: 'saleCompanyPercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('saleCompanyPercent')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Partner satış faizi (%)</label>
                  <input
                    type="number"
                    value={editProduct.salePartnerPercent}
                    onChange={(e) => handleEditChange({ target: { name: 'salePartnerPercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('salePartnerPercent')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Şirkət kirayə faizi (%)</label>
                  <input
                    type="number"
                    value={editProduct.rentCompanyPercent}
                    onChange={(e) => handleEditChange({ target: { name: 'rentCompanyPercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('rentCompanyPercent')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Partner kirayə faizi (%)</label>
                  <input
                    type="number"
                    value={editProduct.rentPartnerPercent}
                    onChange={(e) => handleEditChange({ target: { name: 'rentPartnerPercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('rentPartnerPercent')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Geri qaytarma haqqı (%)</label>
                  <input
                    type="number"
                    value={editProduct.returnFeePercent}
                    onChange={(e) => handleEditChange({ target: { name: 'returnFeePercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('returnFeePercent')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Gecikmə cəriməsi (%)</label>
                  <input
                    type="number"
                    value={editProduct.customerLatePenaltyPercent}
                    onChange={(e) => handleEditChange({ target: { name: 'customerLatePenaltyPercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('customerLatePenaltyPercent')}
                </div>
              </div>
            </div>

            {/* Compensations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Kompesasiyalar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Zərər kompesasiyası</label>
                  <input
                    type="number"
                    value={editProduct.damageCompanyCompensation}
                    onChange={(e) => handleEditChange({ target: { name: 'damageCompanyCompensation', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('damageCompanyCompensation')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">İtki kompesasiyası</label>
                  <input
                    type="number"
                    value={editProduct.lossCompanyCompensation}
                    onChange={(e) => handleEditChange({ target: { name: 'lossCompanyCompensation', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('lossCompanyCompensation')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Geri qaytarma haqqı (%)</label>
                  <input
                    type="number"
                    value={editProduct.partnerTakeBackFeePercent}
                    onChange={(e) => handleEditChange({ target: { name: 'partnerTakeBackFeePercent', value: e.target.value } })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('partnerTakeBackFeePercent')}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Tarixlər</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Etibarlıdır (başlanğıc)</label>


                  <input
                    type="datetime-local"
                    value={editProduct.validFrom}
                    onChange={(e) => setEditProduct({ ...editProduct, validFrom: e.target.value })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                  />
                  {renderError('validFrom')}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium dark:text-white">Etibarlıdır (son)</label>

                  <input
                    type="datetime-local"
                    value={editProduct.validTo}
                    onChange={(e) => setEditProduct({ ...editProduct, validTo: e.target.value })}
                    className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white "
                  />
                  {renderError('validTo')}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl dark:bg-gray-800 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg dark:text-white">Mesaj</h3>

              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium dark:text-white">Xüsusi mesaj</label>
                <input
                  value={editProduct.message}
                  onChange={(e) => handleEditChange({ target: { name: 'message', value: e.target.value } })}
                  className="w-full border px-4 py-3 rounded-md dark:bg-gray-800 dark:text-white"
                />
              </div>
              {renderError('message')}
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex justify-end">
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

      <div className="bg-gray-200 rounded-2xl dark:bg-gray-800 p-6 shadow-sm flex items-center justify-between mt-4">
        <div className='flex flex-col '>
          <p className='dark:text-white'>Partnership Agrement</p>
          <span className='dark:text-white'>{contractFiles[0]?.uploadedAt}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            console.log("object")
            if (contractFiles?.length > 0) {
              console.log("click")
              const fullUrl = contractFiles[0]?.filePath;
              window.open(fullUrl, "_blank");
            }
          }}
          className="text-blue-600 hover:text-blue-800 border border-collapse border-blue-500 py-2 rounded px-2 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Contract File
        </button>

      </div>
      <div className="bg-gray-200 rounded-2xl dark:bg-gray-800 p-6 shadow-sm flex items-center justify-between mt-4">
        <div className='flex flex-col'>
          <p className='dark:text-white'>Partnership Agreement</p>
        </div>
        <div>
          <input
            type="file"
            ref={handleScannedFileUploadRef}
            onChange={handleScannedUploadChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            className="text-blue-600 hover:text-blue-800 border border-collapse border-blue-500 py-2 rounded px-2 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Upload File
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
