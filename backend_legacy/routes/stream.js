const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

let nowPlayingCache = {}; // { [tenantId]: { data: null, ts: 0 } }
const CACHE_TTL = 5000; // 5 seconds

// GET /api/stream/now-playing — proxies MediaCP JSON endpoint
router.get('/now-playing', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }

    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    const url = cfg.nowPlayingUrl;
    if (!url) return res.json({ ok: false, error: 'Now playing URL not configured' });

    // Use cache if fresh
    const cache = nowPlayingCache[tenantId];
    if (cache && cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json({ ok: true, data: cache.data, cached: true });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!response.ok) return res.json({ ok: false, error: 'HTTP ' + response.status });
    
    const data = await response.json();
    nowPlayingCache[tenantId] = { data, ts: Date.now() };
    
    res.json({ ok: true, data });
  } catch (e) {
    res.json({ ok: false, error: e?.message || 'Failed to fetch' });
  }
});

// GET /api/stream/info — returns stream metadata for mobile app
router.get('/info', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }

    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    
    res.json({
      ok: true,
      streamUrl: cfg.streamUrl || '',
      nowPlayingUrl: cfg.nowPlayingUrl || '',
      stationId: cfg.stationId || '',
      name: cfg.name || '',
    });
  } catch (e) {
    res.json({ ok: false, error: e?.message || 'Failed to fetch' });
  }
});

module.exports = router;
