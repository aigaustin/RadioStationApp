const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const roleController = require('../controllers/RoleController');

const router = express.Router();

// GET /api/roles
router.get('/', requireAuth, requirePermission('roles:read'), roleController.listRoles);

// GET /api/permissions
router.get('/permissions', requireAuth, roleController.getPermissions);

// POST /api/roles
router.post('/', requireAuth, requirePermission('roles:write'), roleController.createRole);

// PUT /api/roles/:id
router.put('/:id', requireAuth, requirePermission('roles:write'), roleController.updateRole);

// DELETE /api/roles/:id
router.delete('/:id', requireAuth, requirePermission('roles:write'), roleController.deleteRole);

module.exports = router;
