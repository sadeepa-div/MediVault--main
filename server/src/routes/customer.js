// Cart, checkout, orders and feedback for logged-in customers.
const router = require('express').Router();
const db = require('../db');
const notify = require('../notify');
const { requireAuth, wrap } = require('../auth');

router.use(requireAuth('customer'));

const CART_SQL = `SELECT c.id, c.quantity, m.id AS medicine_id, m.name, m.price, m.stock_qty, m.image_url, m.category,
                         m.requires_prescription, p.id AS pharmacy_id, p.name AS pharmacy_name, p.is_open,
                         p.bank_name, p.bank_account_no, p.bank_account_name
                  FROM cart_items c JOIN medicines m ON m.id = c.medicine_id JOIN pharmacies p ON p.id = m.pharmacy_id
                  WHERE c.user_id = ? ORDER BY p.name, m.name`;

router.get('/cart', wrap(async (req, res) => {
  const [rows] = await db.query(CART_SQL, [req.user.id]);
  res.json(rows);
}));

router.post('/cart', wrap(async (req, res) => {
  const qty = Math.max(1, Number(req.body.quantity) || 1);
  const [[m]] = await db.query('SELECT stock_qty FROM medicines WHERE id = ?', [req.body.medicine_id]);
  if (!m) return res.status(404).json({ error: 'Medicine not found' });
  if (m.stock_qty <= 0) return res.status(400).json({ error: 'This item is out of stock' });
  await db.query(
    `INSERT INTO cart_items (user_id, medicine_id, quantity) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)`,
    [req.user.id, req.body.medicine_id, Math.min(qty, m.stock_qty), m.stock_qty]
  );
  const [rows] = await db.query(CART_SQL, [req.user.id]);
  res.json(rows);
}));

router.patch('/cart/:id', wrap(async (req, res) => {
  const qty = Math.max(1, Number(req.body.quantity) || 1);
  await db.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [qty, req.params.id, req.user.id]);
  const [rows] = await db.query(CART_SQL, [req.user.id]);
  res.json(rows);
}));

router.delete('/cart/:id', wrap(async (req, res) => {
  await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  const [rows] = await db.query(CART_SQL, [req.user.id]);
  res.json(rows);
}));

// Checkout: one order per pharmacy, stock is reserved immediately.
router.post('/checkout', wrap(async (req, res) => {
  const { payment_method, delivery_address, contact_phone, note } = req.body;
  if (!['cash_on_delivery', 'card', 'bank_transfer'].includes(payment_method)) {
    return res.status(400).json({ error: 'Choose a payment method' });
  }
  if (!delivery_address || !contact_phone) return res.status(400).json({ error: 'Delivery address and phone are required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [cart] = await conn.query(CART_SQL + ' FOR UPDATE', [req.user.id]);
    if (!cart.length) throw Object.assign(new Error('Your cart is empty'), { status: 400 });
    const byPharmacy = new Map();
    for (const item of cart) {
      if (item.quantity > item.stock_qty) {
        throw Object.assign(new Error(`Only ${item.stock_qty} of ${item.name} left at ${item.pharmacy_name}`), { status: 400 });
      }
      if (!byPharmacy.has(item.pharmacy_id)) byPharmacy.set(item.pharmacy_id, []);
      byPharmacy.get(item.pharmacy_id).push(item);
    }
    const orderIds = [];
    for (const [pharmacyId, items] of byPharmacy) {
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const [o] = await conn.query(
        `INSERT INTO orders (customer_id, pharmacy_id, total, payment_method, payment_status, delivery_address, contact_phone, note)
         VALUES (?,?,?,?,?,?,?,?)`,
        [req.user.id, pharmacyId, total.toFixed(2), payment_method, payment_method === 'card' ? 'paid' : 'unpaid',
         delivery_address, contact_phone, note || null]
      );
      for (const i of items) {
        await conn.query(
          'INSERT INTO order_items (order_id, medicine_id, medicine_name, unit_price, quantity) VALUES (?,?,?,?,?)',
          [o.insertId, i.medicine_id, i.name, i.price, i.quantity]
        );
        await conn.query('UPDATE medicines SET stock_qty = stock_qty - ? WHERE id = ?', [i.quantity, i.medicine_id]);
      }
      const [[ph]] = await conn.query('SELECT owner_id FROM pharmacies WHERE id = ?', [pharmacyId]);
      await notify(ph.owner_id, 'order', `New order #${o.insertId} from ${req.user.name} — Rs. ${total.toFixed(2)}`, '/owner/orders', conn);
      // Low stock alert for the owner
      const [low] = await conn.query(
        'SELECT name, stock_qty FROM medicines WHERE pharmacy_id = ? AND id IN (?) AND stock_qty <= low_stock_threshold',
        [pharmacyId, items.map((i) => i.medicine_id)]
      );
      for (const l of low) await notify(ph.owner_id, 'stock', `${l.name} is running low (${l.stock_qty} left)`, '/owner/inventory', conn);
      orderIds.push(o.insertId);
    }
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ orderIds });
  } catch (e) {
    await conn.rollback();
    if (e.status) return res.status(e.status).json({ error: e.message });
    throw e;
  } finally {
    conn.release();
  }
}));

