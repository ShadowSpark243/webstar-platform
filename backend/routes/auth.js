const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.get('/setup-admin', authController.createSuperAdmin); // REMOVED — use seed script instead
router.get('/me', protect, authController.getMe);

module.exports = router;
