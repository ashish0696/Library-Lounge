const express = require('express');
const router = express.Router();
const memberDashboardController = require('../controllers/memberDashboardController.js');
const { checkAuthJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

router.get('/available-books', checkAuthJWT, roleMiddleware(['member']), memberDashboardController.getAvailableBooks);
router.get('/my-book-issues', checkAuthJWT, roleMiddleware(['member']), memberDashboardController.myBookIssues);

module.exports = router;