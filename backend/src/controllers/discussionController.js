const Discussion = require('../models/discussion');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// @desc    Get all threads for a course
// @route   GET /api/discussions/course/:courseId
// @access  Private
exports.getThreadsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check access: Student must be enrolled or user is teacher/admin
    if (req.user.role === 'student') {
      const isEnrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      }
    }

    const threads = await Discussion.find({ course: courseId })
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, count: threads.length, data: threads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new thread
// @route   POST /api/discussions
// @access  Private
exports.createThread = async (req, res) => {
  const { courseId, title, content } = req.body;

  try {
    if (!courseId || !title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, title, and content' });
    }

    // Access control: check enrollment / teaching assignment
    if (req.user.role === 'student') {
      const isEnrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
      if (!isEnrolled) {
        return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
      }
    } else if (req.user.role === 'teacher') {
      const course = await Course.findById(courseId);
      if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You are not assigned to teach this course' });
      }
    }

    const thread = await Discussion.create({
      course: courseId,
      author: req.user.id,
      title,
      content
    });

    const populatedThread = await Discussion.findById(thread._id).populate('author', 'name role');

    // Notify course members via Socket.io
    if (req.io) {
      req.io.to(courseId.toString()).emit('notification', {
        message: `New discussion post: "${title}" by ${req.user.name}`,
        type: 'info'
      });
    }

    res.status(201).json({ success: true, data: populatedThread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a thread
// @route   POST /api/discussions/:id/reply
// @access  Private
exports.replyToThread = async (req, res) => {
  const { content } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const thread = await Discussion.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    thread.replies.push({
      author: req.user.id,
      content
    });

    await thread.save();

    const updatedThread = await Discussion.findById(thread._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    // Notify thread author
    if (req.io && thread.author.toString() !== req.user.id) {
      req.io.to(thread.author.toString()).emit('notification', {
        message: `${req.user.name} replied to your thread: "${thread.title}"`,
        type: 'info'
      });
    }

    res.json({ success: true, data: updatedThread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle upvote on thread
// @route   PUT /api/discussions/:id/upvote
// @access  Private
exports.upvoteThread = async (req, res) => {
  try {
    const thread = await Discussion.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    const upvoteIdx = thread.upvotes.indexOf(req.user.id);
    if (upvoteIdx > -1) {
      thread.upvotes.splice(upvoteIdx, 1);
    } else {
      thread.upvotes.push(req.user.id);
    }

    await thread.save();
    const updatedThread = await Discussion.findById(thread._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.json({ success: true, data: updatedThread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle pin thread
// @route   PUT /api/discussions/:id/pin
// @access  Private (Teacher/Admin)
exports.togglePinThread = async (req, res) => {
  try {
    const thread = await Discussion.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    thread.isPinned = !thread.isPinned;
    await thread.save();
    
    const updatedThread = await Discussion.findById(thread._id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    res.json({ success: true, data: updatedThread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete thread
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Discussion.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Discussion thread not found' });
    }

    // Only author, teacher, or admin can delete
    const isAuthor = thread.author.toString() === req.user.id;
    const isPrivileged = ['teacher', 'admin', 'hod'].includes(req.user.role);

    if (!isAuthor && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this thread' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
