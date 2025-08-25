import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InventoryServices from '../services/inventoryService';
import { toast } from 'sonner';
import Modal from "react-modal";
import { Plus, Trash } from 'lucide-react';
import { FaChevronDown } from 'react-icons/fa';

Modal.setAppElement("#root");

const InventoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inventory, setInventory] = useState(null); // Inventory məlumatları
    const [loading, setLoading] = useState(true); // Yüklənmə statusu
    const [scanOpen, setScanOpen] = useState(false); // Skan modalının açıq/bağlı statusu
    const [scanData, setScanData] = useState({
        inventoryId: "",
        productCodes: [],
        status: "OPEN"
    });
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    const statusOptions = [
        { value: 'SOLD', label: 'Məhsul satılıb və müştəriyə verilib' },
        { value: 'IN_THE_OFFICE', label: 'Məhsul aktivdir və hazırda ofisdədir' },
        { value: 'DRAFT', label: 'Məhsul əlavə olunub, amma hələ contract və ya təsdiq yoxdur' },
        { value: 'RESERVED', label: 'Məhsul icarə və ya satış üçün rezerv olunub' },
        { value: 'AT_THE_CLIENT', label: 'Məhsul icarədədir (aktiv olaraq müştəridədir)' },
        { value: 'DELAYED_RETURN', label: ' Məhsulun geri qaytarılması gecikib' },
        { value: 'SERVICE', label: 'Məhsul servisdədir (məsələn: təmir, yoxlama)' },
        { value: 'CANCELLED_BY_PARTNER', label: 'Partner tərəfindən contract ləğv olunub, məhsul geri götürülüb' },
        { value: 'DEACTIVATED', label: ' Məhsul deaktiv vəziyyətdədir (ümumi deaktiv)' },

        { value: 'EXPIRED_AGREEMENT', label: 'Partnyor-la muqavile vaxti bitibse' }
    ];


    const handleCloseInventory = async () => {
        try {
            await InventoryServices.closeScan({
                id: id,
                status: "CLOSE"
            });
            toast.success('Inventory uğurla bağlandı');
            setCloseModalOpen(false);

            const response = await InventoryServices.getById(id);
            setInventory(response.data.data);
        } catch (error) {
            toast.error("Inventory bağlanarkən xəta baş verdi");
        }
    };


    useEffect(() => {
        const fetchInventoryDetail = async () => {
            try {
                const response = await InventoryServices.getById(id);
                setInventory(response.data.data);
            } catch (error) {
                toast.error("Inventory details could not be loaded");
                navigate('/inventory');
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryDetail();
    }, [id, navigate]);

    const openScanModal = () => {
        setScanData({
            inventoryId: id,
            productCodes: [""],
            // status: "SOLD"
        });
        setScanOpen(true);
    };




    const handleScanSubmit = async (e) => {
        e.preventDefault();

        try {
            const validCodes = scanData.productCodes.filter(code => code.trim() !== "");

            if (validCodes.length === 0) {
                toast.error("Ən azı bir məhsul kodu daxil edin");
                return;
            }

            await InventoryServices.createScan({
                inventoryId: scanData.inventoryId,
                productCode: validCodes,
                status: scanData.status
            });

            toast.success(`${validCodes.length} məhsul kodu uğurla əlavə edildi`);
            setScanOpen(false);

            const response = await InventoryServices.getById(id);
            setInventory(response.data.data);

        } catch (error) {
            toast.error(error.response?.data?.message || "Skan əlavə edilərkən xəta baş verdi");
        }
    };


    // const handleProductCodeChange = (index, value) => {
    //     const newProductCodes = [...scanData.productCodes];
    //     newProductCodes[index] = value;
    //     setScanData(prev => ({
    //         ...prev,
    //         productCodes: newProductCodes
    //     }));
    // };



    const handleProductCodeChange = (index, value) => {
        const newProductCodes = [...scanData.productCodes];
        newProductCodes[index] = value;

        // Əgər bu sonuncu inputdursa və dəyər daxil edilibsə, yeni input əlavə et
        if (index === newProductCodes.length - 1 && value.trim() !== "") {
            newProductCodes.push("");
        }

        setScanData(prev => ({
            ...prev,
            productCodes: newProductCodes
        }));
    };
    // const addProductCodeField = () => {
    //     setScanData(prev => ({
    //         ...prev,
    //         productCodes: [...prev.productCodes, ""]
    //     }));
    // };

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

    if (!inventory) {
        return <div className="p-6">Inventory not found</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Inventory Details</h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">General Information</h3>
                <div className="flex justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <p className="text-gray-600 dark:text-gray-300">ID: {inventory.id}</p>
                            <p className="text-gray-600 dark:text-gray-300">User ID: {inventory.userId ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created By Code: {inventory.createdByCode ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created By Name: {inventory.createdByName ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created By Surname: {inventory.createdBySurname ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created By Email: {inventory.createdByEmail ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created By Phone: {inventory.createdByPhone ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Created At: {inventory.createdAt}</p>
                            <p className="text-gray-600 dark:text-gray-300">Closed At: {inventory.closedAt ?? "-"}</p>
                            <p className="text-gray-600 dark:text-gray-300">Status: {inventory.status}</p>
                            <p className="text-gray-600 dark:text-gray-300">Comment: {inventory.comment}</p>
                            <p className="text-gray-600 dark:text-gray-300">Total Products: {inventory.totalProductCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Scanned: {inventory.scannedCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Not Scanned: {inventory.notScannedCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Matched: {inventory.matchedCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Not Matched: {inventory.notMatchedCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Draft Status Count: {inventory.draftStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">In The Office Status Count: {inventory.inTheOfficeStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Reserved Status Count: {inventory.reservedStatusCount}</p>

                            <p className="text-gray-600 dark:text-gray-300">At The Client Status Count: {inventory.atTheClientStatusCount}</p>
                        </div>

                        <div>
                            <p className="text-gray-600 dark:text-gray-300">Delayed Return Status Count: {inventory.delayedReturnStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Sold Status Count: {inventory.soldStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Service Status Count: {inventory.serviceStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Canceled By Partner Status Count: {inventory.canceledByPartnerStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Expired Agreement Status Count: {inventory.expiredAgreementStatusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Expected In Office Count: {inventory.expectedInOfficeCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Office Missing Count: {inventory.officeMissingCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Office Surplus Count: {inventory.officeSurplusCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Matched In Office Count: {inventory.matchedInOfficeCount}</p>
                            <p className="text-gray-600 dark:text-gray-300">Scanned Rate Percent: {inventory.scannedRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Matched Rate Percent: {inventory.matchedRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Not Scanned Rate Percent: {inventory.notScannedRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Not Matched Rate Percent: {inventory.notMatchedRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">In Office Match Rate Percent: {inventory.inOfficeMatchRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Office Missing Rate Percent: {inventory.officeMissingRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Office Surplus Rate Percent: {inventory.officeSurplusRatePercent}</p>
                            <p className="text-gray-600 dark:text-gray-300">Total Elements: {inventory.totalElements}</p>
                            <p className="text-gray-600 dark:text-gray-300">Total Pages: {inventory.totalPages}</p>
                            <p className="text-gray-600 dark:text-gray-300">Size: {inventory.size}</p>
                        </div>
                    </div>

                    <div className="ml-4">
                        <button
                            onClick={openScanModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm whitespace-nowrap"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Skan et
                        </button>

                    </div>
                </div>
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">System Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Scanned Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Scanned At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Scanned</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Matched</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {inventory.productDetails.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.productId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.productCode}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.systemStatus}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.scannedStatus}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.scannedAt ?? "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{product.comment ?? "-"}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.scanned
                                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                                                }`}
                                        >
                                            {product.scanned ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${product.matched
                                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                                                }`}
                                        >
                                            {product.matched ? "Yes" : "No"}
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



            <Modal
                isOpen={closeModalOpen}
                onRequestClose={() => setCloseModalOpen(false)}
                contentLabel="Close Inventory"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 outline-none"
            >
                <h3 className="text-xl font-semibold mb-4">Inventory Bağlama</h3>
                <p className="mb-6">Bağlama əməliyyatına əminsiniz?</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setCloseModalOpen(false)}
                        className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
                    >
                        Xeyr
                    </button>
                    <button
                        onClick={handleCloseInventory}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Bəli
                    </button>
                </div>
            </Modal>


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





                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Məhsul Kodları
                        </label>


                        <div
                            className="max-h-[160px] overflow-y-auto  px-2 py-2"
                            style={{ scrollbarWidth: "thin" }}
                        >
                            {scanData.productCodes.map((code, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        value={code}
                                        onChange={(e) => handleProductCodeChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"

                                    />
                                    {/* Yalnız sonuncu input üçün "+" düyməsini göstər */}
                                    {index === scanData.productCodes.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeProductCodeField(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    )}

                                    {index !== scanData.productCodes.length - 1 && (
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
                    </div>


                    {/* <div>
                        <label className="block text-sm font-medium mb-1">
                            Status
                        </label>



                        <div className="relative">

                            <div
                                onClick={() => setStatusDropdownOpen(prev => !prev)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md 
               dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 
               cursor-pointer flex justify-between items-center"
                            >
                                <span>
                                    {statusOptions.find(o => o.value === scanData.status)?.label || "Status seçin"}
                                </span>
                                <FaChevronDown
                                    className={`ml-2 transition-transform duration-200 ${statusDropdownOpen ? "transform rotate-180" : ""
                                        }`}
                                    size={16}
                                />
                            </div>


                            {statusDropdownOpen && (
                                <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 border 
                    border-gray-300 dark:border-gray-700 rounded-md shadow-lg 
                    max-h-60 overflow-auto z-10">
                                    {statusOptions.map(option => (
                                        <div
                                            key={option.value}
                                            onClick={() => {
                                                setScanData(prev => ({ ...prev, status: option.value }));
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="px-3 py-2 text-sm text-gray-700 dark:text-gray-100 
                     hover:bg-gray-100 dark:hover:bg-gray-700 
                     cursor-pointer break-words"
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>



                    </div> */}


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