const prisma = require('./backend/utils/db');

async function check() {
      const users = await prisma.user.findMany({
            select: { id: true, username: true, teamVolume: true, totalInvested: true, referredById: true }
      });
      console.log("All Users:");
      console.table(users);
}
check().catch(console.error).finally(() => prisma.$disconnect());
