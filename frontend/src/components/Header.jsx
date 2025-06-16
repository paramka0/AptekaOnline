import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSignOutAlt, FaUser, FaCog, FaSearch, FaHistory } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { getProducts } from '../api/apiService';
import LoginRegisterModal from './LoginRegisterModal';

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' или 'register'

  useEffect(() => {
    // Загружаем историю поиска из localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    // Обработчик клика вне поля поиска
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Сохраняем поисковый запрос в историю
      const newHistory = [searchQuery.trim(), ...searchHistory.filter(item => item !== searchQuery.trim())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    console.log('Clicked product:', product);
    const productId = product?._id || product?.id;
    if (!productId) {
      console.error('Product ID is missing:', product);
      return;
    }
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleRemoveFromHistory = (queryToRemove, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события, чтобы не срабатывал handleHistoryClick
    const newHistory = searchHistory.filter(query => query !== queryToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      try {
        const response = await getProducts(`search=${value}&limit=5`);
        setSuggestions(response.data.products || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Ошибка при получении подсказок:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">AptekaOnline</Link>
        
        <div className="flex-grow mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-2 rounded-md focus:outline-none text-gray-900"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              <FaSearch />
            </button>
          </form>

          {showSuggestions && (searchQuery.trim() || searchHistory.length > 0) && (
            <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg z-50">
              {searchQuery.trim() && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-sm text-gray-500 px-2 py-1">Подсказки:</div>
                  {suggestions.map(product => (
                    <div
                      key={product._id}
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <img 
                        src={`${process.env.REACT_APP_API_URL}${product.image_url}`}
                        alt={product.title}
                        className="w-8 h-8 object-cover rounded mr-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = require('../images/image 1.png');
                        }}
                      />
                      <span className="text-gray-900">{product.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchHistory.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-sm text-gray-500 px-2 py-1 flex items-center">
                    <FaHistory className="mr-2" /> История поиска:
                  </div>
                  {searchHistory.map((query, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(query)}
                      className="px-2 py-2 hover:bg-gray-100 cursor-pointer text-gray-900 flex justify-between items-center group"
                    >
                      <span>{query}</span>
                      <button
                        onClick={(e) => handleRemoveFromHistory(query, e)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Удалить из истории"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/cart" className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition">
            Корзина
          </Link>
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="flex items-center space-x-1 hover:text-blue-200">
                  <FaCog className="text-xl" />
                  <span className="hidden md:inline">Админ панель</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center space-x-1 hover:text-blue-200">
                <FaUser className="text-xl" />
                <span className="hidden md:inline">Профиль</span>
              </Link>
              <button 
                onClick={logout}
                className="flex items-center space-x-1 hover:text-blue-200"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="hidden md:inline">Выйти</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              >
                Войти
              </button>
              <button
                className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition"
                onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
      <LoginRegisterModal
        isOpen={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={m => setAuthMode(m)}
      />
    </header>
  );
};

export default Header;
