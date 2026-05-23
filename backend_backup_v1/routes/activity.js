const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { getActivity } = require('../lib/logger');

const router = express.Router();

// GET /api/activity
router.get('/', requireAuth, requirePermission('activity:read'), (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const result = getActivity(limit, offset);
  res.json({ ok: true, ...result });
});

module.exports = router;
