const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { hashToken } = require('../lib/auth');
const { requireAuth, requirePermission, baseUrlFromReq } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

router.get('/', requireAuth, requirePermission('invites:read'), async (req, res) => {
  try {
    const invites = await prisma.invite.findMany({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId },
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = invites.map((i) => ({
      id: i.id,
      email: i.email || '',
      roleId: i.roleId || '',
      roleName: i.role?.name || i.roleId,
      createdAt: i.createdAt,
      expiresAt: i.expiresAt,
      usedAt: i.usedAt || null,
      revokedAt: i.revokedAt || null,
      createdBy: i.createdBy || null,
    }));
    
    res.json({ ok: true, invites: mapped });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/', requireAuth, requirePermission('invites:write'), async (req, res) => {
  try {
    const { email, roleId, expiresInDays } = safeObject(req.body) || {};
    const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rid = typeof roleId === 'string' && roleId ? roleId : null;

    if (rid) {
      const role = await prisma.role.findUnique({ where: { id: rid } });
      if (!role) return res.status(400).json({ ok: false, error: 'Invalid role' });
    }

    const days = Math.max(1, Math.min(30, Number(expiresInDays) || 7));
    const token = crypto.randomBytes(24).toString('hex');
    
    const expiresAt = new Date(Date.now() + days * 86400000);

    const invite = await prisma.invite.create({
      data: {
        email: em,
        roleId: rid,
        tokenHash: hashToken(token),
        expiresAt,
        createdBy: req.user.id,
        tenantId: req.tenantId
      }
    });

    const inviteUrl = `${baseUrlFromReq(req)}/invite?token=${token}`;
    logActivity('invite.create', { userId: req.user.id, email: req.user.email, ip: req.ip });
    res.json({ 
      ok: true, 
      invite: { id: invite.id, email: em, roleId: rid, expiresAt: invite.expiresAt }, 
      token, 
      inviteUrl 
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/:id/revoke', requireAuth, requirePermission('invites:write'), async (req, res) => {
  try {
    const id = req.params.id;
    
    const target = await prisma.invite.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ ok: false, error: 'Not found' });
    if (target.tenantId !== req.tenantId && !req.user.isSuperAdmin) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }

    await prisma.invite.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    logActivity('invite.revoke', { userId: req.user.id, email: req.user.email, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
