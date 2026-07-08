const express = require('express');
const router = express.Router();
const { getReports, createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getReports)
  .post(protect, createReport);

module.exports = router;