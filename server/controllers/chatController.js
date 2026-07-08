const Chat = require('../models/Chat');

exports.getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      company: req.user.company._id,
    })
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
};

exports.getOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [currentUserId, userId],
        company: req.user.company._id,
        createdBy: currentUserId,
      });
    }

    const populated = await Chat.findById(chat._id)
      .populate('participants', 'name email profilePicture')
      .populate('lastMessage');
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};