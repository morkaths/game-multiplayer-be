import express from 'express';
import { getHomePage, getTestPage } from '../controllers/homeController.js';
import authRoutes from './authRoutes.js';
import protectedRoutes from './protectedRoutes.js';
import questionRoutes from './questionRoutes.js';
import questionSetRoutes from './questionSetRoutes.js';
import answerRoutes from './answerRoutes.js';

const router = express.Router();

//router.get('/', getHomePage);

// Thêm routes xác thực
router.use('/auth', authRoutes);

// Thêm routes được bảo vệ
router.use('/protected', protectedRoutes);

router.use('/question-sets', questionSetRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);

export default router;