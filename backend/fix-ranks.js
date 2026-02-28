// One-off script to fix ranks for existing users
const { calculateAndUpdateRank } = require('./utils/rankEngine');
const prisma = require('./utils/db');

async function fixRanks() {
      const users = await prisma.user.findMany({
            where: { teamVolume: { gt: 0 } },
            select: { id: true, teamVolume: true, rank: true }
      });

      console.log(`Found ${users.length} users with teamVolume > 0`);

      for (const u of users) {
            const r = await calculateAndUpdateRank(u.id);
            console.log(`User #${u.id}: vol=${u.teamVolume} old=${u.rank} new=${r ? r.current.name : '?'}`);
      }

      await prisma.$disconnect();
      console.log('Done!');
}

fixRanks();
