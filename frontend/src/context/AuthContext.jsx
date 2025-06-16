import { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../api/profileService';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isAdmin: false,
    profile: null,
    loading: true
  });

  // Проверяем наличие токена в localStorage при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('AuthContext: Загруженные данные из localStorage:');
      console.log('AuthContext: token =', token);
      console.log('AuthContext: userData =', userData);
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('AuthContext: Распарсенный пользователь =', user);
          
          // Устанавливаем токен в Axios
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          setAuthState({
            isAuthenticated: true,
            user: user,
            token: token,
            isAdmin: Boolean(user.isAdmin),
            profile: null,
            loading: false
          });

          // Загружаем профиль пользователя
          await loadUserProfile();
        } catch (e) {
          console.error('AuthContext: Ошибка при инициализации:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.profile) {
        setAuthState(prev => ({
          ...prev,
          profile: response.profile
        }));
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  };

  const updateUserProfile = (profileData) => {
    setAuthState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileData
      }
    }));
  };

  const login = async (userData, token) => {
    console.log('AuthContext: login вызван с данными:');
    console.log('AuthContext: userData =', userData);
    console.log('AuthContext: token =', token);
    
    // Сохраняем данные в localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Устанавливаем токен в Axios
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setAuthState({
      isAuthenticated: true,
      user: userData,
      token: token,
      isAdmin: Boolean(userData.isAdmin),
      profile: null,
      loading: false
    });

    // Загружаем профиль пользователя после входа
    await loadUserProfile();
  };

  const logout = () => {
    // Удаляем данные из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Удаляем токен из Axios
    delete api.defaults.headers.common['Authorization'];
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isAdmin: false,
      profile: null,
      loading: false
    });

    // Перенаправляем на главную страницу
    window.location.href = '/';
  };

  if (authState.loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout, 
      updateUserProfile,
      loadUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
