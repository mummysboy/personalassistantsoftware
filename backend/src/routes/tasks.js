const express = require('express');
const pool = require('../db/connection');
const { authenticate, requireBoss } = require('../middleware/auth');

const router = express.Router();

// Helper to log activity
async function logActivity(taskId, userId, action, details = null) {
  await pool.query(
    'INSERT INTO activity_log (task_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
    [taskId, userId, action, details ? JSON.stringify(details) : null]
  );
}

// Helper to create notification
async function notify(userId, taskId, message) {
  await pool.query(
    'INSERT INTO notifications (user_id, task_id, message) VALUES ($1, $2, $3)',
    [userId, taskId, message]
  );
}

// GET /api/tasks/calendar - must be before :id route
router.get('/calendar', authenticate, async (req, res, next) => {
  try {
    const { start, end } = req.query;
    let query = `
      SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.due_date IS NOT NULL
    `;
    const params = [];
    if (start) {
      params.push(start);
      query += ` AND t.due_date >= $${params.length}`;
    }
    if (end) {
      params.push(end);
      query += ` AND t.due_date <= $${params.length}`;
    }
    query += ' ORDER BY t.due_date ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, assigned_to, category, search, due_start, due_end, sort, pinned } = req.query;

    let query = `
      SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id) as subtask_count,
        (SELECT COUNT(*) FROM subtasks WHERE task_id = t.id AND is_completed = true) as subtask_done_count
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND t.priority = $${params.length}`;
    }
    if (assigned_to) {
      params.push(assigned_to);
      query += ` AND t.assigned_to = $${params.length}`;
    }
    if (category) {
      params.push(category);
      query += ` AND t.category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`;
    }
    if (due_start) {
      params.push(due_start);
      query += ` AND t.due_date >= $${params.length}`;
    }
    if (due_end) {
      params.push(due_end);
      query += ` AND t.due_date <= $${params.length}`;
    }
    if (pinned === 'true') {
      query += ' AND t.is_pinned = true';
    }

    // Sort: pinned first, then by sort param
    query += ' ORDER BY t.is_pinned DESC';
    if (sort === 'due_date') {
      query += ', t.due_date ASC NULLS LAST';
    } else if (sort === 'priority') {
      query += `, CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END`;
    } else if (sort === 'created_at') {
      query += ', t.created_at DESC';
    } else {
      query += ', t.updated_at DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date, assigned_to, category } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, created_by, assigned_to, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description || null, status || 'todo', priority || null, due_date || null, req.user.id, assigned_to || null, category || 'general']
    );

    const task = result.rows[0];
    await logActivity(task.id, req.user.id, 'created', { title });

    // Notify assigned user if different from creator
    if (assigned_to && assigned_to !== req.user.id) {
      await notify(assigned_to, task.id, `${req.user.name} assigned you a task: "${title}"`);
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskResult = await pool.query(
      `SELECT t.*, u1.name as created_by_name, u2.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u1 ON t.created_by = u1.id
       LEFT JOIN users u2 ON t.assigned_to = u2.id
       WHERE t.id = $1`,
      [id]
    );

    if (!taskResult.rows[0]) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [subtasks, comments, attachments, activity] = await Promise.all([
      pool.query('SELECT * FROM subtasks WHERE task_id = $1 ORDER BY sort_order', [id]),
      pool.query(
        `SELECT c.*, u.name as user_name FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.task_id = $1 ORDER BY c.created_at ASC`,
        [id]
      ),
      pool.query(
        `SELECT a.*, u.name as uploaded_by_name FROM attachments a
         JOIN users u ON a.uploaded_by = u.id
         WHERE a.task_id = $1 ORDER BY a.created_at DESC`,
        [id]
      ),
      pool.query(
        `SELECT al.*, u.name as user_name FROM activity_log al
         JOIN users u ON al.user_id = u.id
         WHERE al.task_id = $1 ORDER BY al.created_at DESC LIMIT 50`,
        [id]
      ),
    ]);

    res.json({
      ...taskResult.rows[0],
      subtasks: subtasks.rows,
      comments: comments.rows,
      attachments: attachments.rows,
      activity: activity.rows,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to, category } = req.body;

    // Assistant can't self-approve awaiting_approval → done
    if (req.user.role === 'assistant' && status === 'done') {
      const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (check.rows[0] && check.rows[0].status === 'awaiting_approval') {
        return res.status(403).json({ error: 'Only the boss can approve tasks' });
      }
    }

    const oldTask = (await pool.query('SELECT * FROM tasks WHERE id = $1', [id])).rows[0];
    if (!oldTask) return res.status(404).json({ error: 'Task not found' });

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = $5,
        assigned_to = $6,
        category = COALESCE($7, category),
        updated_at = NOW()
      WHERE id = $8 RETURNING *`,
      [title, description, status, priority, due_date !== undefined ? due_date : oldTask.due_date, assigned_to !== undefined ? assigned_to : oldTask.assigned_to, category, id]
    );

    const updated = result.rows[0];

    // Log status change
    if (status && status !== oldTask.status) {
      await logActivity(id, req.user.id, 'status_changed', { from: oldTask.status, to: status });
      // Notify relevant users
      const otherUser = req.user.id === oldTask.created_by ? oldTask.assigned_to : oldTask.created_by;
      if (otherUser && otherUser !== req.user.id) {
        await notify(otherUser, id, `${req.user.name} changed "${oldTask.title}" status to ${status}`);
      }
    }

    // Log assignment change
    if (assigned_to !== undefined && assigned_to !== oldTask.assigned_to) {
      await logActivity(id, req.user.id, 'assigned', { from: oldTask.assigned_to, to: assigned_to });
      if (assigned_to && assigned_to !== req.user.id) {
        await notify(assigned_to, id, `${req.user.name} assigned you to "${oldTask.title}"`);
      }
    }

    if (title && title !== oldTask.title) {
      await logActivity(id, req.user.id, 'updated', { field: 'title', from: oldTask.title, to: title });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id (boss only)
router.delete('/:id', authenticate, requireBoss, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/pin
router.patch('/:id/pin', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE tasks SET is_pinned = NOT is_pinned, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
