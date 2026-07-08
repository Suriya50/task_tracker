const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { limiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── SERVE STATIC FILES (UPLOADS) ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── RATE LIMITING ───
app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);

// ─── ROUTES ───
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reports', reportRoutes);

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MissionDesk API is running' });
});

// ─── ERROR HANDLER ───
app.use(errorHandler);

module.exports = app;