const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getMe, googleAuth, register, login } = require('../controllers/authController');

router.get('/me', authenticateToken, getMe);
router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);

module.exports = router;