const userService = require('../services/UserService');

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

class UserController {
  async listUsers(req, res) {
    try {
      const users = await userService.listUsers(req.tenantId, req.user.isSuperAdmin);
      const mapped = users.map((u) => ({
        id: u.id,
        email: u.email,
        roleId: u.role?.id || '',
        roleName: u.role?.name || 'Viewer',
        disabled: !!u.disabled,
        createdAt: u.createdAt,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        avatarUrl: u.avatarUrl || '',
        company: u.company || '',
        timezone: u.timezone || '',
        tenantId: u.tenantId,
        tenantName: u.tenant?.name || ''
      }));
      res.json({ ok: true, users: mapped });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const body = safeObject(req.body) || {};
      const data = {
        firstName: typeof body.firstName === 'string' ? body.firstName.trim() : undefined,
        lastName: typeof body.lastName === 'string' ? body.lastName.trim() : undefined,
        avatarUrl: typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : undefined,
        company: typeof body.company === 'string' ? body.company.trim() : undefined,
        timezone: typeof body.timezone === 'string' ? body.timezone.trim() : undefined,
        password: typeof body.password === 'string' && body.password ? body.password : undefined
      };
      
      await userService.updateProfile(req.user.id, req.user.email, req.ip, data);
      res.json({ ok: true });
    } catch (err) {
      const isClientError = err.message === 'Password too short';
      res.status(isClientError ? 400 : 500).json({ ok: false, error: err.message });
    }
  }

  async createUser(req, res) {
    try {
      const body = safeObject(req.body) || {};
      const data = {
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
        password: typeof body.password === 'string' ? body.password : '',
        roleId: body.roleId
      };
      
      await userService.createUser(data, req.tenantId, req.user.isSuperAdmin, req.user.id, req.user.email, req.ip);
      res.json({ ok: true });
    } catch (err) {
      const isClientError = ['Missing email/password', 'Password too short', 'Invalid role'].includes(err.message);
      const isForbidden = err.message === 'Forbidden role assignment';
      const isConflict = err.message === 'User exists';
      
      const status = isForbidden ? 403 : isConflict ? 409 : isClientError ? 400 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  }

  async updateUser(req, res) {
    try {
      const id = String(req.params.id || '');
      const body = safeObject(req.body) || {};
      const data = {
        disabled: body.disabled,
        roleId: body.roleId,
        password: typeof body.password === 'string' ? body.password : undefined
      };

      await userService.updateUser(id, data, req.tenantId, req.user.isSuperAdmin, req.user.id, req.user.email, req.ip);
      res.json({ ok: true });
    } catch (err) {
      const isNotFound = err.message === 'Not found';
      const isForbidden = err.message === 'Forbidden' || err.message === 'Forbidden role assignment';
      const isClientError = err.message === 'Password too short';
      
      const status = isNotFound ? 404 : isForbidden ? 403 : isClientError ? 400 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const id = String(req.params.id || '');
      await userService.deleteUser(id, req.tenantId, req.user.isSuperAdmin, req.user.id, req.user.email, req.ip);
      res.json({ ok: true });
    } catch (err) {
      const isNotFound = err.message === 'Not found';
      const isForbidden = err.message === 'Forbidden';
      
      const status = isNotFound ? 404 : isForbidden ? 403 : 500;
      res.status(status).json({ ok: false, error: err.message });
    }
  }
}

module.exports = new UserController();
