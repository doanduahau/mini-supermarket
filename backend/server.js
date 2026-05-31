require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./src/socket/socket.handler');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket handlers
initSocket(io);
// ─── Connect Database ───────────────────────────────────────────────────────
connectDB();

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// ── Feature Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',              require('./src/routes/auth.routes'));
app.use('/api/my',                require('./src/routes/my.routes'));
app.use('/api/users',             require('./src/routes/user.routes'));
app.use('/api/shifts',            require('./src/routes/shift.routes'));
app.use('/api/shift-assignments', require('./src/routes/shiftAssignment.routes'));
app.use('/api/attendance',        require('./src/routes/attendance.routes'));
app.use('/api/salary-config',     require('./src/routes/salaryConfig.routes'));
app.use('/api/bonus',             require('./src/routes/bonus.routes'));
app.use('/api/payroll',           require('./src/routes/payroll.routes'));
app.use('/api/reports',           require('./src/routes/report.routes'));
app.use('/api/settings',          require('./src/routes/settings.routes'));

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use('/api/dev', require('./src/routes/dev.routes'));
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
