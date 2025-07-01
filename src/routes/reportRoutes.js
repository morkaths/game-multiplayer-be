import express from 'express';
import * as reportCotroller from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();


export default router;
