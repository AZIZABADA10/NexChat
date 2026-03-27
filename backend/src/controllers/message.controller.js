const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params; // The other user in the conversation
    const currentUserId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        replyTo: true,
        reactions: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentConversations = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lastSeen: true,
        _count: {
          select: {
            sentMessages: {
              where: { status: { not: 'SEEN' }, receiverId: req.user.id }
            }
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdmin = async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, status: true, lastSeen: true }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory, getRecentConversations, getAdmin };
