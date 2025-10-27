import React, { useState, useEffect } from 'react';
import CustomOrderService from '../services/getCustomOrderServices';
import { toast } from 'sonner';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
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

    const fetchNotifications = async (customFilters = null) => {
        setLoading(true);
        try {
            const filtersToUse = customFilters || filters;
            const response = await CustomOrderService.getNotifications(
                filtersToUse.page,
                filtersToUse.size
            );

            if (response.data.key === "Success") {
                const data = response.data.data;
                setNotifications(data.content || []);
                setPagination({
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                    currentPage: data.number || 0,
                    hasNext: !data.last,
                    hasPrev: !data.first
                });
            } else {
                toast.error(response.data.message || 'Məlumatlar yüklənə bilmədi');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Xəta baş verdi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        markAllAsRead();
    }, []);

    const markAllAsRead = async () => {
        try {
            const response = await CustomOrderService.getNotifications();
            if (response.data.key === "Success") {
                const allNotifications = response.data.data.content || [];
                const allIds = allNotifications.map(notification => notification.id);
                            
                localStorage.setItem('readNotifications', JSON.stringify(allIds));
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handlePageChange = (newPage) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        fetchNotifications(newFilters);
    };

    const handleSizeChange = (newSize) => {
        const newFilters = { ...filters, size: newSize, page: 1 };
        setFilters(newFilters);
        fetchNotifications(newFilters);
    };


    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Bildirişlər
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Xüsusi sifariş formlarından gələn bildirişlər
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Səhifə ölçüsü:
                        </label>
                        <select
                            value={filters.size}
                            onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                </div>
            </div>

            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Ad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Telefon Nömrəsi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">Yüklənir...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Heç bir bildiriş tapılmadı
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notification) => (
                                    <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {notification.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {notification.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {notification.phoneNumber || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Cəmi {pagination.totalElements} bildiriş, {pagination.currentPage + 1} səhifədən {pagination.totalPages}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={!pagination.hasPrev || loading}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Əvvəlki
                        </button>

                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    disabled={loading}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${filters.page === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={!pagination.hasNext || loading}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            Növbəti
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;