const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { logActivity } = require('../lib/logger');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// GET /api/schedule (public)
router.get('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }
    const shows = await prisma.schedule.findMany({
      where: { tenantId }
    });
    // Schema doesn't have isActive boolean, but we could filter it if it did. We'll return all for now.
    res.json({ ok: true, data: shows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/schedule/all (admin)
router.get('/all', requireAuth, requirePermission('schedule:read'), async (req, res) => {
  try {
    const shows = await prisma.schedule.findMany({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId },
      orderBy: { startTime: 'asc' }
    });
    res.json({ ok: true, data: shows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/schedule
router.post('/', requireAuth, requirePermission('schedule:write'), async (req, res) => {
  try {
    const b = safeObject(req.body) || {};
    
    const show = await prisma.schedule.create({
      data: {
        title: String(b.title || '').trim() || 'Untitled Show',
        host: String(b.host || '').trim(),
        description: String(b.description || '').trim(),
        dayOfWeek: typeof b.dayOfWeek === 'number' ? String(b.dayOfWeek) : (typeof b.dayOfWeek === 'string' ? b.dayOfWeek : ''),
        startTime: String(b.startTime || '00:00').trim(),
        endTime: String(b.endTime || '01:00').trim(),
        tenantId: req.tenantId || 'global'
      }
    });

    logActivity('schedule.create', { userId: req.user.id, email: req.user.email, details: show.title, ip: req.ip });
    res.json({ ok: true, show });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/schedule/:id
router.put('/:id', requireAuth, requirePermission('schedule:write'), async (req, res) => {
  try {
    const id = req.params.id;
    const b = safeObject(req.body) || {};

    const target = await prisma.schedule.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    const data = {};
    if (typeof b.title === 'string') data.title = b.title.trim();
    if (typeof b.host === 'string') data.host = b.host.trim();
    if (typeof b.description === 'string') data.description = b.description.trim();
    if (b.dayOfWeek !== undefined) data.dayOfWeek = typeof b.dayOfWeek === 'number' ? String(b.dayOfWeek) : String(b.dayOfWeek);
    if (typeof b.startTime === 'string') data.startTime = b.startTime.trim();
    if (typeof b.endTime === 'string') data.endTime = b.endTime.trim();

    const show = await prisma.schedule.update({
      where: { id },
      data
    });

    logActivity('schedule.update', { userId: req.user.id, email: req.user.email, details: show.title, ip: req.ip });
    res.json({ ok: true, show });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/schedule/:id
router.delete('/:id', requireAuth, requirePermission('schedule:write'), async (req, res) => {
  try {
    const id = req.params.id;
    
    const target = await prisma.schedule.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    await prisma.schedule.delete({ where: { id } });

    logActivity('schedule.delete', { userId: req.user.id, email: req.user.email, ip: req.ip });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
