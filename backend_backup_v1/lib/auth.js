const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '';

let _runtimeSecret = null;

function getJwtSecret() {
  if (JWT_SECRET) return JWT_SECRET;
  if (_runtimeSecret) return _runtimeSecret;
  _runtimeSecret = crypto.randomBytes(32).toString('hex');
  process.stdout.write('[auth] JWT_SECRET not set — generated random secret for this run.\n');
  return _runtimeSecret;
}

function signToken(user, expiresIn = '7d') {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

module.exports = {
  getJwtSecret,
  signToken,
  verifyToken,
  hashToken,
};
