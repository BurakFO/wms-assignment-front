import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiPackage, FiRefreshCw } from 'react-icons/fi';
import { useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import { generateSKU } from '../../utils/formatters';

const AddProduct = () => {
  const navigate = useNavigate();
  const { execute: createProduct, loading } = useApiCall();
  const [autoGenerateSKU, setAutoGenerateSKU] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      sku: '',
      name: '',
      locationCode: '',
      quantityInStock: 0
    }
  });

  const watchedName = watch('name');

  // Auto-generate SKU when name changes
  React.useEffect(() => {
    if (autoGenerateSKU && watchedName) {
      const generatedSKU = generateSKU(watchedName);
      setValue('sku', generatedSKU);
    }
  }, [watchedName, autoGenerateSKU, setValue]);

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        quantityInStock: parseInt(data.quantityInStock)
      };

      await createProduct(
        () => apiService.products.create(productData),
        {
          successMessage: 'Product created successfully',
          onSuccess: () => navigate('/products')
        }
      );
    } catch (error) {
      // Error handled by useApiCall hook
    }
  };

  const handleGenerateSKU = () => {
    if (watchedName) {
      const generatedSKU = generateSKU(watchedName);
      setValue('sku', generatedSKU);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product in your inventory</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter product name"
              {...register('name', {
                required: 'Product name is required',
                minLength: {
                  value: 2,
                  message: 'Product name must be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                SKU (Stock Keeping Unit) *
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoGenerateSKU}
                    onChange={(e) => setAutoGenerateSKU(e.target.checked)}
                    className="mr-1"
                  />
                  Auto-generate
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="text-primary-600 hover:text-primary-800 p-1"
                  title="Generate new SKU"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              className={`input-field font-mono ${errors.sku ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Enter or generate SKU"
              {...register('sku', {
                required: 'SKU is required',
                minLength: {
                  value: 3,
                  message: 'SKU must be at least 3 characters'
                },
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'SKU must contain only uppercase letters and numbers'
                }
              })}
            />
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              SKU must be unique and contain only uppercase letters and numbers
            </p>
          </div>

          {/* Location Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Code *
            </label>
            <input
              type="text"
              className={`input-field ${errors.locationCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., A1B2, RACK-001"
              {...register('locationCode', {
                required: 'Location code is required',
                minLength: {
                  value: 2,
                  message: 'Location code must be at least 2 characters'
                }
              })}
            />
            {errors.locationCode && (
              <p className="mt-1 text-sm text-red-600">{errors.locationCode.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Specify where this product is stored in the warehouse
            </p>
          </div>

          {/* Quantity in Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              className={`input-field ${errors.quantityInStock ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="0"
              {...register('quantityInStock', {
                required: 'Initial stock quantity is required',
                min: {
                  value: 0,
                  message: 'Stock quantity cannot be negative'
                },
                validate: (value) => {
                  const num = parseInt(value);
                  if (isNaN(num)) return 'Please enter a valid number';
                  return true;
                }
              })}
            />
            {errors.quantityInStock && (
              <p className="mt-1 text-sm text-red-600">{errors.quantityInStock.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the current stock quantity for this product
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="text-gray-600 hover:text-gray-800 px-4 py-2"
                disabled={loading}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPackage className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Help Card */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FiPackage className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Product Creation Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use descriptive product names for easy identification</li>
                <li>• SKUs should be unique and follow your naming convention</li>
                <li>• Location codes help warehouse staff find products quickly</li>
                <li>• Set accurate initial stock quantities for inventory tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct; 