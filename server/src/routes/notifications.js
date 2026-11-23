const router = require('express').Router();
const db = require('../db');
const { requireAuth, wrap } = require('../auth');

router.use(requireAuth());

router.get('/', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50', [req.user.id]);
  res.json(rows);
}));

router.patch('/read-all', wrap(async (req, res) => {
  await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
