const authService = require('./auth.service');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function respond(res, statusCode, message, data) {
  return res.status(statusCode).json({
    message,
    data,
  });
}

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return respond(res, 201, 'User registered successfully.', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return respond(res, 200, 'Login successful.', result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshToken(req.body);
  return respond(res, 200, 'Token refreshed successfully.', result);
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body);
  return respond(res, 200, result.message, null);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user.id);
  return respond(res, 200, 'Profile fetched successfully.', user);
});

module.exports = {
  login,
  logout,
  me,
  refresh,
  register,
};
