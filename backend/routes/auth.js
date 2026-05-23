const express = require('express');
const authController = require('../controllers/AuthController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/accept-invite
router.post('/accept-invite', authController.acceptInvite);

module.exports = router;
