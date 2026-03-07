const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getQuizzes, getQuizById, createQuiz, submitQuiz, getQuizAttempts } = require('../controllers/quizController');


router.get('/quiz/quizzes', authenticateToken, getQuizzes);
router.get('/quiz/quizzes/:id', authenticateToken, getQuizById);
router.post('/quiz/create', authenticateToken, createQuiz);
router.post('/quiz/submit/:quizId', authenticateToken, submitQuiz);
router.get('/quiz/attempts/:quizId', authenticateToken, getQuizAttempts);

module.exports = router;