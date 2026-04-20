const express = require('express');
const router = express.Router();
const { getSystemCalls, executeSystemCall } = require('../controllers/syscallController');
const { authenticateToken } = require('../middleware/auth');
const { syscallLimiter } = require('../middleware/rateLimiter');

// GET /system-calls
router.get('/', authenticateToken, getSystemCalls);

// POST /system-calls/execute
router.post('/execute', authenticateToken, syscallLimiter, executeSystemCall);

module.exports = router;
