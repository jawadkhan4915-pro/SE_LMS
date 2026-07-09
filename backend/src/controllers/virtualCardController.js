const User = require('../models/user');
const VirtualCardDocument = require('../models/virtualCardDocument');

// Helper to generate stable card details for users if not set
const populateCardDefaults = async (user) => {
  let updated = false;

  // 1. Generate stable Roll Number / Teacher ID
  if (!user.rollNo) {
    const isStudent = user.role === 'student';
    const deptPrefixes = { SE: 'SWEN', CS: 'CSEN', IT: 'ITEN', EE: 'EEEN' };
    const prefix = deptPrefixes[user.department] || 'SWEN';
    
    // Parse decimal from MongoDB ObjectId tail for stable random feel
    const decId = parseInt(user._id.toString().slice(-6), 16) % 100000;
    
    if (isStudent) {
      user.rollNo = `${prefix}2411${String(decId).padStart(5, '0')}`;
    } else {
      user.rollNo = `T-${user.department || 'SE'}-${user._id.toString().slice(-4).toUpperCase()}`;
    }
    updated = true;
  }

  // 2. Generate stable CNIC
  if (!user.cnic) {
    const cnicMiddle = parseInt(user._id.toString().slice(-7), 16) % 10000000;
    user.cnic = `31301-${String(cnicMiddle).padStart(7, '0')}-3`;
    updated = true;
  }

  // 3. Generate stable Emergency Contact
  if (!user.emergencyContact) {
    const contactTail = parseInt(user._id.toString().slice(-7), 16) % 10000000;
    user.emergencyContact = `0306-${String(contactTail).padStart(7, '0')}`;
    updated = true;
  }

  // 4. Address default
  if (!user.address) {
    user.address = 'ABU DHABI ROAD SEM NALA PULL NEAR AL HUDA, RAHIM YAR KHAN';
    updated = true;
  }

  // 5. Card Validity
  if (!user.cardValidTill) {
    user.cardValidTill = '2028-07-05';
    updated = true;
  }

  // Save changes if any defaults were set
  if (updated) {
    await user.save({ validateBeforeSave: false });
  }
  return user;
};

// @desc    Get user's own card details and documents
// @route   GET /api/virtual-card
// @access  Private
exports.getCardDetails = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Auto-generate defaults if fields are empty
    user = await populateCardDefaults(user);

    // Fetch documents
    const documents = await VirtualCardDocument.find({ owner: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        card: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          semester: user.semester,
          section: user.section,
          profilePicture: user.profilePicture,
          phone: user.phone,
          rollNo: user.rollNo,
          cnic: user.cnic,
          emergencyContact: user.emergencyContact,
          address: user.address,
          authoritySignature: user.authoritySignature,
          cardValidTill: user.cardValidTill
        },
        documents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update editable card details (CNIC, emergency contact, address, signature)
// @route   PUT /api/virtual-card/settings
// @access  Private
exports.updateCardSettings = async (req, res) => {
  const { cnic, emergencyContact, address, authoritySignature } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (cnic !== undefined) user.cnic = cnic;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (address !== undefined) user.address = address;
    if (authoritySignature !== undefined) user.authoritySignature = authoritySignature;

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Card settings updated successfully',
      data: {
        cnic: user.cnic,
        emergencyContact: user.emergencyContact,
        address: user.address,
        authoritySignature: user.authoritySignature
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload document to card (Self)
// @route   POST /api/virtual-card/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const title = req.body.title || req.file.originalname.split('.')[0];
    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await VirtualCardDocument.create({
      owner: req.user.id,
      title,
      fileUrl,
      uploadedByRole: 'self'
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and linked to card successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user's own self-uploaded document
// @route   DELETE /api/virtual-card/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await VirtualCardDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Verify ownership
    if (document.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
    }

    await VirtualCardDocument.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get card details publicly (for QR code verification)
// @route   GET /api/virtual-card/public/:userId
// @access  Public
exports.getPublicCardDetails = async (req, res) => {
  try {
    let user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Auto-generate defaults if empty
    user = await populateCardDefaults(user);

    // Fetch all documents
    const documents = await VirtualCardDocument.find({ owner: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        card: {
          name: user.name,
          role: user.role,
          department: user.department,
          semester: user.semester,
          section: user.section,
          profilePicture: user.profilePicture,
          rollNo: user.rollNo,
          cnic: user.cnic,
          emergencyContact: user.emergencyContact,
          address: user.address,
          authoritySignature: user.authoritySignature,
          cardValidTill: user.cardValidTill
        },
        documents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin upload official document for a student/teacher
// @route   POST /api/virtual-card/admin/upload/:userId
// @access  Private (Admin/Coordinator/HOD only)
exports.adminUploadDocument = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const title = req.body.title || req.file.originalname.split('.')[0];
    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await VirtualCardDocument.create({
      owner: targetUser._id,
      title,
      fileUrl,
      uploadedByRole: 'university'
    });

    res.status(201).json({
      success: true,
      message: 'Official University Document uploaded successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin/Coordinator/HOD delete university-issued document
// @route   DELETE /api/virtual-card/admin/documents/:id
// @access  Private (Admin/Coordinator/HOD only)
exports.adminDeleteDocument = async (req, res) => {
  try {
    const document = await VirtualCardDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await VirtualCardDocument.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Official Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
