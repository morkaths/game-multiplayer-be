import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Route được bảo vệ bởi token
router.get('/user-content', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Đây là nội dung được bảo vệ cho người dùng đã đăng nhập',
    user: req.user
  });
});

// Route chỉ dành cho admin
router.get('/admin-content', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Đây là nội dung dành cho admin',
    user: req.user
  });
});

export default router; 