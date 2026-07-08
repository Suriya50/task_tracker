const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['profile', 'attachment'],
    default: 'attachment',
  },
  size: {
    type: Number,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['User', 'Task', 'Project', 'Message'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('File', FileSchema);