const { verifyToken, findUserById } = require('./userManager');

// Middleware: Strict authentication required
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in to perform this action.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.'
      });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.'
    });
  }
}

// Middleware: Optional authentication (attaches user if valid token supplied)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await findUserById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }
  } catch (err) {
    console.warn('Optional auth notice:', err.message);
  }

  req.user = null;
  next();
}

module.exports = {
  authenticate,
  optionalAuth
};
