const userService = require('../services/userService');

const emitter = require('../utils/eventEmitter.js');
const logger = require('../utils/logger.js');

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.sendResponse(user, 'User created', true, 201);
        
            // const subject = "Registeration for BookMyProduct";
            // const text = `Thank you for registering with BookMyProduct. Your account has been successfully created.`;

            logger.info( `new user created with email: ${user.email}. Sending registration email.`);

        emitter.emit('sendEmail', {to: user.email, subject: 'Registration Alert', text: `Dear ${user.name},\n\nThank you for registering to your account. Enjoy the Library.\n\nBest regards,\nLibrary Lounge Team`});
    } catch (error) {
        res.sendError(error.message, 400);
    }
    console.log("in user controller - Create");
    
}

const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.sendResponse(user, 'User updated', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.sendResponse(user, 'User details', true, 200);
    } catch (error) {
        res.sendError(error.message, 404);
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.sendResponse(users, 'User list', true, 200);
    } catch (error) {
        res.sendError(error.message, 400);
    }
}

const removeUser = async (req, res) => {
    try {
        await userService.removeUser(req.params.id);
        return res.status(204).send();
    } catch (error) {
        res.sendError(error.message, 404);
    }
}

module.exports = {
    createUser,
    updateUser,
    getUserById,
    getAllUsers,
    removeUser
};
