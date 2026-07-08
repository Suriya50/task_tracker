const User = require('../models/User');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) return;

    // Save socket ID and join user's personal room
    await User.findByIdAndUpdate(userId, { socketId: socket.id });
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // ✅ personal room for direct messages

    // Broadcast online users
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // Join chat rooms
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
    });

    // Typing indicator
    socket.on('typing', ({ chatId, receiverId, isTyping }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId, chatId, isTyping });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { socketId: null });
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};