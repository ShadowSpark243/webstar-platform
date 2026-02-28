const prisma = require('./utils/db');

async function test() {
      const deposit = await prisma.transaction.findFirst({
            where: { type: 'DEPOSIT', status: 'PENDING' }
      });

      if (!deposit) {
            console.log("No pending deposits.");
            return;
      }

      console.log("Found deposit:", deposit.id);

      try {
            const tx = await prisma.transaction.update({
                  where: { id: deposit.id },
                  data: { status: 'APPROVED' }
            });

            const user = await prisma.user.findUnique({ where: { id: tx.userId } });

            await prisma.user.update({
                  where: { id: tx.userId },
                  data: {
                        walletBalance: user.walletBalance + tx.amount,
                        status: (user.walletBalance + tx.amount) >= 100000 ? 'ACTIVE' : user.status
                  }
            });

            console.log("Success.");
      } catch (e) {
            console.error("Error approving:", e);
      }
}

test();
