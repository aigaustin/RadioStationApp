const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const PODCASTS_PATH = path.join(__dirname, '..', 'data', 'podcasts.json');

function load() {
  const db = readJsonFile(PODCASTS_PATH, { podcasts: [] });
  if (!Array.isArray(db.podcasts)) db.podcasts = [];
  return db;
}
function save(data) { writeJsonFile(PODCASTS_PATH, data); }

// GET /api/podcasts (public)
router.get('/', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const db = load();
  const list = db.podcasts.filter((p) => p.isPublished !== false);
  res.json({ ok: true, data: list });
});

// GET /api/podcasts/all (admin)
router.get('/all', requireAuth, requirePermission('podcasts:read'), (_req, res) => {
  res.json({ ok: true, data: load().podcasts });
});

// POST /api/podcasts
router.post('/', requireAuth, requirePermission('podcasts:write'), (req, res) => {
  const b = safeObject(req.body) || {};
  const podcast = {
    id: crypto.randomUUID(),
    title: String(b.title || '').trim() || 'Untitled',
    host: String(b.host || '').trim(),
    description: String(b.description || '').trim(),
    audioUrl: String(b.audioUrl || '').trim(),
    artwork: String(b.artwork || '').trim(),
    duration: typeof b.duration === 'number' ? b.duration : 0,
    category: String(b.category || '').trim(),
    isPublished: b.isPublished !== false,
    publishedAt: Date.now(),
    createdAt: Date.now(),
  };
  const db = load();
  db.podcasts.unshift(podcast);
  save(db);
  logActivity('podcast.create', { userId: req.user?.id, email: req.user?.email, details: podcast.title, ip: req.ip });
  res.json({ ok: true, podcast });
});

// PUT /api/podcasts/:id
router.put('/:id', requireAuth, requirePermission('podcasts:write'), (req, res) => {
  const db = load();
  const idx = db.podcasts.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  const b = safeObject(req.body) || {};
  const p = db.podcasts[idx];
  if (typeof b.title === 'string') p.title = b.title.trim();
  if (typeof b.host === 'string') p.host = b.host.trim();
  if (typeof b.description === 'string') p.description = b.description.trim();
  if (typeof b.audioUrl === 'string') p.audioUrl = b.audioUrl.trim();
  if (typeof b.artwork === 'string') p.artwork = b.artwork.trim();
  if (typeof b.duration === 'number') p.duration = b.duration;
  if (typeof b.category === 'string') p.category = b.category.trim();
  if (typeof b.isPublished === 'boolean') p.isPublished = b.isPublished;
  save(db);
  logActivity('podcast.update', { userId: req.user?.id, email: req.user?.email, details: p.title, ip: req.ip });
  res.json({ ok: true, podcast: p });
});

// DELETE /api/podcasts/:id
router.delete('/:id', requireAuth, requirePermission('podcasts:write'), (req, res) => {
  const db = load();
  const next = db.podcasts.filter((p) => p.id !== req.params.id);
  if (next.length === db.podcasts.length) return res.status(404).json({ ok: false, error: 'Not found' });
  save({ podcasts: next });
  logActivity('podcast.delete', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
