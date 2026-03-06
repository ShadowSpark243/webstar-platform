/**
 * One-time migration script:
 * Move all existing DAILY_ROI + RETURN transaction amounts from incomeBalance → roiBalance
 * 
 * Run: node scripts/migrate-roi-balance.js
 */

require('dotenv').config();
const prisma = require('../utils/db');

async function migrateROIBalances() {
      console.log('Starting ROI balance migration...\n');

      // Find all users who have received DAILY_ROI or RETURN transactions
      const roiTransactions = await prisma.transaction.findMany({
            where: {
                  type: { in: ['DAILY_ROI', 'RETURN'] },
                  status: 'APPROVED'
            },
            select: { userId: true, amount: true, type: true }
      });

      // Sum up ROI amounts per user
      const userROIMap = {};
      for (const tx of roiTransactions) {
            if (!userROIMap[tx.userId]) userROIMap[tx.userId] = 0;
            userROIMap[tx.userId] += tx.amount;
      }

      console.log(`Found ${Object.keys(userROIMap).length} users with ROI transactions.\n`);

      for (const [userId, totalROI] of Object.entries(userROIMap)) {
            const uid = parseInt(userId);
            const user = await prisma.user.findUnique({
                  where: { id: uid },
                  select: { fullName: true, incomeBalance: true, roiBalance: true }
            });

            if (!user) continue;

            // Move the ROI amount: decrement from incomeBalance, increment to roiBalance
            const moveAmount = Math.min(totalROI, user.incomeBalance); // Don't go negative

            if (moveAmount <= 0) {
                  console.log(`  [SKIP] User #${uid} (${user.fullName}): No balance to move (income: ₹${user.incomeBalance}, roi already: ₹${user.roiBalance})`);
                  continue;
            }

            await prisma.user.update({
                  where: { id: uid },
                  data: {
                        incomeBalance: { decrement: moveAmount },
                        roiBalance: { increment: moveAmount }
                  }
            });

            console.log(`  [DONE] User #${uid} (${user.fullName}): Moved ₹${moveAmount.toFixed(2)} from incomeBalance → roiBalance`);
      }

      console.log('\n✅ Migration complete!');
      await prisma.$disconnect();
}

migrateROIBalances().catch(console.error);
