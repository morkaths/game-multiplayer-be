import express from 'express';
import { getHomePage, getTestPage } from '../controllers/homeController.js';
import authRoutes from './authRoutes.js';
import protectedRoutes from './protectedRoutes.js';
import userRoutes from './userRoutes.js';
import questionRoutes from './questionRoutes.js';
import questionSetRoutes from './questionSetRoutes.js';
import answerRoutes from './answerRoutes.js';
import roomRoutes from './roomRoutes.js';
import playerRoutes from './playerRoutes.js';
import playerAnswerRoutes from './playerAnswerRoutes.js';
import reportRoutes from './reportRoutes.js';
const router = express.Router();

//router.get('/', getHomePage);

// Thêm routes xác thực
router.use('/auth', authRoutes);

// Thêm routes được bảo vệ
router.use('/protected', protectedRoutes);

router.use('/users', userRoutes);
router.use('/question-sets', questionSetRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/rooms', roomRoutes);
router.use('/players', playerRoutes);
router.use('/player-answers', playerAnswerRoutes);
router.use('/reports', reportRoutes);
export default router;