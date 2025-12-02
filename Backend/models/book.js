const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig.js');


const book = sequelize.define('Book', {
    book_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    publisher:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    category:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'image_url'
    },
    status: {
        type: DataTypes.ENUM("available", "reserved"),
        allowNull: false,
        defaultValue: 'available',
    }
},{
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = book;