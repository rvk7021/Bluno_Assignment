const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Sign up route
router.post('/signup', authController.signup);

// Sign in route
router.post('/signin', authController.signin);

module.exports = router; 