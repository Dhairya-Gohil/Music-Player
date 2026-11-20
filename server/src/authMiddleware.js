const { verifyToken, findUserById } = require('./userManager');

// Middleware: Strict authentication required
function authenticate(req, res, next) {
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

  const user = findUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User account not found.'
    });
  }

  req.user = user;
  next();
}

// Middleware: Optional authentication (attaches user if valid token supplied)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      const user = findUserById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  req.user = null;
  next();
}

module.exports = {
  authenticate,
  optionalAuth
};
