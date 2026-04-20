const { readDB, writeDB } = require('../middleware/db');

// GET /logs - fetch logs with optional filter/search
const getLogs = (req, res) => {
  try {
    const { search, status, user: filterUser, action, limit = 100, offset = 0 } = req.query;
    let logs = readDB('logs.json');

    // Search across multiple fields
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.username.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q) ||
        (l.error && l.error.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (status && status !== 'ALL') {
      logs = logs.filter(l => l.status === status.toUpperCase());
    }

    // Filter by user
    if (filterUser) {
      logs = logs.filter(l => l.username.toLowerCase().includes(filterUser.toLowerCase()));
    }

    // Filter by action
    if (action && action !== 'ALL') {
      logs = logs.filter(l => l.action === action);
    }

    const total = logs.length;

    // Paginate
    const paginated = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    // Summary stats
    const allLogs = readDB('logs.json');
    const stats = {
      total: allLogs.length,
      success: allLogs.filter(l => l.status === 'SUCCESS').length,
      failed: allLogs.filter(l => l.status === 'FAILED').length
    };

    res.json({ logs: paginated, total, stats });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to load logs.', code: 'SERVER_ERROR' });
  }
};

// DELETE /logs - admin only: clear all logs
const clearLogs = (req, res) => {
  try {
    writeDB('logs.json', []);
    res.json({ message: 'All logs cleared successfully.' });
  } catch (err) {
    console.error('Error clearing logs:', err);
    res.status(500).json({ error: 'Failed to clear logs.', code: 'SERVER_ERROR' });
  }
};

module.exports = { getLogs, clearLogs };
