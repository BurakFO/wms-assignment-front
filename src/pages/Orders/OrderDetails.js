import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiX, FiPackage, FiClock, FiCheck } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import StatusBadge from '../../components/UI/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: order, loading, error, refetch } = useApi(
    () => apiService.orders.getById(id),
    [id]
  );
  const { execute: cancelOrder, loading: cancelling } = useApiCall();

  const handleCancelOrder = async () => {
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

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!order) return <ErrorMessage error="Order not found" />;

  // Status timeline configuration
  const statusFlow = ['NEW', 'ALLOCATED', 'PICKING', 'COMPLETED'];
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  const getStatusIcon = (status, index) => {
    if (isCancelled && index > 0) {
      return <FiX className="w-4 h-4" />;
    }
    if (index < currentStatusIndex || (index === currentStatusIndex && !isCancelled)) {
      return <FiCheck className="w-4 h-4" />;
    }
    return <FiClock className="w-4 h-4" />;
  };

  const getStatusColor = (status, index) => {
    if (isCancelled && index > 0) {
      return 'bg-red-100 text-red-600 border-red-200';
    }
    if (index < currentStatusIndex || (index === currentStatusIndex && !isCancelled)) {
      return 'bg-green-100 text-green-600 border-green-200';
    }
    if (index === currentStatusIndex) {
      return 'bg-blue-100 text-blue-600 border-blue-200';
    }
    return 'bg-gray-100 text-gray-400 border-gray-200';
  };

  const canCancel = order.status === 'NEW' || order.status === 'ALLOCATED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600">Created on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="btn-danger flex items-center"
          >
            {cancelling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <FiX className="w-4 h-4 mr-2" />
                Cancel Order
              </>
            )}
          </button>
        )}
      </div>

      {/* Order Status and Timeline */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
          <StatusBadge status={order.status} className="text-sm px-3 py-1" />
        </div>

        {/* Status Timeline */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {statusFlow.map((status, index) => (
              <div key={status} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2
                  ${getStatusColor(status, index)}
                `}>
                  {getStatusIcon(status, index)}
                </div>
                <span className={`text-sm font-medium ${
                  index <= currentStatusIndex && !isCancelled ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
          
          {/* Connection Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
            <div 
              className={`h-full transition-all duration-500 ${
                isCancelled ? 'bg-red-300' : 'bg-green-300'
              }`}
              style={{ 
                width: isCancelled ? '0%' : `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Cancelled Status */}
          {isCancelled && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                <FiX className="w-4 h-4 mr-1" />
                Order Cancelled
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created Date:</span>
              <span className="font-medium">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">
                {order.orderLineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Product Types:</span>
              <span className="font-medium">{order.orderLineItems?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/orders"
              className="btn-secondary w-full flex items-center justify-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
            <Link
              to="/orders/create"
              className="btn-primary w-full flex items-center justify-center"
            >
              <FiPackage className="w-4 h-4 mr-2" />
              Create New Order
            </Link>
            {order.status === 'PICKING' && (
              <Link
                to="/picking-tasks"
                className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center"
              >
                <FiClock className="w-4 h-4 mr-2" />
                View Picking Tasks
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Order Line Items */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
        {order.orderLineItems && order.orderLineItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Product SKU</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Line Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderLineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{item.productSku}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{item.quantity} units</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No items in this order</p>
        )}

        {/* Order Summary */}
        {order.orderLineItems && order.orderLineItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Order Total:</span>
              <span className="text-xl font-bold text-primary-600">
                {order.orderLineItems.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails; 