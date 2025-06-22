import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiClipboard, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import StatusBadge from '../../components/UI/StatusBadge';
import { formatDate, isLowStock } from '../../utils/formatters';

const Dashboard = () => {
  // Fetch data with custom hooks
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useApi(() => apiService.products.getAll());
  const { data: orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useApi(() => apiService.orders.getAll());
  const { data: pickingTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useApi(() => apiService.pickingTasks.getAll());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchProducts();
      refetchOrders();
      refetchTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchProducts, refetchOrders, refetchTasks]);

  // Calculate metrics
  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter(product => isLowStock(product.quantityInStock)).length || 0;
  const activeOrders = orders?.filter(order => ['NEW', 'ALLOCATED', 'PICKING'].includes(order.status)).length || 0;
  const pendingTasks = pickingTasks?.filter(task => task.status === 'IN_PROGRESS').length || 0;

  // Recent orders (latest 5)
  const recentOrders = orders?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5) || [];

  const loading = productsLoading || ordersLoading || tasksLoading;
  const error = productsError || ordersError || tasksError;

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: FiPackage,
      color: 'bg-blue-500',
      link: '/products'
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockProducts,
      icon: FiAlertTriangle,
      color: lowStockProducts > 0 ? 'bg-red-500' : 'bg-green-500',
      link: '/products?filter=low-stock'
    },
    {
      title: 'Active Orders',
      value: activeOrders,
      icon: FiShoppingCart,
      color: 'bg-green-500',
      link: '/orders'
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      icon: FiClipboard,
      color: 'bg-yellow-500',
      link: '/picking-tasks'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your Warehouse Management System</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/products/add" className="btn-primary flex items-center">
            <FiPlus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
          <Link to="/orders/create" className="btn-secondary flex items-center">
            <FiPlus className="w-4 h-4 mr-2" />
            Create Order
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Link 
              key={index}
              to={metric.link}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {order.orderLineItems?.length || 0} items
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/products" className="text-sm text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>
          {products && products.filter(product => isLowStock(product.quantityInStock)).length > 0 ? (
            <div className="space-y-3">
              {products
                .filter(product => isLowStock(product.quantityInStock))
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {product.quantityInStock} left
                      </p>
                      <p className="text-xs text-gray-500">{product.locationCode}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All products are well stocked</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 