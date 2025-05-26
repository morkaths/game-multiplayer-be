import express from 'express';
import { changePassword, resetPassword, updateProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/change-password', authMiddleware, changePassword);
router.post('/reset-password', resetPassword);
router.put('/profile', authMiddleware, updateProfile);

export default router;
