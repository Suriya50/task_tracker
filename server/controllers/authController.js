const User = require('../models/User');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    let company;
    if (role === 'Admin') {
      company = await Company.findOne({ name: companyName });
      if (!company) {
        company = await Company.create({ name: companyName });
      }
    } else {
      company = await Company.findOne({ name: companyName });
      if (!company) {
        return res.status(400).json({ success: false, message: 'Company not found. Contact your administrator.' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      company: company._id,
    });

    // Update company members
    company.members.push({ user: user._id, role: user.role });
    if (role === 'Admin' && !company.createdBy) {
      company.createdBy = user._id;
    }
    await company.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: company.name,
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('company');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company.name,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('company');
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company.name,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    next(error);
  }
};