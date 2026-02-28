const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All Admin routes require both authentication AND admin privileges
router.use(protect);
router.use(adminOnly);

// Global Stats & Overview
router.get('/stats', adminController.getGlobalStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/wallet', adminController.updateUserWallet);
router.put('/users/:id/status', adminController.updateUserStatus);

// KYC Approvals
router.get('/kyc', adminController.getAllKyc);
router.put('/kyc/review', adminController.reviewKyc);

// Global Ledger / Deposits
router.get('/deposits', adminController.getPendingDeposits);
router.put('/deposits/review', adminController.reviewDeposit);
router.get('/transactions', adminController.getAllTransactions);

// Global Network Tree
router.get('/network', adminController.getGlobalNetworkTree);

// Project Management
router.get('/projects', adminController.getAllProjects);
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.delete('/projects/:id', adminController.deleteProject);

module.exports = router;
