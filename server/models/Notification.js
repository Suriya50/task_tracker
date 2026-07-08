const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['task', 'message', 'meeting', 'report', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'typeModel',
  },
  typeModel: {
    type: String,
    enum: ['Task', 'Message', 'Meeting', 'Report', 'Project'],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);