import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import uploadQuestionImage from '../middleware/uploadQuestionImage.js';
import * as questionController from '../controllers/questionController.js';

const router = express.Router();

// router.get('/', questionController.getQuestions); // query: /questions?question_set_id=
// router.get('/:id', questionController.getQuestion);
// router.post('/', uploadQuestionImage.single('image'), questionController.createQuestion);
// router.put('/:id', uploadQuestionImage.single('image'), questionController.updateQuestion);
// router.delete('/:id', questionController.deleteQuestion);

router.get('/', questionController.getQuestions); // query: /questions?question_set_id=
router.get('/:id', questionController.getQuestion);

// api/questions/
router.post('/', authenticateToken, uploadQuestionImage.single('image'), questionController.createQuestion);
router.put('/:id', authenticateToken, uploadQuestionImage.single('image'), questionController.updateQuestion);
router.delete('/:id', authenticateToken, questionController.deleteQuestion);

export default router;
