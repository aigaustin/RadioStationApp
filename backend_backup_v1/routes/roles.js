const express = require('express');
const crypto = require('crypto');
const { safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { loadRoles, saveRoles, normalizePermissions, ALL_PERMISSIONS } = require('../lib/permissions');
const { logActivity } = require('../lib/logger');

const router = express.Router();

// GET /api/roles
router.get('/', requireAuth, requirePermission('roles:read'), (_req, res) => {
  const db = loadRoles();
  res.json({ ok: true, roles: db.roles || [] });
});

// GET /api/permissions
router.get('/permissions', requireAuth, (_req, res) => {
  res.json({ ok: true, permissions: ALL_PERMISSIONS });
});

// POST /api/roles
router.post('/', requireAuth, requirePermission('roles:write'), (req, res) => {
  const { name, permissions } = safeObject(req.body) || {};
  const nm = typeof name === 'string' ? name.trim() : '';
  if (!nm) return res.status(400).json({ ok: false, error: 'Missing role name' });
  const db = loadRoles();
  const id = crypto.randomUUID();
  const role = { id, name: nm, permissions: normalizePermissions(permissions), isSystem: false, createdAt: Date.now() };
  db.roles.push(role);
  saveRoles(db);
  logActivity('role.create', { userId: req.user?.id, email: req.user?.email, details: `Created role ${nm}`, ip: req.ip });
  res.json({ ok: true, role });
});

// PUT /api/roles/:id
router.put('/:id', requireAuth, requirePermission('roles:write'), (req, res) => {
  const id = String(req.params.id || '');
  const { name, permissions } = safeObject(req.body) || {};
  const db = loadRoles();
  const idx = (db.roles || []).findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  if (typeof name === 'string' && name.trim()) db.roles[idx].name = name.trim();
  if (Array.isArray(permissions)) db.roles[idx].permissions = normalizePermissions(permissions);
  saveRoles(db);
  logActivity('role.update', { userId: req.user?.id, email: req.user?.email, details: `Updated role ${db.roles[idx].name}`, ip: req.ip });
  res.json({ ok: true, role: db.roles[idx] });
});

// DELETE /api/roles/:id
router.delete('/:id', requireAuth, requirePermission('roles:write'), (req, res) => {
  const id = String(req.params.id || '');
  if (id === 'admin') return res.status(400).json({ ok: false, error: 'Cannot delete admin role' });
  const db = loadRoles();
  const next = (db.roles || []).filter((r) => r.id !== id);
  if (next.length === db.roles.length) return res.status(404).json({ ok: false, error: 'Not found' });
  saveRoles({ roles: next });
  logActivity('role.delete', { userId: req.user?.id, email: req.user?.email, details: `Deleted role ${id}`, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
