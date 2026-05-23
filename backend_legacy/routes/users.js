const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const userController = require('../controllers/UserController');

const router = express.Router();

// GET /api/users
router.get('/', requireAuth, requirePermission('users:read'), userController.listUsers);

// PUT /api/users/me/profile
router.put('/me/profile', requireAuth, userController.updateProfile);

// POST /api/users
router.post('/', requireAuth, requirePermission('users:write'), userController.createUser);

// PUT /api/users/:id
router.put('/:id', requireAuth, requirePermission('users:write'), userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', requireAuth, requirePermission('users:write'), userController.deleteUser);

module.exports = router;
