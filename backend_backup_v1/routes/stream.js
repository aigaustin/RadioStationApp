const express = require('express');
const path = require('path');
const { readJsonFile } = require('../lib/db');

const router = express.Router();
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');

let nowPlayingCache = { data: null, ts: 0 };
const CACHE_TTL = 5000; // 5 seconds

// GET /api/stream/now-playing — proxies MediaCP JSON endpoint
router.get('/now-playing', async (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const cfg = readJsonFile(CONFIG_PATH, {});
  const url = cfg.nowPlayingUrl;
  if (!url) return res.json({ ok: false, error: 'Now playing URL not configured' });

  // Use cache if fresh
  if (nowPlayingCache.data && Date.now() - nowPlayingCache.ts < CACHE_TTL) {
    return res.json({ ok: true, data: nowPlayingCache.data, cached: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return res.json({ ok: false, error: 'HTTP ' + response.status });
    const data = await response.json();
    nowPlayingCache = { data, ts: Date.now() };
    res.json({ ok: true, data });
  } catch (e) {
    res.json({ ok: false, error: e?.message || 'Failed to fetch' });
  }
});

// GET /api/stream/info — returns stream metadata for mobile app
router.get('/info', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const cfg = readJsonFile(CONFIG_PATH, {});
  res.json({
    ok: true,
    streamUrl: cfg.streamUrl || '',
    nowPlayingUrl: cfg.nowPlayingUrl || '',
    stationId: cfg.stationId || '',
    name: cfg.name || '',
  });
});

module.exports = router;
