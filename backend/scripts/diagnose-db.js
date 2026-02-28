const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseAll() {
      console.log('=== FULL DATABASE DIAGNOSTIC ===\n');

      // 1. Users
      const users = await prisma.user.findMany({
            select: { id: true, fullName: true, username: true, email: true, status: true, kycStatus: true, walletBalance: true, totalInvested: true, teamVolume: true, rank: true, role: true, kycImageUrl: true, referredById: true }
      });
      console.log(`📦 USER TABLE (${users.length} rows):`);
      users.forEach(u => {
            console.log(`  #${u.id} @${u.username} | Status: ${u.status} | KYC: ${u.kycStatus} | Balance: ₹${u.walletBalance} | Invested: ₹${u.totalInvested} | TeamVol: ₹${u.teamVolume} | Rank: ${u.rank} | Role: ${u.role} | kycImageUrl: ${u.kycImageUrl ? 'YES' : 'NULL'}`);
      });

      // 2. Investments
      const investments = await prisma.investment.findMany({
            include: { user: { select: { username: true } }, project: { select: { title: true } } }
      });
      console.log(`\n📦 INVESTMENT TABLE (${investments.length} rows):`);
      if (investments.length === 0) {
            console.log('  ⚠️  EMPTY — No investment records exist');
      } else {
            investments.forEach(inv => {
                  console.log(`  #${inv.id} | User: @${inv.user.username} | Project: ${inv.project.title} | Amount: ₹${inv.amount} | Return: ₹${inv.expectedReturn} | Status: ${inv.status}`);
            });
      }

      // 3. KycDocuments
      const kycDocs = await prisma.kycDocument.findMany({
            include: { user: { select: { username: true, kycStatus: true } } }
      });
      console.log(`\n📦 KYCDOCUMENT TABLE (${kycDocs.length} rows):`);
      if (kycDocs.length === 0) {
            console.log('  ⚠️  EMPTY — No KYC document records exist');
            // Check if any users have KYC set to non-UNVERIFIED
            const kycUsers = users.filter(u => u.kycStatus !== 'UNVERIFIED');
            if (kycUsers.length > 0) {
                  console.log(`  🔴 MISMATCH: ${kycUsers.length} user(s) have kycStatus != UNVERIFIED but no KycDocument records:`);
                  kycUsers.forEach(u => console.log(`     @${u.username} — kycStatus: ${u.kycStatus}, kycImageUrl: ${u.kycImageUrl || 'NULL'}`));
            }
      } else {
            kycDocs.forEach(doc => {
                  console.log(`  #${doc.id} | User: @${doc.user.username} | Type: ${doc.documentType} | Status: ${doc.status} | URL: ${doc.documentUrl ? 'YES' : 'NULL'}`);
            });
      }

      // 4. Transactions
      const transactions = await prisma.transaction.findMany({
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: 'desc' },
            take: 20
      });
      const txCount = await prisma.transaction.count();
      console.log(`\n📦 TRANSACTION TABLE (${txCount} total, showing latest 20):`);
      if (txCount === 0) {
            console.log('  ⚠️  EMPTY');
      } else {
            transactions.forEach(tx => {
                  console.log(`  #${tx.id} | @${tx.user.username} | ${tx.type} | ₹${tx.amount} | ${tx.status} | ${tx.description || ''}`);
            });
      }

      // 5. Projects
      const projects = await prisma.project.findMany({
            include: { _count: { select: { investments: true } } }
      });
      console.log(`\n📦 PROJECT TABLE (${projects.length} rows):`);
      projects.forEach(p => {
            console.log(`  #${p.id} | ${p.title} | Status: ${p.status} | Raised: ₹${p.raisedAmount}/${p.targetAmount} | Investors: ${p._count.investments} | ROI: ${p.roiPercentage}%`);
      });

      // 6. NetworkLevelStat
      const stats = await prisma.networkLevelStat.findMany({
            orderBy: [{ userId: 'asc' }, { level: 'asc' }],
            include: { user: { select: { username: true } } }
      });
      console.log(`\n📦 NETWORKLEVELSTAT TABLE (${stats.length} rows):`);
      if (stats.length === 0) {
            console.log('  ⚠️  EMPTY');
      } else {
            stats.forEach(s => {
                  console.log(`  @${s.user.username} L${s.level} (${s.percent}) | Count: ${s.count} | Active: ${s.active} | Volume: ₹${s.volume} | Commission: ₹${s.commission}`);
            });
      }

      // Summary of data integrity issues
      console.log('\n=== DATA INTEGRITY CHECKS ===');

      // Check: Users with totalInvested > 0 but no Investment records
      const investedUsers = users.filter(u => u.totalInvested > 0);
      const usersWithInvestments = [...new Set(investments.map(i => i.userId))];
      const mismatchUsers = investedUsers.filter(u => !usersWithInvestments.includes(u.id));
      if (mismatchUsers.length > 0) {
            console.log(`\n🔴 USERS WITH totalInvested > 0 BUT NO Investment RECORDS:`);
            mismatchUsers.forEach(u => console.log(`  @${u.username} — totalInvested: ₹${u.totalInvested}`));
      }

      // Check: Projects with raisedAmount > 0 but no Investment records
      const fundedProjects = projects.filter(p => p.raisedAmount > 0 && p._count.investments === 0);
      if (fundedProjects.length > 0) {
            console.log(`\n🔴 PROJECTS WITH raisedAmount > 0 BUT NO INVESTOR RECORDS:`);
            fundedProjects.forEach(p => console.log(`  ${p.title} — raisedAmount: ₹${p.raisedAmount}`));
      }

      console.log('\n=== DIAGNOSTIC COMPLETE ===');
      await prisma.$disconnect();
}

diagnoseAll().catch(e => {
      console.error('Diagnostic failed:', e);
      prisma.$disconnect();
      process.exit(1);
});
