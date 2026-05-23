const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(DATA_DIR);

/**
 * Read a JSON file, returning `fallback` on any error.
 */
function readJsonFile(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

/**
 * Atomically write JSON to a file (write to tmp then rename).
 */
function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * Returns a valid object or null.
 */
function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

/**
 * Append an item to the beginning of an array stored in a JSON file.
 * Keeps the array capped at `maxLen`.
 */
function prependToList(filePath, key, item, maxLen = 5000) {
  const db = readJsonFile(filePath, { [key]: [] });
  if (!Array.isArray(db[key])) db[key] = [];
  db[key].unshift(item);
  db[key] = db[key].slice(0, maxLen);
  writeJsonFile(filePath, db);
  return db;
}

module.exports = {
  DATA_DIR,
  ensureDir,
  readJsonFile,
  writeJsonFile,
  safeObject,
  prependToList,
};
