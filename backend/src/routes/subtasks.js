const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// POST /api/tasks/:id/subtasks
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM subtasks WHERE task_id = $1',
      [id]
    );

    const result = await pool.query(
      'INSERT INTO subtasks (task_id, title, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [id, title, maxOrder.rows[0].next_order]
    );

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id/subtasks/:subtaskId
router.put('/:subtaskId', authenticate, async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const { title, is_completed, sort_order } = req.body;

    const result = await pool.query(
      `UPDATE subtasks SET
        title = COALESCE($1, title),
        is_completed = COALESCE($2, is_completed),
        sort_order = COALESCE($3, sort_order)
      WHERE id = $4 RETURNING *`,
      [title, is_completed, sort_order, subtaskId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Subtask not found' });

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id/subtasks/:subtaskId
router.delete('/:subtaskId', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM subtasks WHERE id = $1 RETURNING *', [req.params.subtaskId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Subtask not found' });
    res.json({ message: 'Subtask deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
