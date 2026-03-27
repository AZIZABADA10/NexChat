const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/message.routes');
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Logic
const setupSockets = require('./sockets/chat.socket');
setupSockets(io, prisma);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, prisma };
