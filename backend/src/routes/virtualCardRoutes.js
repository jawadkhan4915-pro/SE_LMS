const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  getCardDetails,
  updateCardSettings,
  uploadDocument,
  deleteDocument,
  getPublicCardDetails,
  adminUploadDocument,
  adminDeleteDocument
} = require('../controllers/virtualCardController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Custom Multer Storage for Card Documents (allows PDF, Doc, and Images)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'card-doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word documents, and images (PNG, JPG, JPEG, WEBP) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// === PUBLIC ENDPOINT (Verification) ===
router.get('/public/:userId', getPublicCardDetails);

// === PROTECTED USER ENDPOINTS ===
router.use(protect);

router.route('/')
  .get(getCardDetails);

router.route('/settings')
  .put(updateCardSettings);

router.route('/upload')
  .post(upload.single('file'), uploadDocument);

router.route('/documents/:id')
  .delete(deleteDocument);

// === ADMIN / STAFF PORTAL ENDPOINTS ===
router.use(authorizeRoles('admin', 'hod', 'coordinator'));

router.route('/admin/upload/:userId')
  .post(upload.single('file'), adminUploadDocument);

router.route('/admin/documents/:id')
  .delete(adminDeleteDocument);

module.exports = router;
