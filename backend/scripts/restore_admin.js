import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
      if (!fs.existsSync('admin_backup.json')) {
            console.log('No backup file found, skipping restore.');
            return;
      }
      const admins = JSON.parse(fs.readFileSync('admin_backup.json', 'utf-8'));
      for (const admin of admins) {
            // Upsert or Create Admin
            await prisma.user.create({
                  data: {
                        id: admin.id,
                        email: admin.email,
                        password: admin.password,
                        fullName: admin.fullName,
                        role: admin.role,
                        kycStatus: admin.kycStatus,
                        walletBalance: admin.walletBalance,
                        totalInvested: admin.totalInvested,
                        totalEarnings: admin.totalEarnings,
                        incomeBalance: admin.incomeBalance,
                        roiBalance: admin.roiBalance,
                        createdAt: new Date(admin.createdAt),
                        updatedAt: new Date(admin.updatedAt)
                  }
            });
      }
      console.log(`Restored ${admins.length} admin accounts successfully.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
