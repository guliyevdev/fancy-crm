import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import orderService from "../services/orderService";
import { toast } from "sonner";
import { SiContactlesspayment, SiTaketwointeractivesoftware } from "react-icons/si";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // Yeni: Upload Modal
  const [fileType, setFileType] = useState("CONTRACT"); // Yeni: File Type state
  const [paymentData, setPaymentData] = useState({
    orderCode: "",
    orderId: "",
    amount: 0,
    paymentType: "CASH",
    purpose: "DEPOSIT"
  });

  const [returnItems, setReturnItems] = useState([]);

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data.data.data);

      setPaymentData(prev => ({
        ...prev,
        orderCode: data.data.data.orderCode,
        orderId: data.data.data.id,
        amount: data.data.data.currentDebt || 0
      }));

      if (data.data.data.items) {
        const initialReturnItems = data.data.data.items.map(item => ({
          itemId: item.id,
          status: "GOOD",
          damageFee: 0
        }));
        setReturnItems(initialReturnItems);
      }
    } catch (error) {
      toast.error("Sifariş məlumatları gətirilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);
      await orderService.PostPayment(paymentData);

      toast.success("Ödəniş uğurla tamamlandı");
      setShowPaymentModal(false);
      fetchOrder();
    } catch (error) {
      toast.error("Ödəniş alınmada xəta baş verdi");
    } finally {
      setDownloading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);

      const requestData = {
        orderId: order.id,
        orderCode: order.orderCode,
        itemsStatuses: returnItems
      };

      await orderService.ReturnSattlement(requestData);

      toast.success("Qaytarılma uğurla tamamlandı");
      setShowReturnModal(false);
      fetchOrder();
    } catch (error) {
      toast.error("Qaytarılma zamanı xəta baş verdi");
      console.error("Return error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleItemStatusChange = (index, newStatus) => {
    const updatedItems = [...returnItems];
    updatedItems[index].status = newStatus;

    if (newStatus === "GOOD") {
      updatedItems[index].damageFee = 0;
    }

    setReturnItems(updatedItems);
  };

  const handleDamageFeeChange = (index, newFee) => {
    const updatedItems = [...returnItems];
    updatedItems[index].damageFee = parseFloat(newFee) || 0;
    setReturnItems(updatedItems);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setDownloading(true);
      await orderService.uploadFile(order.id, file, fileType);
      toast.success("Fayl uğurla yükləndi");
      setShowUploadModal(false);
      fetchOrder();
    } catch (err) {
      toast.error("Fayl yüklənmədi");
    } finally {
      setDownloading(false);
      e.target.value = "";
    }
  };


  const handleTakeOrder = async () => {
    try {
      setDownloading(true);

      const requestData = {
        orderCode: order.orderCode
      };

      const response = await orderService.CustomerTakeOrder(requestData);
      toast.success(response.message);
      fetchOrder();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Yüklənir...</div>;
  }

  if (!order) {
    return <div className="text-center py-10 text-red-500">Sifariş tapılmadı</div>;
  }


  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <p className="card-title">Order Details</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium rounded-md"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            General Information
          </h3>

          <div>
            <strong>Order ID:</strong>{" "}
            <span className="font-mono">{order.id}</span>
          </div>
          <div>
            <strong>Order Code:</strong>{" "}
            <span className="font-mono">{order.orderCode}</span>
          </div>
          <div>
            <strong>Customer Name:</strong>{" "}
            <span className="font-mono">{order.customerName}</span>
          </div>
          <div>
            <strong>Customer Email:</strong>{" "}
            <span className="font-mono">{order.customerEmail}</span>
          </div>
          <div>
            <strong>Customer Phone:</strong>{" "}
            <span className="font-mono">{order.customerPhone}</span>
          </div>
          <div>
            <strong>Customer Code:</strong>{" "}
            <span className="font-mono">{order.customerCode}</span>
          </div>
          <div>
            <strong>Order Type:</strong>{" "}
            <span className="font-mono">{order.orderType}</span>
          </div>
          <div>
            <strong>Status:</strong>{" "}
            <span className="font-mono">{order.status}</span>
          </div>
          <div>
            <strong>Rent Date From:</strong>{" "}
            <span className="font-mono">{order.rentDateFrom}</span>
          </div>
          <div>
            <strong>Rent Date To:</strong>{" "}
            <span className="font-mono">{order.rentDateTo}</span>
          </div>
          <div>
            <strong>Created At:</strong>{" "}
            <span className="font-mono">{order.createdAt}</span>
          </div>
          <div>
            <strong>Updated At:</strong>{" "}
            <span className="font-mono">{order.updatedAt}</span>
          </div>
        </div>

        {/* Financial Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Financial Summary
          </h3>
          <div>
            <strong>Total Price:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.totalPrice)}</span>
          </div>
          <div>
            <strong>Rent Price:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.rentPrice)}</span>
          </div>
          <div>
            <strong>Sale Price:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.salePrice)}</span>
          </div>
          <div>
            <strong>Paid Amount:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.paidAmount)}</span>
          </div>
          <div>
            <strong>Deposit Paid:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.depositPaid)}</span>
          </div>
          <div>
            <strong>Current Debt:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.currentDebt)}</span>
          </div>
          <div>
            <strong>Penalty Fee:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.penaltyFee)}</span>
          </div>
          <div>
            <strong>Damage Fee:</strong>{" "}
            <span className="font-mono">{formatCurrency(order.damageFee)}</span>
          </div>
        </div>
      </div>

      <div className="card-footer mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Product Code</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Product Name</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Partner Code</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Rent Price</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Sale Price</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Total Price</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Penalty %</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Penalty Amount</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Damage Fee</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-1000 dark:text-gray-700 uppercase">Returned At</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {order?.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.productCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.partnerCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.rentPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.salePrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.totalPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.penaltyPercent}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{formatCurrency(item.penaltyAmount)}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{formatCurrency(item.damageFee)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.returnedAt || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="card-footer mt-6 border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Status History 📜
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Changed By ID</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Changed By Code</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Changed By Name</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Changed By Email</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Changed By Phone</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Change Note</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Return Type</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Return Amount</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 dark:text-gray-300 uppercase">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {order?.orderHistory && order.orderHistory.length > 0 ? (
                order.orderHistory
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((historyItem) => (
                    <tr key={historyItem.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{historyItem.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{historyItem.status}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changedById}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changedByCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changedByName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changedByEmail}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changedByPhone}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.changeNote}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.returnType || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{historyItem.returnAmount ?? "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(historyItem.createdAt)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center text-gray-400 py-3">
                    No status history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>




      <div className="flex items-center justify-start gap-4 mt-6">
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
              setDownloading(true);
              await orderService.uploadFile(order.id, file);
              toast.success("File uploaded successfully");
              e.target.value = "";
            } catch (err) {
              toast.error("File upload failed");
            } finally {
              setDownloading(false);
            }
          }}
        />

        {/* {order.waitingForUpload && (
          <>
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 w-auto"
              disabled={downloading}
            >
              {downloading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <Download size={16} />
                  Upload Contract
                </>
              )}
            </button>


          </>
        )} */}
        {order.waitingForUpload && (
          <>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 w-auto"
              disabled={downloading}
            >
              {downloading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <Download size={16} />
                  Upload Contract
                </>
              )}
            </button>
          </>
        )}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 w-auto"
          disabled={downloading}
        >
          <SiContactlesspayment size={26} />

          Payment
        </button>


        <button
          onClick={() => setShowReturnModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 w-auto"
          disabled={downloading}
        >
          <Download size={16} />
          Return Settlement
        </button>

        <button
          onClick={handleTakeOrder}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 w-auto"
        >
          <SiTaketwointeractivesoftware size={16} />
          {downloading ? "Processing..." : "Take Order"}
        </button>
      </div>






      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Fayl Yüklə
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fayl Tipi
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="CONTRACT">CONTRACT</option>
                  <option value="RECEIPT">RECEIPT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fayl Seç
                </label>
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
                >
                  Ləğv et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Process Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Code
                </label>
                <input
                  type="text"
                  value={paymentData.orderCode}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order ID
                </label>
                <input
                  type="text"
                  value={paymentData.orderId}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Type
                </label>
                <select
                  value={paymentData.paymentType}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="RENT_PAYMENT">Card</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purpose
                </label>
                <select
                  value={paymentData.purpose}
                  onChange={(e) => setPaymentData({ ...paymentData, purpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="DEPOSIT">Deposit</option>
                  <option value="DEBT">Borc Odensi</option>

                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={downloading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                >
                  {downloading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Qaytarılma Əməliyyatı
              </h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Məhsulların Vəziyyəti:
                </h4>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                      <div className="mb-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">Məhsul:</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.productName}</p>
                      </div>

                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vəziyyət
                        </label>
                        <select
                          value={returnItems[index]?.status || "GOOD"}
                          onChange={(e) => handleItemStatusChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                          <option value="GOOD">Yaxşı</option>
                          <option value="DAMAGED">Zədələnmiş</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Zərər Haqqı ($)
                        </label>
                        <input
                          type="number"
                          value={returnItems[index]?.damageFee || 0}
                          onChange={(e) => handleDamageFeeChange(index, e.target.value)}
                          disabled={returnItems[index]?.status === "GOOD"}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={downloading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 text-sm"
                >
                  {downloading ? "Göndərilir..." : "Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetails;
