const BookIssue = require('../models/bookIssue.js');
const { Op } = require('sequelize');
const logger = require('../utils/logger.js');
const emitter = require('../utils/eventEmitter.js');


const requestBook = async (bookId, userId, returnDate) => {
    let parsedReturn = null;
    if (returnDate !== undefined && returnDate !== null && returnDate !== '') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
            const parts = returnDate.split('-').map(Number);
            parsedReturn = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
            parsedReturn = new Date(returnDate);
        }
        if (isNaN(parsedReturn.getTime())) {
            throw new Error('Invalid returnDate format');
        }
    } else {
        parsedReturn = new Date();
    }

    const bookIssue = await BookIssue.create({
        book_id: Number(bookId),
        user_id: userId,
        issue_date: new Date(),
        return_date: parsedReturn,
        status: 'requested',
    });
    return bookIssue;
}

const issueBook = async (issueId, approve) => {
    const bookIssue = await BookIssue.findByPk(issueId);
    if (!bookIssue) {
        throw new Error('Book issue request not found');
    }
    if (approve) {
        bookIssue.status = 'issued';
        bookIssue.issue_date = new Date();
    } else {
        bookIssue.status = 'rejected';
    }
    await bookIssue.save();
    logger.info(`Book issue status updated successfully with ID: '${issueId}' to status: '${bookIssue.status}'`);
    return bookIssue;
}

const viewUserBookIssues = async (userId) => {
    const bookIssues = await BookIssue.findAll({ where: { user_id: userId } });
    return bookIssues;
}

const getTotalIssuedBooksCount = async () => {
    const count = await BookIssue.count({
        where: {
            status: 'issued'
        }
    });
    return count;
}

const getIssuedBookList = async () => {
    const issuedBooks = await BookIssue.findAll({
        where: {
            status: 'issued'
        }
    });
    return issuedBooks;
}

const getReturnedBooksList = async () => {
    const returnedBooks = await BookIssue.findAll({
        where: {
            status: 'returned'
        }
    });
    return returnedBooks;
}


const getAllOverdueBookList = async () => {
    const today = new Date();
    const overdueBooks = await BookIssue.findAll({
        where: {
            status: 'overdue',
            return_date: {
                [Op.lt]: today
            }
        }
    });
    return overdueBooks;
}



const getOverdueBooksCount = async () => {
    const today = new Date();
    const count = await BookIssue.count({
        where: {
            status: 'overdue',
            return_date: {
                [Op.lt]: today
            }
        }
    });
    return count;
}

const viewAllBookIssues = async () => {
    const bookIssues = await BookIssue.findAll();
    return bookIssues;
}

const getRequestedBooksList = async () => {
    const requestedBooks = await BookIssue.findAll({
        where: {
            status: 'requested'
        }
    });
    return requestedBooks;
}
// request a return of a book by issueId setting the status as 'returning'

const reqestReturnBook = async (issueId) => {
    const bookIssue = await BookIssue.findByPk(issueId);
    if (!bookIssue) {
        throw new Error('Book issue request not found');
    }
    bookIssue.status = 'returning';
    await bookIssue.save();
    logger.info(`Book return requested successfully with ID: '${issueId}'`);
    return bookIssue;
};

const getReturningBooksList = async () => {
    const returningBooks = await BookIssue.findAll({
        where: {
            status: 'returning'
        }
    });
    return returningBooks;
};

const returnBook = async (issueId) => {
    const bookIssue = await BookIssue.findByPk(issueId);
    if (!bookIssue) {
        throw new Error('Book issue request not found');
    }
    const planned = bookIssue.return_date ? new Date(bookIssue.return_date) : null;
    const actualReturn = new Date();
    let status = 'returned';
    if (planned) {
        const plannedMid = new Date(planned.getFullYear(), planned.getMonth(), planned.getDate());
        const todayMid = new Date(actualReturn.getFullYear(), actualReturn.getMonth(), actualReturn.getDate());
        if (plannedMid < todayMid) {
            status = 'overdue';
        } else {
            status = 'returned';
        }
    }
    bookIssue.status = status;
    bookIssue.return_date = actualReturn;
    await bookIssue.save();
    logger.info(`Book return processed successfully with ID: '${issueId}', status set as: '${status}'`);
    return bookIssue;
};


const viewDailyIssuedBooks = async (date) => {
    const target = date ? new Date(date) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    // console.log("in bookIssue Service, Daily Issued Books", start, end);
    const bookIssues = await BookIssue.findAll({
        where: {
            issue_date: {
                [Op.between]: [start, end]
            }
        }
    });
    return bookIssues;
};

const getReturnedBooksCount = async () => {
    const count = await BookIssue.count({
        where: {
            status: 'returned'
        }
    });
    return count;
}

const getBookIssueById = async (issueId) => {
    const bookIssue = await BookIssue.findByPk(issueId);
    return bookIssue;
}


module.exports = {
    requestBook,
    issueBook,
    viewUserBookIssues,
    viewAllBookIssues,
    viewDailyIssuedBooks,
    returnBook,
    getTotalIssuedBooksCount,
    getOverdueBooksCount,
    getAllOverdueBookList,
    getReturnedBooksCount,
    getIssuedBookList,
    getReturnedBooksList,
    getRequestedBooksList,
    reqestReturnBook,
    getReturningBooksList,
    getBookIssueById
};
