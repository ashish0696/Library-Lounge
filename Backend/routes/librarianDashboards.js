const express = require('express');
const router = express.Router();
const { checkAuthJWT } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const librarianDashboardController = require('../controllers/librarianDashBoardController.js');


router.get('/book-count', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.bookCount);
router.get('/issued-book-count', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.issuedBookCount);
router.get('/overdue-book-count', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.overdueBookCount);
router.get('/overdue-books', checkAuthJWT, roleMiddleware(['librarian','superAdmin']), librarianDashboardController.getOverdueBooksList);
router.get('/returned-book-count', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.returnedBookCount);
router.get('/issued-books', checkAuthJWT, roleMiddleware(['librarian','superAdmin']), librarianDashboardController.issuedBooksList);
router.get('/returned-books', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.getReturnedBooksList);
router.get('/requested-books', checkAuthJWT, roleMiddleware(['librarian']), librarianDashboardController.getRequestedBooksList);
module.exports = router;


