const express = require('express');
const path = require('path');
const { readJsonFile, safeObject } = require('../lib/db');
const { xmlrpcCall } = require('../lib/xmlrpc');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

function getMediacpConfig() {
  const cfg = readJsonFile(CONFIG_PATH, {});
  const m = safeObject(cfg.mediacp) || {};
  return {
    apiKey: m.apiKey || '',
    rpcUrl: m.rpcUrl || '',
    serverId: typeof m.serverId === 'number' ? m.serverId : 0,
  };
}

async function rpc(method, extra = {}) {
  const mc = getMediacpConfig();
  if (!mc.rpcUrl || !mc.apiKey) return { ok: false, fault: { faultString: 'MediaCP not configured' } };
  const args = { auth: mc.apiKey, ServerID: mc.serverId, ...extra };
  return xmlrpcCall(mc.rpcUrl, method, args);
}

// GET /api/mediacp/status
router.get('/status', requireAuth, requirePermission('mediacp:read'), async (_req, res) => {
  const result = await rpc('service.status');
  res.json(result);
});

// GET /api/mediacp/overview
router.get('/overview', requireAuth, requirePermission('mediacp:read'), async (_req, res) => {
  const result = await rpc('service.overview');
  res.json(result);
});

// POST /api/mediacp/start
router.post('/start', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('service.start');
  logActivity('mediacp.start', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/stop
router.post('/stop', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('service.stop');
  logActivity('mediacp.stop', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/restart
router.post('/restart', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('service.restart');
  logActivity('mediacp.restart', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/kick-source
router.post('/kick-source', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('service.kicksource');
  logActivity('mediacp.kicksource', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/update-title
router.post('/update-title', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const { title } = safeObject(req.body) || {};
  if (!title) return res.status(400).json({ ok: false, error: 'Missing title' });
  const result = await rpc('service.updatetitle', { NewTitle: String(title).slice(0, 250) });
  logActivity('mediacp.updatetitle', { userId: req.user?.id, email: req.user?.email, details: title, ip: req.ip });
  res.json(result);
});

// GET /api/mediacp/source-status
router.get('/source-status', requireAuth, requirePermission('mediacp:read'), async (_req, res) => {
  const result = await rpc('source.status');
  res.json(result);
});

// POST /api/mediacp/source/start
router.post('/source/start', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('source.start');
  logActivity('mediacp.source.start', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/source/stop
router.post('/source/stop', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('source.stop');
  logActivity('mediacp.source.stop', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

// POST /api/mediacp/source/restart
router.post('/source/restart', requireAuth, requirePermission('mediacp:write'), async (req, res) => {
  const result = await rpc('source.restart');
  logActivity('mediacp.source.restart', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json(result);
});

module.exports = router;
