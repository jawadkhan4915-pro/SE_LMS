const Resource = require('../models/resource');
const Course = require('../models/course');

// @desc    Add a resource (PDF, research paper, datasets, URLs)
// @route   POST /api/resources
// @access  Private/Teacher/Admin
exports.createResource = async (req, res) => {
  const { title, type, url, courseId } = req.body;

  try {
    // Check if course-specific resource and authorize teacher
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to add resources for this course' });
      }
    }

    const resource = await Resource.create({
      title,
      type,
      url,
      uploadedBy: req.user.id,
      course: courseId || null
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get resources (all or by course)
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  const { courseId } = req.query;

  try {
    let query = {};
    if (courseId) {
      query = { course: courseId };
    } else {
      query = { course: null }; // General department wide resources
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resources.length, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Teacher/Admin
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Auth check
    if (req.user.role === 'teacher' && resource.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
