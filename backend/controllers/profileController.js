import User from '../models/User.js';
import ErrorHandler from '../utils/errorHandler.js';

class ProfileController {
  // Получение профиля пользователя
  static async getProfile(req, res, next) {
    try {
      console.log('Получение профиля для пользователя:', req.user.id);
      const user = await User.getById(req.user.id);
      if (!user) {
        console.error('Пользователь не найден:', req.user.id);
        return next(new ErrorHandler('Пользователь не найден', 404));
      }

      console.log('Профиль пользователя:', {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender
      });

      res.status(200).json({
        success: true,
        profile: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          profileUpdatedAt: user.profileUpdatedAt
        }
      });
    } catch (err) {
      console.error('Ошибка при получении профиля:', err);
      next(new ErrorHandler(err.message, 500));
    }
  }

  // Обновление профиля пользователя
  static async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, gender } = req.body;
      console.log('Обновление профиля. Данные:', { firstName, lastName, gender });
      console.log('ID пользователя:', req.user.id);
      
      // Валидация пола
      if (gender && !['male', 'female', 'other'].includes(gender)) {
        console.error('Некорректное значение пола:', gender);
        return next(new ErrorHandler('Некорректное значение пола', 400));
      }

      const user = await User.getById(req.user.id);
      if (!user) {
        console.error('Пользователь не найден:', req.user.id);
        return next(new ErrorHandler('Пользователь не найден', 404));
      }

      console.log('Текущие данные пользователя:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender
      });

      // Обновляем только переданные поля
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.gender = gender || user.gender;

      console.log('Новые данные пользователя:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender
      });

      await user.updateProfile();
      console.log('Профиль успешно обновлен');

      res.status(200).json({
        success: true,
        message: 'Профиль успешно обновлен',
        profile: {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          profileUpdatedAt: user.profileUpdatedAt
        }
      });
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      next(new ErrorHandler(err.message, 500));
    }
  }

  // Удаление аккаунта
  static async deleteAccount(req, res, next) {
    try {
      console.log('Удаление аккаунта пользователя:', req.user.id);
      
      const user = await User.getById(req.user.id);
      if (!user) {
        console.error('Пользователь не найден:', req.user.id);
        return next(new ErrorHandler('Пользователь не найден', 404));
      }

      // Удаляем пользователя
      await User.delete(req.user.id);
      console.log('Аккаунт успешно удален');

      res.status(200).json({
        success: true,
        message: 'Аккаунт успешно удален'
      });
    } catch (err) {
      console.error('Ошибка при удалении аккаунта:', err);
      next(new ErrorHandler(err.message, 500));
    }
  }
}

export default ProfileController; 