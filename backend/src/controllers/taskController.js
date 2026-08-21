// controllers/taskController.js
// All task business logic lives here. Route handlers stay thin; this file
// is where role permissions are actually enforced (not just in the UI).

const db = require('../db');
const { validateTaskInput, STATUSES } = require('../utils/validate');
const { ApiError } = require('../middleware/errorHandler');

const TASK_SELECT = `
  SELECT
    t.id, t.title, t.description, t.status, t.priority, t.deadline,
    t.created_at, t.updated_at,
    t.assignee_id, au.name AS assignee_name, au.username AS assignee_username,
    t.created_by, cu.name AS created_by_name
  FROM tasks t
  LEFT JOIN users au ON au.id = t.assignee_id
  LEFT JOIN users cu ON cu.id = t.created_by
`;

function getTaskOr404(id) {
  const task = db.prepare(`${TASK_SELECT} WHERE t.id = ?`).get(id);
  if (!task) throw new ApiError(404, 'Task not found.');
  return task;
}

function assertAssigneeExists(assigneeId) {
  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(assigneeId);
  if (!user) throw new ApiError(400, 'Selected assignee does not exist.');
  if (user.role !== 'co_committee') {
    throw new ApiError(400, 'Tasks can only be assigned to Co-Committee Members.');
  }
  return user;
}

/**
 * GET /api/tasks
 * Tech Head: sees all tasks, with optional filters.
 * Co-Committee Member: sees only tasks assigned to them (filters still apply
 * on top of that restriction so they can't be used to view others' tasks).
 */
function listTasks(req, res, next) {
  try {
    const { status, priority, assigneeId } = req.query;
    const clauses = [];
    const params = [];

    if (req.user.role === 'co_committee') {
      clauses.push('t.assignee_id = ?');
      params.push(req.user.id);
    } else if (assigneeId) {
      clauses.push('t.assignee_id = ?');
      params.push(assigneeId);
    }

    if (status) {
      if (!STATUSES.includes(status)) throw new ApiError(400, 'Invalid status filter.');
      clauses.push('t.status = ?');
      params.push(status);
    }

    if (priority) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        throw new ApiError(400, 'Invalid priority filter.');
      }
      clauses.push('t.priority = ?');
      params.push(priority);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const tasks = db.prepare(`${TASK_SELECT} ${where} ORDER BY t.created_at DESC`).all(...params);

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

function getTask(req, res, next) {
  try {
    const task = getTaskOr404(req.params.id);
    if (req.user.role === 'co_committee' && task.assignee_id !== req.user.id) {
      // 404 rather than 403 so members can't probe which task IDs exist.
      throw new ApiError(404, 'Task not found.');
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

/** POST /api/tasks — Tech Head only. */
function createTask(req, res, next) {
  try {
    const { valid, errors } = validateTaskInput(req.body);
    if (!valid) throw new ApiError(400, 'Invalid task data.', errors);

    const { title, description = '', status = 'Pending', priority = 'Medium', deadline = null } = req.body;
    const assigneeId = Number(req.body.assigneeId);
    assertAssigneeExists(assigneeId);

    const info = db
      .prepare(
        `INSERT INTO tasks (title, description, assignee_id, created_by, status, priority, deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(title.trim(), description, assigneeId, req.user.id, status, priority, deadline || null);

    const task = getTaskOr404(info.lastInsertRowid);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/tasks/:id — Tech Head only. Full edit of any field. */
function updateTask(req, res, next) {
  try {
    const existing = getTaskOr404(req.params.id);

    const { valid, errors } = validateTaskInput(req.body, { partial: true });
    if (!valid) throw new ApiError(400, 'Invalid task data.', errors);

    const next_ = {
      title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
      description: req.body.description !== undefined ? req.body.description : existing.description,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      priority: req.body.priority !== undefined ? req.body.priority : existing.priority,
      deadline: req.body.deadline !== undefined ? req.body.deadline : existing.deadline,
      assigneeId: req.body.assigneeId !== undefined ? Number(req.body.assigneeId) : existing.assignee_id,
    };

    if (req.body.assigneeId !== undefined) assertAssigneeExists(next_.assigneeId);

    db.prepare(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, assignee_id = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(next_.title, next_.description, next_.status, next_.priority, next_.deadline, next_.assigneeId, existing.id);

    res.json({ task: getTaskOr404(existing.id) });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id/status
 * Tech Head: can update status on any task.
 * Co-Committee Member: can update status ONLY on tasks assigned to them,
 * and may only change the `status` field (nothing else).
 */
function updateStatus(req, res, next) {
  try {
    const existing = getTaskOr404(req.params.id);

    if (req.user.role === 'co_committee' && existing.assignee_id !== req.user.id) {
      throw new ApiError(403, 'You can only update the status of tasks assigned to you.');
    }

    const { status } = req.body;
    if (!status || !STATUSES.includes(status)) {
      throw new ApiError(400, 'A valid status is required.', {
        status: `Status must be one of: ${STATUSES.join(', ')}.`,
      });
    }

    db.prepare(`UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, existing.id);
    res.json({ task: getTaskOr404(existing.id) });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/tasks/:id — Tech Head only. */
function deleteTask(req, res, next) {
  try {
    const existing = getTaskOr404(req.params.id);
    db.prepare('DELETE FROM tasks WHERE id = ?').run(existing.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, updateStatus, deleteTask };
