import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api/orderService';
import CheckoutModal from '../components/CheckoutModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CartPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    totalPrice,
    clearCart
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      alert('Для оформления заказа необходимо авторизоваться');
      navigate('/login');
      return;
    }
    console.log('Opening modal, showModal:', true); // Логируем открытие модалки
    setShowModal(true);
  };

  const handleSubmitOrder = async (formData) => {
    try {
      setIsProcessing(true);
      console.log('Submitting order with data:', formData);
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        itemsPrice: totalPrice,
        taxPrice: 0, // налог убран
        shippingPrice: formData.deliveryMethod === 'pickup' ? 0 : 300, // 300 рублей за доставку
        totalPrice: totalPrice + (formData.deliveryMethod === 'pickup' ? 0 : 300),
        paymentMethod: formData.paymentMethod,
        deliveryMethod: formData.deliveryMethod,
        address: formData.address,
        phone: formData.phone
      };
      
      const response = await createOrder(orderData);
      console.log('Order created successfully:', response);
      
      clearCart();
      setShowModal(false);
      navigate('/profile');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(`Ошибка при оформлении заказа: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Корзина</h1>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl mb-4">Ваша корзина пуста</p>
              <button 
                onClick={() => navigate('/home')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-md mb-4 flex">
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${item.image_url}` || require('../images/image 1.png')} 
                      alt={item.title} 
                      className="w-24 h-24 object-cover mr-6"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require('../images/image 1.png');
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-gray-600 mb-2">Цена: {item.price}₽</p>
                      <div className="flex items-center mb-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-200 px-3 py-1 rounded-l"
                        >
                          -
                        </button>
                        <span className="bg-gray-100 px-4 py-1">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-200 px-3 py-1 rounded-r"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price * item.quantity}₽</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                <h2 className="text-xl font-bold mb-4">Итого</h2>
                <div className="flex justify-between mb-2">
                  <span>Товары ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>{totalPrice}₽</span>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Общая сумма</span>
                  <span>{totalPrice}₽</span>
                </div>
                <button 
                  onClick={handleCheckoutClick}
                  disabled={isProcessing}
                  className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Оформление...' : 'Оформить заказ'}
                </button>
              </div>
            </div>
          )}
          
          {showModal && (
            <CheckoutModal 
              onClose={() => {
                console.log('Closing modal');
                setShowModal(false);
              }}
              onSubmit={handleSubmitOrder}
              isProcessing={isProcessing}
              cartTotal={totalPrice}
            />
          )}
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
};

export default CartPage;