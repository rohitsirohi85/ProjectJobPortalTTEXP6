const router = require('express').Router();
const pool = require('../config/db');
const { protect, allow } = require('../middleware/auth');

// Public: search + filter + pagination
router.get('/', async (req, res) => {
  try {
    const { search, location, type, category, minSalary } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const where = ['is_active = 1'];
    const params = [];

    if (search) {
      where.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (location) { where.push('location LIKE ?'); params.push(`%${location}%`); }
    if (type) { where.push('job_type = ?'); params.push(type); }
    if (category) { where.push('category = ?'); params.push(category); }
    if (minSalary) { where.push('salary_max >= ?'); params.push(Number(minSalary)); }

    const w = where.join(' AND ');
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM jobs WHERE ${w}`, params);
    const [jobs] = await pool.query(
      `SELECT id, title, company, location, job_type, category, salary_min, salary_max, created_at,
              LEFT(description, 220) AS snippet
       FROM jobs WHERE ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT DISTINCT category FROM jobs WHERE is_active=1 AND category IS NOT NULL ORDER BY category'
  );
  res.json(rows.map((r) => r.category));
});

// Employer: my jobs (with applicant counts)
router.get('/employer/mine', protect, allow('employer'), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicants
     FROM jobs j WHERE employer_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Job not found' });
  res.json(rows[0]);
});

const fields = (b) => [
  b.title, b.company, b.location, b.job_type || 'Full-time', b.category || null,
  b.salary_min || null, b.salary_max || null, b.description, b.requirements || null,
  b.is_active === false || b.is_active === 0 ? 0 : 1,
];

router.post('/', protect, allow('employer'), async (req, res) => {
  const b = req.body;
  if (!b.title || !b.company || !b.location || !b.description)
    return res.status(400).json({ message: 'Title, company, location and description are required' });
  const [r] = await pool.query(
    `INSERT INTO jobs (employer_id, title, company, location, job_type, category, salary_min, salary_max, description, requirements, is_active)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [req.user.id, ...fields(b)]
  );
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', protect, allow('employer'), async (req, res) => {
  const [r] = await pool.query(
    `UPDATE jobs SET title=?, company=?, location=?, job_type=?, category=?, salary_min=?, salary_max=?,
     description=?, requirements=?, is_active=? WHERE id=? AND employer_id=?`,
    [...fields(req.body), req.params.id, req.user.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
  res.json({ message: 'Job updated' });
});

router.delete('/:id', protect, allow('employer'), async (req, res) => {
  const [r] = await pool.query('DELETE FROM jobs WHERE id=? AND employer_id=?', [req.params.id, req.user.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
  res.json({ message: 'Job deleted' });
});

module.exports = router;
