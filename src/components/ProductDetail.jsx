import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom"; 
import { ArrowLeft, Save, Upload, Image as ImageIcon, PlusCircle, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner'; // ✅ ADD this import

// --- SERVICE IMPORTS ---
// The component now relies on these services being correctly configured in your project.
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import caratService from '../services/caratService';
import { searchMaterials } from '../services/materialService';
import designerService from '../services/designerService';
import occasionService from '../services/occasionService';
import colorService from '../services/colorService';
import { backendBaseUrl, uploadToServer } from '../utils/axiosInstance';
import partnerService from '../services/partnerService';
import { pdf, Document, Page, StyleSheet } from '@react-pdf/renderer';
import InitialDeliveryActPage from './InitialDeliveryActPage'
import FinalDeliveryActPage from './FinalDeliveryActPage';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderBottomStyle: 'solid',
  },
  companyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    fontSize: 10,
    color: '#666666',
  },
  headerRightText: {
    marginBottom: 2,
  },
  providerCustomerSection: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  providerSection: {
    flex: 1,
    marginRight: 40,
  },
  customerSection: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  providerText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#333333',
  },
  providerCompany: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333333',
  },
  invoiceSection: {
    marginBottom: 30,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  invoiceDetailsTable: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  invoiceDetailCell: {
    border: '1px solid #cccccc',
    padding: 8,
    minHeight: 40,
  },
  invoiceDetailHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    fontSize: 10,
    borderBottom: '1px solid #cccccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  invoiceDetailValue: {
    fontSize: 10,
    color: '#333333',
  },
  servicesSection: {
    marginBottom: 30,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  table: {
    border: '1px solid #cccccc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #cccccc',
  },
  tableHeaderCell: {
    padding: 10,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    borderRight: '1px solid #cccccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #cccccc',
  },
  tableCell: {
    padding: 10,
    fontSize: 10,
    color: '#333333',
    textAlign: 'center',
    borderRight: '1px solid #cccccc',
  },
  descriptionCol: { width: '70%' },
  valueCol: { width: '30%' },
});





