require('dotenv').config();
const prisma = require('./utils/db');

async function runE2ETest() {
      try {
            // Step 1: Verify TestAlpha registration
            const testUser = await prisma.user.findUnique({ where: { username: 'TestAlpha' } });
            if (!testUser) {
                  console.log('ERROR: TestAlpha user not found!');
                  return;
            }
            console.log('=== STEP 1: REGISTRATION VERIFIED ===');
            console.log('User ID:', testUser.id);
            console.log('Full Name:', testUser.fullName);
            console.log('Email:', testUser.email);
            console.log('KYC Status:', testUser.kycStatus);
            console.log('Account Status:', testUser.status);
            console.log('Wallet Balance:', testUser.walletBalance);
            console.log('Referred By ID:', testUser.referredById);

            // Check referrer
            if (testUser.referredById) {
                  const referrer = await prisma.user.findUnique({ where: { id: testUser.referredById } });
                  console.log('Referrer:', referrer.fullName, '(@' + referrer.username + ')');
            }

            // Step 2-3: Manually approve KYC (since S3 file upload not available)
            console.log('\n=== STEP 2-3: KYC FAST-TRACKED ===');
            await prisma.user.update({
                  where: { id: testUser.id },
                  data: { kycStatus: 'VERIFIED' }
            });
            console.log('KYC Status updated to VERIFIED');

            // Step 4: Create a deposit request for TestAlpha
            console.log('\n=== STEP 4: CREATING DEPOSIT REQUEST ===');
            const depositTx = await prisma.transaction.create({
                  data: {
                        userId: testUser.id,
                        type: 'DEPOSIT',
                        amount: 200000,
                        status: 'PENDING',
                        description: 'Manual Bank Deposit',
                        bankReference: 'UTR-E2E-TEST-001'
                  }
            });
            console.log('Deposit TX created with ID:', depositTx.id, '| Amount: 200000 | Status: PENDING');

            // Step 5: Admin approves deposit (simulate reviewDeposit logic)
            console.log('\n=== STEP 5: ADMIN APPROVES DEPOSIT ===');
            await prisma.transaction.update({
                  where: { id: depositTx.id },
                  data: { status: 'APPROVED' }
            });

            const newBalance = testUser.walletBalance + depositTx.amount;
            const newStatus = newBalance >= 100000 ? 'ACTIVE' : testUser.status;
            await prisma.user.update({
                  where: { id: testUser.id },
                  data: {
                        walletBalance: newBalance,
                        status: newStatus
                  }
            });
            console.log('Deposit APPROVED. New wallet balance:', newBalance, '| Status:', newStatus);

            // Trigger network stats cascade for activation
            if (newStatus === 'ACTIVE' && testUser.status !== 'ACTIVE') {
                  console.log('User became ACTIVE. Will trigger network stats on investment.');
            }

            // Step 6: Invest in a project
            console.log('\n=== STEP 6: INVESTING IN PROJECT ===');
            const projects = await prisma.project.findMany({ where: { status: 'ACTIVE' }, take: 1 });
            if (projects.length === 0) {
                  console.log('WARNING: No active projects found. Creating a test project...');
                  const testProject = await prisma.project.create({
                        data: {
                              name: 'E2E Test Project',
                              projectId: 'PRJ-E2E-001',
                              description: 'End-to-end test project',
                              investmentAmount: 100000,
                              dailyReturnPercent: 1.0,
                              durationDays: 30,
                              status: 'ACTIVE'
                        }
                  });
                  projects.push(testProject);
                  console.log('Test project created:', testProject.projectId);
            }

            const project = projects[0];
            console.log('Investing in project:', project.projectId, '| Amount:', project.investmentAmount);

            // Create investment transaction
            const investTx = await prisma.transaction.create({
                  data: {
                        userId: testUser.id,
                        type: 'INVESTMENT',
                        amount: project.investmentAmount,
                        status: 'APPROVED',
                        description: 'Investment in Project ID: ' + project.projectId
                  }
            });

            // Deduct from wallet
            await prisma.user.update({
                  where: { id: testUser.id },
                  data: {
                        walletBalance: newBalance - project.investmentAmount,
                        totalInvested: (testUser.totalInvested || 0) + project.investmentAmount
                  }
            });
            console.log('Investment TX created ID:', investTx.id, '| Remaining balance:', newBalance - project.investmentAmount);

            // Step 7: Distribute commissions (5 levels)
            console.log('\n=== STEP 7: COMMISSION DISTRIBUTION ===');
            const commissionRates = [0.05, 0.03, 0.02, 0.01, 0.005]; // 5%, 3%, 2%, 1%, 0.5%
            let currentUser = testUser;
            let level = 0;

            while (currentUser.referredById && level < 5) {
                  const upliner = await prisma.user.findUnique({ where: { id: currentUser.referredById } });
                  if (!upliner) break;

                  const commission = project.investmentAmount * commissionRates[level];
                  console.log(`Level ${level + 1}: ${upliner.fullName} (@${upliner.username}) earns ₹${commission} commission`);

                  // Create commission transaction
                  await prisma.transaction.create({
                        data: {
                              userId: upliner.id,
                              type: 'COMMISSION',
                              amount: commission,
                              status: 'APPROVED',
                              description: `L${level + 1} commission from ${testUser.fullName}'s investment`
                        }
                  });

                  // Credit upliner wallet
                  await prisma.user.update({
                        where: { id: upliner.id },
                        data: {
                              walletBalance: upliner.walletBalance + commission
                        }
                  });

                  currentUser = upliner;
                  level++;
            }
            console.log('Total commission levels distributed:', level);

            // Final verification
            console.log('\n=== FINAL STATE VERIFICATION ===');
            const finalUser = await prisma.user.findUnique({ where: { id: testUser.id } });
            console.log('TestAlpha Final State:', JSON.stringify({
                  id: finalUser.id,
                  name: finalUser.fullName,
                  status: finalUser.status,
                  kycStatus: finalUser.kycStatus,
                  walletBalance: finalUser.walletBalance,
                  totalInvested: finalUser.totalInvested
            }, null, 2));

            // Check all transactions for this user
            const allTx = await prisma.transaction.findMany({
                  where: { userId: testUser.id },
                  orderBy: { createdAt: 'desc' }
            });
            console.log('\nTestAlpha Transactions:');
            allTx.forEach(tx => {
                  console.log(`  TX-${tx.id}: ${tx.type} | ₹${tx.amount} | ${tx.status} | ${tx.description}`);
            });

            // Check referrer commissions
            if (testUser.referredById) {
                  const refTx = await prisma.transaction.findMany({
                        where: { userId: testUser.referredById, type: 'COMMISSION' },
                        orderBy: { createdAt: 'desc' }
                  });
                  const referrer = await prisma.user.findUnique({ where: { id: testUser.referredById } });
                  console.log(`\nReferrer (${referrer.fullName}) Commissions:`);
                  refTx.forEach(tx => {
                        console.log(`  TX-${tx.id}: ${tx.type} | ₹${tx.amount} | ${tx.status} | ${tx.description}`);
                  });
                  console.log('Referrer Wallet Balance:', referrer.walletBalance);
            }

            console.log('\n✅ END-TO-END TEST COMPLETE');
      } catch (err) {
            console.error('ERROR:', err.message);
            console.error(err.stack);
      } finally {
            await prisma.$disconnect();
      }
}

runE2ETest();
