import express from 'express';
import authenticateToken from '../middleware/auth.js';
import { getMe, googleAuth, register, login } from '../controllers/authController.js';

const router = express.Router();

router.get('/auth/me', authenticateToken, getMe);
router.post('/api/auth/google', googleAuth);
router.post('/registration', register);
router.post('/login', login);

export default router;