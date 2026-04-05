import express from 'express';
import authenticateToken from '../middleware/auth.js';
import {
    getQuizzes, getQuizById,
    createQuiz, submitQuiz, getQuizAttempts
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/quiz/quizzes', authenticateToken, getQuizzes);
router.get('/quiz/quizzes/:id', authenticateToken, getQuizById);
router.post('/quiz/create', authenticateToken, createQuiz);
router.post('/quiz/submit/:quizId', authenticateToken, submitQuiz);
router.get('/quiz/attempts/:quizId', authenticateToken, getQuizAttempts);

export default router;