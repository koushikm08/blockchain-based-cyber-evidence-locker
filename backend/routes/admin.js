const express = require('express');
const {
    getUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

const router = express.Router();

// Apply protection and role check to all routes
router.use(protect);
router.use(checkRole('admin'));

router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/users/:id/role')
    .put(updateUserRole);

module.exports = router;
