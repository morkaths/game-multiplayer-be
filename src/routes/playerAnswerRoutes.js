import express from 'express';
import * as playerAnswerController from '../controllers/playerAnswerController.js';

const router = express.Router();

router.post('/', playerAnswerController.submitAnswer);
router.get('/', async (req, res, next) => {
  if (req.query.player_id) return playerAnswerController.getAnswersByPlayer(req, res, next);
  if (req.query.room_id) return playerAnswerController.getAnswersByRoom(req, res, next);
  if (req.query.question_id) return playerAnswerController.getAnswersByQuestion(req, res, next);
  res.status(400).json({ success: false, message: 'Thiếu tham số truy vấn' });
});

export default router;
