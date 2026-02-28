const prisma = require('./backend/utils/db');

async function recalculateTeamVolume() {
      console.log("Starting DB Team Volume Recalculation...");

      // 1. Reset all team volumes to 0
      await prisma.user.updateMany({
            data: { teamVolume: 0 }
      });
      console.log("Reset all team volumes to 0.");

      // 2. Fetch all users
      const users = await prisma.user.findMany({
            select: { id: true, totalInvested: true, referredById: true }
      });

      const userMap = new Map();
      users.forEach(u => userMap.set(u.id, u));

      // 3. For each user that has invested, add to their 5 upliners
      for (const u of users) {
            if (u.totalInvested > 0) {
                  let currentUplinerId = u.referredById;
                  for (let i = 0; i < 5; i++) {
                        if (!currentUplinerId) break;

                        const upliner = userMap.get(currentUplinerId);
                        if (!upliner) break;

                        // Update Upliner's team volume in DB
                        await prisma.user.update({
                              where: { id: upliner.id },
                              data: { teamVolume: { increment: u.totalInvested } }
                        });

                        // Move up
                        currentUplinerId = upliner.referredById;
                  }
            }
      }

      console.log("Team Volume recalculation complete. Verifying...");
      const verified = await prisma.user.findMany({
            select: { username: true, teamVolume: true, totalInvested: true }
      });
      console.table(verified);
}

recalculateTeamVolume().catch(console.error).finally(() => prisma.$disconnect());
