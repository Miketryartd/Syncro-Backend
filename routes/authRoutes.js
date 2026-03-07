const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getMe, googleAuth, register, login } = require('../controllers/authController');


router.get('/auth/me', authenticateToken, getMe);
router.post('/api/auth/google', googleAuth);
router.post('/registration', register);
router.post('/login', login);

module.exports = router;