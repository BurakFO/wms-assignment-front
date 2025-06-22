import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiPackage, FiShoppingCart, FiClock } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import StatusBadge from '../../components/UI/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: task, loading: taskLoading, error: taskError, refetch: refetchTask } = useApi(
    () => apiService.pickingTasks.getById(id),
    [id]
  );
  
  const { data: order, loading: orderLoading, error: orderError } = useApi(
    () => task ? apiService.orders.getById(task.orderId) : Promise.resolve(null),
    [task?.orderId]
  );
  
  const { execute: completeTask, loading: completing } = useApiCall();

  const handleCompleteTask = async () => {
    if (window.confirm(`Are you sure you want to complete Task #${task.id}?`)) {
      try {
        await completeTask(
          () => apiService.pickingTasks.complete(task.id),
          {
            successMessage: 'Task completed successfully',
            onSuccess: () => {
              refetchTask();
              // Navigate back to tasks list after a short delay
              setTimeout(() => navigate('/picking-tasks'), 1500);
            }
          }
        );
      } catch (error) {
        // Error handled by useApiCall hook
      }
    }
  };

  const loading = taskLoading || orderLoading;
  const error = taskError || orderError;

  if (loading) return <LoadingSpinner text="Loading task details..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  if (!task) return <ErrorMessage error="Task not found" />;

  const canComplete = task.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/picking-tasks')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Picking Task #{task.id}</h1>
            <p className="text-gray-600">Associated with Order #{task.orderId}</p>
          </div>
        </div>
        {canComplete && (
          <button
            onClick={handleCompleteTask}
            disabled={completing}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
          >
            {completing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Completing...
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4 mr-2" />
                Complete Task
              </>
            )}
          </button>
        )}
      </div>

      {/* Task Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Task ID:</span>
              <span className="font-medium">#{task.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created Date:</span>
              <span className="font-medium">{formatDateTime(task.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Associated Order:</span>
              <Link
                to={`/orders/${task.orderId}`}
                className="font-medium text-primary-600 hover:text-primary-800"
              >
                #{task.orderId}
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/picking-tasks"
              className="btn-secondary w-full flex items-center justify-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Link>
            <Link
              to={`/orders/${task.orderId}`}
              className="btn-primary w-full flex items-center justify-center"
            >
              <FiShoppingCart className="w-4 h-4 mr-2" />
              View Order Details
            </Link>
            {task.status === 'DONE' && (
              <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-center">
                <FiCheck className="w-4 h-4 inline mr-2" />
                Task Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Information */}
      {order && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Associated Order Details</h2>
          
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Order Status</p>
              <StatusBadge status={order.status} className="mt-1" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Created Date</p>
              <p className="font-medium text-gray-900 mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="font-medium text-gray-900 mt-1">
                {order.orderLineItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
              </p>
            </div>
          </div>

          {/* Items to Pick */}
          <h3 className="text-md font-medium text-gray-900 mb-3">Items to Pick</h3>
          {order.orderLineItems && order.orderLineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Product SKU</th>
                    <th className="table-header">Quantity to Pick</th>
                    <th className="table-header">Status</th>
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
                        {task.status === 'DONE' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheck className="w-3 h-3 mr-1" />
                            Picked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FiClock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No items in associated order</p>
          )}
        </div>
      )}

      {/* Picking Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FiPackage className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Picking Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Locate products using the SKU numbers listed above</li>
              <li>• Pick the exact quantities specified for each product</li>
              <li>• Verify product locations and quantities before picking</li>
              <li>• Mark task as complete once all items are picked and ready</li>
              <li>• Contact supervisor if any products are missing or damaged</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Task Timeline */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Timeline</h2>
        <div className="relative">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-200 flex items-center justify-center">
                <FiClock className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-900 mt-2">Created</span>
              <span className="text-xs text-gray-500">{formatDate(task.createdAt)}</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200">
              <div 
                className={`h-full transition-all duration-500 ${
                  task.status === 'DONE' ? 'bg-green-300' : 'bg-blue-300'
                }`}
                style={{ width: task.status === 'DONE' ? '100%' : '50%' }}
              />
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                task.status === 'DONE' 
                  ? 'bg-green-100 text-green-600 border-green-200' 
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}>
                <FiCheck className="w-4 h-4" />
              </div>
              <span className={`text-sm font-medium mt-2 ${
                task.status === 'DONE' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                Completed
              </span>
              {task.status === 'DONE' && (
                <span className="text-xs text-gray-500">Just now</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails; 