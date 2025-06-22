import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // Products API
  products: {
    getAll: () => apiClient.get('/api/products'),
    getById: (id) => apiClient.get(`/api/products/${id}`),
    getBySku: (sku) => apiClient.get(`/api/products/sku/${sku}`),
    create: (product) => apiClient.post('/api/products', product),
    update: (id, product) => apiClient.put(`/api/products/${id}`, product),
    delete: (id) => apiClient.delete(`/api/products/${id}`),
    checkStock: (sku, quantity) => apiClient.get(`/api/products/${sku}/stock/${quantity}`)
  },

  // Orders API
  orders: {
    getAll: () => apiClient.get('/api/orders'),
    getById: (id) => apiClient.get(`/api/orders/${id}`),
    getByStatus: (status) => apiClient.get(`/api/orders/status/${status}`),
    create: (order) => apiClient.post('/api/orders', order),
    cancel: (id) => apiClient.put(`/api/orders/${id}/cancel`)
  },

  // Picking Tasks API
  pickingTasks: {
    getAll: () => apiClient.get('/api/picking-tasks'),
    getById: (id) => apiClient.get(`/api/picking-tasks/${id}`),
    getByStatus: (status) => apiClient.get(`/api/picking-tasks/status/${status}`),
    getInProgress: () => apiClient.get('/api/picking-tasks/in-progress'),
    getCompleted: () => apiClient.get('/api/picking-tasks/completed'),
    complete: (id) => apiClient.put(`/api/picking-tasks/${id}/complete`)
  }
};

export default apiService; 