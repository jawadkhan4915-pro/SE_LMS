const Attendance = require('../models/attendance');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// @desc    Mark course attendance
// @route   POST /api/attendance
// @access  Private/Teacher
exports.markAttendance = async (req, res) => {
  const { courseId, date, records, lectureTime, topic } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this course' });
    }

    // Standardize date to midnight UTC
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const formattedRecords = records.map(r => ({
      student: r.studentId || r.student,
      status: r.status
    }));

    let attendance = await Attendance.findOne({ course: courseId, date: attendanceDate });

    if (attendance) {
      attendance.records = formattedRecords;
      attendance.lectureTime = lectureTime || attendance.lectureTime;
      attendance.topic = topic || attendance.topic;
      attendance.markedBy = req.user.id;
      await attendance.save();
      return res.json({ success: true, message: 'Attendance updated successfully', data: attendance });
    }

    attendance = await Attendance.create({
      course: courseId,
      date: attendanceDate,
      lectureTime: lectureTime || '08:00 AM',
      topic: topic || '',
      markedBy: req.user.id,
      records: formattedRecords
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get course attendance records
// @route   GET /api/attendance/course/:courseId
// @access  Private
exports.getCourseAttendance = async (req, res) => {
  try {
    let attendanceLogs = [];

    if (req.user.role === 'student') {
      // Students see only their personal attendance stats, with lecture info
      const logs = await Attendance.find({ course: req.params.courseId })
        .sort({ date: -1 });

      attendanceLogs = logs.map(log => {
        const studentRecord = log.records.find(r => r.student.toString() === req.user.id);
        return {
          date: log.date,
          lectureTime: log.lectureTime || '',
          topic: log.topic || '',
          status: studentRecord ? studentRecord.status : 'absent'
        };
      });
    } else {
      // Teachers/HODs see the full register matrix
      attendanceLogs = await Attendance.find({ course: req.params.courseId })
        .sort({ date: -1 })
        .populate('records.student', 'name email')
        .populate('markedBy', 'name');
    }

    res.json({ success: true, data: attendanceLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance percentage for a student in a course
// @route   GET /api/attendance/course/:courseId/percentage
// @access  Private
exports.getAttendancePercentage = async (req, res) => {
  try {
    const logs = await Attendance.find({ course: req.params.courseId });
    const totalSessions = logs.length;

    if (totalSessions === 0) {
      return res.json({ success: true, data: { percentage: 100, present: 0, absent: 0, total: 0 } });
    }

    let present = 0;
    let absent = 0;
    let late = 0;

    logs.forEach(log => {
      const record = log.records.find(r => r.student.toString() === req.user.id);
      if (record) {
        if (record.status === 'present') present++;
        else if (record.status === 'late') {
          late++;
          present += 0.5; // Late counts as half presence
        } else absent++;
      } else {
        absent++;
      }
    });

    const percentage = ((present / totalSessions) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        percentage: parseFloat(percentage),
        present,
        absent,
        late,
        total: totalSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
