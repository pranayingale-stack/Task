// controllers/userController.js
const db = require('../db');

// Returns co-committee members only, for the Tech Head's "assignee" dropdown.
// Never returns password hashes.
function listMembers(req, res) {
  const members = db
    .prepare('SELECT id, username, name, role FROM users WHERE role = ? ORDER BY name ASC')
    .all('co_committee');
  res.json({ members });
}

module.exports = { listMembers };
