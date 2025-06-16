import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const LoginRegisterModal = ({ isOpen, mode, onClose, onSwitchMode }) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setAgree(false);
    setMessage('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/login', { phone, password });
      const userData = response.data.user;
      login(userData, response.data.token);
      handleClose();
    } catch (error) {
      setMessage('Пользователь не найден или номер/пароль введены неверно');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    if (!agree) {
      setMessage('Необходимо дать согласие на обработку персональных данных');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают');
      setLoading(false);
      return;
    }
    try {
      const response = await api.post('/register', {
        phone,
        password
      });
      login(response.data.user, response.data.token);
      handleClose();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        {mode === 'login' ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Вход</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Номер телефона:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black placeholder-gray-400"
                  placeholder="Введите номер телефона"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Пароль:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black placeholder-gray-400"
                  placeholder="Введите пароль"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>
            {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
            <div className="mt-4 text-center">
              <span className="text-gray-900">Нет аккаунта?</span>{' '}
              <button className="text-blue-600 hover:underline" onClick={() => { onSwitchMode('register'); resetForm(); }}>
                Зарегистрируйтесь
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Регистрация</h2>
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Номер телефона:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black placeholder-gray-400"
                  placeholder="Введите номер телефона"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Пароль:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black placeholder-gray-400"
                  placeholder="Введите пароль"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Повторите пароль:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white text-black placeholder-gray-400"
                  placeholder="Повторите пароль"
                />
              </div>
              <div className="mb-4 flex items-start">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="agree" className="text-xs text-gray-900 select-none">
                  Даю согласие на обработку персональных данных в соответствии с <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">политикой в отношении обработки персональных данных</a>, <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">политикой конфиденциальности</a>, соглашаюсь с <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">пользовательским соглашением</a>
                </label>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
            {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
            <div className="mt-4 text-center">
              <span className="text-gray-900">Уже есть аккаунт?</span>{' '}
              <button className="text-blue-600 hover:underline" onClick={() => { onSwitchMode('login'); resetForm(); }}>
                Войти
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginRegisterModal; 