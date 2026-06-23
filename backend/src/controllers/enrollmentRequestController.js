const EnrollmentRequest = require('../models/enrollmentRequest');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const User = require('../models/user');

// @desc    Student submits enrollment request
// @route   POST /api/enrollment-requests
// @access  Private/Student
exports.submitRequest = async (req, res) => {
  const { courseId, reason } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ success: false, message: 'Already enrolled in this course' });

    // Check if request already exists
    const existing = await EnrollmentRequest.findOne({ student: req.user.id, course: courseId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Enrollment request already ${existing.status}. Cannot submit again.`
      });
    }

    const request = await EnrollmentRequest.create({
      student: req.user.id,
      course: courseId,
      reason: reason || ''
    });

    await request.populate([
      { path: 'student', select: 'name email semester' },
      { path: 'course', select: 'name code creditHours' }
    ]);

    res.status(201).json({ success: true, data: request, message: 'Enrollment request submitted successfully!' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a request for this course.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all enrollment requests (HOD/Admin)
// @route   GET /api/enrollment-requests
// @access  Private/HOD/Admin
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'hod') {
      const deptCourses = await Course.find({ department: req.user.department }).select('_id');
      const deptCourseIds = deptCourses.map(c => c._id);
      filter.course = { $in: deptCourseIds };
    }

    const requests = await EnrollmentRequest.find(filter)
      .populate('student', 'name email semester phone')
      .populate('course', 'name code creditHours semester')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my enrollment requests (Student)
// @route   GET /api/enrollment-requests/my
// @access  Private/Student
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await EnrollmentRequest.find({ student: req.user.id })
      .populate('course', 'name code creditHours semester category')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve enrollment request
// @route   PUT /api/enrollment-requests/:id/approve
// @access  Private/HOD/Admin
exports.approveRequest = async (req, res) => {
  try {
    const request = await EnrollmentRequest.findById(req.params.id)
      .populate('course', 'name code')
      .populate('student', 'name email');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    // Create actual enrollment
    const existing = await Enrollment.findOne({ student: request.student._id, course: request.course._id });
    if (!existing) {
      await Enrollment.create({
        student: request.student._id,
        course: request.course._id,
        approvalStatus: 'approved'
      });
    }

    // Update request status
    request.status = 'approved';
    request.approvedBy = req.user.id;
    await request.save();

    res.json({ success: true, data: request, message: `Enrollment approved for ${request.student.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject enrollment request
// @route   PUT /api/enrollment-requests/:id/reject
// @access  Private/HOD/Admin
exports.rejectRequest = async (req, res) => {
  const { rejectionReason } = req.body;
  try {
    const request = await EnrollmentRequest.findById(req.params.id)
      .populate('student', 'name email');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = 'rejected';
    request.approvedBy = req.user.id;
    request.rejectionReason = rejectionReason || 'Request rejected by administration.';
    await request.save();

    res.json({ success: true, data: request, message: 'Enrollment request rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
