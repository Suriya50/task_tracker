const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    unique: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Employee'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);