const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require JWT authentication
router.use(authMiddleware);

router.get('/', billController.getBills);
router.get('/:id', billController.getBillById);
router.post('/', billController.createBill);

module.exports = router;
