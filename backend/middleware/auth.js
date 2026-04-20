const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'syscall_secret_key_2024';

// Verify JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Invalid or expired token.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Require admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.',
      code: 'INSUFFICIENT_PRIVILEGES'
    });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
