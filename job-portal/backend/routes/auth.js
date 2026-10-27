const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (u) => {
  const { password, ...rest } = u;
  return rest;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company_name } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const userRole = role === 'employer' ? 'employer' : 'jobseeker';

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO users (name, email, password, role, company_name) VALUES (?,?,?,?,?)',
      [name, email, hash, userRole, userRole === 'employer' ? company_name || null : null]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
    res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(rows[0]), user: publicUser(rows[0]) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', protect, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(rows[0]));
});

router.put('/me', protect, async (req, res) => {
  const { name, phone, location, headline, bio, company_name } = req.body;
  await pool.query(
    'UPDATE users SET name=COALESCE(?,name), phone=?, location=?, headline=?, bio=?, company_name=? WHERE id=?',
    [name || null, phone || null, location || null, headline || null, bio || null, company_name || null, req.user.id]
  );
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  res.json(publicUser(rows[0]));
});

router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(currentPassword || '', rows[0].password)))
    return res.status(400).json({ message: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  await pool.query('UPDATE users SET password=? WHERE id=?', [await bcrypt.hash(newPassword, 10), req.user.id]);
  res.json({ message: 'Password updated' });
});

module.exports = router;
