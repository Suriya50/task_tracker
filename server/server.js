const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const socketIO = require('socket.io');
const socketHandler = require('./socket/socketHandler');

connectDB();

const server = http.createServer(app);

// ─── ALLOWED ORIGINS FOR SOCKET.IO ───
const allowedOrigins = [
  'http://localhost:5173',                           // Vite default
  'http://localhost:5174',                           // Additional port
  'http://localhost:5175',                           // Additional port
  process.env.FRONTEND_URL,                          // Production frontend
].filter(Boolean);  // Remove any undefined values

const io = socketIO(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for Socket.IO from origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});