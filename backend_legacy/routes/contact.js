const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

// POST /api/contact (public, rate-limit friendly)
router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const tenantId = req.query.tenantId;
    if (!tenantId) {
      return res.status(400).json({ ok: false, error: 'Missing tenantId query parameter' });
    }

    const b = safeObject(req.body) || {};
    const name = String(b.name || '').trim().slice(0, 200);
    const email = String(b.email || '').trim().slice(0, 200);
    const message = String(b.message || '').trim().slice(0, 2000);
    
    if (!name || !message) return res.status(400).json({ ok: false, error: 'Name and message required' });

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        tenantId
      }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/contact (admin)
router.get('/', requireAuth, requirePermission('contact:read'), async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      where: req.user.isSuperAdmin && !req.tenantId ? {} : { tenantId: req.tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ ok: true, messages });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/contact/:id/read (admin)
router.put('/:id/read', requireAuth, requirePermission('contact:read'), async (req, res) => {
  try {
    const id = req.params.id;
    
    const target = await prisma.contactMessage.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/contact/:id (admin)
router.delete('/:id', requireAuth, requirePermission('contact:write'), async (req, res) => {
  try {
    const id = req.params.id;

    const target = await prisma.contactMessage.findUnique({ where: { id } });
    if (!target || (target.tenantId !== req.tenantId && !req.user.isSuperAdmin)) {
      return res.status(404).json({ ok: false, error: 'Not found' });
    }

    await prisma.contactMessage.delete({ where: { id } });
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
