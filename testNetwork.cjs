const prisma = require('./backend/utils/db');

async function test() {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      console.log("Admin ID:", admin.id);

      const stats = [];
      let currentLevelUserIds = [admin.id];

      for (let i = 1; i <= 5; i++) {
            if (currentLevelUserIds.length === 0) {
                  stats.push({ level: i, percent: i === 1 ? '5%' : i === 2 ? '2%' : '0.5%', count: 0, volume: 0, active: 0 });
                  continue;
            }

            const downlines = await prisma.user.findMany({
                  where: { referredById: { in: currentLevelUserIds } },
                  select: { id: true, totalInvested: true, status: true }
            });

            const count = downlines.length;
            const active = downlines.filter(u => u.totalInvested > 0).length;
            const volume = downlines.reduce((sum, u) => sum + u.totalInvested, 0);

            stats.push({
                  level: i,
                  percent: i === 1 ? '5%' : i === 2 ? '2%' : '0.5%',
                  count,
                  active,
                  volume
            });

            currentLevelUserIds = downlines.map(u => u.id);
      }
      console.log("Admin Network Stats from Admin ID:", stats);

      const allUsers = await prisma.user.findMany({ select: { id: true, fullName: true, referredById: true } });
      console.log("Total users in system:", allUsers.length);
      console.log("Root users:", allUsers.filter(u => !u.referredById).length);
}
test().catch(console.error).finally(() => prisma.$disconnect());
