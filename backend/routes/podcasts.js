const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// GET /api/podcasts (public)
router.get('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }
    const podcasts = await prisma.podcast.findMany({
      where: { tenantId, isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, data: podcasts });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/podcasts/all (admin)
router.get('/all', requireAuth, requirePermission('podcasts:read'), async (req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, data: podcasts });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/podcasts
router.post('/', requireAuth, requirePermission('podcasts:write'), async (req, res) => {
  try {
    const b = safeObject(req.body) || {};
    
    const podcast = await prisma.podcast.create({
      data: {
        title: String(b.title || '').trim() || 'Untitled',
        host: String(b.host || '').trim(),
        description: String(b.description || '').trim(),
        audioUrl: String(b.audioUrl || '').trim(),
        artwork: String(b.artwork || '').trim(),
        category: String(b.category || '').trim(),
        isPublished: b.isPublished !== false,
        tenantId: req.tenantId || 'global'
      }
    });

    logActivity('podcast.create', { userId: req.user.id, email: req.user.email, details: podcast.title, ip: req.ip });
    res.json({ ok: true, podcast });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/podcasts/:id
router.put('/:id', requireAuth, requirePermission('podcasts:write'), async (req, res) => {
  try {
    const id = req.params.id;
    const b = safeObject(req.body) || {};

    const target = await prisma.podcast.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    const data = {};
    if (typeof b.title === 'string') data.title = b.title.trim();
    if (typeof b.host === 'string') data.host = b.host.trim();
    if (typeof b.description === 'string') data.description = b.description.trim();
    if (typeof b.audioUrl === 'string') data.audioUrl = b.audioUrl.trim();
    if (typeof b.artwork === 'string') data.artwork = b.artwork.trim();
    if (typeof b.category === 'string') data.category = b.category.trim();
    if (typeof b.isPublished === 'boolean') data.isPublished = b.isPublished;

    const podcast = await prisma.podcast.update({
      where: { id },
      data
    });

    logActivity('podcast.update', { userId: req.user.id, email: req.user.email, details: podcast.title, ip: req.ip });
    res.json({ ok: true, podcast });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/podcasts/:id
router.delete('/:id', requireAuth, requirePermission('podcasts:write'), async (req, res) => {
  try {
    const id = req.params.id;
    
    const target = await prisma.podcast.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    await prisma.podcast.delete({ where: { id } });

    logActivity('podcast.delete', { userId: req.user.id, email: req.user.email, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
