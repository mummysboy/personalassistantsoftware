const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/recurring-tasks
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u1.name as created_by_name, u2.name as assigned_to_name
       FROM recurring_tasks r
       LEFT JOIN users u1 ON r.created_by = u1.id
       LEFT JOIN users u2 ON r.assigned_to = u2.id
       ORDER BY r.next_run ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/recurring-tasks
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, priority, category, assigned_to, frequency, day_of_week, day_of_month, next_run } = req.body;
    if (!title || !frequency || !next_run) {
      return res.status(400).json({ error: 'Title, frequency, and next_run are required' });
    }

    const result = await pool.query(
      `INSERT INTO recurring_tasks (title, description, priority, category, assigned_to, created_by, frequency, day_of_week, day_of_month, next_run)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, description, priority || null, category || 'general', assigned_to, req.user.id, frequency, day_of_week, day_of_month, next_run]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/recurring-tasks/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { title, description, priority, category, assigned_to, frequency, day_of_week, day_of_month, next_run, is_active } = req.body;

    const result = await pool.query(
      `UPDATE recurring_tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        category = COALESCE($4, category),
        assigned_to = $5,
        frequency = COALESCE($6, frequency),
        day_of_week = $7,
        day_of_month = $8,
        next_run = COALESCE($9, next_run),
        is_active = COALESCE($10, is_active)
      WHERE id = $11 RETURNING *`,
      [title, description, priority, category, assigned_to, frequency, day_of_week, day_of_month, next_run, is_active, req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Recurring task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/recurring-tasks/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM recurring_tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Recurring task not found' });
    res.json({ message: 'Recurring task deleted' });
  } catch (err) {
    next(err);
  }
});

// Process recurring tasks (called on server start and periodically)
async function processRecurringTasks() {
  try {
    const now = new Date();
    const result = await pool.query(
      'SELECT * FROM recurring_tasks WHERE is_active = true AND next_run <= $1',
      [now]
    );

    for (const template of result.rows) {
      // Create task from template
      await pool.query(
        `INSERT INTO tasks (title, description, priority, category, assigned_to, created_by, recurring_template_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [template.title, template.description, template.priority, template.category, template.assigned_to, template.created_by, template.id]
      );

      // Calculate next run
      let nextRun = new Date(template.next_run);
      if (template.frequency === 'daily') {
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (template.frequency === 'weekly') {
        nextRun.setDate(nextRun.getDate() + 7);
      } else if (template.frequency === 'monthly') {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }

      await pool.query('UPDATE recurring_tasks SET next_run = $1 WHERE id = $2', [nextRun, template.id]);
    }

    if (result.rows.length > 0) {
      console.log(`Processed ${result.rows.length} recurring tasks`);
    }
  } catch (err) {
    console.error('Error processing recurring tasks:', err);
  }
}

module.exports = router;
module.exports.processRecurringTasks = processRecurringTasks;
