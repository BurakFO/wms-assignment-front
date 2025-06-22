import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiCheck, FiClipboard, FiClock, FiFilter } from 'react-icons/fi';
import { useApi, useApiCall } from '../../hooks/useApi';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import EmptyState from '../../components/UI/EmptyState';
import StatusBadge from '../../components/UI/StatusBadge';
import { formatDate } from '../../utils/formatters';

const PickingTasksList = () => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: pickingTasks, loading, error, refetch } = useApi(() => apiService.pickingTasks.getAll());
  const { execute: completeTask, loading: completingTask } = useApiCall();

  // Filter and sort picking tasks
  const filteredTasks = useMemo(() => {
    if (!pickingTasks) return [];

    let filtered = pickingTasks.filter((task) => {
      if (statusFilter === 'ALL') return true;
      return task.status === statusFilter;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'id') {
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
  }, [pickingTasks, statusFilter, sortBy, sortOrder]);

  const handleCompleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to complete Task #${task.id}?`)) {
      try {
        await completeTask(
          () => apiService.pickingTasks.complete(task.id),
          {
            successMessage: 'Task completed successfully',
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

  if (loading) return <LoadingSpinner text="Loading picking tasks..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  const statusOptions = ['ALL', 'IN_PROGRESS', 'DONE'];
  const statusCounts = pickingTasks ? {
    ALL: pickingTasks.length,
    IN_PROGRESS: pickingTasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: pickingTasks.filter(t => t.status === 'DONE').length,
  } : {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Picking Tasks</h1>
          <p className="text-gray-600">Manage warehouse picking operations</p>
        </div>
        <div className="flex gap-3">
          <Link to="/orders/create" className="btn-secondary flex items-center">
            <FiClipboard className="w-4 h-4 mr-2" />
            New Order
          </Link>
        </div>
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
              {status === 'ALL' ? 'All Tasks' : status.replace('_', ' ')}
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
              Showing {filteredTasks.length} of {pickingTasks?.length || 0} tasks
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
            <option value="id-desc">Task ID (High-Low)</option>
            <option value="id-asc">Task ID (Low-High)</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card p-0">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    Task ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header">Order ID</th>
                  <th
                    className="table-header cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="table-header">Created Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">#{task.id}</div>
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/orders/${task.orderId}`}
                        className="font-medium text-primary-600 hover:text-primary-800"
                      >
                        #{task.orderId}
                      </Link>
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="table-cell">
                      <div className="text-gray-900">{formatDate(task.createdAt)}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/picking-tasks/${task.id}`}
                          className="text-primary-600 hover:text-primary-800 p-1"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            disabled={completingTask}
                            className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                            title="Complete Task"
                          >
                            <FiCheck className="w-4 h-4" />
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
            icon={FiClipboard}
            title="No picking tasks found"
            description={
              statusFilter !== 'ALL'
                ? `No tasks with status "${statusFilter.replace('_', ' ')}" found.`
                : "No picking tasks available. Tasks are automatically created when orders are allocated."
            }
            action={
              statusFilter !== 'ALL' ? (
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className="btn-secondary"
                >
                  Show All Tasks
                </button>
              ) : (
                <Link to="/orders/create" className="btn-primary">
                  <FiClipboard className="w-4 h-4 mr-2" />
                  Create Order
                </Link>
              )
            }
          />
        )}
      </div>

      {/* Task Statistics */}
      {pickingTasks && pickingTasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{pickingTasks.length}</p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {pickingTasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {pickingTasks.filter(t => t.status === 'DONE').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FiClock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Picking Task Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tasks are automatically created when orders are allocated</li>
              <li>• IN_PROGRESS tasks need warehouse staff attention</li>
              <li>• Complete tasks by clicking the check button</li>
              <li>• View task details to see associated order information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickingTasksList; 