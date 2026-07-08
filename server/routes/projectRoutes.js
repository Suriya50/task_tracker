const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'Manager'), createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('Admin', 'Manager'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;