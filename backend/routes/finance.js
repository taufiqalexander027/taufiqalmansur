const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { auth } = require('../middleware/auth');

// Master Data Routes
router.post('/sync-master', auth, financeController.syncMasterData);
router.get('/rekenings', auth, financeController.getRekenings);

// Transaction Routes
router.post('/transactions', auth, financeController.saveTransaction);
router.get('/transactions', auth, financeController.getTransactions);

module.exports = router;
