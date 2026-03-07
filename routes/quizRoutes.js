const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getQuizzes, getQuizById, createQuiz, submitQuiz, getQuizAttempts } = require('../controllers/quizController');

router.get('/', authenticateToken, getQuizzes);
router.get('/:id', authenticateToken, getQuizById);
router.post('/create', authenticateToken, createQuiz);
router.post('/submit/:quizId', authenticateToken, submitQuiz);
router.get('/attempts/:quizId', authenticateToken, getQuizAttempts);

module.exports = router;