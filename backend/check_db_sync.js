const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
      const projects = await prisma.project.findMany({
            include: {
                  _count: { select: { investments: true } },
                  investments: true
            }
      });

      console.log('--- PROJECTS OVERVIEW ---');
      projects.forEach(p => {
            console.log(`ID: ${p.id} | Title: "${p.title}" | Raised: ${p.raisedAmount} | Inv Count: ${p._count.investments}`);
            if (p.investments.length > 0) {
                  console.log(`  First Inv UserID: ${p.investments[0].userId}`);
            }
      });

      const totalInvs = await prisma.investment.count();
      console.log('\nTotal Investments in DB:', totalInvs);
}

main()
      .catch(console.error)
      .finally(() => prisma.$disconnect());
