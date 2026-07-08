const User = require('../models/User');
const Company = require('../models/Company');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// ─── GET USERS FOR CHAT SIDEBAR (ROLE‑BASED) ───
exports.getChatUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const currentRole = req.user.role;

    let companyId = req.user.company?._id || req.user.company;
    let companyName = req.user.company?.name || '';

    if (!companyId || typeof companyId === 'string') {
      const company = await Company.findOne({ name: companyName });
      if (company) {
        companyId = company._id;
      } else {
        const userDoc = await User.findById(currentUserId).populate('company');
        if (userDoc?.company) {
          companyId = userDoc.company._id;
          companyName = userDoc.company.name;
        }
      }
    }

    let rolesToShow = [];
    if (currentRole === 'Admin') {
      rolesToShow = ['Manager', 'Employee'];
    } else if (currentRole === 'Manager') {
      rolesToShow = ['Admin', 'Employee'];
    } else {
      rolesToShow = ['Admin', 'Manager'];
    }

    const users = await User.find({
      company: companyId,
      role: { $in: rolesToShow },
      _id: { $ne: currentUserId }
    })
      .select('-password')
      .populate('company', 'name')
      .sort({ name: 1 });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL USERS ───
exports.getUsers = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const currentUserId = req.user.id;

    let companyObjectId = companyId;
    if (typeof companyId === 'string' && !mongoose.Types.ObjectId.isValid(companyId)) {
      const company = await Company.findOne({ name: companyId });
      if (company) {
        companyObjectId = company._id;
      } else {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }
    }

    const users = await User.find({
      company: companyObjectId,
      _id: { $ne: currentUserId },
    })
      .select('-password')
      .populate('company', 'name')
      .sort({ name: 1 });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE USER ───
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('company', 'name');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userCompanyId = user.company?._id || user.company;
    const reqCompanyId = req.user.company?._id || req.user.company;
    if (String(userCompanyId) !== String(reqCompanyId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE USER (ADMIN ONLY) ───
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userCompanyId = user.company?._id || user.company;
    const reqCompanyId = req.user.company?._id || req.user.company;
    if (String(userCompanyId) !== String(reqCompanyId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE USER (ADMIN ONLY) ───
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userCompanyId = user.company?._id || user.company;
    const reqCompanyId = req.user.company?._id || req.user.company;
    if (String(userCompanyId) !== String(reqCompanyId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (String(user._id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    await user.remove();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE OWN PROFILE ───
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD AVATAR (LOCAL STORAGE) ───
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old avatar file if it's a local file
    if (user.profilePicture && user.profilePicture.includes('/uploads/')) {
      const oldPath = path.join(__dirname, '../', user.profilePicture.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.warn('Could not delete old avatar:', err.message);
        }
      }
    }

    // Generate URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

    // Update user's profile picture
    user.profilePicture = fileUrl;
    await user.save();

    res.json({
      success: true,
      data: { profilePicture: fileUrl },
    });
  } catch (error) {
    console.error('❌ uploadAvatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Avatar upload failed',
    });
  }
};

// ─── CHANGE PASSWORD ───
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};