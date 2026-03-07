const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePasswordStrength, validateFullName, validateOrganization } = require('../utils/validation');

// Register
exports.register = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const { fullName, email, password, confirmPassword, organization, role, adminCode } = req.body;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) return res.status(400).json({ message: emailValidation.message });

    const nameValidation = validateFullName(fullName);
    if (!nameValidation.valid) return res.status(400).json({ message: nameValidation.message });

    const orgValidation = validateOrganization(organization);
    if (!orgValidation.valid) return res.status(400).json({ message: orgValidation.message });

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return res.status(400).json({ message: strengthCheck.message || 'Password does not meet strength requirements' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Handle admin code validation
    if (role === 'admin') {
      const validAdminCode = process.env.ADMIN_SIGNUP_CODE || '123456789';
      if (adminCode !== validAdminCode) {
        return res.status(403).json({ message: 'Invalid admin verification code' });
      }
    }

    // Create user (password will be hashed by the pre-save middleware)
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: password,
      organization,
      role: role || 'investigator',
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'evidence_locker_secret_key_2026_change_this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) return res.status(400).json({ message: emailValidation.message });

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'evidence_locker_secret_key_2026_change_this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.setHeader('Content-Type', 'application/json');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
