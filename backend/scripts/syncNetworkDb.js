const prisma = require('../utils/db');
const networkStats = require('../utils/networkStats');

async function run() {
      console.log("Starting full database network aggregation sync...");

      // 1. Reset all aggregation fields to 0
      console.log("Resetting Network stats to 0...");
      await prisma.networkLevelStat.updateMany({
            data: { count: 0, active: 0, volume: 0, commission: 0 }
      });

      await prisma.user.updateMany({
            data: { totalTeamMembers: 0, totalActiveTeamMembers: 0, teamVolume: 0, totalTeamCommission: 0 }
      });

      // 2. Fetch all users
      const allUsers = await prisma.user.findMany({ select: { id: true, status: true, totalInvested: true } });
      const totalUsers = allUsers.length;

      console.log(`Processing ${totalUsers} users...`);

      // 3. Re-play their existences incrementally using the core engine
      for (const user of allUsers) {
            // A. Trigger Registration Event (New User)
            await networkStats.updateUpliners(user.id, { isNewUser: true });

            // B. Trigger Activation Event (If Active)
            if (user.status === 'ACTIVE') {
                  await networkStats.updateUpliners(user.id, { isNewlyActive: true });
            }

            // C. Trigger Investment Event (If they have volume)
            // Note: We avoid re-creating the COMMISSION transactions because historical ones exist.
            // We just want to update the pure aggregates in User + NetworkLevelStat.
            if (user.totalInvested > 0) {
                  let currentUserId = user.id;
                  for (let level = 1; level <= 5; level++) {
                        const u = await prisma.user.findUnique({ where: { id: currentUserId }, select: { referredById: true } });
                        if (!u || !u.referredById) break;

                        const uplinerId = u.referredById;
                        const investmentAmt = user.totalInvested;
                        const COMMISSION_RATES = { 1: 0.05, 2: 0.02, 3: 0.005, 4: 0.005, 5: 0.005 };

                        await prisma.networkLevelStat.update({
                              where: { userId_level: { userId: uplinerId, level } },
                              data: {
                                    volume: { increment: investmentAmt },
                                    commission: { increment: investmentAmt * COMMISSION_RATES[level] }
                              }
                        });

                        await prisma.user.update({
                              where: { id: uplinerId },
                              data: {
                                    teamVolume: { increment: investmentAmt },
                                    totalTeamCommission: { increment: investmentAmt * COMMISSION_RATES[level] }
                              }
                        });

                        currentUserId = uplinerId;
                  }
            }
      }

      console.log("✅ Database Network Aggregations fully synchronized.");
      process.exit(0);
}

run().catch(e => {
      console.error(e);
      process.exit(1);
});
