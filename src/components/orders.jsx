import React, { useState, useEffect } from "react";
import { Eye, Plus } from "lucide-react";
import OrderDetails from "./OrderDetails";
import { useNavigate } from "react-router-dom";
import orderService from "../services/orderService";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const fetchOrders = async (keyword = '') => {
    setLoading(true);
    try {
      const result = await orderService.searchOrders({keyword: keyword}, 0, 10);
      setOrders(result.content || []);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const viewOrderDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onClose={closeDetails} />;
  }
  const exportOrdersToExcel = (orders) => {
  const data = orders.map(order => ({
    'Customer Email': order.customerEmail,
    'Order Code': order.orderCode,
    'Type': order.type,
    'Total Price': order.totalPrice?.toFixed(2),
    'Status': order.status,
    'File contract':order.file.name
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);

  
};

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrders(searchTerm); // You can add search criteria handling here
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Search ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/create/order")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Create order
          </button>
          <button 
          onClick={() => exportOrdersToExcel(orders)}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md">
            Export Excel
          </button>
        </div>
      </div>

      <div className="card-header">
        <p className="card-title">All Orders</p>
      </div>

      <div className="card-body p-0">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="relative h-[500px] w-full overflow-auto rounded-none">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order.id || order.code}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.customerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {order.orderCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : order.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {order.status}
                      </span>
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
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5 text-gray-500 dark:text-gray-300"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
