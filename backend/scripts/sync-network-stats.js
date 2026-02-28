const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COMMISSION_RATES = { 1: 0.05, 2: 0.02, 3: 0.005, 4: 0.005, 5: 0.005 };
const PERCENT_STRS = { 1: '5%', 2: '2%', 3: '0.5%', 4: '0.5%', 5: '0.5%' };

const RANK_TIERS = [
      { name: 'Starter', minVolume: 0 },
      { name: 'Manager', minVolume: 1500000 },
      { name: 'Senior Manager', minVolume: 5000000 },
      { name: 'Director', minVolume: 10000000 },
];

function getRankForVolume(teamVolume) {
      let rank = RANK_TIERS[0];
      for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
            if (teamVolume >= RANK_TIERS[i].minVolume) { rank = RANK_TIERS[i]; break; }
      }
      return rank.name;
}

async function fullSync() {
      console.log('=== FULL DATABASE RECONCILIATION ===\n');

      // ───────────────────────────────────────────
      // STEP 1: Fix User.totalInvested from actual Investment records
      // ───────────────────────────────────────────
      console.log('📊 STEP 1: Reconciling User.totalInvested from Investment table...');
      const allUsers = await prisma.user.findMany({ select: { id: true, username: true, totalInvested: true } });

      for (const user of allUsers) {
            const investmentSum = await prisma.investment.aggregate({
                  _sum: { amount: true },
                  where: { userId: user.id, status: 'ACTIVE' }
            });
            const actualInvested = investmentSum._sum.amount || 0;

            if (Math.abs(user.totalInvested - actualInvested) > 0.01) {
                  console.log(`  🔧 @${user.username}: totalInvested ₹${user.totalInvested} → ₹${actualInvested} (from Investment table)`);
                  await prisma.user.update({
                        where: { id: user.id },
                        data: { totalInvested: actualInvested }
                  });
            }
      }

      // ───────────────────────────────────────────
      // STEP 2: Fix Project.raisedAmount from actual Investment records
      // ───────────────────────────────────────────
      console.log('\n📊 STEP 2: Reconciling Project.raisedAmount from Investment table...');
      const allProjects = await prisma.project.findMany({ select: { id: true, title: true, raisedAmount: true, targetAmount: true, status: true } });

      for (const project of allProjects) {
            const raised = await prisma.investment.aggregate({
                  _sum: { amount: true },
                  where: { projectId: project.id, status: 'ACTIVE' }
            });
            const actualRaised = raised._sum.amount || 0;

            if (Math.abs(project.raisedAmount - actualRaised) > 0.01) {
                  console.log(`  🔧 "${project.title}": raisedAmount ₹${project.raisedAmount} → ₹${actualRaised} (from Investment table)`);
            }

            // Also fix status based on actual raised vs target
            let correctStatus = project.status;
            if (actualRaised >= project.targetAmount && project.status === 'OPEN') {
                  correctStatus = 'FUNDED';
                  console.log(`  🔧 "${project.title}": status ${project.status} → FUNDED (target reached)`);
            }

            await prisma.project.update({
                  where: { id: project.id },
                  data: { raisedAmount: actualRaised, status: correctStatus }
            });
      }

      // ───────────────────────────────────────────
      // STEP 3: Reconcile NetworkLevelStat from actual referral tree
      // ───────────────────────────────────────────
      console.log('\n📊 STEP 3: Reconciling NetworkLevelStat from referral tree...');

      // Refresh user data after step 1 fixes
      const refreshedUsers = await prisma.user.findMany({
            select: { id: true, username: true, referredById: true, totalInvested: true }
      });

      for (const user of refreshedUsers) {
            let currentLevelUserIds = [user.id];
            let totalTeamMembers = 0;
            let totalActiveTeamMembers = 0;
            let totalTeamVolume = 0;
            let totalTeamCommission = 0;

            for (let level = 1; level <= 5; level++) {
                  let count = 0, active = 0, volume = 0, commission = 0;

                  if (currentLevelUserIds.length > 0) {
                        const downlines = await prisma.user.findMany({
                              where: { referredById: { in: currentLevelUserIds } },
                              select: { id: true, totalInvested: true }
                        });

                        count = downlines.length;
                        active = downlines.filter(u => u.totalInvested > 0).length;
                        volume = downlines.reduce((sum, u) => sum + (u.totalInvested || 0), 0);
                        commission = volume * COMMISSION_RATES[level];

                        totalTeamMembers += count;
                        totalActiveTeamMembers += active;
                        totalTeamVolume += volume;
                        totalTeamCommission += commission;

                        currentLevelUserIds = downlines.map(u => u.id);
                  }

                  await prisma.networkLevelStat.upsert({
                        where: { userId_level: { userId: user.id, level } },
                        update: { count, active, volume, commission, percent: PERCENT_STRS[level] },
                        create: { userId: user.id, level, count, active, volume, commission, percent: PERCENT_STRS[level] }
                  });
            }

            // ───────────────────────────────────────────
            // STEP 4: Sync User aggregate fields
            // ───────────────────────────────────────────
            const correctRank = getRankForVolume(totalTeamVolume);

            await prisma.user.update({
                  where: { id: user.id },
                  data: {
                        teamVolume: totalTeamVolume,
                        totalTeamMembers,
                        totalActiveTeamMembers,
                        totalTeamCommission,
                        rank: correctRank
                  }
            });

            console.log(`  ✅ @${user.username} — Invested: ₹${(await prisma.user.findUnique({ where: { id: user.id }, select: { totalInvested: true } })).totalInvested.toLocaleString('en-IN')} | Team: ${totalTeamMembers} members (${totalActiveTeamMembers} active) | Volume: ₹${totalTeamVolume.toLocaleString('en-IN')} | Rank: ${correctRank}`);
      }

      // ───────────────────────────────────────────
      // STEP 5: Verify User.walletBalance (informational only — won't auto-fix)
      // ───────────────────────────────────────────
      console.log('\n📊 STEP 5: Wallet balance audit (informational)...');
      for (const user of refreshedUsers) {
            const deposits = await prisma.transaction.aggregate({
                  _sum: { amount: true },
                  where: { userId: user.id, type: 'DEPOSIT', status: 'APPROVED' }
            });
            const commissions = await prisma.transaction.aggregate({
                  _sum: { amount: true },
                  where: { userId: user.id, type: 'COMMISSION', status: 'APPROVED' }
            });
            const investments = await prisma.transaction.aggregate({
                  _sum: { amount: true },
                  where: { userId: user.id, type: 'INVESTMENT', status: 'APPROVED' }
            });

            const totalIn = (deposits._sum.amount || 0) + (commissions._sum.amount || 0);
            const totalOut = investments._sum.amount || 0;
            const expectedBalance = totalIn - totalOut;

            const actualUser = await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalance: true } });
            const diff = Math.abs(actualUser.walletBalance - expectedBalance);

            if (diff > 1) {
                  console.log(`  ⚠️  @${user.username}: walletBalance=₹${actualUser.walletBalance} | Expected (deposits+commissions-investments)=₹${expectedBalance} | Diff: ₹${diff.toFixed(0)}`);
            } else {
                  console.log(`  ✅ @${user.username}: walletBalance=₹${actualUser.walletBalance} ≈ Expected ₹${expectedBalance}`);
            }
      }

      console.log('\n=== RECONCILIATION COMPLETE ===');
      await prisma.$disconnect();
}

fullSync().catch(e => {
      console.error('❌ Sync failed:', e);
      prisma.$disconnect();
      process.exit(1);
});
