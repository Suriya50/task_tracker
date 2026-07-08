const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  todayWork: {
    type: String,
    required: true,
  },
  hoursWorked: {
    type: Number,
    required: true,
  },
  problems: String,
  tomorrowPlan: String,
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);