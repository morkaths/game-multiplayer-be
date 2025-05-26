import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as questionSetController from '../controllers/questionSetController.js';
import uploadQuestionSetImage from '../middleware/uploadQuestionSetImage.js';

const router = express.Router();

// router.get('/', getQuestionSets);
// router.get('/:id', getQuestionSet);
// router.post('/', createQuestionSet);
// router.put('/:id', updateQuestionSet);
// router.delete('/:id', deleteQuestionSet);
router.get('/', questionSetController.getQuestionSets);
router.get('/by-user', questionSetController.getQuestionSetsByUser); // query: /question-sets/by-user?user_id=
router.get('/my-sets', authenticateToken, questionSetController.getMyQuestionSets);
router.get('/:id', questionSetController.getQuestionSet);

router.post('/', authenticateToken, uploadQuestionSetImage.single('image'), questionSetController.createQuestionSet);
router.put('/:id', authenticateToken, uploadQuestionSetImage.single('image'), questionSetController.updateQuestionSet);
router.delete('/:id', authenticateToken, questionSetController.deleteQuestionSet);

export default router;
