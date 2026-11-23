// Pharmacy owner area: profile, shop status, medicines/inventory, orders, feedback, sales analysis.
const router = require('express').Router();
const db = require('../db');
const notify = require('../notify');
const upload = require('../upload');
const { requireAuth, wrap } = require('../auth');

router.use(requireAuth('owner'));

// Load the owner's pharmacy for every request.
router.use(wrap(async (req, res, next) => {
  const [[p]] = await db.query('SELECT * FROM pharmacies WHERE owner_id = ?', [req.user.id]);
  if (!p) return res.status(404).json({ error: 'No pharmacy linked to this account' });
  req.pharmacy = p;
  next();
}));

router.get('/profile', wrap(async (req, res) => {
  const [[u]] = await db.query(
    'SELECT id, username, email, full_name, phone, birthday, id_no, address, photo_url FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json({ owner: u, pharmacy: req.pharmacy });
}));

router.put('/profile', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'shop_image', maxCount: 1 }]), wrap(async (req, res) => {
  const b = req.body;
  const photo = req.files?.photo?.[0] ? `/uploads/${req.files.photo[0].filename}` : undefined;
  const shopImg = req.files?.shop_image?.[0] ? `/uploads/${req.files.shop_image[0].filename}` : undefined;
  await db.query(
    `UPDATE users SET full_name = COALESCE(?, full_name), phone = ?, email = COALESCE(?, email), address = ?,
            photo_url = COALESCE(?, photo_url) WHERE id = ?`,
    [b.full_name || null, b.phone || null, b.email || null, b.address || null, photo || null, req.user.id]
  );
  await db.query(
    `UPDATE pharmacies SET name = COALESCE(?, name), address = ?, city = ?, phone = ?, email = ?, description = ?,
            opening_hours = ?, bank_name = ?, bank_account_no = ?, bank_account_name = ?, image_url = COALESCE(?, image_url)
     WHERE id = ?`,
    [b.pharmacy_name || null, b.pharmacy_address || null, b.city || null, b.pharmacy_phone || null, b.pharmacy_email || null,
     b.description || null, b.opening_hours || null, b.bank_name || null, b.bank_account_no || null, b.bank_account_name || null,
     shopImg || null, req.pharmacy.id]
  );
  const [[u]] = await db.query(
    'SELECT id, username, email, full_name, phone, birthday, id_no, address, photo_url FROM users WHERE id = ?', [req.user.id]
  );
  const [[p]] = await db.query('SELECT * FROM pharmacies WHERE id = ?', [req.pharmacy.id]);
  res.json({ owner: u, pharmacy: p });
}));

router.patch('/shop-status', wrap(async (req, res) => {
  const open = req.body.is_open ? 1 : 0;
  await db.query('UPDATE pharmacies SET is_open = ? WHERE id = ?', [open, req.pharmacy.id]);
  res.json({ is_open: open });
}));

// ---- Medicines / inventory ----
router.get('/medicines', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.*, COALESCE((SELECT SUM(i.quantity) FROM order_items i JOIN orders o ON o.id = i.order_id
                           WHERE i.medicine_id = m.id AND o.status <> 'cancelled'), 0) AS units_sold
     FROM medicines m WHERE m.pharmacy_id = ? ORDER BY m.name`,
    [req.pharmacy.id]
  );
  res.json(rows);
}));

const MED_FIELDS = ['name', 'generic_name', 'category', 'manufacturer', 'dosage', 'description', 'price', 'stock_qty', 'low_stock_threshold', 'requires_prescription'];
function medValues(b) {
  return MED_FIELDS.map((f) => {
    if (f === 'requires_prescription') return b[f] === 'true' || b[f] === '1' || b[f] === true ? 1 : 0;
    if (f === 'low_stock_threshold') return b[f] === undefined || b[f] === '' ? 10 : Number(b[f]);
    if (['price', 'stock_qty'].includes(f)) return Number(b[f] || 0);
    return b[f] || null;
  });
}

router.post('/medicines', upload.single('image'), wrap(async (req, res) => {
  if (!req.body.name || !req.body.price) return res.status(400).json({ error: 'Name and price are required' });
  const img = req.file ? `/uploads/${req.file.filename}` : null;
  const [r] = await db.query(
    `INSERT INTO medicines (pharmacy_id, ${MED_FIELDS.join(', ')}, image_url) VALUES (?, ${MED_FIELDS.map(() => '?').join(', ')}, ?)`,
    [req.pharmacy.id, ...medValues(req.body), img]
  );
  const [[m]] = await db.query('SELECT * FROM medicines WHERE id = ?', [r.insertId]);
  res.status(201).json(m);
}));

router.put('/medicines/:id', upload.single('image'), wrap(async (req, res) => {
  const img = req.file ? `/uploads/${req.file.filename}` : null;
  const [r] = await db.query(
    `UPDATE medicines SET ${MED_FIELDS.map((f) => `${f} = ?`).join(', ')}, image_url = COALESCE(?, image_url)
     WHERE id = ? AND pharmacy_id = ?`,
    [...medValues(req.body), img, req.params.id, req.pharmacy.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: 'Medicine not found' });
  const [[m]] = await db.query('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
  res.json(m);
}));

router.patch('/medicines/:id/stock', wrap(async (req, res) => {
  const delta = Number(req.body.delta || 0);
  await db.query('UPDATE medicines SET stock_qty = GREATEST(stock_qty + ?, 0) WHERE id = ? AND pharmacy_id = ?',
    [delta, req.params.id, req.pharmacy.id]);
  const [[m]] = await db.query('SELECT * FROM medicines WHERE id = ?', [req.params.id]);
  res.json(m);
}));

router.delete('/medicines/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM medicines WHERE id = ? AND pharmacy_id = ?', [req.params.id, req.pharmacy.id]);
  res.json({ ok: true });
}));

// ---- Orders ----
router.get('/orders', wrap(async (req, res) => {
  const args = [req.pharmacy.id];
  let filter = '';
  if (req.query.status) { filter = 'AND o.status = ?'; args.push(req.query.status); }
  const [orders] = await db.query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.customer_id WHERE o.pharmacy_id = ? ${filter} ORDER BY o.created_at DESC`,
    args
  );
  if (orders.length) {
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id IN (?)', [orders.map((o) => o.id)]);
    for (const o of orders) o.items = items.filter((i) => i.order_id === o.id);
  }
  res.json({ orders, bank: { bank_name: req.pharmacy.bank_name, bank_account_no: req.pharmacy.bank_account_no, bank_account_name: req.pharmacy.bank_account_name } });
}));

