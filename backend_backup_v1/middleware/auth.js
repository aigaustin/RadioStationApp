const path = require('path');
const { readJsonFile } = require('../lib/db');
const { verifyToken } = require('../lib/auth');
const { resolveUserRole } = require('../lib/permissions');

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  const db = readJsonFile(USERS_PATH, { users: [] });
  if (!Array.isArray(db.users)) db.users = [];
  return db;
}

function getAuthUser(req) {
  const token = req.cookies?.session || '';
  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) return null;
  const db = loadUsers();
  const u = db.users.find((x) => x.id === payload.sub);
  if (!u || u.disabled) return null;
  const role = resolveUserRole(u);
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    avatarUrl: u.avatarUrl || '',
    company: u.company || '',
    timezone: u.timezone || '',
    role: { id: role.id, name: role.name },
    permissions: role.permissions || [],
  };
}

function requireAuth(req, res, next) {
  const u = getAuthUser(req);
  if (!u) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  req.user = u;
  next();
}

function requirePermission(permission) {
  return (req, res, next) => {
    const u = req.user || getAuthUser(req);
    if (!u) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (!u.permissions || !u.permissions.includes(permission)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    req.user = u;
    next();
  };
}

function baseUrlFromReq(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

module.exports = { getAuthUser, requireAuth, requirePermission, baseUrlFromReq };
