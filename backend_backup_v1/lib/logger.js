const path = require('path');
const { readJsonFile, writeJsonFile } = require('./db');

const ACTIVITY_PATH = path.join(__dirname, '..', 'data', 'activity.json');
const MAX_ENTRIES = 1000;

/**
 * Log an activity entry.
 * @param {string} action — e.g. 'config.update', 'user.create', 'mediacp.restart'
 * @param {object} [meta] — optional metadata (userId, email, details, etc.)
 */
function logActivity(action, meta = {}) {
  const db = readJsonFile(ACTIVITY_PATH, { entries: [] });
  if (!Array.isArray(db.entries)) db.entries = [];
  db.entries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    action,
    userId: meta.userId || null,
    email: meta.email || null,
    details: meta.details || null,
    ip: meta.ip || null,
    timestamp: Date.now(),
  });
  db.entries = db.entries.slice(0, MAX_ENTRIES);
  writeJsonFile(ACTIVITY_PATH, db);
}

/**
 * Read recent activity entries.
 */
function getActivity(limit = 50, offset = 0) {
  const db = readJsonFile(ACTIVITY_PATH, { entries: [] });
  const entries = Array.isArray(db.entries) ? db.entries : [];
  return {
    entries: entries.slice(offset, offset + limit),
    total: entries.length,
  };
}

module.exports = { logActivity, getActivity, ACTIVITY_PATH };
