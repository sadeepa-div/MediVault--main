// Public browsing: medicines, pharmacies, categories.
const router = require('express').Router();
const db = require('../db');
const { wrap } = require('../auth');

// Only pharmacies whose owners an admin has approved are visible to the public.
const VISIBLE = "JOIN users ow ON ow.id = p.owner_id AND ow.status = 'approved'";

router.get('/categories', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT m.category, COUNT(*) AS count FROM medicines m JOIN pharmacies p ON p.id = m.pharmacy_id ${VISIBLE}
     WHERE m.category IS NOT NULL GROUP BY m.category ORDER BY m.category`
  );
  res.json(rows);
}));

router.get('/medicines', wrap(async (req, res) => {
  const { q, category, city, pharmacy, inStock, sort } = req.query;
  const where = [];
  const args = [];
  if (q) {
    where.push('(m.name LIKE ? OR m.generic_name LIKE ? OR m.category LIKE ? OR p.name LIKE ?)');
    args.push(...Array(4).fill(`%${q}%`));
  }
  if (category) { where.push('m.category = ?'); args.push(category); }
  if (city) { where.push('p.city = ?'); args.push(city); }
  if (pharmacy) { where.push('p.id = ?'); args.push(pharmacy); }
  if (inStock === '1') where.push('m.stock_qty > 0');
  const order = { price_asc: 'm.price ASC', price_desc: 'm.price DESC', name: 'm.name ASC' }[sort] || 'm.stock_qty > 0 DESC, m.name ASC';
  const [rows] = await db.query(
    `SELECT m.*, p.name AS pharmacy_name, p.phone AS pharmacy_phone, p.city, p.is_open,
            (SELECT ROUND(AVG(rating),1) FROM feedback f WHERE f.pharmacy_id = p.id) AS pharmacy_rating
     FROM medicines m JOIN pharmacies p ON p.id = m.pharmacy_id ${VISIBLE}
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY ${order} LIMIT 200`,
    args
  );
  res.json(rows);
}));

router.get('/medicines/:id', wrap(async (req, res) => {
  const [[med]] = await db.query(
    `SELECT m.*, p.name AS pharmacy_name, p.phone AS pharmacy_phone, p.email AS pharmacy_email,
            p.address AS pharmacy_address, p.city, p.is_open, p.opening_hours
     FROM medicines m JOIN pharmacies p ON p.id = m.pharmacy_id ${VISIBLE} WHERE m.id = ?`,
    [req.params.id]
  );
  if (!med) return res.status(404).json({ error: 'Medicine not found' });
  // Same medicine at other pharmacies, so people can compare price and availability.
  const [alternatives] = await db.query(
    `SELECT m.id, m.price, m.stock_qty, p.name AS pharmacy_name, p.city, p.phone AS pharmacy_phone, p.is_open
     FROM medicines m JOIN pharmacies p ON p.id = m.pharmacy_id ${VISIBLE}
     WHERE m.name = ? AND m.id <> ? ORDER BY m.price`,
    [med.name, med.id]
  );
  const [reviews] = await db.query(
    `SELECT f.id, f.rating, f.comment, f.created_at, u.full_name, f.medicine_id
     FROM feedback f JOIN users u ON u.id = f.user_id
     WHERE f.pharmacy_id = ? AND (f.medicine_id = ? OR f.medicine_id IS NULL)
     ORDER BY f.created_at DESC LIMIT 20`,
    [med.pharmacy_id, med.id]
  );
  res.json({ ...med, alternatives, reviews });
}));

router.get('/pharmacies', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, p.address, p.city, p.phone, p.email, p.description, p.opening_hours, p.is_open, p.image_url,
            (SELECT COUNT(*) FROM medicines m WHERE m.pharmacy_id = p.id) AS medicine_count,
            (SELECT ROUND(AVG(rating),1) FROM feedback f WHERE f.pharmacy_id = p.id) AS rating,
            (SELECT COUNT(*) FROM feedback f WHERE f.pharmacy_id = p.id) AS review_count
     FROM pharmacies p ${VISIBLE} ORDER BY p.name`
  );
  res.json(rows);
}));

router.get('/pharmacies/:id', wrap(async (req, res) => {
  const [[p]] = await db.query(
    `SELECT p.id, p.name, p.address, p.city, p.phone, p.email, p.description, p.opening_hours, p.is_open, p.image_url,
            ow.full_name AS owner_name, ow.photo_url AS owner_photo,
            (SELECT ROUND(AVG(rating),1) FROM feedback f WHERE f.pharmacy_id = p.id) AS rating
     FROM pharmacies p ${VISIBLE} WHERE p.id = ?`,
    [req.params.id]
  );
  if (!p) return res.status(404).json({ error: 'Pharmacy not found' });
  const [reviews] = await db.query(
    `SELECT f.rating, f.comment, f.created_at, u.full_name FROM feedback f JOIN users u ON u.id = f.user_id
     WHERE f.pharmacy_id = ? ORDER BY f.created_at DESC LIMIT 20`,
    [p.id]
  );
  res.json({ ...p, reviews });
}));

module.exports = router;
