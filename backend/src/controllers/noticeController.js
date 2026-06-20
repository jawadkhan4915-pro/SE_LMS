const Notice = require('../models/notice');

// @desc    Create a new notice/announcement
// @route   POST /api/notices
// @access  Private/Admin/HOD
exports.createNotice = async (req, res) => {
  const { title, content, targetRoles } = req.body;

  try {
    const notice = await Notice.create({
      title,
      content,
      targetRoles: targetRoles || ['student', 'teacher'],
      postedBy: req.user.id
    });

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get notices matching user role
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    let query = {};

    // Filter notices targeted for user's role, or general
    if (req.user.role !== 'admin') {
      query = { targetRoles: req.user.role };
    }

    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .populate('postedBy', 'name role');

    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
