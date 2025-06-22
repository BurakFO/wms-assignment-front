I need you to create a modern, professional React frontend for my Warehouse Management System (WMS) backend. The backend is running on Spring Boot with the following specifications:

## 🔧 TECHNICAL REQUIREMENTS

**Frontend Stack:**
- React 18+ with functional components and hooks
- Tailwind CSS for styling 
- React Router DOM for navigation
- React Icons for icons
- Axios for API calls
- React Hook Form for form handling
- React Hot Toast for notifications

**Backend Integration:**
- Base API URL: http://localhost:8080
- CORS enabled on backend
- REST API with JSON responses

## 📋 BACKEND API ENDPOINTS TO INTEGRATE

### Products API (http://localhost:8080/api/products)
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID  
- `GET /api/products/sku/{sku}` - Get product by SKU
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{sku}/stock/{quantity}` - Check stock availability

**Product Object:**
```json
{
  "id": 1,
  "sku": "LAPTOP001",
  "name": "Gaming Laptop", 
  "locationCode": "A1B2",
  "quantityInStock": 100
}
```

### Orders API (http://localhost:8080/api/orders)
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/status/{status}` - Get orders by status (NEW, ALLOCATED, PICKING, COMPLETED, CANCELLED)
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/cancel` - Cancel order

**Order Creation Payload:**
```json
{
  "orderLineItems": [
    {
      "productSku": "LAPTOP001",
      "quantity": 2
    }
  ]
}
```

**Order Response:**
```json
{
  "id": 1,
  "createdAt": "2024-01-15T10:30:00",
  "status": "ALLOCATED",
  "orderLineItems": [
    {
      "id": 1,
      "productSku": "LAPTOP001", 
      "quantity": 2
    }
  ]
}
```

### Picking Tasks API (http://localhost:8080/api/picking-tasks)
- `GET /api/picking-tasks` - Get all picking tasks
- `GET /api/picking-tasks/{id}` - Get picking task by ID
- `GET /api/picking-tasks/status/{status}` - Get tasks by status (IN_PROGRESS, DONE)
- `GET /api/picking-tasks/in-progress` - Get in-progress tasks
- `GET /api/picking-tasks/completed` - Get completed tasks
- `PUT /api/picking-tasks/{id}/complete` - Complete picking task

## 🎨 UI/UX REQUIREMENTS

**Design System:**
- Modern, clean warehouse/logistics theme
- Professional blue/gray color scheme
- Responsive design (mobile-first)
- Loading states and error handling
- Success/error notifications with react-hot-toast

**Navigation Structure:**
├── Dashboard (/)
├── Products (/products)
│ ├── Products List
│ ├── Add Product
│ └── Edit Product
├── Orders (/orders)
│ ├── Orders List
│ ├── Create Order
│ └── Order Details
└── Picking Tasks (/picking-tasks)
├── Tasks List
└── Task Details


## 📱 PAGE SPECIFICATIONS

### 1. Dashboard Page (/)
- **Key Metrics Cards:**
  - Total Products count
  - Low Stock Alerts (products with quantity < 10)
  - Active Orders count
  - Pending Picking Tasks count
- **Recent Activity Section:**
  - Latest 5 orders
  - Recent picking task completions
- **Quick Actions:**
  - "Add New Product" button
  - "Create Order" button

### 2. Products Page (/products)
**Products List:**
- Searchable table with columns: SKU, Name, Location, Stock, Actions
- Filter by low stock (< 10 items)
- Sort by name, stock quantity
- Edit/Delete actions per row
- "Add New Product" button

**Add/Edit Product Form:**
- Fields: SKU, Name, Location Code, Quantity in Stock
- Real-time validation
- Auto-generate SKU suggestion
- Stock quantity validation (non-negative)

### 3. Orders Page (/orders)
**Orders List:**
- Table with: Order ID, Created Date, Status, Items Count, Actions
- Filter by status (NEW, ALLOCATED, PICKING, COMPLETED, CANCELLED)
- Status badges with colors:
  - NEW: gray
  - ALLOCATED: blue  
  - PICKING: yellow
  - COMPLETED: green
  - CANCELLED: red
- View Details and Cancel actions

**Create Order Form:**
- Multi-step form:
  1. Add Products (search and select products with quantity)
  2. Review Order (show selected items)
  3. Confirmation
- Real-time stock availability check
- Remove line items functionality
- Order total calculation

**Order Details Page:**
- Order information display
- Line items table
- Status timeline/progress
- Cancel order button (if applicable)

### 4. Picking Tasks Page (/picking-tasks)
**Tasks List:**
- Table with: Task ID, Order ID, Status, Created Date, Actions
- Filter by status (IN_PROGRESS, DONE)
- Complete task action
- View associated order details

**Task Details:**
- Task information
- Associated order details
- Line items to pick
- Complete task button
- Status timeline

## 🛠️ TECHNICAL IMPLEMENTATION DETAILS

### API Integration:
```javascript
// Example API service structure
const API_BASE_URL = 'http://localhost:8080';

const apiService = {
  products: {
    getAll: () => axios.get(`${API_BASE_URL}/api/products`),
    getById: (id) => axios.get(`${API_BASE_URL}/api/products/${id}`),
    create: (product) => axios.post(`${API_BASE_URL}/api/products`, product),
    update: (id, product) => axios.put(`${API_BASE_URL}/api/products/${id}`, product),
    delete: (id) => axios.delete(`${API_BASE_URL}/api/products/${id}`)
  },
  orders: {
    getAll: () => axios.get(`${API_BASE_URL}/api/orders`),
    create: (order) => axios.post(`${API_BASE_URL}/api/orders`, order),
    cancel: (id) => axios.put(`${API_BASE_URL}/api/orders/${id}/cancel`)
  },
  pickingTasks: {
    getAll: () => axios.get(`${API_BASE_URL}/api/picking-tasks`),
    complete: (id) => axios.put(`${API_BASE_URL}/api/picking-tasks/${id}/complete`)
  }
};
```

### Error Handling:
- Network error handling
- API error responses display
- Loading states for all async operations
- Form validation with helpful error messages

### State Management:
- Use React hooks (useState, useEffect, useContext)
- Custom hooks for API calls
- Context for global state if needed

## 🎯 SPECIFIC FEATURES TO IMPLEMENT

1. **Real-time Stock Validation** - When creating orders, check stock before allowing item addition
2. **Auto-refresh** - Automatically refresh data every 30 seconds on dashboard
3. **Responsive Tables** - Mobile-friendly table designs
4. **Search Functionality** - Search products by SKU or name
5. **Bulk Actions** - Select multiple items for bulk operations
6. **Export Functionality** - Export data to CSV (optional)
7. **Dark Mode Toggle** - Light/dark theme switcher (optional)

## 📦 PROJECT SETUP

Please create a complete React project with:
- Clean folder structure (components, pages, services, hooks, utils)
- Proper component organization
- TypeScript interfaces for API responses
- Environment variables for API configuration
- README with setup instructions

## 🚀 DELIVERABLES

1. Complete React application source code
2. Package.json with all dependencies
3. Tailwind configuration
4. API service layer
5. All pages and components
6. Error handling and loading states
7. Responsive design implementation
8. Setup and run instructions

Make the UI intuitive for warehouse workers and managers. Focus on usability, performance, and professional appearance. The system should handle the complete workflow: Product Management → Order Creation → Inventory Allocation → Picking Tasks → Order Completion.