const bookService = require('../services/bookService.js');
const userService = require('../services/userService.js');
const issueService = require('../services/bookIssueService.js');

const getDashboardStats = async (req, res) => {
    try {
        const totalBooks = await bookService.getTotalBooksCount();
        const totalUsers = await userService.getTotalUsersCount();
        const totalIssuedBooks = await issueService.getTotalIssuedBooksCount();
        const overdueBooks = await issueService.getOverdueBooksCount();
        res.sendResponse({ totalBooks, totalUsers, totalIssuedBooks, overdueBooks }, 'Dashboard stats', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

const getDailyIssues = async (req, res) => {
    try {
        const dailyIssues = await issueService.viewDailyIssuedBooks();
        res.sendResponse({ dailyIssues }, 'Daily issued books count', true, 200);
    } catch (error) {
        res.sendError(error.message, 500);
    }
};

module.exports = {
    getDashboardStats,
    getDailyIssues
};

