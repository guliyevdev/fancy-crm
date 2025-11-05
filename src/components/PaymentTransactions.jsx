import React, { useState, useEffect } from 'react';
import ReturnPaymentService from '../services/ReturnPaymentService';
import { toast } from 'sonner';

const PaymentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        userPin: '',
        amount: '',
        status: '',
        sortField: '',
        sortOrder: '',
        page: 1,
        size: 10
    });
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        hasNext: false,
        hasPrev: false
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const statusOptions = [
        { value: '', label: 'Hamısı', color: 'bg-gray-100 text-gray-800' },
        { value: 'PENDING', label: 'Gözləyir', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'APPROVED', label: 'Təsdiqləndi', color: 'bg-green-100 text-green-800' },
        { value: 'DECLINE', label: 'Rədd edildi', color: 'bg-red-100 text-red-800' },
        { value: 'CANCEL', label: 'Ləğv edildi', color: 'bg-gray-100 text-gray-800' },
        { value: 'FAIL', label: 'Uğursuz', color: 'bg-red-100 text-red-800' },
        { value: 'REVERSED', label: 'Geri qaytarıldı', color: 'bg-orange-100 text-orange-800' },
        { value: 'REFUNDED', label: 'Geri ödənildi', color: 'bg-blue-100 text-blue-800' }
    ];

    const sortOptions = [
        { value: '', label: 'Seçin' },
        { value: 'createdAt', label: 'Yaradılma tarixi' },
        { value: 'amount', label: 'Məbləğ' },
        { value: 'status', label: 'Status' },
        { value: 'userPin', label: 'İstifadəçi PIN' }
    ];

    const fetchTransactions = async (customFilters = null) => {
        setLoading(true);
        try {
            const filtersToUse = customFilters || filters;
            const response = await ReturnPaymentService.GetPaymentTransactions(filtersToUse);
            console.log('API Response:', response.data); // Debug üçün

            // Yeni data strukturu
            const responseData = response.data?.data || {};
            const transactionsData = responseData.items || [];

            const safeTransactions = Array.isArray(transactionsData) ? transactionsData : [];
            setTransactions(safeTransactions);

            // Yeni pagination strukturu
            if (responseData.pages !== undefined) {
                setPagination({
                    totalPages: responseData.pages || 0,
                    totalElements: responseData.total || 0,
                    currentPage: (responseData.page || 1) - 1, // Backend 1-dən başlayır, biz 0-dan
                    hasNext: responseData.hasNext || false,
                    hasPrev: responseData.hasPrev || false
                });
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Ödəniş məlumatları yüklənərkən xəta baş verdi';
            toast.error(errorMessage);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // Səhifə açılan kimi ilk məlumatları yüklə
    useEffect(() => {
        fetchTransactions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handleSearch = () => {
        const updatedFilters = { ...filters, page: 1 };
        setFilters(updatedFilters);
        fetchTransactions(updatedFilters);
    };

    const handlePageChange = (newPage) => {
        const updatedFilters = { ...filters, page: newPage };
        setFilters(updatedFilters);
        fetchTransactions(updatedFilters); // Yeni page ilə birbaşa göndəririk
    };

    // 24 saat yoxlama funksiyası
    const isWithin24Hours = (dateString) => {
        const transactionDate = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - transactionDate) / (1000 * 60 * 60);
        return diffInHours <= 24;
    };

    // Return əməliyyatını işə sal
    const handleReturnPayment = (transaction) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    // Modal təsdiqləmə
    const confirmReturnPayment = async () => {
        if (!selectedTransaction) return;

        const within24Hours = isWithin24Hours(selectedTransaction.createdAt);

        try {
            if (within24Hours) {
                // 24 saat içində - Reverse
                const response = await ReturnPaymentService.ReversePayment(selectedTransaction.id);
                const successMessage = response.data?.message || 'Ödəniş uğurla geri qaytarıldı';
                toast.success(successMessage);
            } else {
                // 24 saatdan çox - Refund
                const response = await ReturnPaymentService.RefundPayment(selectedTransaction.id);
                const successMessage = response.data?.message || 'Ödəniş uğurla geri ödənildi';
                toast.success(successMessage);
            }
            setShowModal(false);
            setSelectedTransaction(null);
            fetchTransactions();
        } catch (error) {
            console.error('Error processing return payment:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Əməliyyat zamanı xəta baş verdi';
            toast.error(errorMessage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('az-AZ');
    };

    const formatAmount = (amount) => {
        if (!amount) return '0.00 ₼';
        return `${parseFloat(amount).toFixed(2)} ₼`;
    };

    const getStatusBadge = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        const icons = {
            'PENDING': '⏳',
            'APPROVED': '✅',
            'DECLINE': '❌',
            'CANCEL': '🚫',
            'FAIL': '⚠️',
            'REVERSED': '🔄',
            'REFUNDED': '💰'
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusOption?.color || 'bg-gray-100 text-gray-800'}`}>
                <span>{icons[status] || '📄'}</span>
                <span>{statusOption?.label || status}</span>
            </span>
        );
    };

    const getPaymentTypeIcon = (type) => {
        const icons = {
            'CASH': '💵',
            'CARD': '💳',
            'ONLINE': '🌐'
        };
        return icons[type] || '💰';
    };

    const getPurposeLabel = (purpose) => {
        const labels = {
            'INSTALLMENT_PRE_PAY': 'Avans ödənişi',
            'INSTALLMENT_PAYMENT': 'Taksit ödənişi',
            'FULL_PAYMENT': 'Tam ödəniş',
            'PARTIAL_PAYMENT': 'Qismən ödəniş',
            'REFUND': 'Geri qaytarma',
            'OTHER': 'Digər'
        };
        return labels[purpose] || purpose;
    };

    return (
        <>
            {/* Confirmation Modal */}
            {showModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                                <span className="text-2xl">
                                    {isWithin24Hours(selectedTransaction.createdAt) ? '🔄' : '💸'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Əməliyyatı Təsdiq Et
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isWithin24Hours(selectedTransaction.createdAt)
                                        ? 'Ödənişi geri qaytarmaq'
                                        : 'Ödənişi geri ödəmək'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Transaction ID</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTransaction.transactionId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Məbləğ</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">{formatAmount(selectedTransaction.amount)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400">Əməliyyat növü</p>
                                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                                        {isWithin24Hours(selectedTransaction.createdAt)
                                            ? '🔄 Reverse (24 saat içində)'
                                            : '💸 Refund (24 saatdan çox)'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                            Bu əməliyyatı həyata keçirmək istədiyinizdən <span className="font-bold">əminsiniz</span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedTransaction(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                ❌ Ləğv et
                            </button>
                            <button
                                onClick={confirmReturnPayment}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium shadow-md"
                            >
                                ✅ Təsdiq et
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <span className="text-3xl">💳</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Ödəniş Əməliyyatları
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Ödəniş əməliyyatlarını idarə edin və izləyin
                            </p>
                        </div>
                    </div>

                    {/* Info Message */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">ℹ️</span>
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    İstifadəçi tarixçəsini görmək üçün
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Sadəcə <span className="font-semibold">İstifadəçi PIN</span> əlavə edib axtarış edə bilərsiniz
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    İstifadəçi PIN
                                </label>
                                <input
                                    type="text"
                                    value={filters.userPin}
                                    onChange={(e) => handleFilterChange('userPin', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="PIN daxil edin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Məbləğ
                                </label>
                                <input
                                    type="number"
                                    value={filters.amount}
                                    onChange={(e) => handleFilterChange('amount', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Məbləğ"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sıralama
                                </label>
                                <select
                                    value={filters.sortField}
                                    onChange={(e) => handleFilterChange('sortField', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                            >
                                <span>🔍</span>
                                <span>Axtar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFilters({
                                        userPin: '',
                                        amount: '',
                                        status: '',
                                        sortField: '',
                                        sortOrder: '',
                                        page: 1,
                                        size: 10
                                    });
                                }}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                            >
                                <span>🗑️</span>
                                <span>Təmizlə</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    🔢 ID
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    🔑 Transaction
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    📦 Order
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    👤 PIN
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    💰 Məbləğ
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    💱 Valyuta
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    📊 Status
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    🎯 Məqsəd
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    💳 Növ
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    🕐 Tarix
                                </th>
                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider whitespace-nowrap">
                                    ⚙️ Əməliyyat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {transactions.length === 0 && !loading ?
                                            'Axtarış etmək üçün filtrləri doldurun və "Axtar" düyməsini basın' :
                                            'Heç bir ödəniş əməliyyatı tapılmadı'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                Array.isArray(transactions) && transactions.map((transaction, index) => (
                                    <tr key={transaction.id || index} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-3 py-3 whitespace-nowrap text-xs font-semibold text-blue-600 dark:text-blue-400">
                                            #{transaction.id || '-'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 dark:text-white font-mono">
                                            {transaction.transactionId || '-'}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-medium whitespace-nowrap">
                                                📦 {transaction.orderId || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-medium whitespace-nowrap">
                                                👤 {transaction.userPin || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs font-bold text-green-600 dark:text-green-400">
                                            💰 {formatAmount(transaction.amount)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                                                {transaction.currency || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            <span className="inline-flex items-center text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                🎯 {getPurposeLabel(transaction.purpose)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium whitespace-nowrap">
                                                {getPaymentTypeIcon(transaction.paymentType)} {transaction.paymentType || '-'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                                            <span className="font-medium whitespace-nowrap">🕐 {formatDate(transaction.createdAt)}</span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-xs font-medium">
                                            <div className="flex flex-col gap-1.5">
                                                <button
                                                    onClick={() => handleReturnPayment(transaction)}
                                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 hover:from-orange-200 hover:to-orange-300 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200 dark:hover:from-orange-800 dark:hover:to-orange-700 rounded-md transition-all duration-150 font-medium text-xs whitespace-nowrap shadow-sm"
                                                >
                                                    {isWithin24Hours(transaction.createdAt) ? '🔄 Geri qaytar' : '💸 Geri ödə'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span className="text-lg">📄</span>
                            <span>
                                Cəmi <span className="font-bold text-blue-600 dark:text-blue-400">{pagination.totalElements}</span> nəticədən{' '}
                                <span className="font-bold text-blue-600 dark:text-blue-400">{pagination.currentPage * filters.size + 1}</span>-
                                <span className="font-bold text-blue-600 dark:text-blue-400">{Math.min((pagination.currentPage + 1) * filters.size, pagination.totalElements)}</span> göstərilir
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage)}
                                disabled={!pagination.hasPrev}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 shadow-sm"
                            >
                                <span>◀️</span>
                                <span>Əvvəlki</span>
                            </button>
                            <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-bold shadow-md">
                                <span>{pagination.currentPage + 1}</span>
                                <span className="mx-1">/</span>
                                <span>{pagination.totalPages}</span>
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 2)}
                                disabled={!pagination.hasNext}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 shadow-sm"
                            >
                                <span>Növbəti</span>
                                <span>▶️</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentTransactions;
