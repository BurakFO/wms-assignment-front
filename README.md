# Warehouse Management System (WMS) - Frontend

A modern, professional React frontend for managing warehouse operations including inventory, orders, and picking tasks.

## 🚀 Features

- **Dashboard**: Key metrics, low stock alerts, and recent activity
- **Product Management**: Add, edit, delete, and search products with real-time stock tracking
- **Order Management**: Create orders with stock validation, view order details, and track status
- **Picking Tasks**: Manage picking operations with task completion tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Auto-refresh dashboard every 30 seconds
- **Professional UI**: Clean, modern interface designed for warehouse workers

## 🛠️ Technology Stack

- **React 18+** with functional components and hooks
- **Tailwind CSS** for styling and responsive design
- **React Router DOM** for navigation
- **React Icons** for consistent iconography
- **Axios** for API communication
- **React Hook Form** for form handling and validation
- **React Hot Toast** for notifications

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Backend WMS API running on `http://localhost:8080`

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kuehne-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your backend API URL:
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/          # Navigation and layout components
│   └── UI/              # Generic UI components (buttons, forms, etc.)
├── pages/               # Page components
│   ├── Dashboard/       # Dashboard and analytics
│   ├── Products/        # Product management pages
│   ├── Orders/          # Order management pages
│   └── PickingTasks/    # Picking task management pages
├── services/            # API service layer
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and helpers
├── App.js               # Main application component
└── index.js             # Application entry point
```

## 🔌 Backend API Integration

The frontend integrates with the following API endpoints:

### Products API
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/products/{sku}/stock/{quantity}` - Check stock availability

### Orders API
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/cancel` - Cancel order

### Picking Tasks API
- `GET /api/picking-tasks` - Get all picking tasks
- `GET /api/picking-tasks/{id}` - Get task by ID
- `PUT /api/picking-tasks/{id}/complete` - Complete task

## 🎨 Key Features

### Dashboard
- Real-time metrics cards (products, low stock, active orders, pending tasks)
- Recent orders list with status indicators
- Low stock alerts with product details
- Auto-refresh every 30 seconds

### Product Management
- Searchable product list with sorting and filtering
- Low stock filter and alerts
- Auto-generated SKU suggestions
- Form validation with real-time feedback
- Bulk actions and product statistics

### Order Management
- Multi-step order creation with stock validation
- Order status tracking with visual timeline
- Real-time stock checking before adding items
- Order filtering by status
- Comprehensive order details view

### Picking Tasks
- Task list with status filtering
- Task completion tracking
- Integration with order details
- Visual status indicators
- Task timeline and progress tracking

## 🔄 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎯 Design System

### Colors
- **Primary**: Blue (#2563eb) - Navigation, CTAs, links
- **Success**: Green (#059669) - Confirmations, completed states
- **Warning**: Yellow (#d97706) - Alerts, pending states
- **Danger**: Red (#dc2626) - Errors, critical alerts
- **Gray Scale**: Various grays for text and backgrounds

### Typography
- **Font Family**: Inter (system fonts fallback)
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400)
- **Small Text**: Light weight (300)

### Components
- **Cards**: White background with subtle shadow
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Consistent input styling with validation states
- **Tables**: Responsive with hover states
- **Status Badges**: Color-coded for different states

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with side navigation
- **Tablet**: Responsive grid layouts and touch-friendly
- **Mobile**: Hamburger menu and mobile-optimized tables

## 🔒 Error Handling

- **Network Errors**: Automatic retry functionality
- **Form Validation**: Real-time validation with helpful messages
- **API Errors**: User-friendly error messages
- **Loading States**: Comprehensive loading indicators
- **Empty States**: Helpful empty state illustrations

## 🚀 Production Build

To create a production build:

```bash
npm run build
```

The build folder will contain optimized files ready for deployment.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📦 Deployment

The application can be deployed to:
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect your Git repository
- **Apache/Nginx**: Serve the build folder as static files
- **Docker**: Use the included Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review API integration guide
- Contact the development team

---

**Built with ❤️ for modern warehouse management** # was-assignment-front
