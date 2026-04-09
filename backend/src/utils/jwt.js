const jwt = require('jsonwebtoken');

function getAccessSecret() {
  return process.env.JWT_SECRET || 'dev-secret';
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret';
}

function buildPayload(user) {
  return {
    sub: String(user._id),
    ver: user.tokenVersion || 0,
    role: user.role || 'user',
  };
}

function generateAccessToken(user) {
  return jwt.sign(buildPayload(user), getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}

function generateRefreshToken(user) {
  return jwt.sign(buildPayload(user), getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getAccessSecret,
  getRefreshSecret,
};
