/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ROI Service — Tier 3 Business Logic Layer
 * ──────────────────────────────────────────────────────────────────────────────
 * Pure business logic for daily ROI disbursement. No HTTP awareness.
 * Called by: Cron Scheduler (server.js) and Admin Manual Trigger (adminController).
 *
 * Architecture:
 *   Scheduler → Service (this file) → Data (Prisma ORM)
 * ══════════════════════════════════════════════════════════════════════════════
 */

const prisma = require('../utils/db');
const logger = require('../utils/logger');

// ─── Helper: Days in a given month/year ────────────────────────────────────────
function getDaysInMonth(year, month) {
      return new Date(year, month + 1, 0).getDate();
}

// ─── Helper: Get today's date (date-only, no time) in IST ──────────────────────
function getTodayIST() {
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(now.getTime() + istOffset);
      // Return date-only (strip time)
      return new Date(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate());
}

/**
 * ─── Calculate daily ROI amount for an investment ──────────────────────────────
 * @param {number} principalAmount — Original invested amount
 * @param {number} monthlyRoiPercent — Project's monthly ROI percentage (e.g. 1 for 1%)
 * @param {Date} today — Today's date (IST, date-only)
 * @returns {{ dailyAmount: number, daysInMonth: number, monthlyAmount: number }}
 */
function calculateDailyAmount(principalAmount, monthlyRoiPercent, today) {
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const monthlyAmount = principalAmount * (monthlyRoiPercent / 100);
      const dailyAmount = Math.round((monthlyAmount / daysInMonth) * 100) / 100; // Round to 2 decimal places
      return { dailyAmount, daysInMonth, monthlyAmount };
}

/**
 * ─── MAIN: Process daily payouts for ALL active investments ────────────────────
 * This is the core function called by the cron scheduler every day at midnight.
 *
 * Logic per investment:
 *   1. Check if today's payout already exists (idempotency via unique constraint)
 *   2. Calculate daily ROI based on the current month's day count
 *   3. Determine which month cycle we're in (based on investment creation date)
 *   4. If final day of final month → also return principal & mark PAID_OUT
 *   5. Atomic transaction: DailyPayout + User balance + Transaction log + Investment update
 *
 * @returns {{ processed: number, skipped: number, errors: number, totalDisbursed: number }}
 */
async function processDailyPayouts() {
      const today = getTodayIST();
      const todayStr = today.toISOString().split('T')[0];

      logger.info(`[ROI-SERVICE] Starting daily payout processing for ${todayStr}`);

      const stats = { processed: 0, skipped: 0, errors: 0, totalDisbursed: 0 };

      try {
            // 1. Fetch all ACTIVE investments with their project data
            const activeInvestments = await prisma.investment.findMany({
                  where: { status: 'ACTIVE' },
                  include: {
                        project: { select: { title: true, revenueSharePercent: true, durationMonths: true } },
                        user: { select: { id: true, fullName: true } }
                  }
            });

            logger.info(`[ROI-SERVICE] Found ${activeInvestments.length} active investments to process.`);

            for (const inv of activeInvestments) {
                  try {
                        // 2. Idempotency check — skip if today's payout already exists
                        const existingPayout = await prisma.dailyPayout.findUnique({
                              where: {
                                    investmentId_payoutDate: {
                                          investmentId: inv.id,
                                          payoutDate: today
                                    }
                              }
                        });

                        if (existingPayout) {
                              stats.skipped++;
                              continue;
                        }

                        // 3. Determine which month cycle this investment is in
                        const investmentStartDate = new Date(inv.createdAt);
                        const monthsSinceStart = calculateMonthsDifference(investmentStartDate, today);
                        const currentMonthCycle = monthsSinceStart + 1; // 1-indexed

                        // If beyond the investment duration, mark as PAID_OUT
                        if (currentMonthCycle > inv.project.durationMonths) {
                              await finalizeInvestment(inv, today);
                              stats.processed++;
                              continue;
                        }

                        // 4. Calculate today's daily amount
                        const { dailyAmount, daysInMonth } = calculateDailyAmount(
                              inv.amount,
                              inv.project.revenueSharePercent,
                              today
                        );

                        const dayOfMonth = today.getDate();

                        // 5. Check if this is the final payout (last day of last month)
                        const isFinalMonth = currentMonthCycle === inv.project.durationMonths;
                        const isFinalDay = dayOfMonth === daysInMonth;
                        const isInvestmentComplete = isFinalMonth && isFinalDay;

                        // 6. Atomic transaction
                        const operations = [
                              // Create DailyPayout record
                              prisma.dailyPayout.create({
                                    data: {
                                          investmentId: inv.id,
                                          userId: inv.userId,
                                          amount: dailyAmount,
                                          payoutDate: today,
                                          monthNumber: currentMonthCycle,
                                          dayOfMonth: dayOfMonth
                                    }
                              }),
                              // Credit user's ROI Balance (separate from Income)
                              prisma.user.update({
                                    where: { id: inv.userId },
                                    data: {
                                          roiBalance: { increment: dailyAmount }
                                    }
                              }),
                              // Log Transaction
                              prisma.transaction.create({
                                    data: {
                                          userId: inv.userId,
                                          type: 'DAILY_ROI',
                                          amount: dailyAmount,
                                          status: 'APPROVED',
                                          description: `Daily Revenue Distribution: ${inv.project.title} (Month ${currentMonthCycle}, Day ${dayOfMonth}/${daysInMonth})`
                                    }
                              }),
                              // Update Investment tracking fields
                              prisma.investment.update({
                                    where: { id: inv.id },
                                    data: {
                                          lastPayoutDate: today,
                                          totalPaidOut: { increment: dailyAmount },
                                          currentMonth: currentMonthCycle,
                                          ...(isInvestmentComplete ? {
                                                status: 'PAID_OUT',
                                                paidOutAt: new Date(),
                                                returnedAmount: inv.totalPaidOut + dailyAmount + inv.amount
                                          } : {})
                                    }
                              })
                        ];

                        // If the investment is complete, also return the principal
                        if (isInvestmentComplete) {
                              operations.push(
                                    prisma.user.update({
                                          where: { id: inv.userId },
                                          data: {
                                                roiBalance: { increment: inv.amount },
                                                totalInvested: { decrement: inv.amount }
                                          }
                                    }),
                                    prisma.transaction.create({
                                          data: {
                                                userId: inv.userId,
                                                type: 'RETURN',
                                                amount: inv.amount,
                                                status: 'APPROVED',
                                                description: `Contribution Returned: ${inv.project.title} participation cycle completed after ${inv.project.durationMonths} months.`
                                          }
                                    })
                              );
                        }

                        await prisma.$transaction(operations);

                        stats.processed++;
                        stats.totalDisbursed += dailyAmount;
                        if (isInvestmentComplete) {
                              stats.totalDisbursed += inv.amount; // principal
                              logger.info(`[ROI-SERVICE] Investment #${inv.id} COMPLETED. Principal ₹${inv.amount} returned to user #${inv.userId}.`);
                        }

                  } catch (error) {
                        // If unique constraint error, treat as duplicate (already processed)
                        if (error.code === 'P2002') {
                              stats.skipped++;
                        } else {
                              stats.errors++;
                              logger.error(`[ROI-SERVICE] Error processing investment #${inv.id}: ${error.message}`);
                        }
                  }
            }

      } catch (error) {
            logger.error(`[ROI-SERVICE] Critical failure: ${error.message}`);
            throw error;
      }

      logger.info(`[ROI-SERVICE] Daily payout complete: ${JSON.stringify(stats)}`);
      return stats;
}

