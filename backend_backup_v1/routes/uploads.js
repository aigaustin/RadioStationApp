const express = require('express');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { requireAuth, requirePermission, baseUrlFromReq } = require('../middleware/auth');
const { ensureDir } = require('../lib/db');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
ensureDir(UPLOADS_DIR);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname || '') || '').toLowerCase();
      const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '';
      cb(null, crypto.randomUUID() + safeExt);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/image', requireAuth, requirePermission('uploads:write'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'Missing file' });
  const url = `${baseUrlFromReq(req)}/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

module.exports = router;
module.exports.UPLOADS_DIR = UPLOADS_DIR;
