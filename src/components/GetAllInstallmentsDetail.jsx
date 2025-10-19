import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstallmentService from '../services/installmentService';
import { FaArrowLeft, FaEdit, FaCalendarAlt, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'sonner';

const GetAllInstallmentsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [installment, setInstallment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const fetchInstallmentDetail = async () => {
            try {
                setLoading(true);
                const response = await InstallmentService.getAllInstallmentsById(id);
                setInstallment(response.data.data);
            } catch (error) {
                console.error('Error fetching installment detail:', error);
                setError('Failed to load installment details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInstallmentDetail();
        }
    }, [id]);

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            // Her dosya için ayrı ayrı API çağrısı yap
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file); // Binary file olarak gönder
                return await InstallmentService.uploadFiles(id, formData);
            });

            await Promise.all(uploadPromises);

            toast.success('Files uploaded successfully!');

            // Başarılı upload sonrası sayfayı yenile
            window.location.reload();
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('Error uploading files. Please try again.');
        } finally {
            setUploading(false);
            // Input'u temizle
            event.target.value = '';
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedStatus) return;

        setUpdatingStatus(true);
        try {
            await InstallmentService.updateStatus(id, selectedStatus);

            // Başarılı update sonrası veriyi yeniden çek
            const response = await InstallmentService.getAllInstallmentsById(id);
            setInstallment(response.data.data);

            setShowStatusModal(false);
            setSelectedStatus('');
            toast.success('Status updated successfully!');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status. Please try again.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleFileDownload = async (fileId) => {
        try {
            const response = await InstallmentService.downloadFile(fileId);

            // Blob'dan URL oluştur ve indir
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `file_${fileId}`; // Dosya adı
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('File downloaded successfully!');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Error downloading file. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CREATED':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <FaCheckCircle className="w-4 h-4" />;
            case 'REJECTED':
                return <FaTimesCircle className="w-4 h-4" />;
            default:
                return <FaClock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading installment details...</p>
                </div>
            </div>
        );
    }

    if (error || !installment) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Installment not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <FaArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Installment Details
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: #{installment.id} | Code: {installment.code}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => setShowStatusModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200"
                            >
                                <FaEdit className="w-4 h-4 mr-2" />
                                Edit Status
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status & Basic Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(installment.status)}`}>
                                            {getStatusIcon(installment.status)}
                                            <span className="ml-2">{installment.status}</span>
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">User PIN</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{installment.userPin}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {new Date(installment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {new Date(installment.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {installment.approvedAt && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Approved At</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(installment.approvedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                {installment.monthlyPaymentDate && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Payment Date</label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(installment.monthlyPaymentDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaMoneyBillWave className="w-5 h-5 mr-2 text-green-600" />
                                Financial Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</span>
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            ${installment.totalAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Amount</span>
                                        <span className="text-lg font-semibold text-green-600">
                                            ${installment.paidAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining Amount</span>
                                        <span className="text-lg font-semibold text-red-600">
                                            ${installment.remainingAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Amount</span>
                                        <span className="text-lg font-semibold text-blue-600">
                                            ${installment.monthlyAmount?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Schedule */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <FaCalendarAlt className="w-5 h-5 mr-2 text-blue-600" />
                                Payment Schedule
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Initial Months</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{installment.initialMonths || '0'} months</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Remaining Months</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{installment.remainingMonths || '0'} months</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        {installment.items && installment.items.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {installment.items.map((item, index) => (
                                                <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        #{item.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                                                        {item.productCode}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        ${item.price?.toLocaleString() || '0'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {item.amount || '0'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">


                                <label className={`w-full inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer ${uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}>
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Upload File
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        multiple
                                        disabled={uploading}
                                    />
                                </label>

                                <button
                                    onClick={() => window.print()}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Details
                                </button>
                            </div>
                        </div>

                        {/* File IDs */}
                        {installment.fileIds && installment.fileIds.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attached Files</h3>
                                <div className="space-y-2">
                                    {installment.fileIds.map((fileId, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">File #{fileId}</span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => InstallmentService.viewFile(fileId)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                                >
                                                    View
                                                </button>
                                                {/* <button
                                                    onClick={() => handleFileDownload(fileId)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                                >
                                                    Download
                                                </button> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Update Modal */}
                {showStatusModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Update Status
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Current status: <span className="font-medium">{installment.status}</span>
                                </p>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select New Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="CREATED">CREATED</option>
                                        <option value="APPROVED">APPROVED</option>
                                        <option value="PENDING">PENDING</option>
                                        <option value="REJECTED">REJECTED</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowStatusModal(false);
                                            setSelectedStatus('');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={!selectedStatus || updatingStatus}
                                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${!selectedStatus || updatingStatus
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {updatingStatus ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            'Update Status'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GetAllInstallmentsDetail;;