require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const enrollmentRequestRoutes = require('./routes/enrollmentRequestRoutes');
const resultRoutes = require('./routes/resultRoutes');
const sessionalRoutes = require('./routes/sessionalRoutes');
const slipRoutes = require('./routes/slipRoutes');
const onlineLectureRoutes = require('./routes/onlineLectureRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const aiRoutes = require('./routes/aiRoutes');
const examRoutes = require('./routes/examRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const teacherAttendanceRoutes = require('./routes/teacherAttendanceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Initialize app
const app = express();


// Connect to Database
connectDB();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows client to load local uploaded assets
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Morgan Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Express Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/enrollment-requests', enrollmentRequestRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/sessional', sessionalRoutes);
app.use('/api/slips', slipRoutes);
app.use('/api/lectures', onlineLectureRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance/teacher', teacherAttendanceRoutes);
app.use('/api/transactions', transactionRoutes);

// Root route status check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app; // For testing
