const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getReports = async (req, res, next) => {
  try {
    let query = { company: req.user.company._id };
    if (req.user.role === 'Employee') {
      query.employee = req.user.id;
    }
    const reports = await Report.find(query)
      .populate('employee', 'name email')
      .sort({ date: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const report = await Report.create({
      ...req.body,
      employee: req.user.id,
      company: req.user.company._id,
    });

    // Notify admins and managers
    const admins = await User.find({
      company: req.user.company._id,
      role: { $in: ['Admin', 'Manager'] },
    });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'report',
        title: 'New Daily Report',
        message: `${req.user.name} submitted a daily report`,
        company: req.user.company._id,
        relatedId: report._id,
        typeModel: 'Report',
      });
    }

    const populated = await Report.findById(report._id)
      .populate('employee', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};