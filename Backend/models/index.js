const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/dbConfig.js');
const User = require('./user.js');
const Book = require('./book.js');
const BookIssue = require('./bookIssue.js');

// associate models if needed
User.hasMany(BookIssue, { foreignKey: 'user_id' });
Book.hasMany(BookIssue, { foreignKey: 'book_id' });
BookIssue.belongsTo(User, { foreignKey: 'user_id' });
BookIssue.belongsTo(Book, { foreignKey: 'book_id' });




module.exports = {
    User,
    Book
};

