const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { readJsonFile, writeJsonFile, ensureDir } = require('./lib/db');
const { ensureDefaultRoles } = require('./lib/permissions');
const { getAuthUser } = require('./middleware/auth');
const { logActivity } = require('./lib/logger');

// ─── Config ──────────────────────────────────────────────
const PORT = Number(process.env.PORT || 4545);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const USERS_PATH = path.join(DATA_DIR, 'users.json');

ensureDir(DATA_DIR);
ensureDir(UPLOADS_DIR);
ensureDefaultRoles();

// ─── Bootstrap admin ─────────────────────────────────────
(function bootstrap() {
  const db = readJsonFile(USERS_PATH, { users: [] });
  if (db.users && db.users.length) return;
  const email = process.env.BOOTSTRAP_EMAIL || '';
  const pw = process.env.BOOTSTRAP_PASSWORD || '';
  if (!email || !pw) return;
  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(pw, 10);
  writeJsonFile(USERS_PATH, {
    users: [{ id, email, passwordHash, roleId: 'admin', disabled: false, createdAt: Date.now() }],
  });
  process.stdout.write(`[init] Admin created: ${email}\n`);
})();

// ─── Express ─────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

// ─── Rate limiter (in-memory, simple) ────────────────────
const rateLimits = new Map();
function rateLimit(windowMs, maxReqs) {
  return (req, res, next) => {
    const key = req.ip + ':' + req.path;
    const now = Date.now();
    let entry = rateLimits.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 };
      rateLimits.set(key, entry);
    }
    entry.count++;
    if (entry.count > maxReqs) {
      return res.status(429).json({ ok: false, error: 'Too many requests. Try again later.' });
    }
    next();
  };
}
// Cleanup stale entries every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimits) {
    if (now - v.start > 300000) rateLimits.delete(k);
  }
}, 300000);

// ─── Request logger ──────────────────────────────────────
app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    const ts = new Date().toISOString().slice(11, 19);
    process.stdout.write(`[${ts}] ${req.method} ${req.path}\n`);
  }
  next();
});

// ─── CORS for public endpoints ───────────────────────────
app.use((req, res, next) => {
  if (req.path === '/config' || req.path.startsWith('/api/stream') ||
      req.path.startsWith('/api/push/register') || req.path === '/api/contact' ||
      req.path.startsWith('/api/schedule') || req.path.startsWith('/api/podcasts')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
  }
  next();
});

// Static uploads
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', etag: true }));

// ─── Health ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const uptime = process.uptime();
  const mem = process.memoryUsage();
  res.json({
    ok: true,
    uptime: Math.floor(uptime),
    memory: { rss: Math.round(mem.rss / 1048576), heap: Math.round(mem.heapUsed / 1048576) },
    timestamp: Date.now(),
  });
});

// ─── Public config ───────────────────────────────────────
app.get('/config', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=30');
  const cfg = readJsonFile(CONFIG_PATH, {});
  const { mediacp, ...publicCfg } = cfg;
  res.json(publicCfg);
});

// ─── /api/me ─────────────────────────────────────────────
app.get('/api/me', (req, res) => {
  const u = getAuthUser(req);
  if (!u) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  res.json({ ok: true, user: u });
});

// ─── Mount routes ────────────────────────────────────────
app.use('/api/auth', rateLimit(60000, 10), require('./routes/auth'));
app.use('/api/config', require('./routes/config'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/invites', require('./routes/invites'));
app.use('/api/push', require('./routes/push'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/mediacp', require('./routes/mediacp'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/podcasts', require('./routes/podcasts'));
app.use('/api/contact', rateLimit(60000, 5), require('./routes/contact'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/stream', require('./routes/stream'));

// ─── Admin dashboard ─────────────────────────────────────
app.get('/invite', (req, res) => {
  res.redirect('/admin' + (req.originalUrl || '').replace(/^\/invite/, ''));
});
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
  index: 'index.html',
  maxAge: '1h',
  etag: true,
}));
app.get('/admin/*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.get('/', (_req, res) => res.redirect('/admin'));

// ─── 404 ─────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Not found' }));

// ─── Error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  process.stderr.write(`[error] ${err.stack || err.message}\n`);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

// ─── Graceful shutdown ───────────────────────────────────
const server = app.listen(PORT, () => {
  process.stdout.write(`[server] Radio Admin → http://localhost:${PORT}\n`);
});

function shutdown(signal) {
  process.stdout.write(`\n[server] ${signal} received, shutting down...\n`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
