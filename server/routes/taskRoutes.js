const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin', 'Manager'), createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, authorize('Admin', 'Manager'), deleteTask);

module.exports = router;