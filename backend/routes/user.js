const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, requireAdmin } = require('../middlewares/auth');

// Public: Get user profile by username
router.get('/:username', userController.getUserByUsername);

// Private: Update user profile (only self)
router.put('/:username', authenticateJWT, userController.updateUserProfile);

// Private: Upload user profile photo
router.post(
  '/:username/upload-photo',
  authenticateJWT,
  userController.uploadMiddleware,
  userController.uploadUserPhoto
);

// Private: Change user password (only self)
router.put('/:username/change-password', authenticateJWT, userController.changePassword);

// Admin: Set user inactive
router.post('/:username/set-inactive', authenticateJWT, requireAdmin, userController.setInactive);

// Admin: Temporary ban user
router.post('/:username/temporary-ban', authenticateJWT, requireAdmin, userController.temporaryBan);

// Admin: Suspend user
router.post('/:username/suspend', authenticateJWT, requireAdmin, userController.suspendUser);

module.exports = router; 