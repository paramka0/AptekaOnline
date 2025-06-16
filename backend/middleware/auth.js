import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncErrors from './catchAsyncErrors.js';
import User from '../models/User.js';
import db from '../utils/database.js';

// Check if user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  let token;
  
  // Check Authorization header first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Fallback to cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorHandler('Login first to access this resource', 401));
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return next(new ErrorHandler('Server configuration error', 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { 
      algorithms: ['HS256'],
      ignoreExpiration: false
    });
    
    // Проверка структуры токена
    if (!decoded.id || !decoded.phone || typeof decoded.isAdmin === 'undefined') {
      console.error('Invalid token structure:', decoded);
      return next(new ErrorHandler('Invalid token structure', 401));
    }

    // Получаем пользователя из базы данных
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        if (!row) {
          console.error('User not found for id:', decoded.id);
          return resolve(null);
        }
        resolve(new User(row.id, row.phone, row.password, row.isAdmin));
      });
    });
    
    if (!user) {
      return next(new ErrorHandler('User not found for this token', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorHandler('Token expired. Please login again', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorHandler('Invalid token. Please login again', 401));
    }
    return next(new ErrorHandler('Authentication error', 401));
  }
});

// Handle user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user.isAdmin) {
      return next(
        new ErrorHandler(
          `У вас нет прав для доступа к этому ресурсу`,
          403
        )
      );
    }
    next();
  };
};