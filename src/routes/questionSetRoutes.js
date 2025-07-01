import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as questionSetController from '../controllers/questionSetController.js';

const router = express.Router();

router.get('/', questionSetController.getQuestionSets); // Lấy toàn bộ bộ câu hỏi
router.get('/search', questionSetController.searchQuestionSets); // Tìm kiếm bộ câu hỏi
router.get('/by-user', questionSetController.getQuestionSetsByUser); // Lấy bộ câu hỏi theo user_id: /question-sets/by-user?user_id=
router.get('/me', authenticateToken, questionSetController.getMyQuestionSets); // Lấy bộ câu hỏi của user đang đăng nhập
router.get('/:id', questionSetController.getQuestionSet); // Lấy chi tiết bộ câu hỏi
router.get('/stats/:id', questionSetController.getQuestionSetStats); // Thống kê

router.post('/', authenticateToken, questionSetController.createQuestionSet); // Tạo bộ câu hỏi (cần đăng nhập)
router.put('/:id', authenticateToken, questionSetController.updateQuestionSet); // Cập nhật bộ câu hỏi (cần đăng nhập)
router.delete('/:id', authenticateToken, questionSetController.deleteQuestionSet); // Xoá bộ câu hỏi (cần đăng nhập)

export default router;