import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import EmptyState from '../../components/UI/EmptyState';
import { isLowStock } from '../../utils/formatters';
import toast from 'react-hot-toast';

const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data: products, loading, error, refetch } = useApi(() => apiService.products.getAll());
  const { execute: deleteProduct, loading: deleteLoading } = useApiCall();

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.locationCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = !filterLowStock || isLowStock(product.quantityInStock);
      
      return matchesSearch && matchesFilter;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'quantityInStock') {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, filterLowStock, sortBy, sortOrder]);

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(
          () => apiService.products.delete(product.id),
          {
            successMessage: 'Product deleted successfully',
            onSuccess: () => refetch()
          }
        );
      } catch (error) {
        // Error handled by useApiCall hook
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) return <LoadingSpinner text="Loading products..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your inventory products</p>
        </div>
        <Link to="/products/add" className="btn-primary flex items-center">
          <FiPlus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or location..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterLowStock
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <FiAlertTriangle className="w-4 h-4 inline mr-2" />
              Low Stock Only
            </button>
            <select
              className="input-field"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="sku-asc">SKU A-Z</option>
              <option value="sku-desc">SKU Z-A</option>
              <option value="quantityInStock-asc">Stock Low-High</option>
              <option value="quantityInStock-desc">Stock High-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card p-0">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('sku')}
                  >
                    SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Product Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header">Location</th>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('quantityInStock')}
                  >
                    Stock {sortBy === 'quantityInStock' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{product.sku}</td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="table-cell">
                      <span className="text-gray-600">{product.locationCode}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-medium ${
                        isLowStock(product.quantityInStock) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.quantityInStock}
                      </span>
                    </td>
                    <td className="table-cell">
                      {isLowStock(product.quantityInStock) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="Edit Product"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FiPackage}
            title="No products found"
            description={
              searchTerm || filterLowStock
                ? "No products match your search criteria. Try adjusting your filters."
                : "Get started by adding your first product to the inventory."
            }
            action={
              <Link to="/products/add" className="btn-primary">
                <FiPlus className="w-4 h-4 mr-2" />
                Add First Product
              </Link>
            }
          />
        )}
      </div>

      {/* Summary */}
      {products && products.length > 0 && (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => isLowStock(p.quantityInStock)).length}
              </p>
              <p className="text-sm text-gray-600">Low Stock Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {products.reduce((sum, p) => sum + p.quantityInStock, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Stock Units</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList; 