const db = require('./db');

async function notify(userId, type, message, link = null, conn = db) {
  await conn.query('INSERT INTO notifications (user_id, type, message, link) VALUES (?,?,?,?)', [userId, type, message, link]);
}

module.exports = notify;
