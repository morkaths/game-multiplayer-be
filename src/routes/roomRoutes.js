import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', roomController.getRooms); // Lấy toàn bộ phòng
router.get('/by-host', roomController.getRoomsByHostId); // Lấy phòng theo host_id: /rooms/by-host?host_id=
router.get('/by-pin', roomController.getRoomByPin); // Lấy phòng theo pin: /rooms/by-pin?pin=
router.get('/:id', roomController.getRoom); // Lấy chi tiết phòng
router.post('/', authenticateToken, roomController.createRoom); // Tạo phòng (cần đăng nhập)
router.put('/:id', authenticateToken, roomController.updateRoom); // Cập nhật phòng (cần đăng nhập)
router.delete('/:id', authenticateToken, roomController.deleteRoom); // Xoá phòng (cần đăng nhập)

export default router;
