const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  uploadAvatar,
  changePassword,
  getChatUsers,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── CHAT USERS ENDPOINT ───
router.get('/chat-users', protect, getChatUsers);

// ─── OTHER ROUTES ───
router.route('/')
  .get(protect, getUsers);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/password', protect, changePassword);

module.exports = router;