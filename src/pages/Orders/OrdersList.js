import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEye, FiX, FiShoppingCart, FiFilter } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import EmptyState from '../../components/UI/EmptyState';
import StatusBadge from '../../components/UI/StatusBadge';
import { formatDate } from '../../utils/formatters';

const OrdersList = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: orders, loading, error, refetch } = useApi(() => apiService.orders.getAll());
  const { execute: cancelOrder, loading: cancelLoading } = useApiCall();

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = orders.filter((order) => {
      if (statusFilter === 'ALL') return true;
      return order.status === statusFilter;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'id') {
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
  }, [orders, statusFilter, sortBy, sortOrder]);

  const handleCancelOrder = async (order) => {
    if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
      try {
        await cancelOrder(
          () => apiService.orders.cancel(order.id),
          {
            successMessage: 'Order cancelled successfully',
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

  if (loading) return <LoadingSpinner text="Loading orders..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const statusOptions = ['ALL', 'NEW', 'ALLOCATED', 'PICKING', 'COMPLETED', 'CANCELLED'];
  const statusCounts = orders ? {
    ALL: orders.length,
    NEW: orders.filter(o => o.status === 'NEW').length,
    ALLOCATED: orders.filter(o => o.status === 'ALLOCATED').length,
    PICKING: orders.filter(o => o.status === 'PICKING').length,
    COMPLETED: orders.filter(o => o.status === 'COMPLETED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  } : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>
        <Link to="/orders/create" className="btn-primary flex items-center">
          <FiPlus className="w-4 h-4 mr-2" />
          Create Order
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
              <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full">
                {statusCounts[status] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders?.length || 0} orders
            </span>
          </div>
          <select
            className="input-field"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="id-desc">Order ID (High-Low)</option>
            <option value="id-asc">Order ID (Low-High)</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card p-0">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    Order ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header">Items</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-900">
                        {order.orderLineItems?.length || 0} items
                      </div>
                      {order.orderLineItems && order.orderLineItems.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.orderLineItems.slice(0, 2).map((item, index) => (
                            <span key={index}>
                              {item.productSku} ({item.quantity})
                              {index < Math.min(order.orderLineItems.length, 2) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {order.orderLineItems.length > 2 && (
                            <span> +{order.orderLineItems.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {(order.status === 'NEW' || order.status === 'ALLOCATED') && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={cancelLoading}
                            className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                            title="Cancel Order"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FiShoppingCart}
            title="No orders found"
            description={
              statusFilter !== 'ALL'
                ? `No orders with status "${statusFilter}" found.`
                : "No orders have been created yet. Create your first order to get started."
            }
            action={
              statusFilter !== 'ALL' ? (
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className="btn-secondary"
                >
                  Show All Orders
                </button>
              ) : (
                <Link to="/orders/create" className="btn-primary">
                  <FiPlus className="w-4 h-4 mr-2" />
                  Create First Order
                </Link>
              )
            }
          />
        )}
      </div>

      {/* Summary Statistics */}
      {orders && orders.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => ['NEW', 'ALLOCATED', 'PICKING'].includes(o.status)).length}
              </p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'CANCELLED').length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList; 