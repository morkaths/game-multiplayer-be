import express from 'express';
import * as reportCotroller from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/all', authenticateToken, reportCotroller.getReports); // Lấy danh sách báo cáo phòng: /reports/all?type=
router.get('/roomroom/:id', authenticateToken, reportCotroller.getRoomReport); // Lấy chi tiết báo cáo phòng
router.get('/players/:id', authenticateToken, reportCotroller.getPlayerReports); // Lấy danh sách báo cáo người chơi của phòng

export default router;
