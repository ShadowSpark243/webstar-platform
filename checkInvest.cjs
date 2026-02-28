const prisma = require('./backend/utils/db');

async function testNetworkStats() {
      // 1. Get a random user with downlines or just the admin
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

      // 2. See if there are any child users
      const children = await prisma.user.findMany({ where: { referredById: admin.id } });
      if (children.length > 0) {
            console.log("Admin's direct referrals:", children.map(c => c.username));
            // Force an investment on the first child to see if it tallies
            console.log("Forcing an investment of 50000 on", children[0].username);

            await prisma.user.update({
                  where: { id: children[0].id },
                  data: { totalInvested: { increment: 50000 } }
            });

            // Tally Volume for the admin stats endpoint
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
            console.log("\nSimulated /wallet/network-stats for Admin:", stats);
      } else {
            console.log("No children. Create some test users with referral codes.");
      }
}

testNetworkStats().catch(console.error).finally(() => prisma.$disconnect());
