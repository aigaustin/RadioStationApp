const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { getRoleById, resolveUserRole, loadRoles } = require('../lib/permissions');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

function loadUsers() {
  const db = readJsonFile(USERS_PATH, { users: [] });
  if (!Array.isArray(db.users)) db.users = [];
  // Normalize legacy fields
  let changed = false;
  db.users.forEach((u) => {
    if (!u) return;
    if (!u.roleId && typeof u.role === 'string') { u.roleId = u.role; changed = true; }
    if (!u.roleId) { u.roleId = 'viewer'; changed = true; }
    if (u.role && u.role !== u.roleId) { delete u.role; changed = true; }
    if (typeof u.disabled !== 'boolean') { u.disabled = false; changed = true; }
  });
  if (changed) writeJsonFile(USERS_PATH, db);
  return db;
}

function saveUsers(data) {
  writeJsonFile(USERS_PATH, data);
}

// GET /api/users
router.get('/', requireAuth, requirePermission('users:read'), (_req, res) => {
  const db = loadUsers();
  const rolesDb = loadRoles();
  const rolesById = new Map((rolesDb.roles || []).map((r) => [r.id, r]));
  const users = (db.users || []).map((u) => ({
    id: u.id,
    email: u.email,
    roleId: u.roleId || 'viewer',
    roleName: rolesById.get(u.roleId || 'viewer')?.name || (u.roleId || 'viewer'),
    disabled: !!u.disabled,
    createdAt: u.createdAt,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    avatarUrl: u.avatarUrl || '',
    company: u.company || '',
    timezone: u.timezone || '',
  }));
  res.json({ ok: true, users });
});

// PUT /api/users/me/profile
router.put('/me/profile', requireAuth, (req, res) => {
  const { firstName, lastName, avatarUrl, company, timezone, password } = safeObject(req.body) || {};
  const db = loadUsers();
  const idx = db.users.findIndex((u) => u.id === req.user?.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'User not found' });
  
  if (typeof firstName === 'string') db.users[idx].firstName = firstName.trim();
  if (typeof lastName === 'string') db.users[idx].lastName = lastName.trim();
  if (typeof avatarUrl === 'string') db.users[idx].avatarUrl = avatarUrl.trim();
  if (typeof company === 'string') db.users[idx].company = company.trim();
  if (typeof timezone === 'string') db.users[idx].timezone = timezone.trim();
  
  if (typeof password === 'string' && password) {
    if (password.length < 6) return res.status(400).json({ ok: false, error: 'Password too short' });
    db.users[idx].passwordHash = bcrypt.hashSync(password, 10);
  }
  
  saveUsers(db);
  logActivity('profile.update', { userId: req.user?.id, email: req.user?.email, details: 'Updated own profile', ip: req.ip });
  res.json({ ok: true });
});

// POST /api/users
router.post('/', requireAuth, requirePermission('users:write'), (req, res) => {
  const { email, password, roleId } = safeObject(req.body) || {};
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const pw = typeof password === 'string' ? password : '';
  const rid = typeof roleId === 'string' && roleId ? roleId : 'viewer';
  if (!em || !pw) return res.status(400).json({ ok: false, error: 'Missing email/password' });
  if (pw.length < 6) return res.status(400).json({ ok: false, error: 'Password too short' });
  if (!getRoleById(rid)) return res.status(400).json({ ok: false, error: 'Invalid role' });
  const db = loadUsers();
  if (db.users.some((u) => String(u.email).toLowerCase() === em)) return res.status(409).json({ ok: false, error: 'User exists' });
  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(pw, 10);
  db.users.push({ 
    id, email: em, passwordHash, roleId: rid, disabled: false, createdAt: Date.now(),
    firstName: '', lastName: '', avatarUrl: '', company: '', timezone: ''
  });
  saveUsers(db);
  logActivity('user.create', { userId: req.user?.id, email: req.user?.email, details: `Created user ${em}`, ip: req.ip });
  res.json({ ok: true });
});

// PUT /api/users/:id
router.put('/:id', requireAuth, requirePermission('users:write'), (req, res) => {
  const id = String(req.params.id || '');
  const { password, roleId, disabled } = safeObject(req.body) || {};
  const db = loadUsers();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  if (typeof roleId === 'string' && roleId && getRoleById(roleId)) db.users[idx].roleId = roleId;
  if (typeof disabled === 'boolean') db.users[idx].disabled = disabled;
  if (typeof password === 'string') {
    if (password.length < 6) return res.status(400).json({ ok: false, error: 'Password too short' });
    db.users[idx].passwordHash = bcrypt.hashSync(password, 10);
  }
  saveUsers(db);
  logActivity('user.update', { userId: req.user?.id, email: req.user?.email, details: `Updated user ${db.users[idx].email}`, ip: req.ip });
  res.json({ ok: true });
});

// DELETE /api/users/:id
router.delete('/:id', requireAuth, requirePermission('users:write'), (req, res) => {
  const id = String(req.params.id || '');
  const db = loadUsers();
  const target = db.users.find((u) => u.id === id);
  const next = db.users.filter((u) => u.id !== id);
  if (next.length === db.users.length) return res.status(404).json({ ok: false, error: 'Not found' });
  saveUsers({ users: next });
  logActivity('user.delete', { userId: req.user?.id, email: req.user?.email, details: `Deleted user ${target?.email}`, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
module.exports.loadUsers = loadUsers;
module.exports.saveUsers = saveUsers;
module.exports.USERS_PATH = USERS_PATH;
