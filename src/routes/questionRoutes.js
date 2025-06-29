import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

router.get('/', questionController.getQuestions); // query: /questions?question_set_id=
router.get('/:id', questionController.getQuestion);

// api/questions/
router.post('/', authenticateToken, questionController.createQuestion);
router.put('/:id', authenticateToken, questionController.updateQuestion);
router.delete('/:id', authenticateToken, questionController.deleteQuestion);

export default router;
