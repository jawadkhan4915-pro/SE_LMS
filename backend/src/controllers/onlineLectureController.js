const crypto = require('crypto');
const OnlineLecture = require('../models/onlineLecture');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');

// Helper to validate email domain
const isValidUniversityEmail = (email) => {
  if (!email) return false;
  const lowercaseEmail = email.toLowerCase();
  
  // Always allow standard gmail.com for simplicity/demo
  if (lowercaseEmail.endsWith('@gmail.com')) return true;

  // Check configured university domains
  const configuredDomains = process.env.UNIVERSITY_EMAIL_DOMAIN 
    ? process.env.UNIVERSITY_EMAIL_DOMAIN.split(',').map(d => d.trim().toLowerCase())
    : ['lms.edu', 'student.lms.edu', 'university.edu'];

  return configuredDomains.some(domain => lowercaseEmail.endsWith(`@${domain}`));
};

// @desc    Create a new online lecture
// @route   POST /api/lectures
// @access  Private/Teacher
exports.createLecture = async (req, res) => {
  const { courseId, title, description, date, startTime, endTime } = req.body;

  try {
    if (!courseId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify course exists and teacher is assigned to it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to create a lecture for this course' });
    }

    // Generate unique meeting ID
    const meetingId = crypto.randomBytes(8).toString('hex');

    const lecture = await OnlineLecture.create({
      course: courseId,
      teacher: req.user.id,
      title,
      description,
      date,
      startTime,
      endTime,
      meetingId
    });

    res.status(201).json({ success: true, data: lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all lectures for user (Teacher sees their own; Student sees enrolled courses' lectures)
// @route   GET /api/lectures
// @access  Private
exports.getLectures = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'teacher') {
      query = { teacher: req.user.id };
    } else if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user.id }).select('course');
      const courseIds = enrollments.map(e => e.course);
      query = { course: { $in: courseIds } };
    }

    const lectures = await OnlineLecture.find(query)
      .populate('course', 'name code')
      .populate('teacher', 'name email')
      .sort({ date: -1, startTime: -1 });

    res.json({ success: true, count: lectures.length, data: lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lecture details by meetingId
// @route   GET /api/lectures/:meetingId
// @access  Private
exports.getLectureByMeetingId = async (req, res) => {
  try {
    const lecture = await OnlineLecture.findOne({ meetingId: req.params.meetingId })
      .populate('course', 'name code')
      .populate('teacher', 'name email');

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    // Access control
    if (req.user.role === 'student') {
      const isEnrolled = await Enrollment.findOne({
        student: req.user.id,
        course: lecture.course._id
      });

      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      }
    } else if (req.user.role === 'teacher' && lecture.teacher._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not the designated teacher for this lecture' });
    }

    res.json({ success: true, data: lecture });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Google ID Token or check simulated email and join lecture
// @route   POST /api/lectures/:meetingId/join
// @access  Private/Student
exports.joinLecture = async (req, res) => {
  const { email, googleIdToken } = req.body;

  try {
    const lecture = await OnlineLecture.findOne({ meetingId: req.params.meetingId });
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    let verifiedEmail = email;

    // 1. Google Token verification (if token is provided and is a real token)
    if (googleIdToken && googleIdToken !== 'mock_token') {
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`);
        const googleData = await response.json();
        
        if (googleData && googleData.email) {
          verifiedEmail = googleData.email;
          if (googleData.email_verified !== 'true' && googleData.email_verified !== true) {
            return res.status(400).json({ success: false, message: 'Google email address is not verified' });
          }
        } else {
          return res.status(400).json({ success: false, message: 'Invalid Google token' });
        }
      } catch (err) {
        console.error('Google token verification error:', err.message);
        return res.status(400).json({ success: false, message: 'Failed to verify Google identity' });
      }
    }

    // 2. Validate official university email address
    if (!isValidUniversityEmail(verifiedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access Denied. You must authenticate with an official university Gmail account (e.g. ending in @gmail.com or @lms.edu)' 
      });
    }

    // 3. Add to participants if not already added
    const alreadyParticipant = lecture.participants.some(
      p => p.student.toString() === req.user.id
    );

    if (!alreadyParticipant) {
      lecture.participants.push({
        student: req.user.id,
        gmail: verifiedEmail,
        joinedAt: new Date()
      });
      await lecture.save();
    }

    // 4. Automatically mark student as present in today's Attendance register
    try {
      const today = new Date();
      today.setUTCHours(0,0,0,0);

      const Attendance = require('../models/attendance');
      let attendance = await Attendance.findOne({ course: lecture.course, date: today });
      if (!attendance) {
        attendance = await Attendance.create({
          course: lecture.course,
          date: today,
          lectureTime: `${lecture.startTime} - ${lecture.endTime}`,
          topic: `Online Lecture: ${lecture.title}`,
          markedBy: lecture.teacher,
          records: []
        });
      }

      const alreadyMarked = attendance.records.some(
        r => r.student.toString() === req.user.id
      );

      if (!alreadyMarked) {
        attendance.records.push({
          student: req.user.id,
          status: 'present'
        });
        await attendance.save();
      }
    } catch (attendanceErr) {
      console.error('Failed to log automatic online lecture attendance:', attendanceErr.message);
    }

    res.json({ 
      success: true, 
      message: 'Successfully authenticated and joined lecture',
      data: {
        verifiedEmail,
        joinedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update interactive lecture state (whiteboard, slide, active, chat)
// @route   PUT /api/lectures/:meetingId/state
// @access  Private
exports.updateLectureState = async (req, res) => {
  const { whiteboardData, currentSlide, chatMessage, isActive } = req.body;

  try {
    const lecture = await OnlineLecture.findOne({ meetingId: req.params.meetingId });
    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    // Permissions check: Only the host teacher can update slides/whiteboard/active status
    const isTeacher = req.user.role === 'teacher' && lecture.teacher.toString() === req.user.id;

    if (isActive !== undefined && isTeacher) {
      lecture.isActive = isActive;
    }
    if (whiteboardData !== undefined && isTeacher) {
      lecture.whiteboardData = whiteboardData;
    }
    if (currentSlide !== undefined && isTeacher) {
      lecture.currentSlide = currentSlide;
    }

    // Both teachers and authenticated participants can post chat messages
    if (chatMessage) {
      lecture.chatMessages.push({
        senderName: req.user.name,
        senderEmail: req.user.email,
        senderRole: req.user.role,
        message: chatMessage,
        timestamp: new Date()
      });
    }

    await lecture.save();

    res.json({
      success: true,
      data: {
        isActive: lecture.isActive,
        whiteboardData: lecture.whiteboardData,
        currentSlide: lecture.currentSlide,
        chatMessages: lecture.chatMessages,
        participantsCount: lecture.participants.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active lecture state (whiteboard, slide, active, chat, participants)
// @route   GET /api/lectures/:meetingId/state
// @access  Private
exports.getLectureState = async (req, res) => {
  try {
    const lecture = await OnlineLecture.findOne({ meetingId: req.params.meetingId })
      .populate('participants.student', 'name email semester');

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Lecture not found' });
    }

    res.json({
      success: true,
      data: {
        isActive: lecture.isActive,
        whiteboardData: lecture.whiteboardData,
        currentSlide: lecture.currentSlide,
        chatMessages: lecture.chatMessages,
        participants: lecture.participants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
