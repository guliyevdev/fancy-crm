import React, { useState, useEffect } from "react";
import { CheckCircle, Eye, Plus } from "lucide-react";
import OrderDetails from "./OrderDetails";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomSelect from "../shared/CustomSelect";

const SaleOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finishingOrderId, setFinishingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1
  });
  const [type, setType] = useState('')

  const navigate = useNavigate();

  const fetchOrders = async (
    page = 0,
    size = pagination.pageSize,
    keyword = searchTerm,
    orderType = type
  ) => {
    setLoading(true);
    try {
      const params = {
        searchCodes: keyword,
        active: true,
        page,
        size,
        type: "SALE",
      };


      const response = await orderService.searchOrders(params);

      const apiData = response.data?.data || response.data;
      const ordersData = apiData?.content || [];

      setOrders(ordersData);
      setPagination({
        currentPage: apiData?.number || 0,
        pageSize: apiData?.size || size,
        totalElements: apiData?.totalElements || 0,
        totalPages: apiData?.totalPages || 1
      });
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Sifarişlər gətirilərkən xəta baş verdi");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const handleFinishOrder = async (orderId, orderCode) => {
    setFinishingOrderId(orderId); // Loading state üçün

    try {
      const requestData = {
        orderId: orderId,
        orderCode: orderCode
      };

      await orderService.FinishRentOrder(requestData);

      toast.success("Sifariş uğurla bitirildi");
      fetchOrders(pagination.currentPage, pagination.pageSize, searchTerm); // Siyahını yenilə
    } catch (error) {
      console.error("Finish order error:", error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      setFinishingOrderId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(0, pagination.pageSize, searchTerm);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchOrders(newPage, pagination.pageSize, searchTerm);
    }
  };

  const viewOrderDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onClose={closeDetails} />;
  }

  const exportOrdersToExcel = (orders) => {
    const data = orders.map(order => ({
      'Müştəri Adı': order.customerName,
      'Müştəri Kodu': order.customerCode,
      'Sifariş Kodu': order.orderCode,
      'Növ': order.orderType,
      'Ümumi Qiymət': order.totalPrice?.toFixed(2),
      'Ödənilmiş Məbləğ': order.paidAmount?.toFixed(2),
      'Qalıq Borc': order.currentDebt?.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sifarişlər');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Sifarişler_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  console.log("object", orders)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold dark:text-white">Order Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/create/order")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Yeni Sifariş
          </button>
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md">
            Excelə çıxar
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col lg:flex-row  lg:justify-between lg:items-end  gap-4">
        <div className="flex flex-col gap-2  ">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Search by customer  and order Code
          </label>
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Axtarış ..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Axtar
            </button>
          </form>
        </div>





        {/* <div className="flex flex-col gap-1 w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Filter By Type
          </label>

          <CustomSelect
            value={type}
            options={[
              { value: '', label: 'All' },

              { value: 'RENT', label: 'Rent' },
              { value: 'SALE', label: 'Sale' }
            ]}
            onChange={(selected) => {
              const value = selected?.target?.value || '';
              console.log("Seçilən dəyər:", value);
              setType(value);
              fetchOrders(0, pagination.pageSize, searchTerm, value);
            }}
            placeholder="Növ seçin"
            className="w-full bg-white border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm focus:ring-2 max-w-[100%] focus:ring-blue-500 focus:border-blue-500"
            isMulti={false}
          />

        </div> */}

      </div>



      {/* <div className="card-header">
        <p className="card-title">Bütün Sifarişlər</p>
      </div> */}
<div className="card-body p-0">
  {loading ? (
    <div className="text-center py-10">Yüklənir...</div>
  ) : (
    <div className="relative h-[500px] w-full overflow-auto rounded-none space-y-10">
      {orders.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Müştəri Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Müştəri Kodu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sifariş Kodu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Növ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ümumi Qiymət
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ödənilmiş Məbləğ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Qalıq Borc
              </th>
              <th className="relative px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {order.customerCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {order.orderCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {order.orderType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {order.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {order.totalPrice?.toFixed(2)} AZN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {order.paidAmount?.toFixed(2)} AZN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {order.currentDebt?.toFixed(2)} AZN
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-start py-5 text-gray-500 dark:text-gray-300">
          Sifariş yoxdur
        </div>
      )}

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-4 p-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 0}
            className={`p-2 rounded-full ${
              pagination.currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FaChevronLeft size={20} />
          </button>

          <span className="text-gray-800 dark:text-gray-200 text-sm">
            Səhifə {pagination.currentPage + 1} / {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage + 1 >= pagination.totalPages}
            className={`p-2 rounded-full ${
              pagination.currentPage + 1 >= pagination.totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )}
</div>



    </div>
  );
};

export default SaleOrder;