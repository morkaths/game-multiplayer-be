import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as playerController from '../controllers/playerController.js';
import uploadAvatar from '../middleware/uploadAvatar.js';

const router = express.Router();

router.get('/' , authenticateToken, playerController.getPlayers); // Lấy danh sách player trong room (query: room_id)
router.get('/:id', playerController.getPlayer); // Lấy chi tiết player
router.post('/', uploadAvatar.single('avatar'), playerController.createPlayer); // Thêm player vào room
router.put('/:id', playerController.updatePlayer); // Cập nhật player
router.delete('/:id', playerController.deletePlayer); // Xoá player

export default router;
