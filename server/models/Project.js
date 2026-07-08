const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true,
  },
  description: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Active', 'OnHold', 'Completed'],
    default: 'Active',
  },
  startDate: Date,
  endDate: Date,
  deadline: Date,
  files: [{
    name: String,
    url: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);