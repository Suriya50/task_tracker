const express = require('express');
const router = express.Router();
const {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

// ─── GET ALL MEETINGS ───
router.get('/', protect, getMeetings);

// ─── CREATE MEETING ───
router.post('/', protect, authorize('Admin', 'Manager'), createMeeting);

// ─── UPDATE MEETING ───
router.put('/:id', protect, authorize('Admin', 'Manager'), updateMeeting);

// ─── DELETE MEETING ───
router.delete('/:id', protect, authorize('Admin'), deleteMeeting);

module.exports = router;