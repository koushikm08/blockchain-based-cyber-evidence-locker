const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user has required role
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        if (!roles.includes(req.user.role)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};
