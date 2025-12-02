const bcrypt = require('bcryptjs');
const User = require('../models/user.js');


const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email: email.toLowerCase() } });
};

const verifyPassword = async (user, password) => {
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
};



module.exports = {
    findUserByEmail,
    verifyPassword
};









