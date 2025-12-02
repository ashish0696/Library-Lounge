const express = require('express');
const router = express.Router();
const adminDashBoardComtroller = require('../controllers/adminDashBoardComtroller.js');
const { checkAuthJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');


router.get('/stats', checkAuthJWT, roleMiddleware(['superAdmin']), adminDashBoardComtroller.getDashboardStats);
router.get('/daily-issues', checkAuthJWT, roleMiddleware(['superAdmin']), adminDashBoardComtroller.getDailyIssues);
module.exports = router;