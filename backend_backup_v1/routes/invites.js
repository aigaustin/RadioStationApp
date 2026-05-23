const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { hashToken } = require('../lib/auth');
const { requireAuth, requirePermission, baseUrlFromReq } = require('../middleware/auth');
const { getRoleById, loadRoles } = require('../lib/permissions');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const INVITES_PATH = path.join(__dirname, '..', 'data', 'invites.json');

function loadInvites() {
  const db = readJsonFile(INVITES_PATH, { invites: [] });
  if (!Array.isArray(db.invites)) db.invites = [];
  return db;
}
function saveInvites(data) { writeJsonFile(INVITES_PATH, data); }

router.get('/', requireAuth, requirePermission('invites:read'), (_req, res) => {
  const db = loadInvites();
  const rolesDb = loadRoles();
  const rolesById = new Map((rolesDb.roles || []).map((r) => [r.id, r]));
  const invites = (db.invites || []).map((i) => ({
    id: i.id, email: i.email || '', roleId: i.roleId,
    roleName: rolesById.get(i.roleId)?.name || i.roleId,
    createdAt: i.createdAt, expiresAt: i.expiresAt,
    usedAt: i.usedAt || null, revokedAt: i.revokedAt || null,
    createdBy: i.createdBy || null,
  }));
  res.json({ ok: true, invites });
});

router.post('/', requireAuth, requirePermission('invites:write'), (req, res) => {
  const { email, roleId, expiresInDays } = safeObject(req.body) || {};
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const rid = typeof roleId === 'string' && roleId ? roleId : 'viewer';
  if (!getRoleById(rid)) return res.status(400).json({ ok: false, error: 'Invalid role' });
  const days = Math.max(1, Math.min(30, Number(expiresInDays) || 7));
  const token = crypto.randomBytes(24).toString('hex');
  const invite = {
    id: crypto.randomUUID(), email: em, roleId: rid, tokenHash: hashToken(token),
    createdAt: Date.now(), expiresAt: Date.now() + days * 86400000,
    usedAt: null, revokedAt: null, createdBy: req.user?.id || null,
  };
  const db = loadInvites();
  db.invites.unshift(invite);
  saveInvites({ invites: db.invites.slice(0, 5000) });
  const inviteUrl = `${baseUrlFromReq(req)}/invite?token=${token}`;
  logActivity('invite.create', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json({ ok: true, invite: { id: invite.id, email: em, roleId: rid, expiresAt: invite.expiresAt }, token, inviteUrl });
});

router.post('/:id/revoke', requireAuth, requirePermission('invites:write'), (req, res) => {
  const db = loadInvites();
  const idx = db.invites.findIndex((i) => i.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  db.invites[idx].revokedAt = Date.now();
  saveInvites(db);
  logActivity('invite.revoke', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
