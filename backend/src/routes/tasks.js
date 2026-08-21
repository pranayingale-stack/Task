const express = require('express');
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', listTasks);
router.get('/:id', getTask);

router.post('/', authorize('tech_head'), createTask);
router.put('/:id', authorize('tech_head'), updateTask);
router.delete('/:id', authorize('tech_head'), deleteTask);

// Both roles hit this route, but the controller enforces that a
// Co-Committee Member may only touch their own assigned tasks.
router.patch('/:id/status', authorize('tech_head', 'co_committee'), updateStatus);

module.exports = router;
