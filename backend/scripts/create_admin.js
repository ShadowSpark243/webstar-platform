const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
      const email = 'admin@itramwebpro.com';
      const plainPassword = 'adminpassword123';

      const existingAdmin = await prisma.admin.findUnique({ where: { email } });
      if (existingAdmin) {
            console.log(`Admin ${email} already exists.`);
            return;
      }

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const admin = await prisma.admin.create({
            data: {
                  email,
                  username: 'admin',
                  password: hashedPassword,
                  referralCode: 'ADMIN_REF',
                  fullName: 'ITRAM WEBPRO Admin',
                  role: 'ADMIN'
            }
      });

      console.log(`Successfully created new admin account!\nEmail: ${email}\nPassword: ${plainPassword}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
