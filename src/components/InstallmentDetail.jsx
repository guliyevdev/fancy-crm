import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import InstallmentService from "../services/installmentService";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100",
};

const InstallmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [installment, setInstallment] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editId, setEditId] = useState(null);
    const [editedValue, setEditedValue] = useState("");

    const [editStatus, setEditStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");

    const [changes, setChanges] = useState({
        status: null,
        items: {},
    });

    useEffect(() => {
        const fetchInstallment = async () => {
            try {
                const response = await InstallmentService.getById(id);
                setInstallment(response.data.data);
                setSelectedStatus(response.data.data.status);
            } catch (error) {
                console.error("Error fetching installment:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstallment();
    }, [id]);

    const handleSaveChanges = async () => {
        if (!installment) return;

        const payload = {};

        if (changes.status && changes.status !== installment.status) {
            payload.status = changes.status;
        }

        const changedItems = Object.values(changes.items);
        if (changedItems.length > 0) {
            payload.items = changedItems.map((item) => ({
                id: item.id,
                amount: item.amount,
                approved: item.approved,
            }));
        }

        if (Object.keys(payload).length === 0) {
            alert("No changes to save!");
            return;
        }

        try {
            const response = await InstallmentService.updateById(installment.id, payload);
            console.log("object", response);
            toast.success(response?.data?.message || "Changes saved successfully.");
            navigate("/installment"); // Uğurlu sonra yönləndirmə
        } catch (error) {
            console.error("Error saving changes:", error);
            toast.error(error?.response?.data?.message || "Failed to save changes.");
        }
    };

    const handleViewFile = async (fileId) => {
        try {
            const response = await InstallmentService.getFileById(fileId);
            const fileBlob = new Blob([response.data]); // Blob yaradılır
            const fileURL = window.URL.createObjectURL(fileBlob);
            window.open(fileURL, "_blank"); // Yeni tab-da açılır
        } catch (error) {
            console.error("Error opening file:", error);
            toast.error(error?.response?.data?.message || "Failed to open file.");
        }
    };


    if (loading) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400">Loading...</div>;
    if (!installment) return <div className="text-center mt-20 text-red-500 dark:text-red-400">Installment not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-8 space-y-6">
            <div className="flex justify-between mb-6">
                <Link to="/installment" className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Installments
                </Link>
                <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Installment Details</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">ID</p>
                        <p className="text-gray-900 dark:text-white">{installment.id}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">UUID</p>
                        <p className="text-gray-900 dark:text-white">{installment.uuid}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">User PIN</p>
                        <p className="text-gray-900 dark:text-white">{installment.userPin}</p>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col justify-center">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold mb-2">Status</p>
                        {!editStatus ? (
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedStatus]}`}>
                                    {selectedStatus}
                                </span>
                                <button
                                    className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                    onClick={() => setEditStatus(true)}
                                >
                                    <CiEdit size={22} />
                                </button>
                            </div>
                        ) : (
                            <select
                                className="w-full px-3 py-1 border rounded-md text-gray-900 dark:text-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setChanges((prev) => ({ ...prev, status: e.target.value }));
                                }}
                                onBlur={() => setEditStatus(false)}
                            >
                                <option value="APPROVED">APPROVED</option>
                                <option value="PENDING">PENDING</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        )}
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">Monthly Amount</p>
                        <p className="text-gray-900 dark:text-white">${installment.monthlyAmount}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-300 font-semibold">Created At</p>
                        <p className="text-gray-900 dark:text-white">{new Date(installment.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Items</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <thead>
                            <tr className="text-left border-b border-gray-300 dark:border-gray-600">
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">ID</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Finance Type</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Amount</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">Approved</th>
                                <th className="px-4 py-2 text-gray-700 dark:text-gray-300">File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installment.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.id}</td>
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.financeType}</td>

                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                                        {editId === item.id ? (
                                            <input
                                                type="number"
                                                value={editedValue}
                                                onChange={(e) => setEditedValue(e.target.value)}
                                                className="w-28 px-2 py-1 border rounded-md text-gray-900 dark:text-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        ) : (
                                            <span className="min-w-[50px]">${item.amount}</span>
                                        )}
                                        <button
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            onClick={() => {
                                                setEditId(item.id);
                                                setEditedValue(item.amount);
                                            }}
                                        >
                                            <CiEdit size={22} />
                                        </button>
                                        {editId === item.id && (
                                            <button
                                                className="ml-2 px-2 py-1 bg-green-600 text-white rounded-md"
                                                onClick={() => {
                                                    setChanges((prev) => ({
                                                        ...prev,
                                                        items: {
                                                            ...prev.items,
                                                            [item.id]: {
                                                                ...item,
                                                                amount: Number(editedValue),
                                                                approved: item.approved,
                                                            },
                                                        },
                                                    }));
                                                    setInstallment((prev) => ({
                                                        ...prev,
                                                        items: prev.items.map((i) =>
                                                            i.id === item.id ? { ...i, amount: Number(editedValue) } : i
                                                        ),
                                                    }));
                                                    setEditId(null);
                                                }}
                                            >
                                                Save
                                            </button>
                                        )}
                                    </td>

                                    <td className="px-4 py-2">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="peer hidden"
                                                checked={item.approved}
                                                onChange={(e) => {
                                                    const updatedApproved = e.target.checked;
                                                    setChanges((prev) => ({
                                                        ...prev,
                                                        items: {
                                                            ...prev.items,
                                                            [item.id]: {
                                                                ...item,
                                                                approved: updatedApproved,
                                                                amount: item.amount,
                                                            },
                                                        },
                                                    }));
                                                    setInstallment((prev) => ({
                                                        ...prev,
                                                        items: prev.items.map((i) =>
                                                            i.id === item.id ? { ...i, approved: updatedApproved } : i
                                                        ),
                                                    }));
                                                }}
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full 
                                              peer dark:bg-gray-700 peer-checked:bg-blue-600 
                                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                                              after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </td>

                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                                        <button
                                            onClick={() => window.open(`https://api.fancy.az/fancy-website/api/v1/crm/installment-applications/files/${item.id}`, "_blank")}
                                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
                                        >
                                            View File
                                        </button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstallmentDetail;
