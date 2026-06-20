const User = require('../models/user');
const Enrollment = require('../models/enrollment');

// @desc    Get all users (paginated, with search & role filter)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;

  try {
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { name, email, password, role, semester, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      semester: role === 'student' ? semester : undefined,
      phone
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin/Owner
exports.updateUser = async (req, res) => {
  try {
    // Owner or Admin check
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Do not allow changing role or email unless admin
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.email;
    }

    // Hash password if updating
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Clean up student enrollments if student deleted
    if (user.role === 'student') {
      await Enrollment.deleteMany({ student: req.params.id });
    }

    res.json({ success: true, message: 'User and associated records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
