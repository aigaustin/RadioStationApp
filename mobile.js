const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/mobile/v1/:tenantSlug/config
router.get('/:tenantSlug/config', async (req, res) => {
  try {
    // Just fetch the first tenant as the active customer (Andre)
    const tenant = await prisma.tenant.findFirst({
       orderBy: { createdAt: 'asc' }
    });

    if (!tenant) {
      return res.status(404).json({ ok: false, error: 'Tenant not found' });
    }

    const tenantId = tenant.id;

    // Fetch the flat config from Config table
    const configDoc = await prisma.config.findUnique({ where: { tenantId_key: { tenantId, key: 'global' } } });
    const cfg = configDoc ? configDoc.value : {};
    
    // Strip out mediacp secrets
    const { mediacp, ...publicCfg } = cfg;

    res.setHeader('Cache-Control', 'no-store');
    res.json({ ok: true, data: publicCfg });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