/**
 * ─── Finalize an investment that has gone past its duration ─────────────────────
 * Marks the investment as PAID_OUT and returns the principal if it hasn't been done yet.
 */
async function finalizeInvestment(inv, today) {
      try {
            await prisma.$transaction([
                  prisma.investment.update({
                        where: { id: inv.id },
                        data: {
                              status: 'PAID_OUT',
                              paidOutAt: new Date(),
                              returnedAmount: inv.totalPaidOut + inv.amount
                        }
                  }),
                  prisma.user.update({
                        where: { id: inv.userId },
                        data: {
                              roiBalance: { increment: inv.amount },
                              totalInvested: { decrement: inv.amount }
                        }
                  }),
                  prisma.transaction.create({
                        data: {
                              userId: inv.userId,
                              type: 'RETURN',
                              amount: inv.amount,
                              status: 'APPROVED',
                              description: `Contribution Returned: ${inv.project.title} participation cycle completed.`
                        }
                  })
            ]);
            logger.info(`[ROI-SERVICE] Finalized overdue investment #${inv.id} for user #${inv.userId}.`);
      } catch (error) {
            logger.error(`[ROI-SERVICE] Error finalizing investment #${inv.id}: ${error.message}`);
      }
}

/**
 * ─── Calculate the number of complete months between two dates ──────────────────
 * Returns 0 if same month, 1 if next month, etc.
 */
function calculateMonthsDifference(startDate, endDate) {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth();
      return (endYear - startYear) * 12 + (endMonth - startMonth);
}

/**
 * ─── Get payout summary for a specific investment (for UI display) ──────────────
 * @param {number} investmentId
 * @returns {{ payouts: DailyPayout[], totalPaid: number, monthlyBreakdown: object }}
 */
async function getPayoutSummary(investmentId) {
      const payouts = await prisma.dailyPayout.findMany({
            where: { investmentId },
            orderBy: { payoutDate: 'desc' },
            take: 60
      });

      const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

      // Group by month
      const monthlyBreakdown = {};
      for (const p of payouts) {
            const key = `Month ${p.monthNumber}`;
            if (!monthlyBreakdown[key]) {
                  monthlyBreakdown[key] = { total: 0, days: 0 };
            }
            monthlyBreakdown[key].total += p.amount;
            monthlyBreakdown[key].days++;
      }

      return { payouts, totalPaid, monthlyBreakdown };
}

/**
 * ─── Get today's total earnings for a specific user ─────────────────────────────
 * @param {number} userId
 * @returns {{ todayEarnings: number, todayPayouts: DailyPayout[] }}
 */
async function getTodayEarnings(userId) {
      const today = getTodayIST();
      const todayPayouts = await prisma.dailyPayout.findMany({
            where: {
                  userId,
                  payoutDate: today
            },
            include: {
                  investment: {
                        include: {
                              project: { select: { title: true } }
                        }
                  }
            }
      });

      const todayEarnings = todayPayouts.reduce((sum, p) => sum + p.amount, 0);
      return { todayEarnings, todayPayouts };
}

/**
 * ─── Get recent daily payouts for a user (for ledger/history display) ──────────
 * @param {number} userId
 * @param {number} limit
 */
async function getRecentPayouts(userId, limit = 30) {
      return prisma.dailyPayout.findMany({
            where: { userId },
            orderBy: { payoutDate: 'desc' },
            take: limit,
            include: {
                  investment: {
                        include: {
                              project: { select: { title: true, revenueSharePercent: true } }
                        }
                  }
            }
      });
}

module.exports = {
      processDailyPayouts,
      calculateDailyAmount,
      getPayoutSummary,
      getTodayEarnings,
      getRecentPayouts,
      getTodayIST
};
