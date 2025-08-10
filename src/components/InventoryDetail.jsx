import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InventoryServices from '../services/inventoryService';
import { toast } from 'sonner';
import Modal from "react-modal";
import { Plus, Trash } from 'lucide-react';

Modal.setAppElement("#root");

const InventoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State-lər
    const [inventory, setInventory] = useState(null); // Inventory məlumatları
    const [loading, setLoading] = useState(true); // Yüklənmə statusu
    const [scanOpen, setScanOpen] = useState(false); // Skan modalının açıq/bağlı statusu
    const [scanData, setScanData] = useState({
        inventoryId: "", // Inventory ID
        productCodes: [], // Məhsul kodları arrayi
        status: "OPEN" // Default status
    });
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const statusOptions = [
        { value: 'DRAFT', label: 'Məhsul əlavə olunub, amma hələ contract və ya təsdiq yoxdur' },
        { value: 'IN_THE_OFFICE', label: 'Məhsul aktivdir və hazırda ofisdədir' },
        { value: 'RESERVED', label: 'Məhsul icarə və ya satış üçün rezerv olunub' },
        { value: 'AT_THE_CLIENT', label: 'Məhsul icarədədir (aktiv olaraq müştəridədir)' },
        { value: 'DELAYED_RETURN', label: ' Məhsulun geri qaytarılması gecikib' },
        { value: 'SOLD', label: 'Məhsul satılıb və müştəriyə verilib' },
        { value: 'SERVICE', label: 'Məhsul servisdədir (məsələn: təmir, yoxlama)' },
        { value: 'CANCELLED_BY_PARTNER', label: 'Partner tərəfindən contract ləğv olunub, məhsul geri götürülüb' },
        { value: 'DEACTIVATED', label: ' Məhsul deaktiv vəziyyətdədir (ümumi deaktiv)' },

        { value: 'EXPIRED_AGREEMENT', label: 'Partnyor-la muqavile vaxti bitibse' }
    ];

    const handleCloseInventory = async () => {
        // if (!selectedStatus) {
        //     toast.error('Zəhmət olmasa status seçin');
        //     return;
        // }

        try {
            await InventoryServices.closeScan({
                id: id,
                status: selectedStatus
            });
            toast.success('Inventory uğurla bağlandı');
            setCloseModalOpen(false);

            // Inventory məlumatlarını yenilə
            const response = await InventoryServices.getById(id);
            setInventory(response.data.data);
        }
        catch (error) {
            console.error('Inventory bağlanarkən xəta:', error);
            // toast.error(error.response?.data?.message || 'Inventory bağlana bilmədi');
        }
    };



    useEffect(() => {
        const fetchInventoryDetail = async () => {
            try {
                const response = await InventoryServices.getById(id);
                setInventory(response.data.data);
            } catch (error) {
                console.error("Error fetching inventory details:", error);
                toast.error("Inventory details could not be loaded");
                navigate('/inventory');
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryDetail();
    }, [id, navigate]);

    // Skan modalını açmaq üçün funksiya
    const openScanModal = () => {
        setScanData({
            inventoryId: id, // URL-dən gələn ID-ni istifadə edirik
            productCodes: [""], // Boş inputla başlayırıq
            status: "OPEN" // Default status
        });
        setScanOpen(true);
    };

    // Form inputlarının dəyərlərini dəyişmək üçün
    const handleScanChange = (e) => {
        const { name, value } = e.target;
        setScanData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Skan formunu göndərmək üçün funksiya
    const handleScanSubmit = async (e) => {
        e.preventDefault();

        try {
            const validCodes = scanData.productCodes.filter(code => code.trim() !== "");

            if (validCodes.length === 0) {
                toast.error("Ən azı bir məhsul kodu daxil edin");
                return;
            }

            // Burada artıq bir requestlə göndəririk
            await InventoryServices.createScan({
                inventoryId: scanData.inventoryId,
                productCodes: validCodes, // array kimi gedir
                status: scanData.status
            });

            toast.success(`${validCodes.length} məhsul kodu uğurla əlavə edildi`);
            setScanOpen(false);

            // Yenidən inventory-ni yükləyirik
            const response = await InventoryServices.getById(id);
            setInventory(response.data.data);

        } catch (error) {
            console.error("Skan əlavə edilərkən xəta:", error);
            toast.error(error.response?.data?.message || "Skan əlavə edilərkən xəta baş verdi");
        }
    };


    const handleProductCodeChange = (index, value) => {
        const newProductCodes = [...scanData.productCodes];
        newProductCodes[index] = value;
        setScanData(prev => ({
            ...prev,
            productCodes: newProductCodes
        }));
    };

    const addProductCodeField = () => {
        setScanData(prev => ({
            ...prev,
            productCodes: [...prev.productCodes, ""]
        }));
    };

    const removeProductCodeField = (index) => {
        if (scanData.productCodes.length <= 1) return;
        const newProductCodes = scanData.productCodes.filter((_, i) => i !== index);
        setScanData(prev => ({
            ...prev,
            productCodes: newProductCodes
        }));
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    // Inventory tapılmadısa xəta mesajı
    if (!inventory) {
        return <div className="p-6">Inventory not found</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Başlıq */}
            <h2 className="text-2xl font-semibold mb-6">Inventory Details</h2>

            {/* Ümumi məlumatlar bölməsi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">General Information</h3>
                <div className='flex justify-between'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 dark:text-gray-300">ID: {inventory.id}</p>
                            <p className="text-gray-600 dark:text-gray-300">Status: {inventory.status}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created At: {inventory.createdAt}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-300">Total Products: {inventory.totalProductCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Scanned: {inventory.scannedCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Not Scanned: {inventory.notScannedCount}</p>
                        </div>
                    </div>
                    {/* Skan et düyməsi */}
                    <div>
                        <button
                            onClick={openScanModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Skan et
                        </button>
                    </div>
                </div>
            </div>

            {/* Məhsul detalları bölməsi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">System Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Scanned</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matched</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {inventory.productDetails.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.productCode}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.systemStatus}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.scanned ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                                            {product.scanned ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.matched ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                                            {product.matched ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


            </div>
            <div className="flex justify-end mt-3">
                <button
                    onClick={() => setCloseModalOpen(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
                >
                    Close
                </button>
            </div>

            {/* close modali  */}

            <Modal
                isOpen={closeModalOpen}
                onRequestClose={() => setCloseModalOpen(false)}
                contentLabel="Close Inventory"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4">Inventory Bağlama</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Bağlama səbəbini seçin
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                            <option value="">Seçim edin</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setCloseModalOpen(false)}
                            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
                        >
                            Ləğv et
                        </button>
                        <button
                            onClick={handleCloseInventory}
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                            Təsdiqlə
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Skan modalı */}
            <Modal
                isOpen={scanOpen}
                onRequestClose={() => setScanOpen(false)}
                contentLabel="Product Scan"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Məhsul Skanı
                </h3>
                <form onSubmit={handleScanSubmit} className="space-y-4">
                    {/* Inventory ID */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Inventory ID
                        </label>
                        <input
                            name="inventoryId"
                            value={scanData.inventoryId}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                        />
                    </div>

                    {/* Məhsul kodları inputları */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Məhsul Kodları
                        </label>
                        {scanData.productCodes.map((code, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    value={code}
                                    onChange={(e) => handleProductCodeChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    required
                                />
                                {index === scanData.productCodes.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={addProductCodeField}
                                        className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => removeProductCodeField(index)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        <Trash size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Status seçimi */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={scanData.status}
                            onChange={handleScanChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSE">CLOSE</option>
                        </select>
                    </div>

                    {/* Düymələr */}
                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setScanOpen(false)}
                            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
                        >
                            Ləğv et
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Yadda Saxla
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryDetail;