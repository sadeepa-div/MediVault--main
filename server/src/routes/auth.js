const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const notify = require('../notify');
const { sign, requireAuth, wrap } = require('../auth');

const publicUser = (u) => {
  const { password_hash, ...rest } = u;
  return rest;
};

function need(body, fields) {
  const missing = fields.filter((f) => !body[f] || String(body[f]).trim() === '');
  return missing.length ? `Please fill in: ${missing.join(', ').replace(/_/g, ' ')}` : null;
}

async function ensureUnique(username, email) {
  const [rows] = await db.query('SELECT username, email FROM users WHERE username = ? OR email = ?', [username, email]);
  if (rows.some((r) => r.username === username)) return 'That username is already taken';
  if (rows.some((r) => r.email === email)) return 'An account with that email already exists';
  return null;
}

// Customer sign up — active immediately.
router.post('/register', wrap(async (req, res) => {
  const b = req.body;
  const err = need(b, ['full_name', 'username', 'email', 'password']);
  if (err) return res.status(400).json({ error: err });
  if (b.password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const dup = await ensureUnique(b.username, b.email);
  if (dup) return res.status(409).json({ error: dup });
  const [r] = await db.query(
    `INSERT INTO users (role, username, email, password_hash, full_name, phone, address, status)
     VALUES ('customer',?,?,?,?,?,?,'approved')`,
    [b.username, b.email, await bcrypt.hash(b.password, 10), b.full_name, b.phone || null, b.address || null]
  );
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
  res.status(201).json({ token: sign(user), user: publicUser(user) });
}));

// Pharmacy owner sign up — waits for admin approval.
router.post('/register-owner', wrap(async (req, res) => {
  const b = req.body;
  const err = need(b, ['full_name', 'username', 'email', 'password', 'phone', 'birthday', 'id_no', 'address', 'pharmacy_name', 'license_no']);
  if (err) return res.status(400).json({ error: err });
  if (b.password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const dup = await ensureUnique(b.username, b.email);
  if (dup) return res.status(409).json({ error: dup });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO users (role, username, email, password_hash, full_name, phone, birthday, id_no, address, status)
       VALUES ('owner',?,?,?,?,?,?,?,?,'pending')`,
      [b.username, b.email, await bcrypt.hash(b.password, 10), b.full_name, b.phone, b.birthday, b.id_no, b.address]
    );
    await conn.query(
      `INSERT INTO pharmacies (owner_id, name, license_no, address, city, phone, email)
       VALUES (?,?,?,?,?,?,?)`,
      [r.insertId, b.pharmacy_name, b.license_no, b.pharmacy_address || b.address, b.city || null, b.pharmacy_phone || b.phone, b.email]
    );
    const [admins] = await conn.query("SELECT id FROM users WHERE role = 'admin'");
    for (const a of admins) {
      await notify(a.id, 'account', `${b.full_name} (${b.pharmacy_name}) is waiting for approval`, '/admin/approvals', conn);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  res.status(201).json({ message: 'Thanks! Your pharmacy account was submitted and will be active once an admin approves it.' });
}));

router.post('/login', wrap(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Enter your username and password' });
  const [[user]] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }
  if (user.status === 'pending') return res.status(403).json({ error: 'Your account is waiting for admin approval' });
  if (user.status === 'rejected') return res.status(403).json({ error: 'Your account was not approved. Please contact support.' });
  res.json({ token: sign(user), user: publicUser(user) });
}));

router.get('/me', requireAuth(), wrap(async (req, res) => {
  const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
}));

module.exports = router;
