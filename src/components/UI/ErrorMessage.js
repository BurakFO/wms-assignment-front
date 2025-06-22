import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorMessage = ({ error, onRetry, className = '' }) => {
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred';
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <FiAlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {getErrorMessage(error)}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 