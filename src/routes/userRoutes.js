import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', userController.getUsers); // Lấy tất cả user
router.get('/by-username', userController.getUserByUsername); // Lấy user theo username: /users/by-username?username=
router.get('/by-email', userController.getUserByEmail); // Lấy user theo email: /users/by-email?email=
router.get('/:id', userController.getUserById); // Lấy user theo id

router.post('/reset-password', userController.resetPassword); // Đặt lại mật khẩu
router.post('/change-password', authenticateToken, userController.changePassword); // Đổi mật khẩu
router.put('/profile', authenticateToken, userController.updateProfile); // Cập nhật thông tin user

export default router;
