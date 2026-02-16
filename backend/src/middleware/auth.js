const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

function authenticate(req, res, next) {
  let token;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireBoss(req, res, next) {
  if (req.user.role !== 'boss') {
    return res.status(403).json({ error: 'Boss access required' });
  }
  next();
}

module.exports = { authenticate, requireBoss };
