const prisma = require('./db');
const { calculateAndUpdateRank } = require('./rankEngine');

const COMMISSION_RATES = {
      1: 0.05,
      2: 0.02,
      3: 0.005,
      4: 0.005,
      5: 0.005
};

const PERCENT_STRS = {
      1: '5%',
      2: '2%',
      3: '0.5%',
      4: '0.5%',
      5: '0.5%'
};

/**
 * Ensures a user has 5 empty NetworkLevelStat rows.
 */
exports.initializeNetworkStats = async (userId) => {
      try {
            const existing = await prisma.networkLevelStat.findMany({ where: { userId } });
            if (existing.length < 5) {
                  const toCreate = [];
                  for (let i = 1; i <= 5; i++) {
                        if (!existing.some(e => e.level === i)) {
                              toCreate.push({
                                    userId,
                                    level: i,
                                    percent: PERCENT_STRS[i],
                                    count: 0,
                                    active: 0,
                                    volume: 0,
                                    commission: 0
                              });
                        }
                  }
                  if (toCreate.length > 0) {
                        await prisma.networkLevelStat.createMany({ data: toCreate });
                  }
            }
      } catch (error) {
            console.error("Error initializing network stats:", error);
      }
};

/**
 * Core Incremental Update Engine for up to 5 Upliners
 * @param {number} userId - The user causing the event
 * @param {object} updates - { isNewUser: boolean, isNewlyActive: boolean, investmentAmount: number }
 */
exports.updateUpliners = async (userId, updates = { isNewUser: false, isNewlyActive: false, investmentAmount: 0 }) => {
      try {
            let currentUserId = userId;
            let triggerUser = null;

            if (updates.investmentAmount > 0) {
                  triggerUser = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, username: true } });
            }

            for (let level = 1; level <= 5; level++) {
                  const user = await prisma.user.findUnique({ where: { id: currentUserId }, select: { referredById: true } });
                  if (!user || !user.referredById) break;

                  const uplinerId = user.referredById;

                  // Ensure upliner has stats rows initialized
                  await exports.initializeNetworkStats(uplinerId);

                  // 1. Update NetworkLevelStat Model
                  const statUpdate = {};
                  if (updates.isNewUser) statUpdate.count = { increment: 1 };
                  if (updates.isNewlyActive) statUpdate.active = { increment: 1 };
                  if (updates.investmentAmount > 0) {
                        statUpdate.volume = { increment: updates.investmentAmount };
                        statUpdate.commission = { increment: updates.investmentAmount * COMMISSION_RATES[level] };
                  }

                  if (Object.keys(statUpdate).length > 0) {
                        await prisma.networkLevelStat.update({
                              where: { userId_level: { userId: uplinerId, level } },
                              data: statUpdate
                        });
                  }

                  // 2. Update Upliner's Aggregate Totals on User Model (for fast dashboard loading)
                  const userUpdate = {};
                  if (updates.isNewUser) userUpdate.totalTeamMembers = { increment: 1 };
                  if (updates.isNewlyActive) userUpdate.totalActiveTeamMembers = { increment: 1 };
                  if (updates.investmentAmount > 0) {
                        userUpdate.teamVolume = { increment: updates.investmentAmount };
                        userUpdate.totalTeamCommission = { increment: updates.investmentAmount * COMMISSION_RATES[level] };
                        userUpdate.walletBalance = { increment: updates.investmentAmount * COMMISSION_RATES[level] };
                  }

                  if (Object.keys(userUpdate).length > 0) {
                        await prisma.user.update({
                              where: { id: uplinerId },
                              data: userUpdate
                        });

                        // Auto-update rank when teamVolume changes
                        if (userUpdate.teamVolume) {
                              await calculateAndUpdateRank(uplinerId);
                        }
                  }

                  // 3. Output Commission Transaction
                  if (updates.investmentAmount > 0 && triggerUser) {
                        const earnedCommission = updates.investmentAmount * COMMISSION_RATES[level];
                        await prisma.transaction.create({
                              data: {
                                    userId: uplinerId,
                                    type: 'COMMISSION',
                                    amount: earnedCommission,
                                    status: 'APPROVED',
                                    description: `Level ${level} Network Commission from ${triggerUser.fullName} (@${triggerUser.username})`
                              }
                        });
                  }

                  // Move up next level
                  currentUserId = uplinerId;
            }
      } catch (error) {
            console.error("Error updating upliners:", error);
      }
};
