const express = require('express');
const { listMembers } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Only the Tech Head needs the member list, to populate the assignee dropdown.
router.get('/members', authenticate, authorize('tech_head'), listMembers);

module.exports = router;
