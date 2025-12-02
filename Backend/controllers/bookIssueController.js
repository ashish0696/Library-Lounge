const bookIssueService = require('../services/bookIssueService.js');
const logger = require("../utils/logger.js");
const bookService = require('../services/bookService.js');
const userService = require('../services/userService.js');
const emitter = require('../utils/eventEmitter.js');


const requestBook = async (req, res) => {
    try {
        const { bookId, returnDate } = req.body;
        const userId = req.user.id;
        const book = await bookService.getBookById(bookId);
        const bookIssue = await bookIssueService.requestBook(bookId, userId, returnDate);
        logger.info(`Book requested successfully: '${book.title}' by user: ${userId}`);

    res.sendResponse(bookIssue, 'Book requested', true, 201);

    } catch (error) {
        res.sendError(error.message, 400);
    }   
};

const issueBook = async (req, res) => {
    try {
        const issueId = req.params.id;
        const { approve } = req.body;
        const bookIssue = await bookIssueService.issueBook(issueId, approve);
        logger.info(`Book issued successfully with ID: '${issueId}' with approval: ${approve}`);

        res.sendResponse(bookIssue, 'Book issue updated', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};


const viewAllIssuedBooks = async (req, res) => {
    try {
        const bookIssues = await bookIssueService.viewAllBookIssues();
        res.sendResponse(bookIssues, 'Issued books', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

const viewDailyIssuedBooks = async (req, res) => {
    try {
        const { date } = req.query;
        const bookIssues = await bookIssueService.viewDailyIssuedBooks(date);
        res.sendResponse(bookIssues, 'Daily issued books', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
    // console.log("in bookIssue Controller, Daily Issued Books");

};

const returnBook = async (req, res) => {
    try {
        const issueId = req.params.id;
        const bookIssue = await bookIssueService.returnBook(issueId);
        logger.info(`Book returned successfully with ID: '${issueId}'`);
        res.sendResponse(bookIssue, 'Book returned', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};
const getIssuesByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.sendError('Authentication required', 401);
        const bookIssues = await bookIssueService.viewUserBookIssues(userId);
        res.sendResponse(bookIssues, 'User issued books', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

const countIssuedBooks = async (req, res) => {
    try {
        const count = await bookIssueService.getTotalIssuedBooksCount();
        res.sendResponse({ count }, 'Total issued books count', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

const reqestReturnBook = async (req, res) => {
    try {
        const issueId = req.params.id;
        const bookIssue = await bookIssueService.reqestReturnBook(issueId);
        logger.info(`Return requested successfully for Book Issue ID: '${issueId}'`);
        res.sendResponse(bookIssue, 'Return requested', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

const getReturningBooksList = async (req, res) => {
    try {
        const returningBooks = await bookIssueService.getReturningBooksList();
        res.sendResponse(returningBooks, 'Returning books list', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

// notify a user about an overdue book by issue id
const notifyOverdueMail = async (req, res) => {
    try {
        const issueId = req.params.id;
        const bookIssue = await bookIssueService.getBookIssueById(issueId);
        if (!bookIssue) return res.sendError('Book issue not found', 404);

        const today = new Date();
        const returnDate = bookIssue.return_date ? new Date(bookIssue.return_date) : null;
        let isOverdue = false;
        let overduePeriod = '';
        if (returnDate) {
            if (returnDate < today) {
                isOverdue = true;
                const diffMs = today - returnDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                overduePeriod = `${diffDays} days, ${diffHours} hr`;
            }
        }

        if (!isOverdue) {
            return res.sendError('Book is not overdue', 400);
        }

        // fetch related user and book details
        const user = await userService.getUserById(bookIssue.user_id);
        const book = await bookService.getBookById(bookIssue.book_id);

        if (!user) return res.sendError('User not found', 404);

        const subject = `Overdue book notice: ${book ? book.title : 'Your borrowed book'}`;
        const text = `Dear member,\n
This is a reminder that the following book you borrowed is overdue.\n\nBook Title: ${book ? book.title : 'N/A'}\nIssued Date: ${bookIssue.issue_date ? new Date(bookIssue.issue_date).toLocaleDateString() : 'N/A'}\nReturn Date: ${returnDate ? returnDate.toLocaleDateString() : 'N/A'}\nOverdue Period: ${overduePeriod}\n\nMember Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}
        \nPlease return the book as soon as possible to avoid further penalties.\n\n
        \nLibrary Lounge Team`;

        try {
            logger.info(`Sending overdue email to: ${user.email} for issue id: ${issueId}`);
            emitter.emit('sendEmail', { to: user.email, subject, text });
        } catch (emitErr) {
            logger.info('Failed to emit overdue sendEmail event', emitErr);
        }

        return res.sendResponse({ to: user.email }, 'Overdue email queued', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
};

module.exports = {
    requestBook,
    issueBook,
    viewAllIssuedBooks,
    viewDailyIssuedBooks,
    returnBook,
    getIssuesByUser,
    countIssuedBooks,
    reqestReturnBook,
    getReturningBooksList
    ,notifyOverdueMail
};