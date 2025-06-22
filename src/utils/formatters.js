export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const getStatusColor = (status) => {
  const statusColors = {
    NEW: 'bg-gray-100 text-gray-800',
    ALLOCATED: 'bg-blue-100 text-blue-800',
    PICKING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const generateSKU = (name) => {
  if (!name) return '';
  
  const cleaned = name.replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleaned.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '';
  
  let sku = '';
  if (words.length === 1) {
    sku = words[0].substring(0, 6).toUpperCase();
  } else {
    sku = words.map(word => word.substring(0, 2)).join('').toUpperCase();
  }
  
  // Add random numbers
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${sku}${randomNum}`;
};

export const isLowStock = (quantity, threshold = 10) => {
  return quantity < threshold;
}; 