const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['ready', 'cancelled'], ready: ['completed'], completed: [], cancelled: [] };
router.patch('/orders/:id', wrap(async (req, res) => {
  const [[o]] = await db.query('SELECT * FROM orders WHERE id = ? AND pharmacy_id = ?', [req.params.id, req.pharmacy.id]);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const { status, payment_status } = req.body;
  if (status) {
    if (!NEXT[o.status].includes(status)) return res.status(400).json({ error: `Cannot move an order from ${o.status} to ${status}` });
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, o.id]);
    if (status === 'cancelled') {
      await db.query(
        'UPDATE medicines m JOIN order_items i ON i.medicine_id = m.id SET m.stock_qty = m.stock_qty + i.quantity WHERE i.order_id = ?',
        [o.id]
      );
    }
    if (status === 'completed') await db.query("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [o.id]);
    const label = { confirmed: 'was confirmed', ready: 'is ready', completed: 'was completed', cancelled: 'was cancelled by the pharmacy' }[status];
    await notify(o.customer_id, 'order', `Your order #${o.id} from ${req.pharmacy.name} ${label}`, `/orders/${o.id}`);
  }
  if (payment_status === 'paid') await db.query("UPDATE orders SET payment_status = 'paid' WHERE id = ?", [o.id]);
  const [[updated]] = await db.query('SELECT * FROM orders WHERE id = ?', [o.id]);
  res.json(updated);
}));

// ---- Feedback ----
router.get('/feedback', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.*, u.full_name, m.name AS medicine_name FROM feedback f JOIN users u ON u.id = f.user_id
     LEFT JOIN medicines m ON m.id = f.medicine_id WHERE f.pharmacy_id = ? ORDER BY f.created_at DESC`,
    [req.pharmacy.id]
  );
  res.json(rows);
}));

// ---- Sales analysis ----
router.get('/analytics', wrap(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const pid = req.pharmacy.id;
  const [[summary]] = await db.query(
    `SELECT COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total END), 0) AS revenue,
            COUNT(*) AS orders,
            SUM(status = 'pending') AS pending,
            COALESCE(AVG(CASE WHEN status <> 'cancelled' THEN total END), 0) AS avg_order
     FROM orders WHERE pharmacy_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [pid, days]
  );
  const [daily] = await db.query(
    `SELECT DATE(created_at) AS day, SUM(total) AS revenue, COUNT(*) AS orders FROM orders
     WHERE pharmacy_id = ? AND status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at) ORDER BY day`,
    [pid, days]
  );
  const [top] = await db.query(
    `SELECT i.medicine_name AS name, SUM(i.quantity) AS units, SUM(i.quantity * i.unit_price) AS revenue
     FROM order_items i JOIN orders o ON o.id = i.order_id
     WHERE o.pharmacy_id = ? AND o.status <> 'cancelled' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY i.medicine_name ORDER BY revenue DESC LIMIT 8`,
    [pid, days]
  );
  const [byPayment] = await db.query(
    `SELECT payment_method, COUNT(*) AS orders, SUM(total) AS revenue FROM orders
     WHERE pharmacy_id = ? AND status <> 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY payment_method`,
    [pid, days]
  );
  const [[stock]] = await db.query(
    `SELECT COUNT(*) AS total, SUM(stock_qty = 0) AS out_of_stock, SUM(stock_qty > 0 AND stock_qty <= low_stock_threshold) AS low_stock
     FROM medicines WHERE pharmacy_id = ?`,
    [pid]
  );
  const [[rating]] = await db.query('SELECT ROUND(AVG(rating),1) AS avg, COUNT(*) AS count FROM feedback WHERE pharmacy_id = ?', [pid]);
  res.json({ summary, daily, top, byPayment, stock, rating, is_open: req.pharmacy.is_open, pharmacy_name: req.pharmacy.name });
}));

module.exports = router;