router.get('/orders', wrap(async (req, res) => {
  const [orders] = await db.query(
    `SELECT o.*, p.name AS pharmacy_name, p.phone AS pharmacy_phone,
            (SELECT COUNT(*) FROM order_items i WHERE i.order_id = o.id) AS item_count
     FROM orders o JOIN pharmacies p ON p.id = o.pharmacy_id WHERE o.customer_id = ? ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(orders);
}));

router.get('/orders/:id', wrap(async (req, res) => {
  const [[order]] = await db.query(
    `SELECT o.*, p.name AS pharmacy_name, p.phone AS pharmacy_phone, p.address AS pharmacy_address,
            p.bank_name, p.bank_account_no, p.bank_account_name
     FROM orders o JOIN pharmacies p ON p.id = o.pharmacy_id WHERE o.id = ? AND o.customer_id = ?`,
    [req.params.id, req.user.id]
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const [items] = await db.query(
    `SELECT i.*, m.image_url, m.category FROM order_items i LEFT JOIN medicines m ON m.id = i.medicine_id WHERE i.order_id = ?`,
    [order.id]
  );
  res.json({ ...order, items });
}));

router.patch('/orders/:id/cancel', wrap(async (req, res) => {
  const [[order]] = await db.query('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled' });
  await db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);
  await db.query(
    `UPDATE medicines m JOIN order_items i ON i.medicine_id = m.id SET m.stock_qty = m.stock_qty + i.quantity WHERE i.order_id = ?`,
    [order.id]
  );
  const [[ph]] = await db.query('SELECT owner_id FROM pharmacies WHERE id = ?', [order.pharmacy_id]);
  await notify(ph.owner_id, 'order', `Order #${order.id} was cancelled by the customer`, '/owner/orders');
  res.json({ ok: true });
}));

router.post('/feedback', wrap(async (req, res) => {
  const { pharmacy_id, medicine_id, rating, comment } = req.body;
  const r = Number(rating);
  if (!pharmacy_id || !(r >= 1 && r <= 5)) return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars' });
  await db.query('INSERT INTO feedback (user_id, pharmacy_id, medicine_id, rating, comment) VALUES (?,?,?,?,?)',
    [req.user.id, pharmacy_id, medicine_id || null, r, comment || null]);
  const [[ph]] = await db.query('SELECT owner_id FROM pharmacies WHERE id = ?', [pharmacy_id]);
  if (ph) await notify(ph.owner_id, 'feedback', `${req.user.name} left a ${r}★ review`, '/owner/feedback');
  res.status(201).json({ ok: true });
}));

module.exports = router;
