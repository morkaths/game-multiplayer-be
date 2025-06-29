import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', roomController.getRooms); // Lấy toàn bộ phòng
router.get('/by-set', roomController.getRoomsByQuestionSetId); // Lấy phòng theo question_set_id: /rooms/by-set?question_set_id=
router.get('/by-host', roomController.getRoomsByHostId); // Lấy phòng theo host_id: /rooms/by-host?host_id=
router.get('/by-pin', roomController.getRoomByPin); // Lấy phòng theo pin: /rooms/by-pin?pin=
router.get('/reports', authenticateToken, roomController.getRoomReports); // Lấy danh sách báo cáo phòng: /rooms/reports?type=
router.get('/report/:id', authenticateToken, roomController.getRoomReport); // Lấy chi tiết báo cáo phòng
router.get('/player-reports/:id', authenticateToken, roomController.getPlayerReports); // Lấy danh sách báo cáo người chơi của phòng
router.get('/:id', roomController.getRoom); // Lấy chi tiết phòng

router.post('/', authenticateToken, roomController.createRoom); // Tạo phòng (cần đăng nhập)
router.post('/delete-many', authenticateToken, roomController.deleteManyRooms); // Xóa nhiều phòng
router.put('/:id', authenticateToken, roomController.updateRoom); // Cập nhật phòng (cần đăng nhập)
router.delete('/:id', authenticateToken, roomController.deleteRoom); // Xoá phòng (cần đăng nhập)

export default router;
