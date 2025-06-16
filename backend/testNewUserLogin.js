import axios from 'axios';

const testNewUserLogin = async () => {
  const phone = '+79999999999'; // Номер телефона нового пользователя
  const password = '123456'; // Пароль нового пользователя

  try {
    const response = await axios.post('http://localhost:5000/api/login', { phone, password });
    console.log(response.data);
  } catch (error) {
    console.error('Ошибка входа:', error.response.data);
  }
};

testNewUserLogin();
