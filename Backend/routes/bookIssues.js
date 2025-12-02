const express = require('express');
const router = express.Router();
const {roleMiddleware} = require('../middleware/roleMiddleware');

const bookIssueController = require('../controllers/bookIssueController');
const { checkAuthJWT } = require('../middleware/authMiddleware');
const { validateRequestBook, validateApproveBody, validateIssueId } = require('../validation/bookIssue.Validation');

router.post('/request', checkAuthJWT, roleMiddleware(['member']), validateRequestBook, bookIssueController.requestBook);
router.post('/return/:id', checkAuthJWT, roleMiddleware(['member','librarian']), validateIssueId, bookIssueController.returnBook);
router.get('/daily', checkAuthJWT, roleMiddleware(['librarian','superAdmin']), bookIssueController.viewDailyIssuedBooks);
router.get('/', checkAuthJWT, roleMiddleware(['librarian']), bookIssueController.viewAllIssuedBooks);
router.post('/:id', checkAuthJWT, roleMiddleware(['librarian']), validateIssueId, validateApproveBody, bookIssueController.issueBook);
router.get('/user', checkAuthJWT, roleMiddleware(['member']), bookIssueController.getIssuesByUser);
router.get('/count', checkAuthJWT, roleMiddleware(['librarian','superAdmin']), bookIssueController.countIssuedBooks);
router.post('/request-return/:id', checkAuthJWT, roleMiddleware(['member']), validateIssueId, bookIssueController.reqestReturnBook);
router.get('/returning-request', checkAuthJWT, roleMiddleware(['member','librarian','superAdmin']), bookIssueController.getReturningBooksList);
// notify an individual user about an overdue book (by issue id)
router.post('/notify-overdue/:id', checkAuthJWT, roleMiddleware(['librarian','superAdmin']), validateIssueId, bookIssueController.notifyOverdueMail);

module.exports = router;