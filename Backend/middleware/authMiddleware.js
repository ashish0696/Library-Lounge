const { verifyToken } = require('../utils/jwt.js');
const User = require('../models/user.js');

const checkAuthJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.sendError('No token provided', 401);
        }

        const decoded = verifyToken(token);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.sendError('Invalid or expired session token', 401);
        }
        req.user = { id: user.user_id, role: user.role };
        next();
    } catch (error) {
    return res.sendError('Invalid token', 401);
    }
};

module.exports = { checkAuthJWT };