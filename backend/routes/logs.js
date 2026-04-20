const express = require('express');
const router = express.Router();
const { getLogs, clearLogs } = require('../controllers/logsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /logs
router.get('/', authenticateToken, getLogs);

// DELETE /logs - admin only
router.delete('/', authenticateToken, requireAdmin, clearLogs);

module.exports = router;
