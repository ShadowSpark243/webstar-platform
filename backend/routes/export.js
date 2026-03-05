const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { exportTransactionsCSV, exportAdminLedgerCSV, exportUsersCSV } = require('../controllers/exportController');

// User routes
router.get('/transactions', protect, exportTransactionsCSV);

// Admin routes
router.get('/admin-ledger', protect, adminOnly, exportAdminLedgerCSV);
router.get('/admin-users', protect, adminOnly, exportUsersCSV);

module.exports = router;
