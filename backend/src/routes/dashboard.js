const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const [statusCounts, overdue, dueToday, dueThisWeek, recentActivity] = await Promise.all([
      pool.query(`
        SELECT status, COUNT(*) as count FROM tasks GROUP BY status
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM tasks
        WHERE due_date < NOW() AND status != 'done'
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM tasks
        WHERE due_date::date = CURRENT_DATE AND status != 'done'
      `),
      pool.query(`
        SELECT COUNT(*) as count FROM tasks
        WHERE due_date >= CURRENT_DATE AND due_date < CURRENT_DATE + INTERVAL '7 days' AND status != 'done'
      `),
      pool.query(`
        SELECT al.*, u.name as user_name, t.title as task_title
        FROM activity_log al
        JOIN users u ON al.user_id = u.id
        JOIN tasks t ON al.task_id = t.id
        ORDER BY al.created_at DESC LIMIT 20
      `),
    ]);

    const stats = {
      todo: 0,
      in_progress: 0,
      waiting: 0,
      awaiting_approval: 0,
      done: 0,
    };
    statusCounts.rows.forEach((row) => {
      stats[row.status] = parseInt(row.count);
    });

    res.json({
      statusCounts: stats,
      overdue: parseInt(overdue.rows[0].count),
      dueToday: parseInt(dueToday.rows[0].count),
      dueThisWeek: parseInt(dueThisWeek.rows[0].count),
      totalTasks: Object.values(stats).reduce((a, b) => a + b, 0),
      recentActivity: recentActivity.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