// --- Reusable Form Components ---
const FormInput = ({ id, label, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <input id={id} {...props} className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
    </div>
);

const FormSelect = ({ id, label, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
        <select id={id} {...props} className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">{children}</select>
    </div>
);

// --- Dynamic List Component ---
const DynamicMultiSelect = ({ title, items, availableOptions, onAdd, onRemove, onChange, fieldNames }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h3>
        <div className="space-y-3">
            {(items || []).map((item, index) => (
                <div key={index} className="flex gap-3 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <select
                        value={item[fieldNames.id] || ''}
                        onChange={(e) => onChange(index, fieldNames.id, e.target.value)}
                        className="flex-grow p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="" disabled>Select {title.slice(0, -1)}...</option>
                        {availableOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                    <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Remove ${title.slice(0, -1)}`}>
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
        <button type="button" onClick={onAdd} className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition">
            <PlusCircle size={16} /> Add {title.slice(0, -1)}
        </button>
    </div>
);


// --- Main Component ---
const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState(null);

    const [product, setProduct] = useState(null);
    const [options, setOptions] = useState({ categories: [], carats: [], materials: [], colors: [], designers: [], occasions: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [activeImage, setActiveImage] = useState(0);
    const fileInputRef = useRef(null);

    const [imagefile,setImagefile]=useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImagefile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
            setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            setProduct(prev => ({
            ...prev,
            media: {
                name: file.name,
                type: file.type,
            },
            }));
        }
    };



    // Fetch all necessary data on component mount
    useEffect(() => {
      
        const fetchAllData = async () => {
            if (!id) {
                setError("No product ID provided.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Concurrently fetch the product and all lookup/option data
                const [productRes, catRes, caratRes, matRes, colorRes, desRes, occRes] = await Promise.all([
                    productService.getById(id),
                    categoryService.search(),
                    caratService.search(),
                    searchMaterials(),
                    colorService.search(),
                    designerService.search(),
                    occasionService.search(),
                ]);
                

                setProduct(productRes.data);
                setOptions({
                    categories: catRes.data.content,
                    carats: caratRes.data.content,
                    materials: matRes.content,
                    colors: colorRes.data.content,
                    designers: desRes.content,
                    occasions: occRes.data.content,
                });
                setActiveImage(0);
            } catch (err) {
                setError("Failed to load product details and options.");
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
        
    }, [id]);

    
    // Generic handler for simple form input changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: name === "price" || name === "weight" || name === "size" ? parseFloat(value) || 0 : value,
        }));
    }, []);

    // Generic handler for dynamic list changes
    const handleDynamicListChange = useCallback((listName, index, field, value) => {
        setProduct((prev) => {
            const newList = [...(prev[listName] || [])];
            const optionsKey = listName.replace('Ids', 's');
            const selectedOption = options[optionsKey]?.find(opt => opt.id === value);
            newList[index] = selectedOption ? { ...selectedOption } : { id: value };
            return { ...prev, [listName]: newList };
        });
    }, [options]);

    const addDynamicListItem = useCallback((listName) => {
        setProduct((prev) => ({
            ...prev,
            [listName]: [...(prev[listName] || []), { id: '' }],
        }));
    }, []);

    const removeDynamicListItem = useCallback((listName, index) => {
        setProduct((prev) => {
            const newList = [...(prev[listName] || [])];
            newList.splice(index, 1);
            return { ...prev, [listName]: newList };
        });
    }, []);

    // Save product changes
    const saveProduct = async () => {
    setSaving(true);
    try {
        let media = [];

        if (imagefile) {
            const uploadedUrl = await uploadToServer(imagefile);
            media.push({
                name: imagefile.name,
                type: imagefile.type,
                url: uploadedUrl,
            });
        }

        const updateDTO = {
            ...product,
            media: media.length > 0 ? media[0] : product.media,
            occasionIds: product.occasionIds.map(o => o.id),
            materialIds: product.materialIds.map(m => m.id),
            colorIds: product.colorIds.map(c => c.id),
            designerIds: product.designerIds.map(d => d.id),
        };

        await productService.update(id, updateDTO);
        toast.success('Product saved successfully!');
        setTimeout(() => navigate(-1), 1500);
    } catch (err) {
        toast.error('Failed to save product.');
        console.error("Save Error:", err);
    } finally {
        setSaving(false);
    }
};

const handleGenerateInitialDeliveryAct = async (contract) => {
  try {
    const deliveryDataList = [];
    const categoryResponse = await categoryService.getById(product.categoryId);
    const partner = await partnerService.getByPartnerCode(product.partnerCode);
    const category = categoryResponse.data;

     deliveryDataList.push({ contract, product, category });

    const blob = await pdf(
      <Document>
        <Page size="A4" style={styles.page}>
            <InitialDeliveryActPage
              partner={partner}
              deliveryData={product}
              category={category}
            />
          </Page>
      </Document>
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Initial-Delivery-Act.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
     toast.error(`Error generating Initial Delivery Act PDF: ${error.message || 'Unknown error'}`);
    console.error(error);

  }
};




 
  const handleGenerateFinalDeliveryAct = async () => {
const partner = await partnerService.getByPartnerCode(product.partnerCode);
  try {
    const blob = await pdf(
      <Document>
        <Page size="A4" style={styles.page}>
          <FinalDeliveryActPage partner={partner} />
        </Page>
      </Document>
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Final-Delivery-Act-${partner.name || 'unknown'}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
     toast.error('Error generating Final Delivery Act PDF:', error);
  }
};
const handleDocumentChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    toast.loading("Uploading file...");
    const uploadedUrl = await uploadToServer(file);
    toast.success("File uploaded successfully!");
    setUploadedDocumentUrl(uploadedUrl);
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error("Failed to upload file.");
  }
};

const handleFileDocumentChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const uploadedUrl = await uploadToServer(file);
    toast.success("File uploaded successfully!");
    setUploadedDocumentUrl(uploadedUrl);
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error("Failed to upload file.");
  }
};
    
    // Render states
    if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto mt-10">{error}</div>;
    if (!product) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Product not found.</div>;

    const productImage = (product.media && (product.media.type === 'image/jpeg' || product.media.type === 'image/png'))? product.media: null;
    const triggerFileInput = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
};
    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex items-center justify-between mb-6">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                            <ArrowLeft size={16} className="mr-2" /> Back to Products
                        </button>
                        <h1 className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-50">Edit Product</h1>
                    </div>
                    <button onClick={saveProduct} disabled={saving || loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </header>

                <form onSubmit={(e) => { e.preventDefault(); saveProduct(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Images */}
                    <div className="lg:col-span-1 space-y-6">
                         
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Product Images</h3>
                            {/* Placeholder for image uploads */}
                            <div className="aspect-square w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {productImage ? (
                                <img
                                    src={previewImage || `${backendBaseUrl}/${productImage.name}`}
                                    alt={productImage.name || "Product Image"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x600/fecaca/b91c1c?text=Image+Error';
                                    }}
                                    />
                            ) : (
                                <ImageIcon size={48} className="text-gray-400 dark:text-gray-500" />
                            )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={triggerFileInput}
                                className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/75 p-2 rounded-md transition"
                            >
                                <Upload size={16} /> Upload Image
                            </button>
                         </div>
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        Files
                    </h3>

                    <div className="space-y-4">
                        <div>
                        <label
                            htmlFor="document-upload"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Upload Document (PDF, DOC, JPG, PNG)
                        </label>
                        <input
                            type="file"
                            id="document-upload"
                            name="document"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100
                                    dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                            onChange={(e)=>handleFileDocumentChange(e)}
                            />
                                                    </div>

                        <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleGenerateInitialDeliveryAct}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium rounded-md"
                            >
                            <FileText size={25} /> Generate Initial Act Delivry
                            </button>
                        <button
                            type="button"
                            onClick={handleGenerateFinalDeliveryAct}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium rounded-md"
                            >
                            <FileText    size={25} /> Generate final Act Delivry
                            </button>
                        </div>
                    </div>
                    </div>
                    </div>

                    

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Core Information</h3>
                            <div className="space-y-4">
                                <FormInput id="name" name="name" label="Product Name" value={product.name} onChange={handleChange} type="text" required />
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                                    <textarea id="description" name="description" value={product.description || ''} onChange={handleChange} rows={5} className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Product code:</label>
                                        <p htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{product.code}</p>
                                    </div>
                                    <FormInput id="price" name="price" label="Price ($)" value={product.price} onChange={handleChange} type="number" step="0.01" min="0" />
                                    
                                    {product.barcodeImage && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Barcode</label>
                                            <img
                                            src={`data:image/png;base64,${product.barcodeImage}`}
                                            alt="Product Barcode"
                                            className="w-[300px] h-auto border border-gray-300 dark:border-gray-600 rounded-md"
                                            />
                                        </div>
                                        )}
                                        <FormInput id="rentPrice" name="rentPrice" label="Price of rent/day" value={product.rentPrice} onChange={handleChange} type="number" step="0.01" min="0" />
                                    <FormInput id="quantity" name="quantity" label="Quantity" value={product.quantity} onChange={handleChange} type="number" step="0.01" min="0" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Partner & Contract Info</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput id="partnerCode" name="partnerCode" label="Partner Code" value={product.partnerCode || ''} onChange={handleChange} />
    </div>

    <h4 className="text-md font-semibold mt-6 mb-2 text-gray-700 dark:text-gray-200">Contract Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
            { id: "saleCompanyPercent", label: "Sale Company %" },
            { id: "salePartnerPercent", label: "Sale Partner %" },
            { id: "damageCompanyCompensation", label: "Damage Compensation" },
            { id: "lossCompanyCompensation", label: "Loss Compensation" },
            { id: "partnerTakebackFeePercent", label: "Takeback Fee %" },
            { id: "rentCompanyPercent", label: "Rent Company %" },
            { id: "rentPartnerPercent", label: "Rent Partner %" },
            { id: "returnFeePercent", label: "Return Fee %" },
        ].map(({ id, label }) => (
            <FormInput
                key={id}
                id={`contract.${id}`}
                name={id}
                label={label}
                value={product.contract?.[id] || ''}
                onChange={(e) => setProduct(prev => ({
                    ...prev,
                    contract: { ...prev.contract, [id]: parseFloat(e.target.value) || 0 }
                }))}
                type="number"
                step="0.01"
                min="0"
            />
        ))}

        <FormSelect
            id="returnFeePayer"
            name="returnFeePayer"
            label="Return Fee Payer"
            value={product.contract?.returnFeePayer || ''}
            onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setProduct(prev => ({
                    ...prev,
                    contract: {
                    ...prev.contract,
                    [id]: val,
                    }
                }));
                }}

        >
            <option value="">Select...</option>
            <option value="PARTNER">PARTNER</option>
            <option value="COMPANY">COMPANY</option>
            <option value="CUSTOMER">CUSTOMER</option>
        </FormSelect>

        <FormInput
            id="validFrom"
            name="validFrom"
            label="Valid From"
            type="date"
            value={product.contract?.validFrom || ''}
            onChange={(e) => {
  const val = parseFloat(e.target.value) || 0;
  setProduct(prev => ({
    ...prev,
    contract: {
      ...prev.contract,
      [id]: val,
    }
  }));
}}

        />
        <FormInput
            id="validTo"
            name="validTo"
            label="Valid To"
            type="date"
            value={product.contract?.validTo || ''}
            onChange={(e) => {
  const val = parseFloat(e.target.value) || 0;
  setProduct(prev => ({
    ...prev,
    contract: {
      ...prev.contract,
      [id]: val,
    }
  }));
}}

        />
        
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
            <textarea
                rows={3}
                className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={product.contract?.notes || ''}
                onChange={(e) => {
  const val = parseFloat(e.target.value) || 0;
  setProduct(prev => ({
    ...prev,
    contract: {
      ...prev.contract,
      [id]: val,
    }
  }));
}}

            />
        </div>
    </div>
</div>

                        
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Categorization & Specs</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect id="status" name="status" label="Status" value={product.status} onChange={handleChange}>
                                    <option value="SALED">SALED</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="PUBLISHED">PUBLISHED</option>
                                </FormSelect>
                                <FormSelect id="status" name="raison" label="raison" value={product.raison} onChange={handleChange}>
                                    <option value="FOR_SALE">FOR SALE</option>
                                    <option value="FOR_RENT">FOR RENT</option>
                                    <option value="FOR_RENT_SALE">FOR RENT AND SALE</option>
                                </FormSelect>
                                <FormSelect id="categoryId" name="categoryId" label="Category" value={product.categoryId || ''} onChange={handleChange}>
                                    <option value="">Select category...</option>
                                    {options.categories.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </FormSelect>
                                <FormSelect id="caratId" name="caratId" label="Carat" value={product.caratId || ''} onChange={handleChange}>
                                    <option value="">Select carat...</option>
                                    {options.carats.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </FormSelect>
                                <FormInput id="size" name="size" label="Size" value={product.size || ''} onChange={handleChange} type="number" step="0.1" min="0" />
                                <FormInput id="weight" name="weight" label="Weight (g)" value={product.weight || ''} onChange={handleChange} type="number" step="0.1" min="0" />
                            </div>
                        </div>
                        
                        <DynamicMultiSelect
                            title="Materials"
                            items={product.materialIds}
                            availableOptions={options.materials}
                            onAdd={() => addDynamicListItem('materialIds')}
                            onRemove={(index) => removeDynamicListItem('materialIds', index)}
                            onChange={(index, field, value) => handleDynamicListChange('materialIds', index, field, value)}
                            fieldNames={{ id: 'id', name: 'name' }}
                        />

                        <DynamicMultiSelect
                            title="Colors"
                            items={product.colorIds}
                            availableOptions={options.colors}
                            onAdd={() => addDynamicListItem('colorIds')}
                            onRemove={(index) => removeDynamicListItem('colorIds', index)}
                            onChange={(index, field, value) => handleDynamicListChange('colorIds', index, field, value)}
                            fieldNames={{ id: 'id', name: 'name' }}
                        />

                        <DynamicMultiSelect
                            title="Designers"
                            items={product.designerIds}
                            availableOptions={options.designers}
                            onAdd={() => addDynamicListItem('designerIds')}
                            onRemove={(index) => removeDynamicListItem('designerIds', index)}
                            onChange={(index, field, value) => handleDynamicListChange('designerIds', index, field, value)}
                            fieldNames={{ id: 'id', name: 'name' }}
                        />

                        <DynamicMultiSelect
                            title="Occasions"
                            items={product.occasionIds}
                            availableOptions={options.occasions}
                            onAdd={() => addDynamicListItem('occasionIds')}
                            onRemove={(index) => removeDynamicListItem('occasionIds', index)}
                            onChange={(index, field, value) => handleDynamicListChange('occasionIds', index, field, value)}
                            fieldNames={{ id: 'id', name: 'name' }}
                        />

                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductDetail;