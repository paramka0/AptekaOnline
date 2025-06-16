import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const getProducts = async (params = '') => {
  return api.get(`/products${params ? `?${params}` : ''}`);
};

export const getAdminProducts = async () => {
  return api.get(`/admin/products`);
};

export const getProductById = async (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = async (productData) => {
  return api.post(`/products`, productData);
};

export const updateProduct = async (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = async (id) => {
  return api.delete(`/products/${id}`);
};

export const getProductTags = async () => {
  return api.get(`/products/tags/all`);
};

export const getPriceRange = async () => {
  return api.get(`/products/price-range`);
};

// Auth
export const login = async (credentials) => {
  return api.post(`/auth/login`, credentials);
};

export const register = async (userData) => {
  return api.post(`/auth/register`, userData);
};

export const logout = async () => {
  return api.post(`/auth/logout`);
};

// Cart
export const getCart = async () => {
  return api.get(`/cart`);
};

export const addToCart = async (productId, quantity = 1) => {
  return api.post(`/cart`, { productId, quantity });
};

export const removeFromCart = async (productId) => {
  return api.delete(`/cart/${productId}`);
};

export const updateCartItem = async (productId, quantity) => {
  return api.put(`/cart/${productId}`, { quantity });
};

// Orders API
export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders/me');
    return response.data.orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getOrders = async () => {
  return api.get('/admin/orders');
};

export const updateOrderStatus = async (orderId, status) => {
  return api.put(`/admin/orders/${orderId}`, { status });
};

export const deleteOrder = async (orderId) => {
  return api.delete(`/admin/orders/${orderId}`);
};

export const getOrderDetails = async (id) => {
  return api.get(`/orders/${id}`);
};

export const createOrder = async (orderData) => {
  return api.post(`/orders`, orderData);
};

export const getOrderById = async (id) => {
  return api.get(`/orders/${id}`);
};

export default api;
