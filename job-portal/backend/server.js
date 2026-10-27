require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const initDb = require('./config/initDb');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/saved', require('./routes/saved'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('❌ Database connection/init failed:', err.message);
    console.error('Check backend/.env credentials and make sure the database exists.');
    process.exit(1);
  });
