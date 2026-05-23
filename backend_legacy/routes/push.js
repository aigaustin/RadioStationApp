const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// POST /api/push/register (public)
router.post('/register', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }

    const { token, deviceId } = safeObject(req.body) || {};
    const t = typeof token === 'string' ? token.trim() : '';
    if (!t) return res.status(400).json({ ok: false, error: 'Missing token' });

    await prisma.pushToken.upsert({
      where: { token: t },
      update: { deviceId: typeof deviceId === 'string' ? deviceId : '', tenantId },
      create: { token: t, deviceId: typeof deviceId === 'string' ? deviceId : '', tenantId }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/push/send (admin)
router.post('/send', requireAuth, requirePermission('push:send'), async (req, res) => {
  try {
    const { title, body, data } = safeObject(req.body) || {};
    const t = typeof title === 'string' ? title : '';
    const b = typeof body === 'string' ? body : '';
    if (!t || !b) return res.status(400).json({ ok: false, error: 'Missing title/body' });

    const pushTokens = await prisma.pushToken.findMany({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId },
      take: 100 // limit to 100 per request for simplicity
    });

    if (!pushTokens.length) return res.status(400).json({ ok: false, error: 'No devices registered' });
    
    const messages = pushTokens.map((pt) => ({
      to: pt.token, 
      sound: 'default', 
      title: t, 
      body: b, 
      data: safeObject(data) || {},
    }));

    const resp = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
    
    const json = await resp.json().catch(() => null);
    logActivity('push.send', { userId: req.user.id, email: req.user.email, details: `"${t}" to ${pushTokens.length} devices`, ip: req.ip, tenantId: req.tenantId || 'global' });
    res.json({ ok: true, sent: pushTokens.length, response: json });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'Push failed' });
  }
});

// GET /api/push/stats (admin)
router.get('/stats', requireAuth, requirePermission('push:send'), async (req, res) => {
  try {
    const deviceCount = await prisma.pushToken.count({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId }
    });
    res.json({ ok: true, deviceCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});

module.exports = router;
