const router = require('express').Router();
const pool = require('../config/db');
const { protect, allow } = require('../middleware/auth');

router.use(protect, allow('jobseeker'));

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT j.id, j.title, j.company, j.location, j.job_type, j.salary_min, j.salary_max
     FROM saved_jobs s JOIN jobs j ON j.id = s.job_id
     WHERE s.user_id = ? ORDER BY s.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// toggle save/unsave
router.post('/:jobId', async (req, res) => {
  const [ex] = await pool.query('SELECT id FROM saved_jobs WHERE user_id=? AND job_id=?', [req.user.id, req.params.jobId]);
  if (ex.length) {
    await pool.query('DELETE FROM saved_jobs WHERE id=?', [ex[0].id]);
    return res.json({ saved: false });
  }
  await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?,?)', [req.user.id, req.params.jobId]);
  res.json({ saved: true });
});

module.exports = router;
