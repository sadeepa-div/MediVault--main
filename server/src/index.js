require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/catalog'));
app.use('/api/me', require('./routes/customer'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve the built React app in production (after `npm run build` in client/)
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(dist));
app.get(/^\/(?!api|uploads).*/, (req, res, next) => res.sendFile(path.join(dist, 'index.html'), (err) => err && next()));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  res.status(status).json({ error: status === 500 ? 'Something went wrong on the server' : err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Medi_vault API running on http://localhost:${port}`));
