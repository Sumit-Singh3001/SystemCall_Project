const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /auth/login
router.post('/login', authLimiter, login);

// GET /auth/me - protected
router.get('/me', authenticateToken, me);

module.exports = router;
