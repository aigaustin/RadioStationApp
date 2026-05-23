const path = require('path');
const { readJsonFile, writeJsonFile } = require('./db');

const ROLES_PATH = path.join(__dirname, '..', 'data', 'roles.json');

const ALL_PERMISSIONS = [
  'config:read',
  'config:write',
  'uploads:write',
  'push:send',
  'users:read',
  'users:write',
  'roles:read',
  'roles:write',
  'invites:read',
  'invites:write',
  'schedule:read',
  'schedule:write',
  'podcasts:read',
  'podcasts:write',
  'contact:read',
  'contact:write',
  'activity:read',
  'mediacp:read',
  'mediacp:write',
];

function normalizePermissions(perms) {
  if (!Array.isArray(perms)) return [];
  const set = new Set();
  perms.forEach((p) => {
    if (typeof p === 'string' && ALL_PERMISSIONS.includes(p)) set.add(p);
  });
  return Array.from(set);
}

function loadRoles() {
  const db = readJsonFile(ROLES_PATH, { roles: [] });
  if (!Array.isArray(db.roles)) db.roles = [];
  return db;
}

function saveRoles(data) {
  writeJsonFile(ROLES_PATH, data);
}

function ensureDefaultRoles() {
  const db = loadRoles();
  if (db.roles && db.roles.length) return;
  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      permissions: ALL_PERMISSIONS.slice(),
      isSystem: true,
      createdAt: Date.now(),
    },
    {
      id: 'editor',
      name: 'Editor',
      permissions: normalizePermissions([
        'config:read', 'config:write', 'uploads:write', 'push:send',
        'invites:read', 'schedule:read', 'schedule:write',
        'podcasts:read', 'podcasts:write', 'contact:read', 'contact:write',
        'activity:read', 'mediacp:read', 'mediacp:write',
      ]),
      isSystem: true,
      createdAt: Date.now(),
    },
    {
      id: 'viewer',
      name: 'Viewer',
      permissions: normalizePermissions([
        'config:read', 'invites:read', 'schedule:read', 'podcasts:read',
        'contact:read', 'activity:read', 'mediacp:read',
      ]),
      isSystem: true,
      createdAt: Date.now(),
    },
  ];
  saveRoles({ roles });
}

function getRoleById(roleId) {
  const rid = typeof roleId === 'string' ? roleId : '';
  const db = loadRoles();
  return (db.roles || []).find((r) => r.id === rid) || null;
}

function resolveUserRole(user) {
  const roleId =
    user && typeof user.roleId === 'string'
      ? user.roleId
      : user && typeof user.role === 'string'
        ? user.role
        : 'viewer';
  const role = getRoleById(roleId) || getRoleById('viewer');
  return role || { id: 'viewer', name: 'Viewer', permissions: ['config:read'] };
}

function userHasPermission(user, permission) {
  if (!permission) return true;
  const role = resolveUserRole(user);
  return Array.isArray(role.permissions) && role.permissions.includes(permission);
}

module.exports = {
  ALL_PERMISSIONS,
  normalizePermissions,
  loadRoles,
  saveRoles,
  ensureDefaultRoles,
  getRoleById,
  resolveUserRole,
  userHasPermission,
  ROLES_PATH,
};
