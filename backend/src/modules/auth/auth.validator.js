const Joi = require('joi');

const registerBody = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginBody = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const refreshBody = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutBody = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  loginBody,
  logoutBody,
  registerBody,
  refreshBody,
};
