const roleService = require('../services/RoleService');
const { ALL_PERMISSIONS } = require('../lib/permissions');

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

class RoleController {
  async listRoles(req, res) {
    try {
      const roles = await roleService.listRoles(req.tenantId, req.user.isSuperAdmin);
      res.json({ ok: true, roles });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  getPermissions(req, res) {
    res.json({ ok: true, permissions: ALL_PERMISSIONS });
  }

  async createRole(req, res) {
    try {
      const body = safeObject(req.body) || {};
      const data = {
        name: typeof body.name === 'string' ? body.name.trim() : '',
        permissions: body.permissions
      };

      const role = await roleService.createRole(data, req.tenantId, req.user.id, req.user.email, req.ip);
      res.json({ ok: true, role });
    } catch (err) {
      const isClientError = err.message === 'Missing role name' || err.message === 'Role name already exists';
      res.status(isClientError ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async updateRole(req, res) {
    try {
      const id = String(req.params.id || '');
      const body = safeObject(req.body) || {};
      const data = {
        name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : undefined,
        permissions: body.permissions
      };

      const role = await roleService.updateRole(id, data, req.tenantId, req.user.isSuperAdmin, req.user.id, req.user.email, req.ip);
      res.json({ ok: true, role });
    } catch (err) {
      const isNotFound = err.message === 'Not found';
      const isForbidden = err.message === 'Forbidden';
      
      const status = isNotFound ? 404 : isForbidden ? 403 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const id = String(req.params.id || '');
      await roleService.deleteRole(id, req.tenantId, req.user.isSuperAdmin, req.user.id, req.user.email, req.ip);
      res.json({ ok: true });
    } catch (err) {
      const isNotFound = err.message === 'Not found';
      const isForbidden = err.message === 'Forbidden';
      const isClientError = err.message === 'Cannot delete Admin role';
      
      const status = isNotFound ? 404 : isForbidden ? 403 : isClientError ? 400 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  }
}

module.exports = new RoleController();
