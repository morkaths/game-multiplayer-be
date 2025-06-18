import express from 'express';
import * as playerController from '../controllers/playerController.js';

const router = express.Router();

router.get('/', playerController.getPlayers); // query: /players?room_id=
router.get('/by-pin', playerController.getPlayersByPin); // query: /players/by-pin?pin=
router.get('/:id', playerController.getPlayer); // Lấy chi tiết player

router.post('/', playerController.createPlayer); // Thêm player vào room
router.put('/:id', playerController.updatePlayer); // Cập nhật player
router.delete('/:id', playerController.deletePlayer); // Xoá player

export default router;
