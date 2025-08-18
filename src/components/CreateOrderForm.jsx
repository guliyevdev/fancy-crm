import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, FileUp, FileText } from 'lucide-react';
import { toast } from 'sonner';
import productService from '../services/productService';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import ContractPDF from './ContractPDF';
import { pdf } from '@react-pdf/renderer';

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
    phone: '',
    paymentType: '',
  });

  const [contractFile, setContractFile] = useState(null);
  const [contractFileData, setContractFileData] = useState(null);
  const [productCodeInput, setProductCodeInput] = useState('');
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [code, setCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculationLoading, setCalculationLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const calculatePrice = async () => {
      // Ən azı bir məhsul və tarix seçilibsə hesabla
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
          setCalculatedPrice(response.totalPrice || 0);
        } catch (error) {
          console.error('Qiymət hesablanarkən xəta:', error);
          toast.error('Qiymət hesablanarkən xəta baş verdi');
        } finally {
          setCalculationLoading(false);
        }
      } else {
        setCalculatedPrice(0);
      }
    };

    // Debounce istifadə edərək çox sayda sorğunun qarşısını alırıq
    const timer = setTimeout(() => {
      calculatePrice();
    }, 500);

    return () => clearTimeout(timer);
  }, [orderData.orderType, orderData.fromDate, orderData.toDate, orderData.productCodes]);


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileInfo = {
        name: file.name,
        size: +(file.size / 1024).toFixed(2), // KB
        type: file.type,
        url: null,
      };
      setContractFileData(fileInfo);
      setContractFile(file);
    }
  };

  const handleSearchProduct = async () => {
    if (!productCodeInput) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedProduct(null);
    try {
      const response = await productService.getByCode(productCodeInput);
      setSearchedProduct(response.data);
    } catch {
      setSearchError('Product not found');
    }
    setSearchLoading(false);
  };

  // const handleAddItemToOrder = () => {
  //   if (!searchedProduct || quantityToAdd <= 0) return;

  //   const newItems = Array(Number(quantityToAdd)).fill(searchedProduct.code);

  //   setOrderData(prev => ({
  //     ...prev,
  //     productCodes: [...prev.productCodes, ...newItems]
  //   }));

  //   // For display in the table
  //   const existingItemIndex = orderItems.findIndex(
  //     item => item.code === searchedProduct.code
  //   );

  //   if (existingItemIndex >= 0) {
  //     const updatedItems = [...orderItems];
  //     updatedItems[existingItemIndex].quantity += Number(quantityToAdd);
  //     setOrderItems(updatedItems);
  //   } else {
  //     setOrderItems(prev => [
  //       ...prev,
  //       {
  //         ...searchedProduct,
  //         quantity: Number(quantityToAdd)
  //       }
  //     ]);
  //   }

  //   setSearchedProduct(null);
  //   setProductCodeInput('');
  //   setQuantityToAdd(1);
  //   setSearchError('');
  // };

  // const removeOrderItem = (productCode) => {
  //   setOrderData(prev => ({
  //     ...prev,
  //     productCodes: prev.productCodes.filter(code => code !== productCode)
  //   }));

  //   setOrderItems(prev => prev.filter(item => item.code !== productCode));
  // };



  const handleAddItemToOrder = () => {
    if (!searchedProduct || quantityToAdd <= 0) return;

    // Əlavə ediləcək yeni məhsul kodları
    const newProductCodes = Array(Number(quantityToAdd)).fill(searchedProduct.code);

    setOrderData(prev => ({
      ...prev,
      productCodes: [...prev.productCodes, ...newProductCodes]
    }));

    // Cədvəl üçün məhsul məlumatlarını yenilə
    const existingItemIndex = orderItems.findIndex(item => item.code === searchedProduct.code);

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += Number(quantityToAdd);
      setOrderItems(updatedItems);
    } else {
      setOrderItems(prev => [
        ...prev,
        {
          ...searchedProduct,
          quantity: Number(quantityToAdd)
        }
      ]);
    }

    setSearchedProduct(null);
    setProductCodeInput('');
    setQuantityToAdd(1);
    setSearchError('');
  };

  const removeOrderItem = (productCode) => {
    // Arraydən sonuncu uyğun elementi silirik
    const indexToRemove = orderData.productCodes.lastIndexOf(productCode);

    if (indexToRemove !== -1) {
      const newProductCodes = [...orderData.productCodes];
      newProductCodes.splice(indexToRemove, 1);

      setOrderData(prev => ({
        ...prev,
        productCodes: newProductCodes
      }));

      // Cədvəl üçün məhsul məlumatlarını yenilə
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

      // Create a temporary order object for the contract
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

      // Reset form
      setOrderData({
        orderType: 'RENT',
        fromDate: '',
        toDate: '',
        productCodes: [],
        userId: 0,
        userFin: '',
        name: '',
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

  // Calculate total price
  const totalPrice = orderItems.reduce((sum, item) => {
    const price = orderData.orderType === 'RENT' ? item.rentPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow-md rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Order</p>
      </div>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
        {/* --- Left Column: Customer & Contract --- */}
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

          {/* <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Type</label>
            <select
              name="orderType"
              value={orderData.orderType}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
          </div> */}

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
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          {/* <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              name="fromDate"
              value={orderData.fromDate}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
            <input
              type="date"
              name="toDate"
              value={orderData.toDate}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={orderData.orderType === 'RENT'}
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Upload Signed Contract</label>
            <label
              htmlFor="contractUpload"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 flex items-center gap-2 cursor-pointer text-gray-500 dark:text-gray-400"
            >
              <FileUp size={16} />
              {contractFile ? contractFile.name : 'Choose a file...'}
            </label>
            <input id="contractUpload" type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {/* --- Right Column: Product Search & Preview --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Find Product</h3>
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={productCodeInput}
              onChange={(e) => setProductCodeInput(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Product Code"
            />
            <button
              type="button"
              onClick={handleSearchProduct}
              disabled={searchLoading}
              className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {searchLoading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Search size={20} />
              )}
            </button>
          </div>
          {searchError && <p className="text-sm text-red-500 mt-2">{searchError}</p>}

          {searchedProduct && (
            <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{searchedProduct.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{searchedProduct.description}</p>

              <div className="text-sm space-y-1 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">Code:</strong>{' '}
                  <span className="font-mono">{searchedProduct.code}</span>
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">Status:</strong>{' '}
                  <span className={searchedProduct.status === 'AVAILABLE' ? 'text-green-600' : 'text-orange-500'}>
                    {searchedProduct.status}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">In Stock:</strong> {searchedProduct.quantity}
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">It is for:</strong> {searchedProduct.raison}
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">Sale Price:</strong> ${searchedProduct.price.toFixed(2)}
                </div>
                <div>
                  <strong className="text-gray-600 dark:text-gray-300 w-24 inline-block">Rent Price:</strong> ${searchedProduct.rentPrice.toFixed(2)}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <label className="text-sm font-medium">Qty:</label>
                <input
                  type="number"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  min="1"
                  max={searchedProduct.quantity}
                  className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"
                />

                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 ml-auto"
                >
                  <PlusCircle size={16} /> Add
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Type</label>
            <select
              name="orderType"
              value={orderData.orderType}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SALE">Sale</option>
              <option value="RENT">Rent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              name="fromDate"
              value={orderData.fromDate}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
            <input
              type="date"
              name="toDate"
              value={orderData.toDate}
              onChange={handleFormChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={orderData.orderType === 'RENT'}
            />
          </div>
        </div>
      </div>

      {/* --- Order Items Table --- */}
      <div className="px-4 pb-4 md:px-6 md:pb-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Order Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {orderItems.length > 0 ? (
                orderItems.map((item) => {
                  const unitPrice = orderData.orderType === 'RENT' ? item.rentPrice : item.price;
                  return (
                    <tr key={item.code}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </td>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products added yet.
                  </td>
                </tr>
              )}
            </tbody>
            {/* <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">
                  Grand Total
                </td>
                <td colSpan="2" className="px-4 py-3 text-left text-lg font-bold text-gray-900 dark:text-gray-100">${totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot> */}
            <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-800 dark:text-gray-200 uppercase">
                  Grand Total
                </td>
                <td colSpan="2" className="px-4 py-3 text-left text-lg font-bold text-gray-900 dark:text-gray-100">
                  {calculationLoading ? (
                    <div className="w-5 h-5 border-2 border-blue-500/50 border-t-blue-500 rounded-full animate-spin"></div>
                  ) : (
                    `$${calculatedPrice.toFixed(2)}`
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
          className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {submitLoading && (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          )}
          Create Order
        </button>
      </div>
    </form>
  );
};

export default CreateOrderForm;