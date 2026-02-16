const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/tasks/:id/comments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name as user_name FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1 ORDER BY c.created_at ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks/:id/comments
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const result = await pool.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, req.user.id, content]
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (task_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [req.params.id, req.user.id, 'commented', JSON.stringify({ content: content.substring(0, 100) })]
    );

    // Notify other user
    const task = (await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])).rows[0];
    if (task) {
      const otherUser = req.user.id === task.created_by ? task.assigned_to : task.created_by;
      if (otherUser && otherUser !== req.user.id) {
        await pool.query(
          'INSERT INTO notifications (user_id, task_id, message) VALUES ($1, $2, $3)',
          [otherUser, req.params.id, `${req.user.name} commented on "${task.title}"`]
        );
      }
    }

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [req.params.id]);

    // Return comment with user name
    const comment = await pool.query(
      `SELECT c.*, u.name as user_name FROM comments c
       JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
      [result.rows[0].id]
    );
    res.status(201).json(comment.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
