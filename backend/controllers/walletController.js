const prisma = require('../utils/db');

exports.requestDeposit = async (req, res) => {
      try {
            const { amount, utrNumber } = req.body;

            if (!utrNumber || amount < 1000) {
                  return res.status(400).json({ success: false, message: 'Invalid deposit request. Min ₹1000.' });
            }

            const transaction = await prisma.transaction.create({
                  data: {
                        userId: req.user.id,
                        type: 'DEPOSIT',
                        amount: parseFloat(amount),
                        status: 'PENDING',
                        bankReference: utrNumber,
                        description: 'Manual Bank Deposit'
                  }
            });

            res.status(201).json({ success: true, message: 'Deposit request submitted for Admin review.', transaction });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.getWalletHistory = async (req, res) => {
      try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const skip = (page - 1) * limit;

            const [history, total] = await Promise.all([
                  prisma.transaction.findMany({
                        where: { userId: req.user.id },
                        orderBy: { createdAt: 'desc' },
                        skip,
                        take: limit
                  }),
                  prisma.transaction.count({ where: { userId: req.user.id } })
            ]);

            res.status(200).json({
                  success: true,
                  history,
                  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};


// Get user's investments with project details
exports.getMyInvestments = async (req, res) => {
      try {
            const investments = await prisma.investment.findMany({
                  where: { userId: req.user.id },
                  orderBy: { createdAt: 'desc' },
                  include: {
                        project: {
                              select: {
                                    id: true, title: true, genre: true, imageUrl: true,
                                    targetAmount: true, raisedAmount: true, roiPercentage: true,
                                    durationMonths: true, status: true
                              }
                        }
                  }
            });

            res.status(200).json({ success: true, investments });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

// Combined dashboard data — single API call for Overview page
exports.getDashboardData = async (req, res) => {
      try {
            const { getRankProgress } = require('../utils/rankEngine');

            const [investments, recentTx, user] = await Promise.all([
                  prisma.investment.findMany({
                        where: { userId: req.user.id },
                        orderBy: { createdAt: 'desc' },
                        include: {
                              project: {
                                    select: {
                                          id: true, title: true, genre: true, imageUrl: true,
                                          targetAmount: true, raisedAmount: true, roiPercentage: true,
                                          durationMonths: true, status: true
                                    }
                              }
                        }
                  }),
                  prisma.transaction.findMany({
                        where: { userId: req.user.id },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                  }),
                  prisma.user.findUnique({
                        where: { id: req.user.id },
                        select: { teamVolume: true }
                  })
            ]);

            // Portfolio analytics
            const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
            const totalInvestedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
            const activeInvestments = investments.filter(inv => inv.status === 'ACTIVE').length;
            const uniqueProjects = new Set(investments.map(inv => inv.projectId)).size;

            // Rank progress
            const rankProgress = getRankProgress(user?.teamVolume || 0);

            res.status(200).json({
                  success: true,
                  investments,
                  recentTransactions: recentTx,
                  portfolio: {
                        totalExpectedReturn,
                        totalInvestedAmount,
                        activeInvestments,
                        uniqueProjects,
                        estimatedProfit: totalExpectedReturn - totalInvestedAmount
                  },
                  rankProgress
            });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};

exports.investInProject = async (req, res) => {
      try {
            const { projectId, amount } = req.body;
            const investAmount = parseFloat(amount);

            if (!projectId || !amount || isNaN(investAmount) || investAmount <= 0) {
                  return res.status(400).json({ success: false, message: 'Invalid investment request.' });
            }

            // 1. Verify User Balance and KYC (outside transaction — read-only checks)
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (user.kycStatus !== 'VERIFIED') {
                  return res.status(403).json({ success: false, message: 'KYC Verification Required to Invest.' });
            }
            if (user.walletBalance < investAmount) {
                  return res.status(400).json({ success: false, message: 'Insufficient Wallet Balance.' });
            }

            // 2. Fetch Real Project from DB
            const project = await prisma.project.findUnique({ where: { id: parseInt(projectId) } });
            if (!project) {
                  return res.status(404).json({ success: false, message: 'Project not found.' });
            }
            if (project.status !== 'OPEN') {
                  return res.status(400).json({ success: false, message: 'This project is not currently accepting investments.' });
            }
            if (investAmount < project.minInvestment) {
                  return res.status(400).json({ success: false, message: `Minimum investment for this project is ₹${project.minInvestment.toLocaleString('en-IN')}.` });
            }

            // 3. Calculate expected return from real project data
            const expectedReturn = investAmount * (1 + project.roiPercentage / 100);
            const projectWillBeFunded = project.raisedAmount + investAmount >= project.targetAmount;

            // 4. ATOMIC DB TRANSACTION — Array transaction executes in a SINGLE round trip, much faster!
            const [newInvestment, newTx, updatedUser] = await prisma.$transaction([
                  // Create Investment record
                  prisma.investment.create({
                        data: {
                              userId: req.user.id,
                              projectId: project.id,
                              amount: investAmount,
                              expectedReturn,
                              status: 'ACTIVE'
                        }
                  }),
                  // Log Investment Transaction
                  prisma.transaction.create({
                        data: {
                              userId: req.user.id,
                              type: 'INVESTMENT',
                              amount: investAmount,
                              status: 'APPROVED',
                              description: `Investment in ${project.title}`
                        }
                  }),
                  // Deduct from User wallet
                  prisma.user.update({
                        where: { id: req.user.id },
                        data: {
                              walletBalance: { decrement: investAmount },
                              totalInvested: { increment: investAmount }
                        }
                  }),
                  // Update Project raisedAmount (auto-fund if target reached)
                  prisma.project.update({
                        where: { id: project.id },
                        data: {
                              raisedAmount: { increment: investAmount },
                              ...(projectWillBeFunded ? { status: 'FUNDED' } : {})
                        }
                  })
            ]);

            // 5. MLM 5-Level Commission Distribution (runs AFTER transaction — failure here won't undo the investment)
            const networkStats = require('../utils/networkStats');
            await networkStats.updateUpliners(req.user.id, {
                  investmentAmount: investAmount,
                  isNewlyActive: user.totalInvested === 0
            });

            // 6. Invalidate Project Cache globally
            const { projectCache } = require('./projectController');
            if (projectCache) projectCache.del('activeProjects');

            res.status(200).json({ success: true, message: 'Investment successful!', user: updatedUser });
      } catch (error) {
            console.error('[INVEST ERROR]', error.message);
            res.status(500).json({ success: false, message: 'Investment failed. Please try again.' });
      }
};


const { uploadToS3 } = require('../utils/s3');

exports.submitKyc = async (req, res) => {
      try {
            const { documentType, documentNumber } = req.body;
            const file = req.file;

            // Very basic validation
            if (!documentType || !documentNumber || !file) {
                  return res.status(400).json({ success: false, message: 'Missing required document information or image file.' });
            }

            // 1. Check if KYC already exists
            const existingKyc = await prisma.kycDocument.findFirst({
                  where: { userId: req.user.id }
            });

            if (existingKyc && existingKyc.status === 'PENDING') {
                  return res.status(400).json({ success: false, message: 'KYC Verification is already pending.' });
            }

            // If re-submitting (old doc was REJECTED or VERIFIED), delete the old record first
            if (existingKyc) {
                  await prisma.kycDocument.delete({ where: { id: existingKyc.id } });
            }

            // 2. Upload file to Railway S3 Bucket
            const publicUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype);

            // 3. Fetch User Details to duplicate into KYC Table
            const dbUser = await prisma.user.findUnique({
                  where: { id: req.user.id }
            });

            // 4. Create KYC Record with actual S3 URL & Redundant Details
            const kyc = await prisma.kycDocument.create({
                  data: {
                        userId: req.user.id,
                        username: dbUser.username,
                        fullName: dbUser.fullName,
                        email: dbUser.email,
                        phone: dbUser.phone,
                        documentType,
                        documentNumber,
                        documentUrl: publicUrl,
                        status: 'PENDING'
                  }
            });

            // 5. Update User Status & Bind Image
            const updatedUser = await prisma.user.update({
                  where: { id: req.user.id },
                  data: {
                        kycStatus: 'PENDING',
                        kycImageUrl: publicUrl
                  }
            });

            res.status(201).json({ success: true, message: 'KYC Document submitted successfully.', kyc, user: updatedUser });
      } catch (error) {
            console.error('KYC Submit Error:', error);
            res.status(500).json({ success: false, message: 'Failed to process KYC submission.' });
      }
};

exports.getNetworkStats = async (req, res) => {
      try {
            // Ensure this user has initialized NetworkLevelStat rows
            const networkStats = require('../utils/networkStats');
            await networkStats.initializeNetworkStats(req.user.id);

            // 1. Read pre-computed stats directly from NetworkLevelStat table (single query)
            const stats = await prisma.networkLevelStat.findMany({
                  where: { userId: req.user.id },
                  orderBy: { level: 'asc' }
            });

            // 2. Build the downline tree (structural data — requires walking referrals)
            let currentLevelUserIds = [req.user.id];
            const allDownlines = [];

            for (let i = 1; i <= 5; i++) {
                  if (currentLevelUserIds.length === 0) break;

                  const downlines = await prisma.user.findMany({
                        where: { referredById: { in: currentLevelUserIds } },
                        select: { id: true, fullName: true, username: true, email: true, referredById: true, totalInvested: true, teamVolume: true, rank: true, status: true, createdAt: true }
                  });

                  downlines.forEach(d => allDownlines.push({ ...d, level: i }));
                  currentLevelUserIds = downlines.map(u => u.id);
            }

            // 3. Build User Tree from allDownlines
            const userMap = {};
            allDownlines.forEach(u => {
                  userMap[u.id] = { ...u, children: [] };
            });

            const tree = [];
            allDownlines.forEach(u => {
                  if (u.referredById && userMap[u.referredById]) {
                        userMap[u.referredById].children.push(userMap[u.id]);
                  } else if (u.referredById === req.user.id) {
                        tree.push(userMap[u.id]);
                  }
            });

            res.status(200).json({ success: true, networkStats: stats, tree });
      } catch (error) {
            res.status(500).json({ success: false, message: error.message });
      }
};
