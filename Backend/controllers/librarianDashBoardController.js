const bookService = require('../services/bookService.js');
const issueService = require('../services/bookIssueService.js');


const bookCount = async (req, res) => {
    try {
        const count = await bookService.getTotalBooksCount();
        res.sendResponse({ count }, 'Total books count', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const issuedBookCount = async (req, res) => {
    try {
        const count = await issueService.getTotalIssuedBooksCount();
        res.sendResponse({ count }, 'Total issued books count', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const overdueBookCount = async (req, res) => {
    try {
        const count = await issueService.getOverdueBooksCount();
        res.sendResponse({ count }, 'Total overdue books count', true, 200);
    }
    catch (error) {
        res.sendError(error.message, 500);
    }
};

const getOverdueBooksList = async (req, res) => {
    try {
        const overdueBooks = await issueService.getAllOverdueBookList();
        res.sendResponse(overdueBooks, 'Overdue books list', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const returnedBookCount = async (req, res) => {
    try {
        const count = await issueService.getReturnedBooksCount();
        res.sendResponse({ count }, 'Total returned books count', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const issuedBooksList = async (req, res) => {
    try {
        const issuedBooks = await issueService.getIssuedBookList();
        res.sendResponse(issuedBooks, 'Issued books list', true, 200);
    }
    catch (error) {
        res.sendError(error.message, 500);
    }
};

const getReturnedBooksList = async (req, res) => {
    try {
        const returnedBooks = await issueService.getReturnedBooksList();
        res.sendResponse(returnedBooks, 'Returned books list', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const getRequestedBooksList = async (req, res) => {
    try {
        const requestedBooks = await issueService.getRequestedBooksList();
        res.sendResponse(requestedBooks, 'Requested books list', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};


module.exports = {
    bookCount,
    issuedBookCount,
    overdueBookCount,
    getOverdueBooksList,
    returnedBookCount,
    issuedBooksList,
    getReturnedBooksList,
    getRequestedBooksList
};