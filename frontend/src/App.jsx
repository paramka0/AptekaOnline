import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminPage from './pages/admin/AdminPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/account/ProfilePage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StatsProvider } from './context/StatsContext';

const App = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  console.log('App: Состояние аутентификации:');
  console.log('App: isAuthenticated =', isAuthenticated);
  console.log('App: isAdmin =', isAdmin);

  return (
    <CartProvider>
      <StatsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/*" 
              element={
                isAuthenticated && isAdmin ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/admin' }} />
                )
              } 
            />
          </Routes>
        </Router>
      </StatsProvider>
    </CartProvider>
  );
};

export default App;