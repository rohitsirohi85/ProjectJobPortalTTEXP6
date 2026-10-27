const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const pool = require('../config/db');
const { protect, allow } = require('../middleware/auth');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /\.(pdf|doc|docx)$/i.test(file.originalname)
      ? cb(null, true)
      : cb(new Error('Only PDF, DOC or DOCX files allowed')),
});

// Job seeker: my applications (declared before "/:jobId" routes)
router.get('/mine', protect, allow('jobseeker'), async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.id, a.job_id, a.status, a.created_at, j.title, j.company, j.location
     FROM applications a JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = ? ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// Employer: applicants for one of my jobs
router.get('/job/:jobId', protect, allow('employer'), async (req, res) => {
  const [jobs] = await pool.query('SELECT id, title FROM jobs WHERE id=? AND employer_id=?', [req.params.jobId, req.user.id]);
  if (!jobs.length) return res.status(404).json({ message: 'Job not found' });
  const [rows] = await pool.query(
    `SELECT a.id, a.status, a.cover_letter, a.resume_path, a.created_at,
            u.name, u.email, u.phone, u.location, u.headline
     FROM applications a JOIN users u ON u.id = a.user_id
     WHERE a.job_id = ? ORDER BY a.created_at DESC`,
    [req.params.jobId]
  );
  res.json({ job: jobs[0], applicants: rows });
});

// Employer: update status
router.patch('/:id/status', protect, allow('employer'), async (req, res) => {
  const { status } = req.body;
  if (!['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  const [r] = await pool.query(
    `UPDATE applications a JOIN jobs j ON j.id = a.job_id
     SET a.status = ? WHERE a.id = ? AND j.employer_id = ?`,
    [status, req.params.id, req.user.id]
  );
  if (!r.affectedRows) return res.status(404).json({ message: 'Application not found' });
  res.json({ message: 'Status updated' });
});

// Job seeker: apply (optional resume upload in field "resume")
router.post('/:jobId', protect, allow('jobseeker'), (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const [jobs] = await pool.query('SELECT id FROM jobs WHERE id=? AND is_active=1', [req.params.jobId]);
      if (!jobs.length) return res.status(404).json({ message: 'Job not found or closed' });
      await pool.query(
        'INSERT INTO applications (job_id, user_id, cover_letter, resume_path) VALUES (?,?,?,?)',
        [req.params.jobId, req.user.id, req.body.cover_letter || null, req.file ? req.file.filename : null]
      );
      res.status(201).json({ message: 'Application submitted' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'You already applied to this job' });
      console.error(e);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

module.exports = router;
