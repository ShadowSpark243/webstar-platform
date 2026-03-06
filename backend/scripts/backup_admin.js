import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      fs.writeFileSync('admin_backup.json', JSON.stringify(admins, null, 2));
      console.log(`Saved ${admins.length} admin accounts to admin_backup.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
