const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // All user routes require authentication

router.route('/')
  .get(authorizeRoles('admin'), getUsers)
  .post(authorizeRoles('admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorizeRoles('admin'), deleteUser);

module.exports = router;
