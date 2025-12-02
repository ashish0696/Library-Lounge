const express = require('express');
const router = express.Router();

router.use('/users', require('./users.js'));
router.use('/book', require('./books.js'));
router.use('/auth', require('./auth.js'));
router.use('/book-issues', require('./bookIssues.js'));
router.use('/admin-dashboard', require('./adminDashboards.js'));
router.use('/member-dashboard', require('./memberDashboards.js'));
router.use('/librarian-dashboard', require('./librarianDashboards.js'));

module.exports = router;