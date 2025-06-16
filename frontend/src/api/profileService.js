import api from './axiosConfig';

// Получение профиля пользователя
export const getProfile = async () => {
  try {
    const response = await api.get('/profile/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    throw error;
  }
};

// Обновление профиля пользователя
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/profile/', profileData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    throw error;
  }
};

// Удаление аккаунта
export const deleteAccount = async () => {
  try {
    const response = await api.delete('/profile/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении аккаунта:', error);
    throw error;
  }
}; 