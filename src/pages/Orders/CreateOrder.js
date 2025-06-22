import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import toast from 'react-hot-toast';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { data: products, loading, error } = useApi(() => apiService.products.getAll());
  const { execute: createOrder, loading: creating } = useApiCall();
  const { execute: checkStock } = useApiCall();

  // Filter products based on search
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const addProductToOrder = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    // Check if product already exists in order
    const existingItem = orderItems.find(item => item.productSku === selectedProduct.sku);
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    // Check stock availability
    try {
      await checkStock(
        () => apiService.products.checkStock(selectedProduct.sku, totalQuantity),
        {
          showSuccessToast: false,
          showErrorToast: false
        }
      );

      if (existingItem) {
        // Update existing item
        setOrderItems(orderItems.map(item => 
          item.productSku === selectedProduct.sku 
            ? { ...item, quantity: totalQuantity }
            : item
        ));
        toast.success(`Updated ${selectedProduct.name} quantity to ${totalQuantity}`);
      } else {
        // Add new item
        const newItem = {
          productSku: selectedProduct.sku,
          productName: selectedProduct.name,
          availableStock: selectedProduct.quantityInStock,
          quantity: quantity
        };
        setOrderItems([...orderItems, newItem]);
        toast.success(`Added ${selectedProduct.name} to order`);
      }

      // Reset form
      setSelectedProduct(null);
      setQuantity(1);
      setSearchTerm('');
    } catch (error) {
      toast.error(`Insufficient stock. Only ${selectedProduct.quantityInStock} available.`);
    }
  };

  const removeItemFromOrder = (productSku) => {
    setOrderItems(orderItems.filter(item => item.productSku !== productSku));
    toast.success('Item removed from order');
  };

  const updateItemQuantity = async (productSku, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(productSku);
      return;
    }

    const item = orderItems.find(item => item.productSku === productSku);
    if (!item) return;

    try {
      await checkStock(
        () => apiService.products.checkStock(productSku, newQuantity),
        {
          showSuccessToast: false,
          showErrorToast: false
        }
      );

      setOrderItems(orderItems.map(item => 
        item.productSku === productSku 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (error) {
      toast.error(`Insufficient stock. Only ${item.availableStock} available.`);
    }
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    try {
      const orderData = {
        orderLineItems: orderItems.map(item => ({
          productSku: item.productSku,
          quantity: item.quantity
        }))
      };

      const newOrder = await createOrder(
        () => apiService.orders.create(orderData),
        {
          successMessage: 'Order created successfully',
          onSuccess: (order) => navigate(`/orders/${order.id}`)
        }
      );
    } catch (error) {
      // Error handled by useApiCall hook
    }
  };

  const steps = [
    { number: 1, title: 'Add Products', description: 'Search and add products to order' },
    { number: 2, title: 'Review Order', description: 'Review and confirm order details' },
    { number: 3, title: 'Confirmation', description: 'Order confirmation and completion' }
  ];

  if (loading) return <LoadingSpinner text="Loading products..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600">Add products and create a customer order</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.number 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {currentStep > step.number ? <FiCheck className="w-4 h-4" /> : step.number}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ml-4 ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Add Products */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Search */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      <p className="text-xs text-gray-500">Location: {product.locationCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Stock: {product.quantityInStock}
                      </p>
                      {product.quantityInStock < 10 && (
                        <p className="text-xs text-red-600">Low Stock</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity and Add Button */}
            {selectedProduct && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.quantityInStock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="input-field w-20"
                    />
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={addProductToOrder}
                      className="btn-primary flex items-center"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            
            {orderItems.length > 0 ? (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.productSku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.productSku, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <button
                        onClick={() => removeItemFromOrder(item.productSku)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No items added to order yet</p>
            )}

            {orderItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Items:</span>
                  <span className="font-bold text-lg">{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-primary w-full mt-4"
                  disabled={orderItems.length === 0}
                >
                  Review Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Review Order */}
      {currentStep === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Order</h2>
            
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.productSku} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total Items:</span>
                <span className="text-xl font-bold text-primary-600">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back to Add Products
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-4 h-4 mr-2" />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder; 