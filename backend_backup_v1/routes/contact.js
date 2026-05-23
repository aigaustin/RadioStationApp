const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { readJsonFile, writeJsonFile, safeObject } = require('../lib/db');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
const CONTACTS_PATH = path.join(__dirname, '..', 'data', 'contacts.json');

function load() {
  const db = readJsonFile(CONTACTS_PATH, { messages: [] });
  if (!Array.isArray(db.messages)) db.messages = [];
  return db;
}
function save(data) { writeJsonFile(CONTACTS_PATH, data); }

// POST /api/contact (public, rate-limit friendly)
router.post('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const b = safeObject(req.body) || {};
  const name = String(b.name || '').trim().slice(0, 200);
  const email = String(b.email || '').trim().slice(0, 200);
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!name || !message) return res.status(400).json({ ok: false, error: 'Name and message required' });
  const msg = {
    id: crypto.randomUUID(),
    name, email, message,
    isRead: false,
    createdAt: Date.now(),
    ip: req.ip || '',
  };
  const db = load();
  db.messages.unshift(msg);
  save({ messages: db.messages.slice(0, 2000) });
  res.json({ ok: true });
});

// GET /api/contact (admin)
router.get('/', requireAuth, requirePermission('contact:read'), (_req, res) => {
  const db = load();
  res.json({ ok: true, messages: db.messages });
});

// PUT /api/contact/:id/read (admin)
router.put('/:id/read', requireAuth, requirePermission('contact:read'), (req, res) => {
  const db = load();
  const idx = db.messages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Not found' });
  db.messages[idx].isRead = true;
  save(db);
  res.json({ ok: true });
});

// DELETE /api/contact/:id (admin)
router.delete('/:id', requireAuth, requirePermission('contact:write'), (req, res) => {
  const db = load();
  const next = db.messages.filter((m) => m.id !== req.params.id);
  if (next.length === db.messages.length) return res.status(404).json({ ok: false, error: 'Not found' });
  save({ messages: next });
  res.json({ ok: true });
});

module.exports = router;
