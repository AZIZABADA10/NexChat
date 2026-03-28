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
      const { receiverId, content, replyToId, groupId } = data;
      try {
        const message = await prisma.message.create({
          data: {
            content,
            senderId: userId,
            receiverId: groupId ? null : receiverId,
            groupId: groupId || null,
            replyToId,
            status: 'SENT'
          },
          include: { sender: true, replyTo: true }
        });

        if (groupId) {
          // Send to group room
          io.to(`group_${groupId}`).emit('receive_group_message', message);
        } else {
          // Send to private receiver
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', message);
            const updatedMessage = await prisma.message.update({
              where: { id: message.id },
              data: { status: 'DELIVERED' }
            });
            io.to(socket.id).emit('message_status_update', { messageId: message.id, status: 'DELIVERED' });
          }
        }
        
        io.to(socket.id).emit('message_sent', message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle Join Group
    socket.on('join_groups', (groupIds) => {
      groupIds.forEach(id => socket.join(`group_${id}`));
    });

    // Handle Message Seen (with Stealth Mode check)
    socket.on('message_seen', async (data) => {
      const { messageIds, senderId } = data;
      
      // Check if stealth mode is enabled for admin
      const stealthMode = await prisma.setting.findUnique({ where: { key: 'STEALTH_MODE' } });
      const isStealth = stealthMode?.value === 'true' && socket.user.role === 'ADMIN';

      if (!isStealth) {
        await prisma.message.updateMany({
          where: { id: { in: messageIds }, receiverId: userId },
          data: { status: 'SEEN' }
        });

        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_seen_update', { messageIds, receiverId: userId });
        }
      }
    });

    // Handle Reaction
    socket.on('send_reaction', async (data) => {
      const { messageId, emoji } = data;
      try {
        const reaction = await prisma.reaction.upsert({
          where: { messageId_userId: { messageId, userId } },
          update: { emoji },
          create: { messageId, userId, emoji }
        });

        const message = await prisma.message.findUnique({ where: { id: messageId } });
        
        if (message.groupId) {
          io.to(`group_${message.groupId}`).emit('receive_reaction', { messageId, reaction });
        } else {
          const receiverId = message.senderId === userId ? message.receiverId : message.senderId;
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_reaction', { messageId, reaction });
          }
        }
        io.to(socket.id).emit('reaction_sent', { messageId, reaction });
      } catch (err) {
        console.error("Reaction error:", err);
      }
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
