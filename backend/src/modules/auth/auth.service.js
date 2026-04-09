const jwt = require('jsonwebtoken');

const User = require('../../models/user.model');
const {
  generateAccessToken,
  generateRefreshToken,
  getRefreshSecret,
} = require('../../utils/jwt');

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function register(payload) {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    const error = new Error('Email is already registered.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
  });

  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

async function login(payload) {
  const user = await User.findOne({ email: payload.email }).select('+password');
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const passwordOk = await user.comparePassword(payload.password);
  if (!passwordOk) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

async function refreshToken(payload) {
  let decoded;
  try {
    decoded = jwt.verify(payload.refreshToken, getRefreshSecret());
  } catch (error) {
    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive || Number(decoded.ver || 0) !== Number(user.tokenVersion || 0)) {
    const error = new Error('Refresh token is no longer valid.');
    error.statusCode = 401;
    throw error;
  }

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

async function logout(payload) {
  let decoded;
  try {
    decoded = jwt.verify(payload.refreshToken, getRefreshSecret());
  } catch (error) {
    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  user.tokenVersion += 1;
  await user.save();

  return {
    message: 'Logged out successfully.',
  };
}

async function me(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}

module.exports = {
  login,
  logout,
  me,
  refreshToken,
  register,
};
