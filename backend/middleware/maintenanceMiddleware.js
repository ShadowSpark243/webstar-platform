const prisma = require('../utils/db');

/**
 * Maintenance mode middleware.
 * If the AppSetting 'maintenance_mode' is 'true', block all non-admin routes.
 */
const maintenanceMiddleware = async (req, res, next) => {
      try {
            // 1. Allow Admins who already have a valid token
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                  const jwt = require('jsonwebtoken');
                  try {
                        const token = req.headers.authorization.split(' ')[1];
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        if (decoded && decoded.role === 'ADMIN') {
                              return next();
                        }
                  } catch (e) {
                        // Ignore, proceed to normal check
                  }
            }

            // 2. Skip check for exact system routes and login to let users/admins generate tokens
            const whiteListedPaths = [
                  '/admin',
                  '/health',
                  '/auth/login',
                  '/auth/me',
                  '/auth/forgot-password',
                  '/auth/reset-password'
            ];

            const path = req.path;
            if (whiteListedPaths.some(p => path.startsWith(p))) {
                  return next();
            }

            const setting = await prisma.appSetting.findUnique({
                  where: { key: 'maintenance_mode' }
            });

            if (setting && setting.value === 'true') {
                  return res.status(503).json({
                        success: false,
                        message: 'The platform is currently under maintenance. Please check back soon.',
                        maintenance: true
                  });
            }

            next();
      } catch (err) {
            // If AppSetting table doesn't exist yet or any error, just continue
            next();
      }
};

module.exports = maintenanceMiddleware;
