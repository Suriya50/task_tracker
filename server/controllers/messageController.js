const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ─── GET MESSAGES FOR A CHAT ───
exports.getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// ─── SEND A MESSAGE ───
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, content } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Create and save message
    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content,
    });

    // Update chat's lastMessage
    chat.lastMessage = message._id;
    await chat.save();

    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email profilePicture');

    // ─── SOCKET EMISSION ───
    const io = req.app.get('io');
    if (io) {
      // 1. Emit to the chat room (all participants in that room)
      io.to(chatId).emit('newMessage', populatedMessage);

      // 2. Also emit to each participant's personal room for instant delivery
      const otherParticipants = chat.participants.filter(p => String(p) !== String(req.user.id));
      for (const participantId of otherParticipants) {
        // Get the user's socket ID from the online users map (available via socket handler)
        // We'll use the socket room approach instead: each user has a room named after their userId
        io.to(String(participantId)).emit('newMessage', populatedMessage);
      }

      // 3. Send notification event
      io.emit('newNotification', { userId: req.user.id });
    }

    // ─── CREATE NOTIFICATIONS FOR OTHER PARTICIPANTS ───
    const otherParticipants = chat.participants.filter(p => String(p) !== String(req.user.id));
    for (const participant of otherParticipants) {
      await Notification.create({
        recipient: participant,
        type: 'message',
        title: 'New Message',
        message: `${req.user.name}: ${content.substring(0, 50)}`,
        company: req.user.company._id,
        relatedId: message._id,
        typeModel: 'Message',
      });
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    next(error);
  }
};

// ─── MARK MESSAGE AS READ ───
exports.markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();

      // Notify sender that message was read
      const io = req.app.get('io');
      if (io) {
        const senderId = message.sender;
        io.to(String(senderId)).emit('messageRead', { messageId, userId: req.user.id });
      }
    }
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};