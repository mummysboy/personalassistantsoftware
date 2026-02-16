const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/tasks/:id/activity
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name as user_name FROM activity_log al
       JOIN users u ON al.user_id = u.id
       WHERE al.task_id = $1 ORDER BY al.created_at DESC LIMIT 100`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
