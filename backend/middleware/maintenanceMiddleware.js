const prisma = require('../utils/db');

/**
 * Maintenance mode middleware.
 * If the AppSetting 'maintenance_mode' is 'true', block all non-admin routes.
 */
const maintenanceMiddleware = async (req, res, next) => {
      try {
            // Skip check for admin routes and health check
            if (req.path.startsWith('/api/admin') || req.path === '/api/health') {
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
