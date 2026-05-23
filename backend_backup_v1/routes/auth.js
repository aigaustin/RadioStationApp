const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { signToken, hashToken } = require('../lib/auth');
const { resolveUserRole, getRoleById } = require('../lib/permissions');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');
const INVITES_PATH = path.join(__dirname, '..', 'data', 'invites.json');

function loadUsers() {
  const db = readJsonFile(USERS_PATH, { users: [] });
  if (!Array.isArray(db.users)) db.users = [];
  return db;
}

function saveUsers(data) {
  writeJsonFile(USERS_PATH, data);
}

function setCookie(res, token) {
  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!process.env.COOKIE_SECURE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = safeObject(req.body) || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });
  const db = loadUsers();
  const u = db.users.find((x) => String(x.email).toLowerCase() === String(email).toLowerCase());
  if (!u) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  if (u.disabled) return res.status(403).json({ ok: false, error: 'Account disabled' });
  const ok = bcrypt.compareSync(String(password), String(u.passwordHash));
  if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  const token = signToken(u);
  setCookie(res, token);
  const role = resolveUserRole(u);
  logActivity('auth.login', { userId: u.id, email: u.email, ip: req.ip });
  res.json({
    ok: true,
    user: { id: u.id, email: u.email, role: { id: role.id, name: role.name }, permissions: role.permissions || [] },
  });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
});

// POST /api/auth/accept-invite
router.post('/accept-invite', (req, res) => {
  const { token, email, password } = safeObject(req.body) || {};
  const t = typeof token === 'string' ? token.trim() : '';
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const pw = typeof password === 'string' ? password : '';
  if (!t || pw.length < 6) return res.status(400).json({ ok: false, error: 'Missing token or weak password' });

  const invDb = readJsonFile(INVITES_PATH, { invites: [] });
  if (!Array.isArray(invDb.invites)) invDb.invites = [];
  const idx = invDb.invites.findIndex((i) => i.tokenHash === hashToken(t));
  if (idx < 0) return res.status(400).json({ ok: false, error: 'Invalid invite' });
  const inv = invDb.invites[idx];
  if (inv.revokedAt) return res.status(400).json({ ok: false, error: 'Invite revoked' });
  if (inv.usedAt) return res.status(400).json({ ok: false, error: 'Invite already used' });
  if (typeof inv.expiresAt === 'number' && Date.now() > inv.expiresAt) return res.status(400).json({ ok: false, error: 'Invite expired' });
  if (inv.email && em && inv.email !== em) return res.status(400).json({ ok: false, error: 'Email does not match invite' });
  if (inv.email && !em) return res.status(400).json({ ok: false, error: 'Email required' });

  const usersDb = loadUsers();
  const finalEmail = (inv.email || em || '').trim().toLowerCase();
  if (!finalEmail) return res.status(400).json({ ok: false, error: 'Email required' });
  if (usersDb.users.some((u) => String(u.email).toLowerCase() === finalEmail)) {
    return res.status(409).json({ ok: false, error: 'User already exists' });
  }

  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(pw, 10);
  const user = {
    id, email: finalEmail, passwordHash,
    roleId: inv.roleId || 'viewer',
    disabled: false, createdAt: Date.now(),
    invitedBy: inv.createdBy || null,
  };
  usersDb.users.push(user);
  saveUsers(usersDb);
  invDb.invites[idx].usedAt = Date.now();
  writeJsonFile(INVITES_PATH, invDb);

  const tokenJwt = signToken(user);
  setCookie(res, tokenJwt);
  const role = resolveUserRole(user);
  logActivity('auth.accept-invite', { userId: user.id, email: user.email, ip: req.ip });
  res.json({
    ok: true,
    user: { id: user.id, email: user.email, role: { id: role.id, name: role.name }, permissions: role.permissions || [] },
  });
});

module.exports = router;
