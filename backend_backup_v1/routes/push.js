const express = require('express');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const TOKENS_PATH = path.join(__dirname, '..', 'data', 'expoPushTokens.json');

function loadTokens() { return readJsonFile(TOKENS_PATH, { tokens: [] }); }
function saveTokens(data) { writeJsonFile(TOKENS_PATH, data); }

// POST /api/push/register (public)
router.post('/register', (req, res) => {
  const { token, deviceId } = safeObject(req.body) || {};
  const t = typeof token === 'string' ? token.trim() : '';
  if (!t) return res.status(400).json({ ok: false, error: 'Missing token' });
  const db = loadTokens();
  const nextTokens = (db.tokens || []).filter((x) => x.token !== t);
  nextTokens.unshift({ token: t, deviceId: typeof deviceId === 'string' ? deviceId : '', updatedAt: Date.now() });
  saveTokens({ tokens: nextTokens.slice(0, 5000) });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ ok: true });
});

// POST /api/push/send (admin)
router.post('/send', requireAuth, requirePermission('push:send'), async (req, res) => {
  const { title, body, data } = safeObject(req.body) || {};
  const t = typeof title === 'string' ? title : '';
  const b = typeof body === 'string' ? body : '';
  if (!t || !b) return res.status(400).json({ ok: false, error: 'Missing title/body' });
  const db = loadTokens();
  const tokens = (db.tokens || []).map((x) => x.token).filter(Boolean);
  if (!tokens.length) return res.status(400).json({ ok: false, error: 'No devices registered' });
  const messages = tokens.slice(0, 100).map((to) => ({
    to, sound: 'default', title: t, body: b, data: safeObject(data) || {},
  }));
  try {
    const resp = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
    const json = await resp.json().catch(() => null);
    logActivity('push.send', { userId: req.user?.id, email: req.user?.email, details: `"${t}" to ${tokens.length} devices`, ip: req.ip });
    res.json({ ok: true, sent: tokens.length, response: json });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || 'Push failed' });
  }
});

// GET /api/push/stats (admin)
router.get('/stats', requireAuth, requirePermission('push:send'), (_req, res) => {
  const db = loadTokens();
  res.json({ ok: true, deviceCount: (db.tokens || []).length });
});

module.exports = router;
