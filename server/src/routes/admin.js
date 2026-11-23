// Admin area: approve pharmacy owners, view users, overall sales analysis.
const router = require('express').Router();
const db = require('../db');
const notify = require('../notify');
const { requireAuth, wrap } = require('../auth');

router.use(requireAuth('admin'));

router.get('/owners', wrap(async (req, res) => {
  const args = [];
  let filter = '';
  if (req.query.status) { filter = 'AND u.status = ?'; args.push(req.query.status); }
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.birthday, u.id_no, u.address, u.status, u.created_at,
            p.id AS pharmacy_id, p.name AS pharmacy_name, p.license_no, p.city, p.phone AS pharmacy_phone
     FROM users u LEFT JOIN pharmacies p ON p.owner_id = u.id
     WHERE u.role = 'owner' ${filter} ORDER BY u.status = 'pending' DESC, u.created_at DESC`,
    args
  );
  res.json(rows);
}));

router.patch('/owners/:id', wrap(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const [r] = await db.query("UPDATE users SET status = ? WHERE id = ? AND role = 'owner'", [status, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Owner not found' });
  if (status === 'approved') await notify(req.params.id, 'account', 'Your pharmacy account was approved. Welcome to Medi_vault!', '/owner');
  res.json({ ok: true });
}));

router.get('/users', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.role, u.username, u.email, u.full_name, u.phone, u.status, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.customer_id = u.id) AS orders
     FROM users u ORDER BY u.created_at DESC`
  );
  res.json(rows);
}));

router.get('/analytics', wrap(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const [[summary]] = await db.query(
    `SELECT COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END),0) AS revenue, COUNT(*) AS orders,
            COALESCE(AVG(CASE WHEN status <> 'cancelled' THEN total END),0) AS avg_order
     FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [days]
  );
  const [[counts]] = await db.query(
    `SELECT SUM(role='customer') AS customers, SUM(role='owner' AND status='approved') AS pharmacies,
            SUM(role='owner' AND status='pending') AS pending_owners FROM users`
  );
  const [[meds]] = await db.query('SELECT COUNT(*) AS medicines FROM medicines');
  const [daily] = await db.query(
    `SELECT DATE(created_at) AS day, SUM(total) AS revenue, COUNT(*) AS orders FROM orders
     WHERE status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at) ORDER BY day`,
    [days]
  );
  const [byPharmacy] = await db.query(
    `SELECT p.name, p.city, COUNT(o.id) AS orders, COALESCE(SUM(o.total),0) AS revenue
     FROM pharmacies p LEFT JOIN orders o ON o.pharmacy_id = p.id AND o.status <> 'cancelled'
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     JOIN users u ON u.id = p.owner_id AND u.status = 'approved'
     GROUP BY p.id ORDER BY revenue DESC`,
    [days]
  );
  const [topMedicines] = await db.query(
    `SELECT i.medicine_name AS name, SUM(i.quantity) AS units, SUM(i.quantity * i.unit_price) AS revenue,
            COUNT(DISTINCT o.pharmacy_id) AS pharmacies
     FROM order_items i JOIN orders o ON o.id = i.order_id
     WHERE o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY i.medicine_name ORDER BY revenue DESC LIMIT 10`,
    [days]
  );
  const [byCategory] = await db.query(
    `SELECT COALESCE(m.category,'Other') AS category, SUM(i.quantity * i.unit_price) AS revenue
     FROM order_items i JOIN orders o ON o.id = i.order_id LEFT JOIN medicines m ON m.id = i.medicine_id
     WHERE o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY category ORDER BY revenue DESC`,
    [days]
  );
  res.json({ summary: { ...summary, ...counts, ...meds }, daily, byPharmacy, topMedicines, byCategory });
}));

module.exports = router;
