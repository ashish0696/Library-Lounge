const bookService = require('../services/bookService.js');
const logger = require('../utils/logger.js');
const createBook = async (req, res) => {
    try {
        const book = await bookService.createBook(req.body);
        logger.info(`Book created successfully: '${book.title}'`);
    res.sendResponse(book, 'Book created', true, 201);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const updateBook = async (req, res) => {
    try {
        const book = await bookService.updateBook(req.params.id, req.body);
        logger.info(`Book updated successfully: '${book.title}'`);

        res.sendResponse(book, 'Book updated', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const getBookById = async (req, res) => {
    try {
        const book = await bookService.getBookById(req.params.id);
        res.sendResponse(book, 'Book details', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const getAllBooks = async (req, res) => {
    try {
        const books = await bookService.getAllBooks();
        res.sendResponse(books, 'Book list', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const deleteBook = async (req, res) => {
    try {
        await bookService.deleteBook(req.params.id);
        logger.info(`Book deleted successfully with ID: '${req.params.id}'`);
        // 204 No Content - send no body
        return res.status(204).send();
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const bookCount = async (req, res) => {
    try {
        const count = await bookService.getBookCount();
        res.sendResponse({ count }, 'Book count', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

module.exports = {
    createBook,
    updateBook,
    getBookById,
    getAllBooks,
    deleteBook,
    bookCount
};