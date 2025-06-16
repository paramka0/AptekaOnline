import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Header from './Header';
import Footer from './Footer';

const RegisterForm = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/register`, { phone, password });
      setMessage(response.data.message);
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }
      navigate('/'); // Перенаправление на главную страницу после успешной регистрации
    } catch (error) {
      if (error.response) {
        setMessage('Ошибка регистрации: ' + error.response.data.message);
      } else {
        setMessage('Ошибка регистрации: ' + error.message);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen"> {/* Обернул в flex контейнер для заполнения высоты */}
      <Header />
      <div className="flex-grow max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"> {/* Убрал отступ снизу */}
        <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Номер телефона:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Зарегистрироваться
          </button>
        </form>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
      <Footer /> {/* Убрал отступ снизу */}
    </div>
  );
};

export default RegisterForm;
