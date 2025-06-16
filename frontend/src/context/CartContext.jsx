import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as addToCartApi, removeFromCart as removeFromCartApi, updateCartItem as updateCartItemApi } from '../api/apiService';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = useAuth();

  // Загрузка корзины при монтировании
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          // Загружаем корзину с сервера для авторизованных пользователей
          const { data } = await getCart();
          if (data.cart) {
            setCartItems(data.cart);
          }
        } catch (error) {
          console.error('Ошибка при загрузке корзины:', error);
          // Если не удалось загрузить с сервера, пробуем загрузить из localStorage
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        }
      } else {
        // Для неавторизованных пользователей загружаем из localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Сохранение корзины при изменении
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (isAuthenticated) {
        // Синхронизируем с сервером для авторизованных пользователей
        await addToCartApi(product.id, quantity);
      }
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { 
          id: product.id,
          title: product.title,
          price: product.price,
          image_url: product.image_url,
          quantity 
        }];
      });
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      // Показываем ошибку пользователю
      alert(error.response?.data?.message || 'Ошибка при добавлении в корзину');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        // Синхронизируем с сервером для авторизованных пользователей
        await removeFromCartApi(productId);
      }
      
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (isAuthenticated) {
        // Синхронизируем с сервером для авторизованных пользователей
        await updateCartItemApi(productId, quantity);
      }
      
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Ошибка при обновлении количества:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // Очищаем корзину на сервере для авторизованных пользователей
        await Promise.all(cartItems.map(item => removeFromCartApi(item.id)));
      }
      
      setCartItems([]);
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
