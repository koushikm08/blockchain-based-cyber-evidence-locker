const User = require('../models/User');

// @desc    Get all users
// @route   GET `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const users = await User.find().sort('-createdAt');
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const { role } = req.body;

        // Prevent changing own role for safety (optional but good practice)
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        // Prevent deleting self
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete yourself'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
