const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

// ─── GET ALL MEETINGS ───
exports.getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ company: req.user.company._id })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });
    res.json({ success: true, data: meetings });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE A MEETING ───
exports.createMeeting = async (req, res, next) => {
  try {
    const meetingLink = `https://meet.jit.si/MissionDesk-${uuidv4().substring(0, 8)}`;
    const meeting = await Meeting.create({
      ...req.body,
      company: req.user.company._id,
      createdBy: req.user.id,
      meetingLink,
    });

    // Notify participants
    if (meeting.participants?.length) {
      for (const participant of meeting.participants) {
        await Notification.create({
          recipient: participant,
          type: 'meeting',
          title: 'New Meeting Scheduled',
          message: `${req.user.name} created a meeting: ${meeting.title}`,
          company: req.user.company._id,
          relatedId: meeting._id,
          typeModel: 'Meeting',
        });
      }
    }

    const populated = await Meeting.findById(meeting._id)
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('❌ createMeeting error:', error);
    next(error);
  }
};

// ─── UPDATE A MEETING ───
exports.updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('participants', 'name email');
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE A MEETING ───
exports.deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    await meeting.remove();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};