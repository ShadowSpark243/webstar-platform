const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
      const count = await prisma.investment.count();
      console.log('Total Investments in DB:', count);

      if (count > 0) {
            const invs = await prisma.investment.findMany({
                  take: 10,
                  include: {
                        user: { select: { fullName: true, username: true } },
                        project: { select: { title: true, id: true } }
                  }
            });
            console.log('Sample Investments (Last 10):', JSON.stringify(invs, null, 2));
      } else {
            console.log('No investments found in DB.');
      }
}

main()
      .catch(console.error)
      .finally(() => prisma.$disconnect());
