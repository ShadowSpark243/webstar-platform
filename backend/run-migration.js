/**
 * run-migration.js
 * Applies the SupportTicket and SupportMessage table creation directly
 * using the existing Prisma connection. Run with: node run-migration.js
 */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
      console.log('🔄 Applying chat support migration...');

      await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`SupportTicket\` (
      \`id\`        INT          NOT NULL AUTO_INCREMENT,
      \`userId\`    INT          NOT NULL,
      \`subject\`   VARCHAR(191) NOT NULL,
      \`status\`    ENUM('OPEN','IN_PROGRESS','CLOSED') NOT NULL DEFAULT 'OPEN',
      \`createdAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`SupportTicket_userId_idx\` (\`userId\`),
      CONSTRAINT \`SupportTicket_userId_fkey\`
        FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
      console.log('✅ SupportTicket table created (or already exists)');

      await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`SupportMessage\` (
      \`id\`         INT          NOT NULL AUTO_INCREMENT,
      \`ticketId\`   INT          NOT NULL,
      \`senderId\`   INT          NOT NULL,
      \`senderRole\` ENUM('USER','ADMIN') NOT NULL,
      \`message\`    LONGTEXT     NOT NULL,
      \`createdAt\`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`SupportMessage_ticketId_idx\` (\`ticketId\`),
      INDEX \`SupportMessage_senderId_idx\` (\`senderId\`),
      CONSTRAINT \`SupportMessage_ticketId_fkey\`
        FOREIGN KEY (\`ticketId\`) REFERENCES \`SupportTicket\`(\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`SupportMessage_senderId_fkey\`
        FOREIGN KEY (\`senderId\`) REFERENCES \`User\`(\`id\`)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
      console.log('✅ SupportMessage table created (or already exists)');

      // Verify tables exist
      const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'Support%'`;
      console.log('\n📊 Support tables in database:');
      tables.forEach(t => console.log('  •', Object.values(t)[0]));

      console.log('\n🎉 Migration complete! Restart your backend server.');
}

main()
      .catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); })
      .finally(() => prisma.$disconnect());
