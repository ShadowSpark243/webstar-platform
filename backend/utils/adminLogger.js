const prisma = require('./db');

/**
 * Log an administrative action to the database
 * @param {number} adminId - The ID of the admin performing the action
 * @param {string} action - Descriptive action (e.g., 'APPROVE_DEPOSIT', 'REJECT_KYC')
 * @param {string} targetType - The type of object being acted upon ('USER', 'TRANSACTION', 'KYC', 'PROJECT')
 * @param {number|null} targetId - The ID of the target object
 * @param {object|string|null} details - Additional context or data
 */
const logAdminAction = async (adminId, action, targetType, targetId = null, details = null) => {
      try {
            let detailsString = details;
            if (details && typeof details === 'object') {
                  detailsString = JSON.stringify(details);
            }

            await prisma.adminLog.create({
                  data: {
                        adminId,
                        action,
                        targetType,
                        targetId: targetId ? parseInt(targetId) : null,
                        details: detailsString
                  }
            });
      } catch (error) {
            console.error('[ADMIN_LOGGER_ERROR]', error);
            // We don't want to throw here as it shouldn't break the main flow
      }
};

module.exports = { logAdminAction };
