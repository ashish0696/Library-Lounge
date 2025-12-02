const User = require('../models/user');
const { hashPassword } = require('../utils/authUtil');
const { MESSAGES } = require('../utils/messages');


const createUser = async (userData) => {
    // check duplicate email first to provide a friendly error
    const existing = await User.findOne({ where: { email: userData.email } });
    if (existing) {
        // throw an Error with consistent message consumed by controller/middleware
        const err = new Error(MESSAGES.EMAIL_ALREADY_EXIST);
        err.status = 400;
        throw err;
    }

    const password_hash =  await hashPassword(userData.password);
    const user = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: password_hash,
        role: userData.role || 'member',
    });
    return user;
}

const updateUser =  async (id, userData) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
        if (userData.password) {
                userData.password = await hashPassword(userData.password);
        }
        return user.update(userData);
}

const getUserById = async (id) => {
        const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
        return user;
}
const getTotalUsersCount = async () => {
    return await User.count();
}

const getAllUsers = async () => {
    return await User.findAll({ attributes: { exclude: ['password'] } });
}


const removeUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    await user.destroy();
    return true;
}


module.exports = {
    createUser,
    updateUser,
    getUserById,
    getAllUsers,
    removeUser,
    getTotalUsersCount
};
