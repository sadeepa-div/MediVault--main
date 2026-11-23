const jwt = require('jsonwebtoken');

const SECRET = () => process.env.JWT_SECRET || 'dev_secret';

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.full_name }, SECRET(), { expiresIn: '7d' });
}

// Attaches req.user when a valid token is present; rejects otherwise.
function requireAuth(...roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Please log in first' });
    try {
      req.user = jwt.verify(token, SECRET());
    } catch {
      return res.status(401).json({ error: 'Session expired, please log in again' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have access to this page' });
    }
    next();
  };
}

// Small helper so async route errors reach the error handler.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { sign, requireAuth, wrap };
