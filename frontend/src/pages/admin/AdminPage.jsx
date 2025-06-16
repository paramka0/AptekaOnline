import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import AdminStats from './AdminStats';
import AdminOrders from './AdminOrders';
import { FaBox, FaUsers, FaShoppingCart } from 'react-icons/fa';

const AdminPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/').pop() || 'products');

  const tabs = [
    { id: 'products', label: 'Товары', icon: FaBox, path: '/admin/products' },
    { id: 'users', label: 'Пользователи', icon: FaUsers, path: '/admin/users' },
    { id: 'orders', label: 'Заказы', icon: FaShoppingCart, path: '/admin/orders' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <AdminStats />
          
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center px-6 py-3 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="mr-2" />
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <Routes>
            <Route path="products" element={<ProductManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="*" element={<ProductManagement />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
