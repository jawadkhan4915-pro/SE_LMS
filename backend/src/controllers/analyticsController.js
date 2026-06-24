const User = require('../models/user');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Resource = require('../models/resource');
const Attendance = require('../models/attendance');
const QuizAttempt = require('../models/quizAttempt');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/analytics/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const department = req.user.department; // If null/undefined, then it's university-wide admin
    const userQuery = department ? { department } : {};
    const courseQuery = department ? { department } : {};
    
    // For assignments and resources: if department-restricted, we only count within department courses/resources
    let assignmentQuery = {};
    let resourceQuery = {};
    
    if (department) {
      const deptCourses = await Course.find({ department }).select('_id');
      const deptCourseIds = deptCourses.map(c => c._id);
      assignmentQuery = { course: { $in: deptCourseIds } };
      resourceQuery = { $or: [{ course: { $in: deptCourseIds } }, { department }] };
    }

    const totalUsers = await User.countDocuments(userQuery);
    const studentCount = await User.countDocuments({ role: 'student', ...userQuery });
    const teacherCount = await User.countDocuments({ role: 'teacher', ...userQuery });
    const adminCount = await User.countDocuments({ role: 'admin', ...userQuery });
    const hodCount = await User.countDocuments({ role: 'hod', ...userQuery });

    const totalCourses = await Course.countDocuments(courseQuery);
    const totalAssignments = await Assignment.countDocuments(assignmentQuery);
    const totalResources = await Resource.countDocuments(resourceQuery);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, students: studentCount, teachers: teacherCount, admins: adminCount, hods: hodCount },
        totalCourses,
        totalAssignments,
        totalResources
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Teacher Dashboard Stats
// @route   GET /api/analytics/teacher
// @access  Private/Teacher
exports.getTeacherStats = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id });
    const courseIds = courses.map(c => c._id);

    // Enrolled students count
    const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds }, status: 'active' });

    // Total assignments published
    const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });

    // Submissions pending grading (where grade is null)
    const activeAssignments = await Assignment.find({ course: { $in: courseIds } });
    const activeAssignmentIds = activeAssignments.map(a => a._id);
    const pendingGrading = await Submission.countDocuments({
      assignment: { $in: activeAssignmentIds },
      grade: null
    });

    res.json({
      success: true,
      data: {
        coursesCount: courses.length,
        totalStudents,
        totalAssignments,
        pendingGrading
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Student Dashboard Stats
// @route   GET /api/analytics/student
// @access  Private/Student
exports.getStudentStats = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id, status: 'active' })
      .populate('course', 'name code creditHours');
    const courseIds = enrollments.map(e => e.course._id);

    // Calculate GPA (Average of enrolled course GPAs)
    let cumulativeGPA = 0;
    const completedEnrollments = await Enrollment.find({ student: req.user.id, status: 'completed' });
    if (completedEnrollments.length > 0) {
      const gpaSum = completedEnrollments.reduce((acc, curr) => acc + curr.gpa, 0);
      cumulativeGPA = (gpaSum / completedEnrollments.length).toFixed(2);
    } else {
      // Default placeholder if none completed yet
      cumulativeGPA = 3.50; 
    }

    // Pending assignments due (deadline in future, and no submission from student)
    const assignments = await Assignment.find({
      course: { $in: courseIds },
      deadline: { $gt: new Date() }
    });
    
    let pendingAssignmentsCount = 0;
    for (const assignment of assignments) {
      const submitted = await Submission.findOne({
        assignment: assignment._id,
        student: req.user.id
      });
      if (!submitted) {
        pendingAssignmentsCount++;
      }
    }

    // Attendance Calculation across all enrolled courses
    const attendanceLogs = await Attendance.find({ course: { $in: courseIds } });
    let totalClasses = attendanceLogs.length;
    let presentCount = 0;

    attendanceLogs.forEach(log => {
      const record = log.records.find(r => r.student.toString() === req.user.id);
      if (record) {
        if (record.status === 'present') presentCount++;
        else if (record.status === 'late') presentCount += 0.5;
      }
    });

    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 100;

    res.json({
      success: true,
      data: {
        enrolledCoursesCount: enrollments.length,
        gpa: parseFloat(cumulativeGPA),
        pendingAssignments: pendingAssignmentsCount,
        attendance: parseFloat(attendancePercentage),
        courses: enrollments.map(e => ({
          id: e.course._id,
          name: e.course.name,
          code: e.course.code,
          grade: e.grade || 'In Progress'
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get HOD Dashboard Stats & Analytics
// @route   GET /api/analytics/hod
// @access  Private/HOD
exports.getHODStats = async (req, res) => {
  try {
    const department = req.user.department || 'SE';

    const studentCount = await User.countDocuments({ role: 'student', department });
    const teacherCount = await User.countDocuments({ role: 'teacher', department });
    const courseCount = await Course.countDocuments({ department });

    // Aggregated average GPA per course category or course
    const gpaStats = await Enrollment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$course',
          avgGPA: { $avg: '$gpa' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      { $match: { 'courseDetails.department': department } },
      {
        $project: {
          courseName: '$courseDetails.name',
          courseCode: '$courseDetails.code',
          avgGPA: { $round: ['$avgGPA', 2] }
        }
      }
    ]);

    // Average attendance per course
    const attendanceStats = await Attendance.aggregate([
      { $unwind: '$records' },
      {
        $group: {
          _id: { course: '$course', student: '$records.student' },
          presentValue: {
            $sum: {
              $cond: [
                { $eq: ['$records.status', 'present'] }, 1,
                { $cond: [{ $eq: ['$records.status', 'late'] }, 0.5, 0] }
              ]
            }
          },
          totalClasses: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.course',
          attendanceSum: { $sum: { $divide: ['$presentValue', '$totalClasses'] } },
          studentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          averageAttendance: {
            $multiply: [{ $divide: ['$attendanceSum', '$studentCount'] }, 100]
          }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: '$courseDetails' },
      { $match: { 'courseDetails.department': department } },
      {
        $project: {
          courseName: '$courseDetails.name',
          courseCode: '$courseDetails.code',
          avgAttendance: { $round: ['$averageAttendance', 2] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        students: studentCount,
        teachers: teacherCount,
        courses: courseCount,
        gpaByCourse: gpaStats,
        attendanceByCourse: attendanceStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
