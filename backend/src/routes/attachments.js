const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// POST /api/tasks/:taskId/attachments
router.post('/tasks/:taskId/attachments', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await pool.query(
      `INSERT INTO attachments (task_id, uploaded_by, filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.taskId, req.user.id, req.file.originalname, req.file.path, req.file.size, req.file.mimetype]
    );

    await pool.query(
      'INSERT INTO activity_log (task_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [req.params.taskId, req.user.id, 'attachment_added', JSON.stringify({ filename: req.file.originalname })]
    );

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [req.params.taskId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/attachments/:id/download
router.get('/attachments/:id/download', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Attachment not found' });

    const attachment = result.rows[0];
    res.download(attachment.file_path, attachment.filename);
  } catch (err) {
    next(err);
  }
});

// GET /api/attachments/:id/view — serve file inline (for PDFs, images)
router.get('/attachments/:id/view', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Attachment not found' });

    const attachment = result.rows[0];
    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
    res.sendFile(path.resolve(attachment.file_path));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/attachments/:id
router.delete('/attachments/:id', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM attachments WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Attachment not found' });

    // Try to delete file from disk
    try {
      fs.unlinkSync(result.rows[0].file_path);
    } catch { /* file may already be gone */ }

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
