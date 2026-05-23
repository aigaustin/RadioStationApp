const authService = require('../services/AuthService');

function setCookie(res, token) {
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!process.env.COOKIE_SECURE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

class AuthController {
  async register(req, res) {
    try {
      const { email, password, stationName } = safeObject(req.body) || {};
      if (!email || !password || !stationName) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }
      if (password.length < 6) {
        return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
      }

      const { user, token } = await authService.register(email, password, stationName, req.ip);

      setCookie(res, token);
      
      res.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          isSuperAdmin: !user.tenantId,
          tenantId: user.tenantId,
          role: user.role ? { id: user.role.id, name: user.role.name } : null,
          permissions: user.role ? user.role.permissions : []
        },
      });
    } catch (err) {
      const isClientError = err.message === 'Email already in use';
      res.status(isClientError ? 409 : 500).json({ ok: false, error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = safeObject(req.body) || {};
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Missing credentials' });
      }

      const { user, token } = await authService.login(email, password, req.ip);

      setCookie(res, token);
      
      res.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          isSuperAdmin: !user.tenantId,
          tenantId: user.tenantId,
          role: user.role ? { id: user.role.id, name: user.role.name } : null,
          permissions: user.role ? user.role.permissions : []
        },
      });
    } catch (err) {
      const isClientError = err.message === 'Invalid credentials' || err.message === 'Account disabled';
      res.status(isClientError ? 401 : 500).json({ ok: false, error: err.message });
    }
  }

  async acceptInvite(req, res) {
    try {
      const { token, email, password } = safeObject(req.body) || {};
      
      const { user, token: jwtToken } = await authService.acceptInvite(token, email, password, req.ip);

      setCookie(res, jwtToken);
      
      res.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role ? { id: user.role.id, name: user.role.name } : null,
          permissions: user.role ? user.role.permissions : []
        },
      });
    } catch (err) {
      const clientErrors = [
        'Missing token or weak password', 'Invalid invite', 'Invite revoked', 
        'Invite already used', 'Invite expired', 'Email does not match invite', 
        'Email required'
      ];
      const isClientError = clientErrors.includes(err.message);
      const status = err.message === 'User already exists' ? 409 : (isClientError ? 400 : 500);
      res.status(status).json({ ok: false, error: err.message });
    }
  }

  async logout(req, res) {
    res.clearCookie('session', { path: '/' });
    res.json({ ok: true });
  }
}

module.exports = new AuthController();
