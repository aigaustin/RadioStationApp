const prisma = require('../lib/prisma');
const { verifyToken } = require('../lib/auth');

async function getAuthUser(req) {
  const token = req.cookies?.session || '';
  const payload = token ? verifyToken(token) : null;
  if (!payload?.sub) return null;
  
  const u = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true }
  });
  
  if (!u || u.disabled) return null;
  
  // Impersonation logic for Super Admins
  let activeTenantId = u.tenantId;
  const impersonateId = req.cookies?.impersonateTenantId;
  if (!u.tenantId && impersonateId) {
    // User is a Super Admin and is impersonating a tenant
    activeTenantId = impersonateId;
  }
  
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    avatarUrl: u.avatarUrl || '',
    company: u.company || '',
    timezone: u.timezone || '',
    tenantId: activeTenantId,
    isSuperAdmin: !u.tenantId,
    role: u.role ? { id: u.role.id, name: u.role.name } : null,
    permissions: u.role ? u.role.permissions : [],
  };
}

async function requireAuth(req, res, next) {
  try {
    const u = await getAuthUser(req);
    if (!u) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    req.user = u;
    req.tenantId = u.tenantId;
    next();
  } catch (err) {
    next(err);
  }
}

function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      const u = req.user || await getAuthUser(req);
      if (!u) return res.status(401).json({ ok: false, error: 'Unauthorized' });
      
      // Super Admins bypass permissions if not impersonating, or we can just give them everything.
      // But if impersonating, they have full access to that tenant.
      const hasPerm = u.isSuperAdmin || (u.permissions && u.permissions.includes(permission));
      
      if (!hasPerm) {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      req.user = u;
      req.tenantId = u.tenantId;
      next();
    } catch (err) {
      next(err);
    }
  };
}

function requireGlobalAdmin(req, res, next) {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ ok: false, error: 'Forbidden. Super Admin only.' });
  }
  next();
}

function baseUrlFromReq(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

module.exports = { getAuthUser, requireAuth, requirePermission, requireGlobalAdmin, baseUrlFromReq };
