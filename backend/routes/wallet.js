const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

// KYC Upload — in-memory, 5MB max, images + PDF only
const storage = multer.memoryStorage();
const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
            const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
            if (allowed.includes(file.mimetype)) {
                  cb(null, true);
            } else {
                  cb(new Error('Invalid file type. Only JPEG, PNG, WebP, or PDF files are allowed.'));
            }
      }
});

router.use(protect); // Secure all wallet endpoints

router.post('/deposit', upload.single('receiptImage'), walletController.requestDeposit);
router.get('/history', walletController.getWalletHistory);
router.get('/my-investments', walletController.getMyInvestments);
router.get('/dashboard', walletController.getDashboardData);
router.post('/invest', walletController.investInProject);
router.get('/network-stats', walletController.getNetworkStats);
router.post('/kyc/submit', upload.single('documentImage'), walletController.submitKyc);

module.exports = router;
