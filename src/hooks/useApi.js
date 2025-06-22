import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        setData(response.data);
      } catch (err) {
        setError(err);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      console.error('API Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      errorMessage = 'An error occurred',
      showSuccessToast = true,
      showErrorToast = true 
    } = options;

    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      return response.data;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        const message = err.response?.data?.message || errorMessage;
        toast.error(message);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}; 