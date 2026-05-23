const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signToken } = require('../lib/auth');
const { logActivity } = require('../lib/logger');

// Define default tenant permissions instead of ALL_PERMISSIONS
// This avoids granting global super-admin scopes to tenant owners.
const DEFAULT_TENANT_OWNER_PERMS = [
  'config:read', 'config:write', 'uploads:write', 'push:send',
  'users:read', 'users:write', 'roles:read', 'roles:write',
  'invites:read', 'invites:write', 'schedule:read', 'schedule:write',
  'podcasts:read', 'podcasts:write', 'contact:read', 'contact:write',
  'activity:read', 'mediacp:read', 'mediacp:write', 'billing:read'
];

class AuthService {
  async register(email, password, stationName, ipAddress) {
    const em = String(email).toLowerCase().trim();

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email: em } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Create Tenant
    const tenant = await prisma.tenant.create({
      data: { name: String(stationName).trim() }
    });

    // Create Owner Role for Tenant with strict scoped permissions
    const role = await prisma.role.create({
      data: {
        name: 'Owner',
        permissions: DEFAULT_TENANT_OWNER_PERMS,
        tenantId: tenant.id
      }
    });

    // Create User
    const passwordHash = bcrypt.hashSync(String(password), 10);
    const u = await prisma.user.create({
      data: {
        email: em,
        passwordHash,
        tenantId: tenant.id,
        roleId: role.id
      },
      include: { role: true }
    });

    const token = signToken(u);
    logActivity('auth.register', { userId: u.id, email: u.email, details: 'Registered new tenant: ' + tenant.name, ip: ipAddress });

    return { user: u, token };
  }

  async login(email, password, ipAddress) {
    const em = String(email).toLowerCase().trim();
    const u = await prisma.user.findUnique({
      where: { email: em },
      include: { role: true }
    });

    if (!u) throw new Error('Invalid credentials');
    if (u.disabled) throw new Error('Account disabled');
    
    const valid = bcrypt.compareSync(String(password), u.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = signToken(u);
    logActivity('auth.login', { userId: u.id, email: u.email, details: 'User logged in', ip: ipAddress });

    return { user: u, token };
  }

  async acceptInvite(token, email, password, ipAddress) {
    const t = typeof token === 'string' ? token.trim() : '';
    const pw = typeof password === 'string' ? password : '';
    const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    if (!t || pw.length < 6) throw new Error('Missing token or weak password');

    const { hashToken } = require('../lib/auth');
    const tokenHash = hashToken(t);
    const inv = await prisma.invite.findFirst({ where: { tokenHash } });

    if (!inv) throw new Error('Invalid invite');
    if (inv.revokedAt) throw new Error('Invite revoked');
    if (inv.usedAt) throw new Error('Invite already used');
    if (inv.expiresAt && Date.now() > inv.expiresAt.getTime()) throw new Error('Invite expired');
    if (inv.email && em && inv.email.toLowerCase() !== em) throw new Error('Email does not match invite');
    if (inv.email && !em) throw new Error('Email required');

    const finalEmail = (inv.email || em || '').trim().toLowerCase();
    if (!finalEmail) throw new Error('Email required');

    const existingUser = await prisma.user.findUnique({ where: { email: finalEmail } });
    if (existingUser) throw new Error('User already exists');

    const passwordHash = bcrypt.hashSync(pw, 10);
    
    const user = await prisma.user.create({
      data: {
        email: finalEmail,
        passwordHash,
        roleId: inv.roleId,
        tenantId: inv.tenantId,
        disabled: false
      },
      include: { role: true }
    });

    await prisma.invite.update({
      where: { id: inv.id },
      data: { usedAt: new Date() }
    });

    const jwtToken = signToken(user);
    logActivity('auth.accept-invite', { userId: user.id, email: user.email, ip: ipAddress });

    return { user, token: jwtToken };
  }
}

module.exports = new AuthService();
