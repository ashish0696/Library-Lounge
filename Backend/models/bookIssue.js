const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig.js');


const BookIssue = sequelize.define('BookIssue', {
    issue_id: {
        type: DataTypes.INTEGER,    
        primaryKey: true,
        autoIncrement: true,
    },
    book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    issue_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    return_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("requested","issued", "rejected", "returned","returning", "overdue"),
        defaultValue: "requested",
        allowNull: false,
    },
},{
    tableName: 'book_issues',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = BookIssue;