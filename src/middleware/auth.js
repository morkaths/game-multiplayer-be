import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

// Middleware xác thực token JWT
export const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token xác thực'
    });
  }
  
  // Xác thực token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
        error: err.message,
        errorType: err.name
      });
    }
    // Lưu thông tin user vào request để sử dụng trong các route
    req.user = decoded;
    next();
  });
};

// Middleware xác thực role admin
export const requireAdmin = (req, res, next) => {
  // Kiểm tra xem đã xác thực token chưa
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần đăng nhập trước'
    });
  }
  
  // Kiểm tra role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện thao tác này'
    });
  }
  
  next();
}; 