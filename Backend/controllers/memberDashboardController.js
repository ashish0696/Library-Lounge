const bookService = require('../services/bookService.js');
const issueService = require('../services/bookIssueService.js');


const getAvailableBooks = async (req, res) => {
    try {
        const books = await bookService.getAvailableBooks();
        res.sendResponse(books, 'Available books', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const myBookIssues = async (req, res) => {
    try {
        const issuedBooks = await issueService.viewUserBookIssues(req.user.id);
        res.sendResponse(issuedBooks, 'My issued books', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

module.exports = {
    getAvailableBooks,
    myBookIssues
};