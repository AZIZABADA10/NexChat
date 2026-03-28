const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createGroup = async (req, res) => {
  try {
    const { name, userIds } = req.body;
    const group = await prisma.group.create({
      data: {
        name,
        createdBy: req.user.id,
        members: {
          create: [
            { userId: req.user.id, role: 'ADMIN' },
            ...userIds.map((uid) => ({ userId: uid, role: 'MEMBER' }))
          ]
        }
      },
      include: { members: true }
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: req.user.id } }
      },
      include: {
        members: { include: { user: { select: { name: true, status: true } } } },
        _count: { select: { messages: true } }
      }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        sender: { select: { id: true, name: true } },
        reactions: true,
        replyTo: true
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGroup, getMyGroups, getGroupMessages };
