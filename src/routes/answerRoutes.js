import express from 'express';
import * as answerController from '../controllers/answerController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

router.get("/:id", answerController.getAnswer);
router.get("/", answerController.getAnswers); //query: /answers?question_id=

router.post("/", authenticateToken, answerController.createAnswer);
router.put("/:id", authenticateToken, answerController.updateAnswer);
router.delete("/:id", authenticateToken, answerController.deleteAnswer);

export default router;
