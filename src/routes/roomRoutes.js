import express from 'express';
import * as roomController from '../controllers/roomController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', roomController.getRooms); // Lấy danh sách phòng
router.get('/:id', roomController.getRoom); // Lấy chi tiết phòng
router.post('/', authMiddleware, roomController.createRoom); // Tạo phòng (cần đăng nhập)
router.put('/:id', authMiddleware, roomController.updateRoom); // Cập nhật phòng
router.delete('/:id', authMiddleware, roomController.deleteRoom); // Xoá phòng

export default router;
