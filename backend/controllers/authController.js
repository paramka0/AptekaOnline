import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';

class AuthController {
  static async register(req, res, next) {
    try {
      const { phone, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User(null, phone, hashedPassword, 0, null, null, null);
      await user.save();
      // Получаем пользователя с id из базы
      const savedUser = await User.getByPhone(phone);

      const token = jwt.sign(
        {
          id: savedUser.id,
          phone: savedUser.phone,
          isAdmin: Boolean(savedUser.isAdmin)
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES || '24h',
          algorithm: 'HS256'
        }
      );

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000, // 1 час
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: savedUser.id,
          phone: savedUser.phone,
          isAdmin: savedUser.isAdmin,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          gender: savedUser.gender
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      next(new ErrorHandler('Registration failed', 500));
    }
  }

  static async login(req, res, next) {
    try {
      const { phone, password } = req.body;
      
      const user = await User.getByPhone(phone);
      
      if (!user) {
        return next(new ErrorHandler('Invalid credentials', 401));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new ErrorHandler('Invalid credentials', 401));
      }

      // Генерация JWT токена
      const token = jwt.sign(
        { 
          id: user.id, 
          phone: user.phone, 
          isAdmin: Boolean(user.isAdmin)
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES || '24h',
          algorithm: 'HS256'
        }
      );

      // Установка токена в cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000, // 1 час
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          isAdmin: user.isAdmin,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      next(new ErrorHandler('Login failed', 500));
    }
  }

  static logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  static async getAllUsers(req, res, next) {
    try {
      const users = await User.getAll();
      res.status(200).json({
        success: true,
        users
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await User.getById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      if (user.isAdmin) {
        return next(new ErrorHandler('Cannot delete admin user', 403));
      }

      const deleted = await User.delete(userId);
      if (!deleted) {
        return next(new ErrorHandler('Error deleting user', 500));
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (err) {
      next(new ErrorHandler(err.message, 500));
    }
  }
}

export default AuthController;