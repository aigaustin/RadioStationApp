const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function mergeConfig(current, incoming) {
  const obj = safeObject(incoming);
  if (!obj) return current;

  const next = { ...current };
  const contact = safeObject(obj.contact);
  const branding = safeObject(obj.branding);
  const features = safeObject(obj.features);
  const player = safeObject(obj.player);
  const theme = safeObject(obj.theme);
  const mediacp = safeObject(obj.mediacp);
  const adminBranding = safeObject(obj.adminBranding);
  const seo = safeObject(obj.seo);
  const legal = safeObject(obj.legal);

  [
    'name', 'tagline', 'footerText', 'website', 'aboutText',
    'streamUrl', 'nowPlayingUrl', 'scheduleUrl', 'scheduleEventsUrl',
    'scheduleWeekUrl', 'listenerMapUrl', 'countryStatsUrl', 'apiBase', 'stationId',
  ].forEach((k) => {
    if (typeof obj[k] === 'string') next[k] = obj[k];
  });

  if (contact) {
    next.contact = { ...(safeObject(next.contact) || {}) };
    if (typeof contact.email === 'string') next.contact.email = contact.email;
    if (typeof contact.phone === 'string') next.contact.phone = contact.phone;
    if (typeof contact.whatsapp === 'string') next.contact.whatsapp = contact.whatsapp;
  }

  if (branding) {
    next.branding = { ...(safeObject(next.branding) || {}) };
    if (typeof branding.logoUrl === 'string') next.branding.logoUrl = branding.logoUrl;
    if (typeof branding.splashUrl === 'string') next.branding.splashUrl = branding.splashUrl;
  }

  if (features) {
    next.features = { ...(safeObject(next.features) || {}) };
    if (typeof features.enableNotifications === 'boolean') next.features.enableNotifications = features.enableNotifications;
    if (typeof features.enableSchedule === 'boolean') next.features.enableSchedule = features.enableSchedule;
    if (typeof features.enablePodcasts === 'boolean') next.features.enablePodcasts = features.enablePodcasts;
  }

  if (player) {
    next.player = { ...(safeObject(next.player) || {}) };
    if (typeof player.metadataRefreshMs === 'number') next.player.metadataRefreshMs = player.metadataRefreshMs;
    if (typeof player.reconnectMaxDelayMs === 'number') next.player.reconnectMaxDelayMs = player.reconnectMaxDelayMs;
    if (typeof player.reconnectBackoff === 'number') next.player.reconnectBackoff = player.reconnectBackoff;
  }

  if (theme) {
    next.theme = { ...(safeObject(next.theme) || {}) };
    if (typeof theme.primary === 'string') next.theme.primary = theme.primary;
    if (typeof theme.accent === 'string') next.theme.accent = theme.accent;
  }

  if (mediacp) {
    next.mediacp = { ...(safeObject(next.mediacp) || {}) };
    if (typeof mediacp.apiKey === 'string') next.mediacp.apiKey = mediacp.apiKey;
    if (typeof mediacp.rpcUrl === 'string') next.mediacp.rpcUrl = mediacp.rpcUrl;
    if (typeof mediacp.serverId === 'number') next.mediacp.serverId = mediacp.serverId;
  }

  const smtp = safeObject(obj.smtp);
  if (smtp) {
    next.smtp = { ...(safeObject(next.smtp) || {}) };
    if (typeof smtp.host === 'string') next.smtp.host = smtp.host;
    if (typeof smtp.port === 'string') next.smtp.port = smtp.port;
    if (typeof smtp.user === 'string') next.smtp.user = smtp.user;
    if (typeof smtp.password === 'string') next.smtp.password = smtp.password;
    if (typeof smtp.from === 'string') next.smtp.from = smtp.from;
  }

  if (adminBranding) {
    next.adminBranding = { ...(safeObject(next.adminBranding) || {}) };
    if (typeof adminBranding.name === 'string') next.adminBranding.name = adminBranding.name;
    if (typeof adminBranding.logoUrl === 'string') next.adminBranding.logoUrl = adminBranding.logoUrl;
  }

  if (seo) {
    next.seo = { ...(safeObject(next.seo) || {}) };
    if (typeof seo.description === 'string') next.seo.description = seo.description;
    if (typeof seo.keywords === 'string') next.seo.keywords = seo.keywords;
  }

  if (legal) {
    next.legal = { ...(safeObject(next.legal) || {}) };
    if (typeof legal.terms === 'string') next.legal.terms = legal.terms;
    if (typeof legal.privacy === 'string') next.legal.privacy = legal.privacy;
    if (typeof legal.copyright === 'string') next.legal.copyright = legal.copyright;
  }

  return next;
}

// Public config (no auth, CORS enabled)
router.get('/public', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }

    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    
    // Strip sensitive fields
    const { mediacp, ...publicCfg } = cfg;
    res.json(publicCfg);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Admin config read
router.get('/', requireAuth, requirePermission('config:read'), async (req, res) => {
  try {
    const targetTenantId = req.tenantId || 'global';
    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: targetTenantId, key: 'global' } } });
    res.json({ ok: true, data: configDoc ? configDoc.value : {} });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Admin config write
router.put('/', requireAuth, requirePermission('config:write'), async (req, res) => {
  try {
    const incoming = safeObject(req.body) || {};
    const targetTenantId = req.tenantId || 'global';
    
    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId: targetTenantId, key: 'global' } } });
    const current = configDoc ? configDoc.value : {};
    
    const next = mergeConfig(current, incoming);
    
    await prisma.config.upsert({
      where: { tenantId_key: { tenantId: targetTenantId, key: 'global' } },
      update: { value: next },
      create: { tenantId: targetTenantId, key: 'global', value: next }
    });

    logActivity('config.update', { userId: req.user.id, email: req.user.email, ip: req.ip });
    res.json({ ok: true, data: next });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
