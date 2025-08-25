import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, FileUp, FileText, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import productService from '../services/productService';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import ContractPDF from './ContractPDF';
import { pdf } from '@react-pdf/renderer';
import DatePicker from '../shared/DarePicker';
import Authservices from '../services/authServices';

function generateOrderCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${datePart}-${randomPart}`;
}

const CreateOrderForm = () => {
  const [orderData, setOrderData] = useState({
    orderType: 'RENT',
    fromDate: '',
    toDate: '',
    productCodes: [],
    userId: 0,
    userFin: '',
    name: '',
    surname: '',
    email: '',
    phone: "",
    paymentType: '',
  });

  const [contractFile, setContractFile] = useState(null);
  const [contractFileData, setContractFileData] = useState(null);
  const [productCodeInput, setProductCodeInput] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [code, setCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState({
    totalAmount: 0,
    depositAmount: 0,
    currency: 'AZN'
  });
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [disabledDates, setDisabledDates] = useState([]);
  const [fin, setFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // array üçün
  const navigate = useNavigate();

  useEffect(() => {
    const calculatePrice = async () => {
      if (orderData.productCodes.length > 0 && orderData.fromDate &&
        (orderData.orderType === 'SALE' || orderData.toDate)) {
        setCalculationLoading(true);
        try {
          const response = await orderService.CalCulaterPrice({
            orderType: orderData.orderType,
            fromDate: new Date(orderData.fromDate).toISOString(),
            toDate: orderData.toDate ? new Date(orderData.toDate).toISOString() : new Date(orderData.fromDate).toISOString(),
            productCodes: orderData.productCodes
          });
          setCalculatedPrice({
            totalAmount: response.data.totalAmount || 0,
            depositAmount: response.data.depositAmount || 0,
            currency: response.data.currency || 'AZN'
          });
        } catch (error) {
          console.error('Price calculation error:', error);
          toast.error('Price calculation failed');
        } finally {
          setCalculationLoading(false);
        }
      } else {
        setCalculatedPrice({
          totalAmount: 0,
          depositAmount: 0,
          currency: 'AZN'
        });
      }
    };

    const timer = setTimeout(() => {
      calculatePrice();
    }, 500);

    return () => clearTimeout(timer);
  }, [orderData.orderType, orderData.fromDate, orderData.toDate, orderData.productCodes]);




  const handleFindUserByFinSubmit = async (e) => {
    e.preventDefault();
    if (!fin.trim()) {
      toast.error("FIN daxil edin");
      return;
    }

    try {
      setLoading(true);
      const response = await Authservices.getUsersByFin(fin);
      console.log(response)

      // user tapılandan sonra
      if (response.data.data.length > 0) {
        const user = response.data.data[0]; // birinci user götürürük
        setUsers(response.data.data);

        setOrderData(prev => ({
          ...prev,
          userId: user.id,
          userFin: user.fin || '',
          name: user.name || '',
          surname: user.surname || '',
          email: user.email || '',
          phone: user.mobile || '',
        }));
      }

      if (response.data.data.length === 0) {
        toast.warning("Heç bir user tapılmadı");
      } else {
        toast.success("User(s) tapıldı!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileInfo = {
        name: file.name,
        size: +(file.size / 1024).toFixed(2),
        type: file.type,
        url: null,
      };
      setContractFileData(fileInfo);
      setContractFile(file);
    }
  };

  const checkProductAvailability = async (productCode) => {
    try {
      const response = await productService.getProductCodeByName(productCode);
      if (response && response.data && response.data.length > 0) {
        const product = response.data[0];
        setProductInfo(product);

        // Set order type based on product availability
        if (product.forSale && !product.forRent) {
          setOrderData(prev => ({ ...prev, orderType: 'SALE' }));
        } else if (!product.forSale && product.forRent) {
          setOrderData(prev => ({ ...prev, orderType: 'RENT' }));
          // Parse disabled dates for calendar
          if (product.deactiveDates && product.deactiveDates.length > 0) {
            const dates = [];
            product.deactiveDates.forEach(dateRange => {
              const start = new Date(dateRange.startDate);
              const end = new Date(dateRange.endDate);
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d).toISOString().split('T')[0]);
              }
            });
            setDisabledDates(dates);
          }
        }

        return product;
      }
      return null;
    } catch (error) {
      console.error('Error checking product availability:', error);
      toast.error('Could not check product availability');
      return null;
    }
  };

  const handleAddItemToOrder = async () => {
    if (!productCodeInput || quantityToAdd <= 0) {
      toast.error('Please enter a product code and quantity');
      return;
    }

    const product = await checkProductAvailability(productCodeInput);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    let productName = `Product ${productCodeInput}`;
    if (product.name) {
      productName = product.name;
    }

    const newProductCodes = Array(Number(quantityToAdd)).fill(productCodeInput);

    setOrderData(prev => ({
      ...prev,
      productCodes: [...prev.productCodes, ...newProductCodes],
      // Auto-set order type based on product availability
      orderType: product.forSale && !product.forRent ? 'SALE' : 'RENT'
    }));

    const existingItemIndex = orderItems.findIndex(item => item.code === productCodeInput);

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += Number(quantityToAdd);
      setOrderItems(updatedItems);
    } else {
      setOrderItems(prev => [
        ...prev,
        {
          code: productCodeInput,
          name: productName,
          quantity: Number(quantityToAdd),
          price: 0,
          rentPrice: 0,
          forSale: product.forSale,
          forRent: product.forRent
        }
      ]);
    }

    setProductCodeInput('');
    setQuantityToAdd(1);
    toast.success(`${quantityToAdd} item(s) added to order`);
  };

  const removeOrderItem = (productCode) => {
    const indexToRemove = orderData.productCodes.lastIndexOf(productCode);

    if (indexToRemove !== -1) {
      const newProductCodes = [...orderData.productCodes];
      newProductCodes.splice(indexToRemove, 1);

      setOrderData(prev => ({
        ...prev,
        productCodes: newProductCodes
      }));

      const itemIndex = orderItems.findIndex(item => item.code === productCode);
      if (itemIndex !== -1) {
        const updatedItems = [...orderItems];
        if (updatedItems[itemIndex].quantity > 1) {
          updatedItems[itemIndex].quantity -= 1;
          setOrderItems(updatedItems);
        } else {
          setOrderItems(updatedItems.filter(item => item.code !== productCode));
        }
      }
    }
  };

  const handleGenerateContract = async () => {
    try {
      toast('Generating contract...');
      const orderCode = generateOrderCode();
      setCode(orderCode);

      const tempOrder = {
        ...orderData,
        orderCode,
        orderItems: orderItems.map(item => ({
          ...item,
          orderType: orderData.orderType
        }))
      };

      const blob = await pdf(<ContractPDF order={tempOrder} orderCode={orderCode} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contract-${orderCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Contract generated successfully!');
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Failed to generate contract.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const payload = {
        ...orderData,
        fromDate: new Date(orderData.fromDate).toISOString(),
        toDate: new Date(orderData.toDate).toISOString()
      };

      await orderService.createOrder(payload);
      toast.success("Order created successfully");

      if (contractFile) {
        await orderService.uploadToServer(contractFile);
        toast.success('Document uploaded successfully!');
      }

      setOrderData({
        orderType: 'RENT',
        fromDate: '',
        toDate: '',
        productCodes: [],
        userId: 0,
        userFin: '',
        name: users,
        surname: '',
        email: '',
        phone: '',
        paymentType: '',
      });

      setOrderItems([]);
      setContractFile(null);
      navigate("/orders");
    } catch (error) {
      console.error('Create order failed:', error.response ?? error);
      toast.error("Failed to create order");
    } finally {
      setSubmitLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    return disabledDates.includes(date);
  };

  const CalendarModal = ({ onClose, onSelectDate, field, selectedDate, disabledDates }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selected, setSelected] = useState(selectedDate || '');

    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (date) => {
      if (isDateDisabled(date)) return;

      setSelected(date);
      onSelectDate(date, field);
    };

    const navigateMonth = (direction) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
    };

    const renderCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);

      const days = [];

      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isDisabled = isDateDisabled(dateStr);
        const isSelected = selected === dateStr;

        days.push(
          <div
            key={day}
            className={`h-8 flex items-center justify-center rounded-full cursor-pointer
              ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                isSelected ? 'bg-blue-500 text-white' :
                  'hover:bg-gray-100'}`}
            onClick={() => !isDisabled && handleDateSelect(dateStr)}
          >
            {day}
          </div>
        );
      }

      return days;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Select {field === 'fromDate' ? 'Start' : 'End'} Date
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>←</span>
              </button>
              <h4 className="text-lg font-medium">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>→</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (

    <div className='bg-white dark:bg-gray-900 shadow-md rounded-lg'>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Order</p>
      </div>
      <form
        onSubmit={handleFindUserByFinSubmit}
        className="flex gap-2 p-4 md:p-6 gap-x-1 gap-y-8"
      >
        <input
          type="text"
          placeholder="FIN daxil edin..."
          value={fin}
          onChange={(e) => setFin(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-400"
        >
          {loading ? "Axtarılır..." : "Axtar"}
        </button>
      </form>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-md rounded-lg">


        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer & Order Details</h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">User FIN</label>
              <input
                type="text"
                name="userFin"
                value={orderData.userFin}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={orderData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Surname</label>
              <input
                type="text"
                name="surname"
                value={orderData.surname}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={orderData.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                name="phone"
                value={orderData.phone}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Payment Type</label>
              <select
                name="paymentType"
                value={orderData.paymentType || ''}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Payment Type</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Signed Contract</label>
              <label
                htmlFor="contractUpload"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 flex items-center gap-2 cursor-pointer text-gray-500 dark:text-gray-400"
              >
                <FileUp size={16} />
                {contractFile ? contractFile.name : 'Choose a file...'}
              </label>
              <input id="contractUpload" type="file" className="hidden" onChange={handleFileChange} />
            </div> */}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Add Products</h3>

            <div className="flex items-start gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Code</label>
                <input
                  type="text"
                  value={productCodeInput}
                  onChange={(e) => setProductCodeInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Product Code"
                />
              </div>

              <div className="self-end">
                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="h-10 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <PlusCircle size={16} className="mr-1" /> Add
                </button>
              </div>
            </div>

            {productInfo && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Product Information</h4>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Name: {productInfo.name} |
                  For Sale: {productInfo.forSale ? 'Yes' : 'No'} |
                  For Rent: {productInfo.forRent ? 'Yes' : 'No'}
                </p>
                {productInfo.deactiveDates && productInfo.deactiveDates.length > 0 && (
                  <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                    Unavailable dates: {productInfo.deactiveDates.map(d =>
                      `${d.startDate} to ${d.endDate}`
                    ).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Type</label>
              <select
                name="orderType"
                value={orderData.orderType}
                onChange={handleFormChange}
                disabled={orderData.productCodes.length === 0 || (productInfo && !productInfo.forSale && !productInfo.forRent)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${orderData.productCodes.length === 0 || !orderData.orderType || (productInfo && !productInfo.forSale && !productInfo.forRent)
                    ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "bg-white text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                  }`}
              >
                <option value="SALE" disabled={productInfo && !productInfo.forSale}>Sale</option>
                <option value="RENT" disabled={productInfo && !productInfo.forRent}>Rent</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>

              <DatePicker
                value={orderData.fromDate}
                onChange={(date) => setOrderData(prev => ({ ...prev, fromDate: date }))}
                disabled={orderData.productCodes.length === 0}
                placeholder="Başlama tarixi"
                disabledDates={productInfo?.deactiveDates || []}
              />
              {/* </div> */}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>


              <DatePicker
                value={orderData.toDate}
                onChange={(date) => setOrderData(prev => ({ ...prev, toDate: date }))}
                disabled={orderData.productCodes.length === 0}
                placeholder="Başlama tarixi"
                disabledDates={productInfo?.deactiveDates || []}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Order Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Available For</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <tr key={item.code}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.code}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.forSale && 'Sale'}{item.forSale && item.forRent && ' / '}{item.forRent && 'Rent'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeOrderItem(item.code)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No products added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6 mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-left text-lg font-bold text-gray-900 dark:text-gray-100">
                    {calculationLoading ? (
                      <div className="w-5 h-5 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      `${calculatedPrice.totalAmount.toFixed(2)} ${calculatedPrice.currency}`
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">
                    Deposit Amount
                  </td>
                  <td className="px-4 py-3 text-left text-lg font-bold text-gray-900 dark:text-gray-100">
                    {calculationLoading ? (
                      <div className="w-5 h-5 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                      `${calculatedPrice.depositAmount.toFixed(2)} ${calculatedPrice.currency}`
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="px-4 pb-4 md:px-6 md:pb-6 mt-6 flex justify-end items-center gap-4">
          <button
            type="button"
            onClick={handleGenerateContract}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm font-medium rounded-md"
          >
            <FileText size={16} /> Generate Contract
          </button>
          <button
            type="submit"
            disabled={submitLoading || orderItems.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitLoading && (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            )}
            Create Order
          </button>
        </div>

        {showCalendar && (
          <CalendarModal
            onClose={() => setShowCalendar(false)}
            onSelectDate={(date, field) => {
              setOrderData(prev => ({ ...prev, [field]: date }));
              setShowCalendar(false);
            }}
            field={showCalendar}
            selectedDate={orderData[showCalendar]}
            disabledDates={disabledDates}
          />
        )}
      </form>

    </div>
  );
};

export default CreateOrderForm;