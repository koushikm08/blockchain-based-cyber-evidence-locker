const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/signin', login);
router.get('/me', protect, getCurrentUser);

module.exports = router;
