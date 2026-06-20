const express = require('express');
const router = express.Router();
const { createResource, getResources, deleteResource } = require('../controllers/resourceController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth

router.route('/')
  .get(getResources)
  .post(authorizeRoles('teacher', 'admin'), createResource);

router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteResource);

module.exports = router;
