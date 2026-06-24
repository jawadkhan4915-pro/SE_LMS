const Department = require('../models/department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    let { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both department code and name'
      });
    }

    code = code.trim().toUpperCase();
    name = name.trim();

    // Check if code or name already exists
    const codeExists = await Department.findOne({ code });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: `Department with code '${code}' already exists`
      });
    }

    const nameExists = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: `Department with name '${name}' already exists`
      });
    }

    const department = await Department.create({ code, name });
    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    let { code, name } = req.body;
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (code) {
      code = code.trim().toUpperCase();
      // Check if code belongs to another department
      const codeExists = await Department.findOne({ code, _id: { $ne: departmentId } });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: `Department with code '${code}' already exists`
        });
      }
      department.code = code;
    }

    if (name) {
      name = name.trim();
      // Check if name belongs to another department
      const nameExists = await Department.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }, 
        _id: { $ne: departmentId } 
      });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: `Department with name '${name}' already exists`
        });
      }
      department.name = name;
    }

    await department.save();
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    await department.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Department removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
