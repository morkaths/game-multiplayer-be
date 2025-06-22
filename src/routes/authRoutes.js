import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Route đăng ký và đăng nhập
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Route Google
router.post('/google-login', AuthController.googleLogin);

// Route quên mật khẩu & reset mật khẩu
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Route lấy thông tin người dùng hiện tại (được bảo vệ bằng middleware)
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;