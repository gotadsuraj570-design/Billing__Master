const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Dashboard statistics require JWT authentication
router.get('/', authMiddleware, dashboardController.getDashboardStats);

module.exports = router;
