const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');

router.post('/register', [
      body('fullName').trim().notEmpty().withMessage('Full name is required'),
      body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
      body('username').trim().isLength({ min: 3 }).isAlphanumeric().withMessage('Username must be at least 3 alphanumeric characters'),
      body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
      body('phone').optional({ checkFalsy: true }).matches(/^\+91 \d{10}$/).withMessage('Please provide a valid Indian phone number (+91 XXXXXXXXXX)'),
      body('referralCode').optional({ checkFalsy: true }).trim().isString()
], validateRequest, authController.register);

router.post('/login', [
      body('loginId').notEmpty().withMessage('Email or Username is required'),
      body('password').notEmpty().withMessage('Password is required')
], validateRequest, authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:resetToken', authController.resetPassword);

// router.get('/setup-admin', authController.createSuperAdmin); // REMOVED — use seed script instead
router.get('/me', protect, authController.getMe);

module.exports = router;

