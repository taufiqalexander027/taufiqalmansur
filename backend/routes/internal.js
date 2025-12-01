const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internalController');
const { auth, checkRole } = require('../middleware/auth');

// ASN Routes (staff/admin only)
router.post('/asn/daily-reports',
    auth,
    checkRole('staff', 'admin'),
    internalController.createDailyReport
);

router.get('/asn/daily-reports',
    auth,
    checkRole('staff', 'admin'),
    internalController.getMyDailyReports
);

router.post('/asn/berakhlak-assessment',
    auth,
    checkRole('staff', 'admin'),
    internalController.createBerakhlakAssessment
);

// Financial Routes (staff/admin only)
router.get('/financial/summary',
    auth,
    checkRole('staff', 'admin'),
    internalController.getFinancialSummary
);

router.post('/financial/budgets',
    auth,
    checkRole('staff', 'admin'),
    internalController.createBudget
);

router.post('/financial/realizations',
    auth,
    checkRole('staff', 'admin'),
    internalController.createRealization
);

router.get('/financial/programs',
    auth,
    checkRole('staff', 'admin'),
    internalController.getPrograms
);

module.exports = router;
