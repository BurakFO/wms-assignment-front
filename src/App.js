import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductsList from './pages/Products/ProductsList';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';
import OrdersList from './pages/Orders/OrdersList';
import CreateOrder from './pages/Orders/CreateOrder';
import OrderDetails from './pages/Orders/OrderDetails';
import PickingTasksList from './pages/PickingTasks/PickingTasksList';
import TaskDetails from './pages/PickingTasks/TaskDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/create" element={<CreateOrder />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/picking-tasks" element={<PickingTasksList />} />
            <Route path="/picking-tasks/:id" element={<TaskDetails />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App; 