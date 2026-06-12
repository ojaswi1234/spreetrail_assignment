import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import expenseRoutes from './routes/expenseRoutes';
import settlementRoutes from './routes/settlementRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://spreetrail-assignment.vercel.app', // Allow only production frontend
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: 'https://spreetrail-assignment.vercel.app' }));
app.use(express.json());

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-expense', (expenseId) => {
    socket.join(expenseId);
    console.log(`User joined expense chat: ${expenseId}`);
  });

  socket.on('send-message', (data) => {
    // data: { expenseId, userId, message, userName }
    io.to(data.expenseId).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
