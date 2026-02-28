const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

// All project routes require authentication
router.use(protect);

router.get('/', projectController.getActiveProjects);
router.get('/:id', projectController.getProjectById);

module.exports = router;
