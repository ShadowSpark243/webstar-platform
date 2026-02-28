require('dotenv').config();
const prisma = require('./utils/db');

async function fix() {
      try {
            // Reset kycStatus for users who have PENDING status but no matching KYC document
            const users = await prisma.user.findMany({ where: { kycStatus: 'PENDING' } });

            for (const user of users) {
                  const doc = await prisma.kycDocument.findFirst({ where: { userId: user.id } });
                  if (!doc) {
                        await prisma.user.update({
                              where: { id: user.id },
                              data: { kycStatus: 'UNVERIFIED' }
                        });
                        console.log(`Reset kycStatus for ${user.fullName} (id: ${user.id}) to UNVERIFIED`);
                  }
            }
            console.log('Done');
      } catch (e) {
            console.error('Error:', e.message);
      } finally {
            await prisma.$disconnect();
      }
}
fix();
