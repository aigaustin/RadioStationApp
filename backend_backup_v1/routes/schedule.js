const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();
const SCHEDULE_PATH = path.join(__dirname, '..', 'data', 'schedule.json');

function load() {
  const db = readJsonFile(SCHEDULE_PATH, { shows: [] });
  if (!Array.isArray(db.shows)) db.shows = [];
  return db;
}
function save(data) { writeJsonFile(SCHEDULE_PATH, data); }

// GET /api/schedule (public)
router.get('/', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const db = load();
  const shows = db.shows.filter((s) => s.isActive !== false);
  res.json({ ok: true, data: shows });
});

// GET /api/schedule/all (admin — includes inactive)
router.get('/all', requireAuth, requirePermission('schedule:read'), (_req, res) => {
  res.json({ ok: true, data: load().shows });
});

// POST /api/schedule
router.post('/', requireAuth, requirePermission('schedule:write'), (req, res) => {
  const b = safeObject(req.body) || {};
  const show = {
    id: crypto.randomUUID(),
    title: String(b.title || '').trim() || 'Untitled Show',
    host: String(b.host || '').trim(),
    description: String(b.description || '').trim(),
    dayOfWeek: typeof b.dayOfWeek === 'number' ? b.dayOfWeek : (typeof b.dayOfWeek === 'string' ? b.dayOfWeek : ''),
    startTime: String(b.startTime || '00:00').trim(),
    endTime: String(b.endTime || '01:00').trim(),
    imageUrl: String(b.imageUrl || '').trim(),
    isActive: b.isActive !== false,
    createdAt: Date.now(),
  };
  const db = load();
  db.shows.push(show);
  save(db);
  logActivity('schedule.create', { userId: req.user?.id, email: req.user?.email, details: show.title, ip: req.ip });
  res.json({ ok: true, show });
});

// PUT /api/schedule/:id
router.put('/:id', requireAuth, requirePermission('schedule:write'), (req, res) => {
  const db = load();
  const idx = db.shows.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  const b = safeObject(req.body) || {};
  const s = db.shows[idx];
  if (typeof b.title === 'string') s.title = b.title.trim();
  if (typeof b.host === 'string') s.host = b.host.trim();
  if (typeof b.description === 'string') s.description = b.description.trim();
  if (b.dayOfWeek !== undefined) s.dayOfWeek = b.dayOfWeek;
  if (typeof b.startTime === 'string') s.startTime = b.startTime.trim();
  if (typeof b.endTime === 'string') s.endTime = b.endTime.trim();
  if (typeof b.imageUrl === 'string') s.imageUrl = b.imageUrl.trim();
  if (typeof b.isActive === 'boolean') s.isActive = b.isActive;
  save(db);
  logActivity('schedule.update', { userId: req.user?.id, email: req.user?.email, details: s.title, ip: req.ip });
  res.json({ ok: true, show: s });
});

// DELETE /api/schedule/:id
router.delete('/:id', requireAuth, requirePermission('schedule:write'), (req, res) => {
  const db = load();
  const next = db.shows.filter((s) => s.id !== req.params.id);
  if (next.length === db.shows.length) return res.status(404).json({ ok: false, error: 'Not found' });
  save({ shows: next });
  logActivity('schedule.delete', { userId: req.user?.id, email: req.user?.email, ip: req.ip });
  res.json({ ok: true });
});

module.exports = router;
