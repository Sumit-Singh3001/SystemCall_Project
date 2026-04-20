const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB } = require('../middleware/db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.', code: 'MISSING_FIELDS' });
    }

    // Sanitize input - strip special chars
    const sanitizedUsername = String(username).trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (sanitizedUsername !== username.trim()) {
      return res.status(400).json({ error: 'Invalid characters in username.', code: 'INVALID_INPUT' });
    }

    const users = readDB('users.json');
    const user = users.find(u => u.username === sanitizedUsername);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.', code: 'INVALID_CREDENTIALS' });
    }

    // Compare hashed password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.', code: 'INVALID_CREDENTIALS' });
    }

    // Generate JWT token (expires in 8 hours)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.', code: 'SERVER_ERROR' });
  }
};

// GET /auth/me - get current user from token
const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, me };
