const prisma = require('./prisma');

const ALL_PERMISSIONS = [
  'config:read', 'config:write', 'uploads:write', 'push:send',
  'users:read', 'users:write', 'roles:read', 'roles:write',
  'invites:read', 'invites:write', 'schedule:read', 'schedule:write',
  'podcasts:read', 'podcasts:write', 'contact:read', 'contact:write',
  'activity:read', 'mediacp:read', 'mediacp:write', 'tenants:read', 'tenants:write'
];

function normalizePermissions(perms) {
  if (!Array.isArray(perms)) return [];
  const set = new Set();
  perms.forEach((p) => {
    if (typeof p === 'string' && ALL_PERMISSIONS.includes(p)) set.add(p);
  });
  return Array.from(set);
}

async function createDefaultTenantRoles(tenantId) {
  const existingRoles = await prisma.role.count({ where: { tenantId } });
  if (existingRoles > 0) return;

  await prisma.role.createMany({
    data: [
      {
        name: 'Admin',
        permissions: normalizePermissions([
          'config:read', 'config:write', 'uploads:write', 'push:send',
          'users:read', 'users:write', 'roles:read', 'roles:write',
          'invites:read', 'invites:write', 'schedule:read', 'schedule:write',
          'podcasts:read', 'podcasts:write', 'contact:read', 'contact:write',
          'activity:read', 'mediacp:read', 'mediacp:write', 'billing:read'
        ]),
        tenantId
      },
      {
        name: 'Editor',
        permissions: normalizePermissions([
          'config:read', 'config:write', 'uploads:write', 'push:send',
          'invites:read', 'schedule:read', 'schedule:write',
          'podcasts:read', 'podcasts:write', 'contact:read', 'contact:write',
          'activity:read', 'mediacp:read', 'mediacp:write'
        ]),
        tenantId
      },
      {
        name: 'Viewer',
        permissions: normalizePermissions([
          'config:read', 'invites:read', 'schedule:read', 'podcasts:read',
          'contact:read', 'activity:read', 'mediacp:read'
        ]),
        tenantId
      }
    ]
  });
}

module.exports = {
  ALL_PERMISSIONS,
  normalizePermissions,
  createDefaultTenantRoles
};
