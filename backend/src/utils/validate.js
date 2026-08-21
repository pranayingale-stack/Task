// utils/validate.js
// Small dependency-free validation helpers. Deliberately explicit rather
// than "magic" so the rules are easy to audit and explain.

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function validateTaskInput(body, { partial = false } = {}) {
  const errors = {};
  const { title, description, assigneeId, status, priority, deadline } = body;

  if (!partial || title !== undefined) {
    if (!isNonEmptyString(title)) errors.title = 'Title is required and cannot be empty.';
    else if (title.length > 150) errors.title = 'Title must be 150 characters or fewer.';
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.description = 'Description must be text.';
  }
  if (description !== undefined && description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.';
  }

  if (!partial || assigneeId !== undefined) {
    if (assigneeId === undefined || assigneeId === null || Number.isNaN(Number(assigneeId))) {
      errors.assigneeId = 'A valid assignee must be selected.';
    }
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${STATUSES.join(', ')}.`;
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
  }

  if (!partial || deadline !== undefined) {
    if (deadline !== undefined && deadline !== null && deadline !== '' && !isValidDate(deadline)) {
      errors.deadline = 'Deadline must be a valid date.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateLoginInput(body) {
  const errors = {};
  if (!isNonEmptyString(body.username)) errors.username = 'Username is required.';
  if (!isNonEmptyString(body.password)) errors.password = 'Password is required.';
  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateTaskInput, validateLoginInput, STATUSES, PRIORITIES };
