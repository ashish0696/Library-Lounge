const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.sendError('Authentication required', 401);
            }

            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

            if (!roles.includes(req.user.role)) {
                return res.sendError('Access denied for this resource', 403);
            }

            return next();
        } catch (err) {
            return res.sendError('Authorization failure', 500);
        }
    };
};

module.exports = { roleMiddleware };