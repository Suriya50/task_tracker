const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  meetingLink: String,
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Ended', 'Cancelled'],
    default: 'Scheduled',
  },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);