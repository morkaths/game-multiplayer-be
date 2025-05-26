import express from 'express';
import * as homeController from '../controllers/homeController.js';

const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/test', homeController.getTestPage);

export default router;