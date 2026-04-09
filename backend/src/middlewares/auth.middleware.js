const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      message: 'Authorization token is required.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    const userId = decoded.sub || decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token payload.',
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive || Number(decoded.ver || 0) !== Number(user.tokenVersion || 0)) {
      return res.status(401).json({
        message: 'Invalid or expired authorization token.',
      });
    }

    req.user = {
      id: userId,
      payload: decoded,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authorization token.',
    });
  }
}

module.exports = authMiddleware;
