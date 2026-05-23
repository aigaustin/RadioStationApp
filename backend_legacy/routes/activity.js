const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { getActivity } = require('../lib/logger');

const router = express.Router();

// GET /api/activity
router.get('/', requireAuth, requirePermission('activity:read'), async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);
    
    // Super Admin gets all if not impersonating? 
    // Actually getActivity handles tenantId: req.tenantId.
    // If req.tenantId is null (super admin not impersonating), getActivity returns all system-wide activity.
    const result = await getActivity(req.tenantId, limit, offset);
    
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
