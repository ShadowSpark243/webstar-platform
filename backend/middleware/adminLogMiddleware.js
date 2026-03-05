const prisma = require('../utils/db');

/**
 * Logs an admin action for the audit trail.
 * @param {number} adminId - The admin user's ID
 * @param {string} action - e.g., 'APPROVE_KYC', 'REJECT_DEPOSIT', 'BAN_USER'
 * @param {string} targetType - e.g., 'USER', 'TRANSACTION', 'PROJECT'
 * @param {number|null} targetId - ID of affected record
 * @param {string|null} details - Optional JSON or text details
 */
const logAdminAction = async (adminId, action, targetType, targetId = null, details = null) => {
      try {
            await prisma.adminLog.create({
                  data: { adminId, action, targetType, targetId, details }
            });
      } catch (err) {
            console.error('[AUDIT LOG ERROR]', err.message);
      }
};

module.exports = logAdminAction;
