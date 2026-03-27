const jwt = require('jsonwebtoken');

const setupSockets = (io, prisma) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    // Update user status to ONLINE
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ONLINE', lastSeen: new Date() }
    });

    // Notify others (especially admin) about presence
    socket.broadcast.emit('user_presence', { userId, status: 'ONLINE' });

    console.log(`User ${userId} connected`);

    // Handle Private Message
    socket.on('send_message', async (data) => {
      const { receiverId, content, replyToId } = data;
      try {
        const message = await prisma.message.create({
          data: {
            content,
            senderId: userId,
            receiverId,
            replyToId,
            status: 'SENT'
          },
          include: { sender: true, replyTo: true }
        });

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', message);
          
          // Automatically mark as DELIVERED if they are online
          const updatedMessage = await prisma.message.update({
            where: { id: message.id },
            data: { status: 'DELIVERED' }
          });
          io.to(socket.id).emit('message_status_update', { messageId: message.id, status: 'DELIVERED' });
        }
        
        // Confirmation to sender
        io.to(socket.id).emit('message_sent', message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle Typing
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { userId, isTyping });
      }
    });

    // Handle Message Seen
    socket.on('message_seen', async (data) => {
      const { messageIds, senderId } = data;
      await prisma.message.updateMany({
        where: { id: { in: messageIds }, receiverId: userId },
        data: { status: 'SEEN' }
      });

      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_seen_update', { messageIds, receiverId: userId });
      }
    });

    // Handle Reaction
    socket.on('send_reaction', async (data) => {
      const { messageId, emoji } = data;
      const reaction = await prisma.reaction.create({
        data: { messageId, userId, emoji }
      });

      const message = await prisma.message.findUnique({ where: { id: messageId } });
      const receiverId = message.senderId === userId ? message.receiverId : message.senderId;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_reaction', { messageId, reaction });
      }
      io.to(socket.id).emit('reaction_sent', { messageId, reaction });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE', lastSeen: new Date() }
      });
      socket.broadcast.emit('user_presence', { userId, status: 'OFFLINE' });
      console.log(`User ${userId} disconnected`);
    });
  });
};

module.exports = setupSockets;
