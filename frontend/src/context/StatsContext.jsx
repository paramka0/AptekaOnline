import React, { createContext, useContext, useState } from 'react';
import axios from '../utils/axios';

const StatsContext = createContext();

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    usersCount: 0,
    productsCount: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      if (response.data && response.data.success && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    }
  };

  const updateProductsCount = (change) => {
    setStats(prevStats => ({
      ...prevStats,
      productsCount: prevStats.productsCount + change
    }));
  };

  return (
    <StatsContext.Provider value={{ stats, fetchStats, updateProductsCount }}>
      {children}
    </StatsContext.Provider>
  );
};

export default StatsContext; 